# Amazon Chime Chat SDK Developer Start Up Guide

## Summary

This doc is intended for developers interested in the Amazon Chime Meeting and Chat SDK, even those who may not have a strong technical background. It is meant to guide the developer through the steps required to start using the basic AWS Chime SDK demo client against their own AWS account. On completion of this guide, the developer will have a fully functional messaging, audio, and video client with basic auth sign in supported against their AWS resources. From here, the developer should have the minimal foundation required to expand the functionality to meet their own requirements.  For more information, please see the Amazon Chime SDK App blog post.

## Assumptions

- The developer should have their own AWS account. No preexisting set up is required.
- The developer should have node.js installed to support running the Chime sample app
  - Node.js can be downloaded here → https://nodejs.org/en/download/
- ** IMPORTANT** : We currently only support us-east-1 so all the set-up must be done in us-east-1.

## Cloudformation Deployment

1. Ensure AWS CLI is installed
    ```aws --version```
2. Obtain AWS credentials for your AWS account
3. Set the AWS credentials in the AWS CLI - https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.
4. Deploy included Cloudformation template via [Cloudformation Console](https://aws.amazon.com/cloudformation/)
    
    or
    
    ```aws cloudformation create-stack --stack-name <STACKNAME> --template-body file://src/backend/serverless/template.yaml --parameters ParameterKey=DemoName,ParameterValue=<NAME_OF_DEMO> --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND```
5. Verify and record outputs via [Cloudformation Console](https://aws.amazon.com/cloudformation/)
    
    or

    ```aws cloudformation describe-stacks --stack-name <STACKNAME>```

## Running the Amazon Chime Sample App

1. Ensure your workspace has node.js installed. Type `node -v` in your terminal to confirm, and it should return a version number.
2. Navigate to the root folder of Amazon Chime Sample App `apps/chat`
3. In the root directory `apps/chat`, open `src/Config.js` with the editor of your choice and update the each missing config with the values from the
 previously created resources.
4. In the root directory `apps/chat`, run `npm install` and then `npm start` to build and start the client
5. Open https://localhost:9000/ in your browser
6. By default the demo uses Amazon Cognito User Pools to manage users and login.  Alternatively, you can get credentials through a small 
 lambda service that the cloudformation template sets up.  If you prefer to use the default Cognito flow
 continue with [Cognito User Pools - Register a New User](#cognito-user-pools-register-a-new-user).  If you prefer to use the credential 
 exchange service see [Credential Exchange Service: Login](#Credential-Exchange-Service-Login).

#### Cognito User Pools: Register a New User

New users can register through the Amazon Chime Sample App.

1. Open a browser of your choice and navigate to [http://localhost:9000](http://localhost:9000/) to access the client.
2. Provide a Username and Password for the new user. The default user pool requires the password to be a minimum of 8 characters and contain at least one uppercase, lowercase, special character, and number.
3. Choose **Register**.
4. Before this user can login, their account must be confirmed. The quickest way is to follow the steps under **Confirming a New Cognito User as an Account Admin**.

#### Cognito User Pools: **Confirming a New Cognito User as an Account Admin**

1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/home).
2. Choose **Manage User Pools**.
3. Choose the pool that you created.
4. Choose **Users and groups **in the left side panel.
5. Choose the new user whose **Account Status** is **UNCONFIRMED**.
6. Choose **Confirm user.**
7. Now that user should be able to log in.

#### Cognito User Pools: **Logging In**

1. Open a browser of your choice and navigate to [http://localhost:9000](http://localhost:9000/) to access the client.
2. Provide the username and password of the desired user.
3. Choose Login.

Skip ahead to [Creating a Channel](#creating-a-channel)

#### Credential Exchange Service: Login

1. Open a browser of your choice and navigate to [http://localhost:9000](http://localhost:9000/) to access the client.
2. Change the drop down to Credential Exchange Service.
3. The Credential Exchange Service is a small lambda running behind API gateway that enables exchanging your applications or identity
provider's (IDP) token for AWS credentials, or for you to implement custom authentication. To simulate the processes of exchanging 
credentials, by default the lambda returns anonymous access regardless of the token provided. Click "Exchange Token for AWS Credentials" 
to get anonymous access to the chat application. If you wish to change the code to validate your application/IDP token or implement
custom authentication, modify the following code in /backend/serverless/template.yml.

```
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

### Creating a Channel

1. Log into the client
2. In the **Create new channel** box, enter a desired channel name
3. Choose **Create**

### Starting a Meeting

1. Choose the desire Channel from which to start the meeting
2. Choose the menu button for that Channel
3. Choose **Start Meeting**

**Sample Code**

```
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

### Adding Channel Members

1. Log into the client
2. Select a channel from the channel list
3. Click channel actions button
4. Click on “Add Member” option, ( will only show up if you have privileges to do so)
5. Pick a user from the provided list and click on them
6. Click ‘Add’ button to add user to the channel

**Sample Code**

```
async function createChannelMembership(channelArn, memberArn, userId) {
    console.log("createChannelMembership called");
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

### Sending Messages

1. Log into the client
2. Choose a channel. Create one if there is none.
3. Type the desired message
4. Choose **Send**

**Sample Code**

```
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
