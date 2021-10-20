# Amazon Chime SDK Televisit Demo: Frontend Infrastructure

## Summary

This is the frontend React application that can be integrated with backend API Gateway to demonstrate telemedicine solution using Amazon Chime SDK.

## Assumptions

- The developer should have their own AWS account. No preexisting set up is required.
- The developer should have node.js installed to support running the Chime sample app
  - Node.js can be downloaded here → https://nodejs.org/en/download/
- **IMPORTANT** : We currently only support us-east-1 so all the set-up must be done in us-east-1.

## Running the Chime SDK Telemedicine Demo

1. Ensure your workspace has node.js installed. Type `node -v` in your terminal to confirm, and it should return a version number.
2. Fill up the parameter values in the configuration file src/Config.js using the backend stack outputs:

```
const appConfig = {
  apiGatewayInvokeUrl:'https://<API Gateway ID>.execute-api.us-east-1.amazonaws.com/Stage/',
  cognitoUserPoolId: 'us-east-1_<ID>',
  cognitoAppClientId: '<ID>',
  cognitoIdentityPoolId: 'us-east-1:<ID>',
  appInstanceArn: 'arn:aws:chime:us-east-1:<AWS Account>:app-instance/<ID>',
  region: 'us-east-1',
  attachments_s3_bucket_name: 'chimesdktelemedicine-chatattachmentsbucket-<ID>'
};
export default appConfig;

```

3. Run `npm install` to install the required dependencies.
4. In the frontend directory run `npm start` to start the client
5. Open https://0.0.0.0:9000/ in your browser
6. (Optional) To publish the web application, you can download the built static files in dist folder (chat.html and chat-bundle.js), and upload them to a S3 bucket that will host the static front end files with an Amazon CloudFront distribution.

### Register a New User

New users can register through the Amazon Chime Sample App.

1. Open a browser of your choice and navigate to [http://localhost:9000](http://localhost:9000/) to access the client (Accept the risk for self signed certificate)
2. Provide a Username and Password for the new user. The default user pool requires the password to be a minimum of 8 characters and contain at least one uppercase, lowercase, special character, and number.
3. Choose **Register**
4. Before this user can login, their account must be confirmed. The quickest way is to follow the steps under **Confirming a New Cognito User as an Account Admin**

### **Confirming a New Cognito User as an Account Admin**

1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/home)
2. Choose **Manage User Pools**
3. Choose the pool that you created
4. Choose **Users and groups **in the left side panel.
5. Choose the new user whose **Account Status** is **UNCONFIRMED.**
6. Choose **Confirm user.**
7. Now that user should be able to log in.

### **Logging In**

1. Open a browser of your choice and navigate to [http://localhost:9000](http://localhost:9000/)to access the client
2. Provide the username and password of the desired user.
3. Choose Login
4. Create new channel that can send message or create new meeting
