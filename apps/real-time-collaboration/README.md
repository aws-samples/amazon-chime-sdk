# Real-time collaboration using Amazon Chime SDK messaging

The Amazon Chime SDK Messaging Yjs demo is a rich text editor that 
uses Yjs and the messaging features of the Amazon Chime SDK for collaborative editing.
[Yjs](https://github.com/yjs/yjs) is a network-agnostic CRDT framework for building collaboration features in web applications. 
In this demo, we use the Amazon Chime SDK messaging to store and exchange shared Yjs data. 
For more information, see the [Amazon Chime SDK Messaging Yjs blog post]().

## Prerequisites

Before getting started, you must have the following prerequisites:

* An [AWS account](https://aws.amazon.com/free)
that provides access to AWS services.
* Ensure that you have installed [Node.js](https://nodejs.org/en/) version 14 or higher.

## Getting started

### Creating AWS resources

1. Sign in to the AWS Management Console with your primary account. Switch to the **us-east-1 (N. Virginia)** Region. 
   Note: The AWS CloudFormation (https://aws.amazon.com/cloudformation/) template in this section needs to be 
   launched in US east (N. Virginia) Region.
2. Copy the contents of the AWS CloudFormation template from real-time collaboration sample app in
   [GitHub](https://github.com/aws-samples/amazon-chime-sdk/blob/main/apps/real-time-collaboration/backend/template.yaml) and 
   save it in a new file named `real-time-collaboration-app-template.yaml`.
3. Open the AWS CloudFormation console (https://console.aws.amazon.com/cloudformation/) and choose **Create stack**.
4. Choose **Upload a template file**, and then browse for `template.yaml` in the `./backend` folder.
5. For **Stack name**, type `real-time-collaboration-app-demo` and choose **Next**.
6. On the **Specify Details** page, enter the stack name: **DemoName-ChimeCollabDemo**
7. Choose **Next**, and then **Next** on the **Configure stack options** page.
8. On the **Review** page, check the **I acknowledge that AWS CloudFormation might create IAM resources** check box. Then click **Create**.
9. Creating the stack generates 3 outputs: **ApiGatewayUrl, AppInstanceArn, AdminUserArn**. Note these values 
   for the outputs to use to configure the app in the next step.

### Building the packages

```
npm install
npm run build
```

### Running the text editor demo application locally
1. Run the following commands to navigate to the `text-editor` folder:

    ```shell
    cd ./amazon-chime-sdk/apps/real-time-collaboration/examples/text-editor
    ```

2. Open src/Config.js with the editor of your choice. Add the following configuration to it:

    ```js
    export const appConfig = {
      ApiGatewayUrl: '',
      AppInstanceArn: '',
      AdminUserArn: ''
    };
    ```

3. Once the configuration for the application is entered, run the following commands in the text editor folder.

    ```
    npm run start
    ```

4. Open your browser and navigate to https://localhost:8080 to start testing. 
   The application updates the URL with the Amazon Chime channel created for this session. 
   Type a few words in the text editor.
5. Copy the URL with the Amazon Chime channel into a new web browser window. The new browser window shows 
   the text that you previously typed. Type a few words in the text editor of the new web browser window. 
   You can see the text is synchronized to the first web browser session.
   