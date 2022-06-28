import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface CognitoProps {
  appInstanceArn: string;
  createMeetingFunctionArn: string;
  createAttendeeFunctionArn: string;
}

export class Cognito extends Construct {
  readonly doctorUserPoolGroupName = 'DoctorUserPoolGroup';
  readonly patientUserPoolGroupName = 'PatientUserPoolGroup';
  readonly cognitoUserPoolId: string;
  readonly cognitoUserPoolClientId: string;
  readonly cognitoIdentityPoolId: string;

  constructor(scope: Construct, id: string, private props: CognitoProps) {
    super(scope, id);
    const handler = this.createHandler();
    const userPool = this.createUserPool(handler);
    this.cognitoUserPoolId = userPool.userPoolId;

    const userPoolClient = this.createUserPoolClient(userPool);
    this.cognitoUserPoolClientId = userPoolClient.userPoolClientId;

    const identityPool = this.createIdentityPool(userPool, userPoolClient);
    this.cognitoIdentityPoolId = identityPool.ref;

    // Create doctor and patient groups for authenticated Cognito users.
    this.createUserPoolGroups(userPool, identityPool);

    // An authenticated Cognito user has either doctor or patient group role
    // to perform specified actions in the corresponding group role.
    this.attachRoles(userPool, userPoolClient, identityPool);
  }

  private createUserPool = (handler: lambda.Function): cognito.UserPool => {
    const userPool = new cognito.UserPool(this, 'UserPool', {
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      autoVerify: {
        email: true,
      },
      customAttributes: {
        // Supported types: DOCTOR, PATIENT
        accountType: new cognito.StringAttribute({ mutable: true }),
      },
      lambdaTriggers: {
        postAuthentication: handler,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });
    handler.addPermission('CreateUserForCognitoFunctionPermission', {
      action: 'lambda:InvokeFunction',
      principal: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
      sourceAccount: cdk.Stack.of(this).account,
      sourceArn: userPool.userPoolArn,
    });
    return userPool;
  };

  private createHandler = (): lambda.Function => {
    const role = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        AppInstancePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['chime:CreateAppInstanceUser'],
              resources: ['*'],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        CognitoPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['cognito-idp:AdminAddUserToGroup'],
              resources: [`arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/*`],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    return new lambdaNodeJs.NodejsFunction(this, 'CreateUserForCognitoFunction', {
      entry: './lambda/src/create-user-for-cognito.ts',
      handler: 'handler',
      environment: {
        CHIME_APP_INSTANCE_ARN: this.props.appInstanceArn,
        DOCTOR_USER_POOL_GROUP_NAME: this.doctorUserPoolGroupName,
        PATIENT_USER_POOL_GROUP_NAME: this.patientUserPoolGroupName,
      },
      role,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(30),
    });
  };

  private createUserPoolClient = (userPool: cognito.UserPool): cognito.UserPoolClient => {
    return new cognito.UserPoolClient(this, 'UserPoolClient', {
      disableOAuth: true,
      generateSecret: false,
      supportedIdentityProviders: [],
      userPool,
    });
  };

  private createIdentityPool = (
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient
  ): cognito.CfnIdentityPool => {
    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });
    return identityPool;
  };

  private attachRoles = (
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    identityPool: cognito.CfnIdentityPool
  ): void => {
    // These roles do not have any policies.
    // An authenticated Cognito user is a part of either doctor or patient group to perform
    // specified actions in the corresponding group role.
    const authroizedRole = new iam.Role(this, 'AuthorizedRole', {
      assumedBy: this.createFederatedPrincipal(identityPool, true),
    });
    const unauthroizedRole = new iam.Role(this, 'UnauthorizedRole', {
      assumedBy: this.createFederatedPrincipal(identityPool, false),
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: authroizedRole.roleArn,
        unauthenticated: unauthroizedRole.roleArn,
      },
      // Required to attach the doctor or patient group role to authenticated Cognito users in a browser
      roleMappings: {
        cognito: {
          type: 'Token',
          ambiguousRoleResolution: 'Deny',
          identityProvider: `cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${userPool.userPoolId}:${
            userPoolClient.userPoolClientId
          }`,
        },
      },
    });
  };

  private createUserPoolGroups = (userPool: cognito.UserPool, identityPool: cognito.CfnIdentityPool): void => {
    const doctorGroupRole = this.createDoctorGroupRole(userPool, identityPool);
    new cognito.CfnUserPoolGroup(this, 'DoctorUserPoolGroup', {
      groupName: this.doctorUserPoolGroupName,
      roleArn: doctorGroupRole.roleArn,
      userPoolId: userPool.userPoolId,
    });

    const patientGroupRole = this.createPatientGroupRole(userPool, identityPool);
    new cognito.CfnUserPoolGroup(this, 'PatientUserPoolGroup', {
      groupName: this.patientUserPoolGroupName,
      roleArn: patientGroupRole.roleArn,
      userPoolId: userPool.userPoolId,
    });
  };

  /**
   * Roles
   */

  private createDoctorGroupRole = (userPool: cognito.UserPool, identityPool: cognito.CfnIdentityPool): iam.Role => {
    return new iam.Role(this, 'DoctorGroupRole', {
      assumedBy: this.createFederatedPrincipal(identityPool, true),
      inlinePolicies: {
        ...this.createSharedInlinePolicies(),
        CognitoPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['cognito-idp:ListUsersInGroup'],
              resources: [
                `arn:aws:cognito-idp:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:userpool/${userPool.userPoolId}`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
        LambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['lambda:InvokeFunction'],
              resources: [
                `arn:aws:lambda:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:function:*`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });
  };

  private createPatientGroupRole = (userPool: cognito.UserPool, identityPool: cognito.CfnIdentityPool): iam.Role => {
    return new iam.Role(this, 'PatientGroupRole', {
      assumedBy: this.createFederatedPrincipal(identityPool, true),
      inlinePolicies: {
        ...this.createSharedInlinePolicies(),
        LambdaPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ['lambda:InvokeFunction'],
              resources: [this.props.createAttendeeFunctionArn],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });
  };

  private createFederatedPrincipal = (
    identityPool: cognito.CfnIdentityPool,
    isAuthorized: boolean
  ): iam.FederatedPrincipal => {
    return new iam.FederatedPrincipal(
      'cognito-identity.amazonaws.com',
      {
        StringEquals: {
          'cognito-identity.amazonaws.com:aud': identityPool.ref,
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': isAuthorized ? 'authenticated' : 'unauthenticated',
        },
      },
      'sts:AssumeRoleWithWebIdentity'
    );
  };

  private createSharedInlinePolicies = (): Record<string, iam.PolicyDocument> => {
    return {
      MessagingPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['chime:GetMessagingSessionEndpoint'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
          }),
          new iam.PolicyStatement({
            actions: [
              'chime:Connect',
              'chime:ListChannelMessages',
              'chime:ListChannelsModeratedByAppInstanceUser',
              'chime:SendChannelMessage',
            ],
            resources: [
              `${this.props.appInstanceArn}/user/*`,
              `${this.props.appInstanceArn}/channel/*`,
              `${this.props.appInstanceArn}/channel-flow/*`,
            ],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    };
  };
}
