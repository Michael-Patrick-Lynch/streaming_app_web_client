import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

interface ListingData {
  title: string;
  description?: string;
  type: string; // e.g. "auction" or "bin" (or "giveaway")
  quantity?: number;
  category: string;
  shipping_domestic_price: number; // in cents
  shipping_eu_price: number; // in cents
  // Auction-specific fields:
  auction_starting_bid?: number;
  auction_duration?: number;
  auction_sudden_death?: boolean;
  // BIN-specific fields:
  bin_price?: number;
  bin_accept_offers?: boolean;

  // picture_url will be set automatically below.
}

export async function POST(req: Request) {
  const formData = await req.formData();

  // Read the listing data JSON string (note the key change to "listing")
  const listingDataString = formData.get('listing');
  const listingData: ListingData | null = listingDataString
    ? JSON.parse(listingDataString as string)
    : null;

  const imageFile = formData.get('file') as File;
  const token = formData.get('token') as string;

  if (!listingData) {
    return new Response(
      JSON.stringify({ success: false, error: 'Listing data is missing' }),
      { status: 400 }
    );
  }

  if (!imageFile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Image file is required' }),
      { status: 400 }
    );
  }

  // Create S3 client (Cloudflare R2)
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
  });

  try {
    // Generate a unique filename using timestamp and original file name
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${imageFile.name}`;

    // Add the picture_url to listing data
    const listingDataWithUrl = {
      ...listingData,
      picture_url: `https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/${uniqueFilename}`,
    };

    // Clean the data (remove undefined values)
    const cleanListingData = Object.fromEntries(
      Object.entries(listingDataWithUrl).filter(
        ([, value]) => value !== undefined
      )
    );

    console.log('Sending listing data to backend:', cleanListingData);

    // Send the listing data to your Elixir backend.
    // Note: the backend expects the payload in the form { listing: { ... } }
    const createResponse = await axios.post(
      'https://api.firmsnap.com/listings',
      { listing: cleanListingData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const listingId = createResponse.data.id;

    try {
      // Convert File to Buffer and upload to Cloudflare R2
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: imageFile.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (uploadError) {
      // If image upload fails, delete the listing record from the backend
      await axios.delete(`https://api.firmsnap.com/listings/${listingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to upload image, listing record deleted (${uploadError})`,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, listingId }), {
      status: 200,
    });
  } catch (createError: unknown) {
    const errorMessage =
      createError instanceof Error
        ? createError.message
        : 'Failed to create listing record';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500 }
    );
  }
}
