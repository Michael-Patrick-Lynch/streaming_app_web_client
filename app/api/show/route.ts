import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

interface ShowData {
  title: string;
  category: string;
  scheduled_time: string;
  thumbnail_url?: string;
}

export async function POST(req: Request) {
  const formData = await req.formData();

  // Read the show data JSON string (note the key change to "show")
  const showDataString = formData.get('show');
  const showData: ShowData | null = showDataString
    ? JSON.parse(showDataString as string)
    : null;

  const imageFile = formData.get('thumbnail') as File;
  const token = formData.get('token') as string;

  if (!showData) {
    return new Response(
      JSON.stringify({ success: false, error: 'Show data is missing' }),
      { status: 400 }
    );
  }

  if (!imageFile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Thumbnail image is required' }),
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

    // Add the thumbnail_url to show data
    const showDataWithUrl = {
      ...showData,
      thumbnail_url: `https://pub-b0d5f024ddc742a2993ac9ca697c41f7.r2.dev/${uniqueFilename}`,
    };

    // Clean the data (remove undefined values)
    const cleanShowData = Object.fromEntries(
      Object.entries(showDataWithUrl).filter(([, value]) => value !== undefined)
    );

    console.log('Sending show data to backend:', cleanShowData);

    // Send the show data to your backend.
    // Note: the backend expects the payload in the form { show: { ... } }
    const createResponse = await axios.post(
      'https://api.firmsnap.com/shows',
      { show: cleanShowData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const showId = createResponse.data.id;

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
      // If image upload fails, delete the show record from the backend
      await axios.delete(`https://api.firmsnap.com/show/${showId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to upload image, show record deleted (${uploadError})`,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, showId }), {
      status: 200,
    });
  } catch (createError: unknown) {
    // Check if the error is an Axios error with a response
    if (axios.isAxiosError(createError) && createError.response) {
      // If the API returns an "errors" field, pass that along to the client.
      const data = createError.response.data;
      if (data && data.errors) {
        return new Response(
          JSON.stringify({ success: false, errors: data.errors }),
          { status: createError.response.status || 500 }
        );
      }
    }
    // Fallback for other error types or missing "errors" field.
    const errorMessage =
      createError instanceof Error
        ? createError.message
        : 'Failed to create show record';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500 }
    );
  }
}
