import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface DistributionProps {}

/**
 * Create an Amazon S3 bucket and CloudFront distribution. This construct does not upload frontend files
 * that require outputs from stack deployment, such as AppInstanceArn and CognitoUserPoolId.
 * We will manually build and upload frontend files to a bucket created in this construct.
 */
export class Distribution extends Construct {
  readonly bucketName: string;
  readonly id: string;
  readonly url: string;

  constructor(scope: Construct, id: string, props?: DistributionProps) {
    super(scope, id);
    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    const bucket = new s3.Bucket(this, 'Bucket', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [bucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      })
    );
    this.bucketName = bucket.bucketName;

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: cloudFrontOAI,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
              allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
            },
          ],
        },
      ],
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
    });
    this.url = distribution.distributionDomainName;
    this.id = distribution.distributionId;
  }
}
