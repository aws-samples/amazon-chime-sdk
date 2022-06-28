import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface PSTNProps {
  appInstanceArn: string;
  cognitoUserPoolId: string;
}

export class PSTN extends Construct {
  readonly makeOutboundCallFunctionArn: string;

  constructor(scope: Construct, id: string, private props: PSTNProps) {
    super(scope, id);

    // Create a DynamoDB table to store a map of the SIP call's transaction ID to
    // the Chime SDK meeting information.
    const table = this.createTable();

    const eventFunction = this.createHandleTelephonyEventsFunction(table);
    const { phoneNumber, sipMediaApplicationId } = this.createCustomResource(eventFunction.functionArn);
    this.createCleanupPSTNResources(phoneNumber, sipMediaApplicationId);
    const makeOutboundCallFunction = this.createMakeOutboundCallFunction(phoneNumber, sipMediaApplicationId, table);
    this.makeOutboundCallFunctionArn = makeOutboundCallFunction.functionArn;
  }

  private createHandleTelephonyEventsFunction = (table: dynamodb.Table): lambda.Function => {
    const tableName = table.tableName;
    const role = new iam.Role(this, 'HandleTelephonyEventsFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        ChimeMessagingPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:SendChannelMessage'],
              resources: [`${this.props.appInstanceArn}/user/*`, `${this.props.appInstanceArn}/channel/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        ChimeMeetingsPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateAttendee', 'chime:DeleteAttendee'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        DynamoDbPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:GetItem', 'dynamodb:DeleteItem', 'dynamodb:UpdateItem'],
              resources: [`${table.tableArn}`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
    return new lambdaNodeJs.NodejsFunction(this, 'HandleTelephonyEventsFunction', {
      entry: './lambda/src/handle-telephony-events.ts',
      environment: {
        APP_INSTANCE_ARN: this.props.appInstanceArn,
        TABLE_NAME: tableName,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
  };

  private createCustomResource = (
    handleTelephonyEventsFunctionArn: string
  ): {
    sipMediaApplicationId: string;
    phoneNumber: string;
  } => {
    const role = new iam.Role(this, 'CreatePstnFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        ChimePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'chime:CreatePhoneNumberOrder',
                'chime:CreateSipMediaApplication',
                'chime:GetPhoneNumberOrder',
                'chime:SearchAvailablePhoneNumbers',
              ],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        LabmdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['lambda:GetPolicy', 'lambda:AddPermission'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        IamPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['iam:CreateServiceLinkedRole'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
    const handler = new lambdaNodeJs.NodejsFunction(this, 'CreatePstnFunction', {
      entry: './lambda/src/create-pstn.ts',
      environment: {
        HANDLE_TELEPHONY_EVENTS_FUNCTION_ARN: handleTelephonyEventsFunctionArn,
        STACK_NAME: cdk.Stack.of(this).stackName,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(120),
    });
    const provider = new cdk.custom_resources.Provider(this, 'Provider', {
      onEventHandler: handler,
    });
    const customResource = new cdk.CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
    });
    return {
      phoneNumber: customResource.getAtt('PhoneNumber').toString(),
      sipMediaApplicationId: customResource.getAtt('SipMediaApplicationId').toString(),
    };
  };

  private createMakeOutboundCallFunction = (
    phoneNumber: string,
    sipMediaApplicationId: string,
    table: dynamodb.Table
  ): lambda.Function => {
    const role = new iam.Role(this, 'MakeOutboundCallFunctionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        ChimePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateSipMediaApplicationCall'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        CognitoPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['cognito-idp:AdminGetUser'],
              resources: [
                `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/${
                  this.props.cognitoUserPoolId
                }`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        DynamoDbPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['dynamodb:PutItem'],
              resources: [`${table.tableArn}`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });
    return new lambdaNodeJs.NodejsFunction(this, 'MakeOutboundCallFunction', {
      entry: './lambda/src/make-outbound-call.ts',
      environment: {
        COGNITO_USER_POOL_ID: this.props.cognitoUserPoolId,
        PHONE_NUMBER: phoneNumber,
        SIP_MEDIA_APPLICATION_ID: sipMediaApplicationId,
        TABLE_NAME: table.tableName,
      },
      handler: 'handler',
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
  };

  private createTable = (): dynamodb.Table => {
    return new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'transactionId', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  };

  private createCleanupPSTNResources = (phoneNumber: string, sipMediaApplicationId: string): void => {
    const role = new iam.Role(this, 'PSTNResourcesCleanUpLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        ChimePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:DeletePhoneNumber', 'chime:DeleteSipMediaApplication'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')],
    });

    const deleteSIPResourcesLambdaFunctionHandler = new lambdaNodeJs.NodejsFunction(
      this,
      'DeleteSIPResourcesFunction',
      {
        entry: './lambda/src/delete-sip-resources.ts',
        environment: {
          SIP_MEDIA_APPLICATION_ID: sipMediaApplicationId,
          PHONE_NUMBER: phoneNumber,
          STACK_NAME: cdk.Stack.of(this).stackName,
        },
        handler: 'handler',
        role,
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: cdk.Duration.seconds(30),
      }
    );
    const provider = new cdk.custom_resources.Provider(this, 'DeleteSIPResourcesProvider', {
      onEventHandler: deleteSIPResourcesLambdaFunctionHandler,
    });
    new cdk.CustomResource(this, 'DeleteSIPResourcesCustomResource', {
      serviceToken: provider.serviceToken,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  };
}
