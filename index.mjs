import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const S3 = new S3Client();
const DEST_BUCKET = process.env.DEST_BUCKET;
const SUPPORTED_FORMATS = {
  jpg: true,
  jpeg: true,
  png: true,
  gif: true,
  raw: true,
};

export const handler = async (event, context) => {
  const { eventTime, s3 } = event.Records[0];
  const srcBucket = s3.bucket.name;

  // Object key may have spaces or unicode non-ASCII characters
  const srcKey = decodeURIComponent(s3.object.key.replace(/\+/g, " "));
  const ext = srcKey.replace(/^.*\./, "").toLowerCase();

  console.log("Logging Conversion: ",`${eventTime} - ${srcBucket}/${srcKey}`);

  if (!SUPPORTED_FORMATS[ext]) {
    console.log(`ERROR: Unsupported file type (${ext})`);
    return;
  }

  // Get the image from the source bucket
  try {
    const { Body, ContentType } = await S3.send(
      new GetObjectCommand({
        Bucket: srcBucket,
        Key: srcKey,
      })
    );
    const image = await Body.transformToByteArray();


    console.log("Converting here");
    // Convert image to WebP format (lossy)
    const webpBuffer = await sharp(image)
      .webp({ quality: 75 }) // Adjust quality as needed
      .toBuffer();
      
    console.log("Conversion done");

    // Define the destination key for the WebP image
    const destKey = srcKey.replace(/\.[^.]+$/, '.webp');

    // Store the WebP image in the destination bucket
    await S3.send(
      new PutObjectCommand({
        Bucket: DEST_BUCKET,
        Key: destKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
      })
    );
    const message = `Successfully converted ${srcBucket}/${srcKey} to WebP and uploaded to ${DEST_BUCKET}/${destKey}`;
    console.log(message);
    return {
      statusCode: 200,
      body: message,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: `Error processing ${srcBucket}/${srcKey}: ${error.message}`,
    };
  }
};
