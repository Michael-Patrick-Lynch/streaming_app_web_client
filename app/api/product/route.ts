import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

interface ProductData {
  shop_id: string;
  name: string;
  price_in_euro: number;
  quantity: number;
  picture_url: string;
  description: string;
}

export async function POST(req: Request) {
  const formData = await req.formData();

  const productDataString = formData.get('productData');
  const productData: ProductData = productDataString
    ? JSON.parse(productDataString as string)
    : null;

  const imageFile = formData.get('file') as File;
  const token = formData.get('token') as string;

  if (!productData) {
    return new Response(
      JSON.stringify({ success: false, error: 'Product data is missing' }),
      { status: 400 }
    );
  }

  if (!imageFile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Image file is required' }),
      { status: 400 }
    );
  }

  // Create S3 client
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    },
  });

  try {
    // Generate a unique filename using timestamp and original name
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${imageFile.name}`;

    // Add the picture_url to productData before creating the product
    const productDataWithUrl = {
      name: productData.name,
      price_in_euro: productData.price_in_euro,
      quantity: productData.quantity,
      picture_url: `${process.env.CLOUDFLARE_R2_ENDPOINT}/${uniqueFilename}`,
      description: productData.description, // Only include if it exists
    };

    // Remove empty strings from optional fields
    const cleanProductData = Object.fromEntries(
      Object.entries(productDataWithUrl).filter(
        ([, value]) => value !== undefined
      )
    );

    console.log('Sending to API:', cleanProductData);

    const createResponse = await axios.post(
      'https://api.firmsnap.com/shop/product',
      cleanProductData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const productId = createResponse.data.id;

    try {
      // Convert File to Buffer for S3 upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: uniqueFilename, // Use the same unique filename
        Body: buffer,
        ContentType: imageFile.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (uploadError) {
      await axios.delete(`https://api.firmsnap.com/shop/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to upload image, product record deleted (${uploadError})`,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, productId }), {
      status: 200,
    });
  } catch (createError: unknown) {
    const errorMessage =
      createError instanceof Error
        ? createError.message
        : 'Failed to create product record';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500 }
    );
  }
}
