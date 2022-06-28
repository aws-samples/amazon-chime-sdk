import {
  SFNClient,
  ExecutionListItem,
  ListExecutionsCommand,
  StopExecutionCommand,
  StopExecutionCommandOutput,
} from '@aws-sdk/client-sfn';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

const { AWS_REGION, STATE_MACHINE_ARN } = process.env;
const sfnClient = new SFNClient({ region: AWS_REGION });

exports.handler = async (event: CloudFormationCustomResourceEvent) => {
  if (event.RequestType === 'Delete') {
    try {
      let nextToken: string | undefined;
      do {
        const data = await sfnClient.send(
          new ListExecutionsCommand({
            stateMachineArn: STATE_MACHINE_ARN,
            statusFilter: 'RUNNING',
            nextToken,
          })
        );
        nextToken = data.nextToken;
        const promises = data.executions?.map<Promise<StopExecutionCommandOutput>>((execution: ExecutionListItem) => {
          return sfnClient.send(
            new StopExecutionCommand({
              executionArn: execution.executionArn,
            })
          ) as Promise<StopExecutionCommandOutput>;
        });
        if (promises) {
          await Promise.all(promises);
        }
      } while (nextToken);
      return {};
    } catch (error: any) {
      console.warn(`Failed to delete Step Function executions: `, error);
      throw new Error(
        `Failed to delete Step Function executions due to the error: ${error?.message}. To continue deleting the stack, use the AWS CLI or the AWS Step Functions console to delete all running executions.`
      );
    }
  } else {
    // Create or Update
    return {};
  }
};
