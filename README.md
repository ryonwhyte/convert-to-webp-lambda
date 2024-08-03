# Image Resizer Lambda

This Lambda will be invoked when a file is uploaded to a particular bucket. It will fetch the file that was added, convert it to webp, and store the output in a different bucket.

## Run Locally

Clone the project

```bash
  git clone https://github.com/ryonwhyte/convert-to-webp-lambda.git
```

Install Dependencies

```bash
# Install sharpand deps
npm install sharp
```

```bash
# You may need to install differently on mac
npm install --arch=x64 --platform=linux --target=16x sharp
```

## Environment Variables

Remember set the `DEST_BUCKET` in your Lambda's "Configuration" tab. To do this, open your Lambda in the AWS Console, select the "Configuration" tab, then click "Environment variables"

```bash
DEST_BUCKET=thumbnails-bucket-name
```

## Deployment

```bash
npm run package
```

Running the command above will zip your source code and dependencies. The zip can then be uploaded to your Lambda. In case you want to have the inlin code editor you can remove the index.js/index.mjs file from the archive and upload it as a layer. Then zip the index file by itself and upload it normally.
