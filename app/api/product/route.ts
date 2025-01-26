import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

interface ProductData {
  shop_id: string;
  name: string;
  price_in_euro: number;
  quantity: number;
  picture_url: string;
  description?: string;
}

// Sends request to create product record in the DB, if that succeed then uploads image to S3 bucket
export async function POST(req: Request) {
  const token = 'placeholder token, will need to be sent in params';
  const {
    productData,
    file: imageFile,
  }: { productData: ProductData; file: File } = await req.json();
  if (!imageFile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Image file is missing' }),
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
    const createResponse = await axios.post(
      'https://api.firmsnap.com/shop/product',
      productData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const productId = createResponse.data.id;

    try {
      const uploadParams = {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: `${productId}/${imageFile.name}`,
        Body: imageFile,
        ContentType: imageFile.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      return new Response(JSON.stringify({ success: true, productId }), {
        status: 200,
      });
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
