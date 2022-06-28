import { CloudFormationCustomResourceEvent } from 'aws-lambda';
import {
  ChimeSDKIdentityClient,
  DeleteAppInstanceCommand,
  DescribeAppInstanceCommand,
} from '@aws-sdk/client-chime-sdk-identity';

const { AWS_REGION, APP_INSTANCE_ARN, STACK_NAME } = process.env;
const identityClient = new ChimeSDKIdentityClient({ region: AWS_REGION });

exports.handler = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Delete') {
    const data = await identityClient.send(
      new DescribeAppInstanceCommand({
        AppInstanceArn: APP_INSTANCE_ARN,
      })
    );
    if (!data.AppInstance) {
      console.warn(`App instance ${APP_INSTANCE_ARN} not found for stack: ${STACK_NAME}`);
      return {};
    }
    try {
      await identityClient.send(
        new DeleteAppInstanceCommand({
          AppInstanceArn: APP_INSTANCE_ARN,
        })
      );
      console.info('Successfully deleted the AppInstance', APP_INSTANCE_ARN);
    } catch (error) {
      console.error(`Error deleting AppInstance: ${APP_INSTANCE_ARN}`, error);
    } finally {
      return {};
    }
  } else {
    // Update or Create lifecyle events ignored here as this lambda is for deletion.
    return {};
  }
};
