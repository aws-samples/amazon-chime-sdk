# Welcome to Amazon Chime SDK Televisit Demo

The diagram of architecture is here:

![arch](images/chime-sdk-telemedicine.jpg)

### Prerequisites

To deploy the serverless demo you will need:

- Node 10 or higher
- npm 6.11 or higher

And install aws and sam command line tools:

- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)
- [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

- Install [jq](https://stedolan.github.io/jq/), like:

```bash
npm install -g jq
```

### Run deployment script

If you want to try the Chatbot interaction with Amazon Chime SDK chat, create a Amazon Lex V1 Bot in us-east-1 region by importing this [zip file](https://telemedicine-demo-using-chime-sdk.s3.amazonaws.com/ChimeSDKTelemedicineDemoBot_LEX_V1.zip). Build and Publish the chat bot with alias as ‘demo’.

You can run deploy.sh script in this folder to automatically deploy both frontend and backend stacks. 

```bash
cd apps/televisit-demo
./deploy.sh
```

If you see the following prompts during frontend CloudFormation deployment, you just need to input the Amazon S3 bucket name that hosts the HTML and bundled Javascript file in addition to default values for other parameters:
```
Setting default arguments for 'sam deploy'
=========================================
Stack Name [chime-sdk-televisit-frontend]: 
AWS Region [us-east-1]: 
Parameter S3BucketNameForWebSite []: frontenddeploy
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [Y/n]: 
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: 
Save arguments to configuration file [Y/n]: 
SAM configuration file [samconfig.toml]: 
SAM configuration environment [default]: 
```

Alternatively, you can deploy backend and frontend manually: first go to backend folder and follow the README to deploy the CFN stack using AWS SAM CLI; then go to frontend folder and follow the READMD to build and deploy frontend stack.

### Explore the televisit demo

1. Register a new user
<p align="center">
  <img src="images/newregistration.png" width="500">
</p>

2. Confirm user registration on AWS Cognito console
<p align="center">
  <img src="images/confirmuser.png" width="500">
</p>

3. Create a new channel and interact with chatbot through Amazon Chime SDK chat
<p align="center">
  <img src="images/chatbot.png" width="500">
</p>

4. Start a new meeting and try live transcription and media capture functions
<p align="center">
  <img src="images/meeting.png" width="500">
</p>
