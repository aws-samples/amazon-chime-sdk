import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import { S3Client, PutObjectCommand, PutObjectRequest } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

type File = {
  path: string;
  contentType: string;
  templateVariable: string;
};

type Config = {
  DistributionBucketName: string;
  DistributionId: string;
  DistributionUrl: string;
  Region: string;
};

const loadConfig = (config: string): Config => {
  const file = path.resolve(config);
  if (!fs.existsSync(file)) {
    console.log(
      `${file} does not exist. Ensure that you have deployed the Amazon Chime SDK Widget Demo stack. See README.md.`
    );
    process.exit(1);
  }
  const ConfigJSON = JSON.parse(
    fs.readFileSync(file, {
      encoding: 'utf-8',
    })
  );
  /**
   * CDK generates config.json that has uses custom stack name as a key.
   *  {
   *    "__CUSTOM_STACK_NAME__": {
   *      "CognitoIdentityPoolId": "...",
   *      ...
   *    }
   *  }
   *
   * Instead, export only an object.
   * {
   *    "CognitoIdentityPoolId": "...",
   *    ...
   * }
   */
  return Object.values(ConfigJSON)[0] as Config;
};

const uploadFile = async (
  s3Client: S3Client,
  bucketName: string,
  key: string,
  body: PutObjectRequest['Body'] | string | Uint8Array | Buffer,
  contentType: string
) => {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  } catch (error: any) {
    console.log(`Failed to upload ${key} to the S3 bucket "${bucketName}": `, error?.message);
    process.exit(1);
  }
};

const invalidateFiles = async (cloudFrontClient: CloudFrontClient, distributionId: string, items: string[]) => {
  try {
    await cloudFrontClient.send(
      new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: 2,
            Items: items,
          },
        },
      })
    );
  } catch (error: any) {
    console.log(`Failed to invalidate ${JSON.stringify(items)}: `, error?.message);
    process.exit(1);
  }
};

const createScript = (url: string, files: File[], template: string, output: string) => {
  let content = fs.readFileSync(path.resolve(template), 'utf8');
  for (const file of files) {
    content = content.replace(new RegExp(file.templateVariable, 'g'), `https://${url}/${path.basename(file.path)}`);
  }
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(path.resolve(output), content);
};

const main = async ({
  config,
  files,
  output,
  template,
}: {
  config: string;
  files: File[];
  output: string;
  template: string;
}) => {
  const { Region, DistributionBucketName, DistributionId, DistributionUrl } = loadConfig(config);
  for (const file of files) {
    await uploadFile(
      new S3Client({ region: Region }),
      DistributionBucketName,
      path.basename(file.path),
      fs.createReadStream(file.path),
      file.contentType
    );
  }
  await invalidateFiles(
    new CloudFrontClient({ region: Region }),
    DistributionId,
    files.map<string>((file: File) => `/${path.basename(file.path)}`)
  );
  createScript(DistributionUrl, files, template, output);
  console.log('\n');
  console.log(chalk.green('Copy the content of dist/widget.js into your application and run the script!'));
};

main({
  config: 'src/config.json',
  files: [
    {
      contentType: 'application/javascript',
      path: 'widget-dist/index.js',
      templateVariable: '__AMAZON_CHIME_SDK_WIDGET_DEMO_CSS__',
    },
    {
      contentType: 'text/css',
      path: 'widget-dist/index.css',
      templateVariable: '__AMAZON_CHIME_SDK_WIDGET_DEMO_JS__',
    },
  ],
  output: '../dist/widget.js',
  template: 'scripts/template.js',
});
