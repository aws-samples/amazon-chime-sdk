# Amazon Chime SDK Chat Demo

## Overview

The easiest way to get started with messaging in the Amazon Chime SDK is to deploy our chat demo application. By completing the steps below, you will learn how to deploy the Amazon Chime SDK Chat Demo Application, create users and enable them to communicate in chat channels through an interface that will feel familiar to anyone that has used a modern chat messaging application. This application is designed in a way that it can be used as a starting point for your own application, or just a quick way to try out the features of the Amazon Chime SDK for messaging on your own. Please see the [Amazon Chime SDK Messaging App blog post](https://aws.amazon.com/blogs/business-productivity/build-chat-features-into-your-application-with-amazon-chime-sdk-messaging/) for more information.

## Prerequisites

- An [AWS account](https://aws.amazon.com/free/) that provides access to AWS services.
- [Node.js](https://nodejs.org/en/download/) version 14 or higher.

## Deploying the solution

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

## Running the Amazon Chime SDK Chat Demo

1. Navigate to the root directory of the Amazon Chime SDK chat demo `apps/chat`.
1. Open `src/Config.js` and update the configuration with the values from the previous section.
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

## Creating a channel

1. Sign in to the client.
1. In the **Channels** pane, choose the menu (•••).
1. In the **Add channel** box, enter a channel name. Choose a desired type and mode.
1. Choose **Add**.

**Sample code**

```js
async function createChannel(appInstanceArn, name, mode, privacy, userId) {
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

1. Sign in to the client
2. Select a channel in the **Channels** pane.
3. Choose the channel menu (•••).
4. Choose **Add members** under the dropdown menu (•••) of a selected channel. Note that this option only appears if you have permission to add a member.
5. Choose a member and choose **Add**. Note that the member should have signed in to the client before.

**Sample code**

```js
async function createChannelMembership(channelArn, memberArn, userId) {
    console.log('createChannelMembership called');
    const chime =  new AWS.Chime({
        region: 'us-east-1',
        endpoint: endpoint
    });

    var params = {
        ChannelArn: channelArn,
        MemberArn: memberArn
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

1. Sign in to the client
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
 * @returns {object} sendMessage object;
 */
async function sendChannelMessage(
  channelArn,
  messageContent,
  member,
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
    Type: 'STANDARD' // Allowed types are STANDARD and CONTROL
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
