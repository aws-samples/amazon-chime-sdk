# Amazon Chime SDK Chat Demo

## Overview

The easiest way to get started with messaging in the Amazon Chime SDK is to deploy our chat demo application. By completing the steps below, you will learn how to deploy the Amazon Chime SDK Chat Demo Application, create users and enable them to communicate in chat channels through an interface that will feel familiar to anyone that has used a modern chat messaging application. This application is designed in a way that it can be used as a starting point for your own application, or just a quick way to try out the features of the Amazon Chime SDK for messaging on your own. Please see the [Amazon Chime SDK Messaging App blog post](https://aws.amazon.com/blogs/business-productivity/build-chat-features-into-your-application-with-amazon-chime-sdk-messaging/) for more information.

## Prerequisites

- An [AWS account](https://aws.amazon.com/free/) that provides access to AWS services.
- [Node.js](https://nodejs.org/en/download/) version 14 or higher.

## Deploying the demo app
### Using AWS SAM
1. Run the following commands to provision the demo app's infrastructure, as well as build and deploy the web assets.

```bash
cd apps/chat
npm run deploy
```

2. Verify that the `src/backend/serverless/appconfig.json` is populated with the CloudFormation stack outputs. This JSON file used to
   configure the app with `src/Config.js.`

3. Then, you can access the app via the CloudFront endpoint found in the CloudFormation stack outputs.

### Using the AWS CloudFormation console
Alternatively, you can deploy backend and frontend manually:

1. Sign in to the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/) and switch to the **US East (N. Virginia)** region. Note that the AWS CloudFormation template in this demo needs to be launched in the US East (N. Virginia) region.
1. Choose **Create stack**.
1. Choose **Upload a template file**, and then browse for the [template.yaml](src/backend/serverless/template.yaml) file in the `src/backend/serverless` directory.
1. For **Stack name**, type `my-demo-stack` and choose **Next**.
1. Review **Specify stack details** and choose **Next**. You can use the default values or specify your stack name and parameters.
1. Review **Configure stack options** and choose **Next**. You can update the tags and permissions applied to the stack.
1. Review the stack details, choose the following three options and then choose **Create stack**.
    - **I acknowledge that AWS CloudFormation might create IAM resources.**
    - **I acknowledge that AWS CloudFormation might create IAM resources with custom names.**
    - **I acknowledge that AWS CloudFormation might require the following capability: CAPABILITY_AUTO_EXPAND**

After the deployment is complete, the **Outputs** tab of the AWS CloudFormation console includes your resource information. You will update the configuration file with these values in the next section.

## Running the chat demo app locally

1. Navigate to the root directory of the Amazon Chime SDK chat demo `apps/chat`.
1. If you have deployed the CloudFormation stack via the AWS CloudFormation console in the previous steps, open `src/Config.js` and update
   the configuration with the values from the stack output.
1. Install dependencies and start the demo in the `apps/chat` directory.
   ```
   npm install
   npm start
   ```
1. Open https://localhost:9000 in your browser.
1. By default, the demo uses the [Amazon Cognito](https://aws.amazon.com/cognito/) User Pools to manage users. Alternatively, you can get credentials using the [AWS Lambda](https://aws.amazon.com/lambda/) function that the AWS CloudFormation template created in the previous section.

    If you prefer to use the default Cognito, continue to the [Cognito User Pools](#cognito-user-pools) section.
    
    If you prefer to use the credential exchange service, see the [Credential Exchange Service](#credential-exchange-service) section.

## Cognito User Pools

### Registering a new user

New users can register through the Amazon Chime SDK Chat Demo.

1. Open [http://localhost:9000](http://localhost:9000/) in your browser.
1. Provide the username and password for a new user.
1. Choose **Register**.
1. The user must confirm the account before signing in to the demo. Follow the steps in the next section to confirm.

### Confirming a new Cognito user as an account admin

1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/home).
1. Choose **Manage User Pools**.
1. Choose the pool that you created.
1. Choose **Users and groups** in the left side panel.
1. Choose the new user whose **Account Status** is **UNCONFIRMED**.
1. Choose **Confirm user.**
1. Now that user should be able to sign in.

### Signing in

1. Open [http://localhost:9000](http://localhost:9000/) in your browser.
1. Provide the username and password of the desired user.
1. Choose **Sign in**.

Skip to [Creating a Channel](#creating-a-channel)

## Credential Exchange Service

1. Open [http://localhost:9000](http://localhost:9000/) in your browser.
1. Change the drop down to **Credential Exchange Service**.
1. The Credential Exchange Service is a small [AWS Lambda](https://aws.amazon.com/lambda/) function running behind [Amazon API Gateway](https://aws.amazon.com/api-gateway/) that enables exchanging your application's or identity provider's (IDP) token for AWS credentials, or for you to implement custom authentication.

   To simulate the processes of exchanging credentials, by default the AWS Lambda function returns anonymous access regardless of the token provided. Click **Exchange Token for AWS Credentials** to get anonymous access to the chat application. If you wish to change the code to validate your application/IDP token or implement custom authentication, modify the following code in `/backend/serverless/template.yml`.

    ```js
    // STEP 1: Validate your identity providers access token and return user information
    // including UUID, and optionally username or additional metadata
    function validateAccessTokenOrCredsAndReturnUser(identityToken) {
      // For purposes of simulating the exchange, this function defaults to returning anonymous user access.
      // To authenticate known users add logic to validate your auth token here.  The function
      // will need to return the users uuid and optionally display name and/or other metadata
      const randomUserID = `anon_${uuidv4()}`;
      return {
        uuid: randomUserID,
        displayName: randomUserID,
        metadata: null
      };
    }
    ```

## Experimenting with the demo app features
### Creating a channel

1. Sign in to the client.
2. In the **Channels** pane, choose the menu (•••).
3. In the **Add channel** box, enter a channel name. Choose a desired privacy and mode.
4. Channel Type decides which channel to create. Choose based on your requirements.
    - **Create Standard channel**
        - Select channel Type `Standard`.
    
    - **Create Elastic channel**
        - Select channel Type `Elastic`.
        - Enter values of `Maximum SubChannels`, `Target Memberships Per SubChannel` and `Scale-In Minimum Memberships`.

5. Choose **Add**.

**Sample code**

```js

const getElasticChannelConfig = (
  maximumSubChannels,
  targetMembershipsPerSubChannel,
  minimumMembershipPercentage
) => {
  return {
    MaximumSubChannels: maximumSubChannels,
    TargetMembershipsPerSubChannel: targetMembershipsPerSubChannel,
    MinimumMembershipPercentage: minimumMembershipPercentage,
  };
};

const elasticChannelConfiguration = getElasticChannelConfig(maximumSubChannels, targetMembershipsPerSubChannel, minimumMembershipPercentage);

async function createChannel(appInstanceArn, name, mode, privacy, elasticChannelConfiguration, userId) {
  console.log('createChannel called');
  const chime =  new AWS.Chime({
        region: 'us-east-1',
        endpoint: endpoint
  });
  const params = {
    AppInstanceArn: appInstanceArn,
    Name: name,
    Mode: mode,
    Privacy: privacy
  };
  if (elasticChannelConfiguration) {
    params['ElasticChannelConfiguration'] = elasticChannelConfiguration;
  }
  const request = chime.createChannel(params);
  request.on('build', function() {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      userId
    );
  });
  const response = await request.promise();
  return response.ChannelArn;
}
```

### Adding channel members

1. Sign in to the client.
2. Select a channel in the **Channels** pane.
3. Choose the channel menu (•••).
4. Choose **Add members** under the dropdown menu (•••) of a selected channel. Note that this option only appears if you have permission to add a member.
5. Choose a member and choose **Add**. Note that the member should have signed in to the client before.

**Sample code**

```js
async function createChannelMembership(channelArn, memberArn, userId, subChannelId) {
    console.log('createChannelMembership called');
    const chime =  new AWS.Chime({
        region: 'us-east-1',
        endpoint: endpoint
    });

    var params = {
        ChannelArn: channelArn,
        MemberArn: memberArn,
        SubChannelId: subChannelId // Required only when creating memebrship for a subchannel of an elastic channel
    };

    let request = chime.createChannelMembership(params);
    request.on('build', function() {
        request.httpRequest.headers[serviceUserHeader] = createMemberArn(userId);
    });
    let response = await request.promise();
    return response.Member;
}
```

### Sending messages

1. Sign in to the client.
2. Choose a channel.
3. Type a message and choose **Send**.

**Sample code**

```js
/**
 * Function to send channel message
 * @param {channelArn} string Channel Arn
 * @param {messageContent} string Message content
 * @param {member} string Chime channel member
 * @param {options{}} object Additional attributes for the request object.
 * @param {subChannelId} string subChannelId, available only if the channel is a subchannel
 * @returns {object} sendMessage object;
 */
async function sendChannelMessage(
  channelArn,
  messageContent,
  member,
  subChannelId,
  options = null
) {
  console.log('sendChannelMessage called');
  const chime =  new AWS.Chime({
        region: 'us-east-1',
        endpoint: endpoint
  });
  const params = {
    ChannelArn: channelArn,
    Content: messageContent,
    Persistence: 'PERSISTENT', // Allowed types are PERSISTENT and NON_PERSISTENT
    Type: 'STANDARD', // Allowed types are STANDARD and CONTROL
    SubChannelId: subChannelId, // Required only when sending message to a subchannel of an elastic channel
  };
  if (options && options.Metadata) {
    params.Metadata = options.Metadata;
  }

  const request = chime.sendChannelMessage(params);
  request.on('build', function() {
    request.httpRequest.headers[appInstanceUserArnHeader] = createMemberArn(
      member.userId
    );
  });
  const response = await request.promise();
  const sentMessage = {
    response: response,
    CreatedTimestamp: new Date(),
    Sender: { Arn: createMemberArn(member.userId), Name: member.username }
  };
  return sentMessage;
}
```
### Using channel flows
1. To create channel flow and be able to add them to your channels, follow the [Use Channel Flows blog post](https://aws.amazon.com/blogs/business-productivity/use-channel-flows-to-remove-profanity-and-sensitive-content-from-messages-in-amazon-chime-sdk-messaging/) or you can deploy a stack by browsing the [channelFlowBlogTemplate.yaml](src/backend/serverless/channelFlowBlogTemplate.yaml) file in the `src/backend/serverless` directory.
2. Follow steps from [Use Channel Flows blog post](https://aws.amazon.com/blogs/business-productivity/use-channel-flows-to-remove-profanity-and-sensitive-content-from-messages-in-amazon-chime-sdk-messaging/) to get the demo app running.
3. Add channel flow to a channel by choosing the **Manage channel flow** option from the channel menu.
4. Send Messages on the channel with profanity or PII and see sensitive content being redacted. More details in the [Use Channel Flows blog post](https://aws.amazon.com/blogs/business-productivity/use-channel-flows-to-remove-profanity-and-sensitive-content-from-messages-in-amazon-chime-sdk-messaging/).

### Presence and typing indicators
The chat demo app also supports presence and typing indicators within a channel. To learn more, see the
[Build presence and typing indicators with Amazon Chime SDK messaging
](https://aws.amazon.com/blogs/business-productivity/build-presence-and-typing-indicators-with-amazon-chime-sdk-messaging/) blog post.

### Elastic Channels
1. Elastic channels support large-scale chat experiences for up to one million users. Use cases include watch parties for sporting events, political events, or live entertainment with create elastic channels
2. Elastic channels make it easy to create secure, scalable, moderated chat experiences for large audiences which one can use with built in moderation features to help enforce brand, corporate, or community guidelines. 
3. Elastic channels feature is available in the US East (N. Virginia) region and supports up to 1 Million members (see [Messaging Quotas](https://docs.aws.amazon.com/general/latest/gr//chime-sdk.html) for default values) 
4. Existing channel flows feature can be used to automate moderation across all messages sent in the elastic channel.
5. An elastic channel is a collection of subchannels with memberships distributed across subchannels.
6. To create an elastic channel, provide channel name, privacy, and select channel Type `Elastic` and add desired value of `Maximum SubChannels`, `Target Memberships Per SubChannel` & `Scale-In Minimum Memberships`. Refer to [CreateChannel API](https://docs.aws.amazon.com/chime-sdk/latest/APIReference/API_messaging-chime_CreateChannel.html) for more details.
7. Moderator can list and join subchannels in an elastic channel with members count by choosing **List subchannels** option from the channel menu.
8. Moderators can manage members in a subchannel by choosing **Manage members** option from the subchannel menu.
9. Users can view members and leave subchannel using **View members** and **Leave channel** options repectively, from subchannel menu.

## Recommendations
When you deploy the AWS CloudFormation template in a production environment, we recommend that you use a specific origin for the
`Access-Control-Allow-Origin` response header to scope-down access to resources.
