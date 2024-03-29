# Sample Customer Service Alexa Skill

Amazon Chime SDK Alexa Skill calling allows enterprise customers to enable calling directly in their Amazon
Alexa Skills. In this tutorial, we build an Alexa Skill that allows a customer to place a call to a
customer support.

## Prerequisites

For this walk-through, you should have the following pre-requisites:

- An [AWS account](https://aws.amazon.com/free/) with [administrator access](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).
- An [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) account.
- An Alexa enabled device that can place phone calls.

## Getting started

### Import Alexa calling Skill

Use the following guide to create an Alexa Skill by importing the provided sample Alexa Skill.

#### To create an Alexa Skill in Alexa Developer Console

Use the following steps to create an Alexa Skill. Once your Skill is created,
you can import the Alexa Skill AWS Lambda and interaction model for your Alexa Skill.

1. Log into [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) with your account.
2. Choose the **Create Skill**
3. Provide a Skill name. e.g. **My Customer Support**
4. Select **Other** for **Choose a type of experience** 
5. Select **Custom** for **Choose a model**
6. Select **Alexa-hosted (Node.js)** for **Choose a method to host your Skill's backend resources**
7. Choose **Create Skill**
8. Select **Start from Scratch** for **Choose a template to add to your Skill**
9. Choose **Continue with template**

#### To import sample Skill

Use the following steps to import the Alexa Skill AWS Lambda for your Alexa Skill.

1. Find the Alexa Skill in apps/alexa-skill-calling/skill-sample-simple-customer-support/simple-customer-support-skill folder in the provided sample code package.
2. Update "placeholder" destinationPhoneNumber and sourcePhoneNumber in the `apps/alexa-skill-calling/skill-sample-simple-customer-support/simple-customer-support-skill/lambda/config.js`.
   The phone number must be in E.164 phone number format. For example, "+12065551111".
3. Zip the `apps/alexa-skill-calling/skill-sample-simple-customer-support/simple-customer-support-skill` folder into a zip file.
   Within the `apps/alexa-skill-calling/skill-sample-simple-customer-support` folder,
   execute this command **zip -r simple-customer-support-skill.zip simple-customer-support-skill**
4. In the Alexa Developer Console of your newly created Skill, choose tab **Code**, then **Import Code**, and then Select the zip folder of this package
5. Choose **Next** and then select the **simple-customer-support-skill** folder
6. Choose **Next** and then **Import**.
7. After the **Import** is done, choose **Deploy** to deploy the AWS Lambda for your Alexa Skill.

#### To import interaction model

Use the following steps to import the Alexa Skill interaction model.

1. Within Alexa Developer Console, choose your newly created Skill.
2. Choose **Build**. Choose **Select Interaction Model** and then **Intents**. Choose **JSON Editor** and then **Drag and Drop**
3. Select the file in `apps/alexa-skill-calling/skill-sample-simple-customer-support/simple-customer-support-skill/interactionModels/custom/en-US.json` file in the provided sample code package.
4. Choose **Save Model** and then choose **Build Model**.
5. After the build finish, you should see a new Intents created in the **Interaction Model** drop down.

### Create Amazon Chime SDK PSTN Audio SIP media application (SMA)

Use the following guide to create a SMA application by importing the provided sample SMA application.

#### To provision phone number for SMA

You are now provisioning a phone number for your SMA application. Your Alexa Skill will call this newly provisioned phone number. Here are the steps.

1. Open the Amazon Chime SDK console at https://console.aws.amazon.com/chime-sdk/home.
2. Choose **Phone number management**, then **Order**, then **Provision phone numbers**, then **SIP Media Application Dial-In**, and then choose **Next**
3. Select **Local** as the **Type**. Select a state, for example, **California**. Choose the magnify glass to search for phone numbers.
4. Select one of the phone numbers and choose **Provision**.
5. Take note of this phone number. You will use this phone number in the **To create SMA AWS Lambda** step.

#### To create SMA AWS Lambda

Use the following guide to create a SMA AWS Lambda for your SMA. Your provisioned phone number will invoke this SMA AWS Lambda
when SMA receives a call from your Alexa Skill.

1. Open the AWS Lambda console at https://console.aws.amazon.com/lambda/home.
2. Choose **Create function**.
3. Leave the defaults including: **Author from scratch** and create a name for your function.
4. Choose **Create Function**
5. Take note of the ARN of this AWS Lambda by choosing the **Copy ARN** at the top right corner. You will use this AWS Lambda ARN in the **To create SMA** step.
6. Choose your newly created function. In the **Code** tab, copy the code in `apps/alexa-skill-calling/skill-sample-simple-customer-support/simple-play-audio/index.js`
   into the "index.js" file. Please be sure to rename your file to "index.js", not the default "index.mjs"; otherwise, your SMA AWS Lambda will not launch. 
7. Choose **Deploy** to deploy your AWS Lambda.
7. Choose **Configuration** and then **Permissions**
8. Under **Resource-based policy statements**, choose **Add permissions**
9. Select **AWS account**. Enter **ChimeSipMediaApplicationLambdaInvokePolicy** for Statement ID. Enter voiceconnector.chime.amazonaws.com for Principal.
10. Select "lambda:InvokeFunction" in the **Action** drop down list. Choose **Save**

#### To create SMA

Use the following steps to create a SMA application and a SMA rule. The SMA rule instructs SMA to invoke your SMA AWS Lambda 
when SMA receives a call from your Alexa Skill.

1. Open the Amazon Chime SDK console at https://console.aws.amazon.com/chime-sdk/home.
2. Choose **SIP media applications**
3. Choose the **Create**
4. Provide a name for your SMA application. Select **US East (N. Virginia)** as AWS region. Enter the ARN of the SMA AWS Lambda that you created above.
5. Choose **Create**.
6. Select your newly created SMA Application. Select **Rules** and choose **Create**
7. Provide a name for your SMA application rule. Select **To phone number** as the Trigger type.
8. Select the phone number that you just provisioned above in the **Phone number** drop down. Choose **Next** to create a SMA rule.
9. You have successfully created a SMA application. You can call the phone number that you just provisioned to verify that your SMA AWS Lambda is invoked.
The phone number may take a few minutes to be activated.

### Enable Amazon Chime SDK Alexa Skill calling

#### To find the Skill's client ID

To integrate your Alexa Skill with an Amazon Chime SDK SIP media application, you first need to find the Skill's client ID.

Note: Alexa Skills have Skill IDs and client IDs. For these steps, you only use the client ID.

To find a Skill's client ID

1. In the Alexa Developer Console, choose the desired Skill.
2. Choose Tools and then Permission.
3. At the bottom of the page, choose Timers to enable the Timers permission, and then choose Timers to disable the Timers permission.
   The client ID appears at the bottom of the Permission page. The ID has a prefix of amzn1.application-oa2-client followed by a string of characters.
   For example, amzn1.application-oa2-client.ad213256-e602-4756-9534-cc3b76b670b4.
4. Copy that ID and go to the next steps.

#### Integrate the Skill with a SIP media application

1. Open the Amazon Chime SDK console at https://console.aws.amazon.com/chime-sdk/home.
2. In the navigation pane, under SIP trunking, choose SIP media applications.
3. Select the SIP media application that you want to integrate.
4. Choose the **Alexa Skill Configuration** tab.
5. Under **Alexa Skill Status**, choose **Enabled**.
6. Under **Alexa Skill Client ID**, enter the ID from the previous steps.
7. Choose Save.

#### Enable the Communication - Calling permission for the Skill

After you integrate your Skill with a SIP media application, you use the Alexa Developer Console to
enable the "Communication - Calling" permission for the Skill. By default, that permission only appears after you integrate
a Skill with a SIP media application. Once you do that, the **Communication - Calling** permission appears at the bottom
of the Permission page in the Alexa Developer Console.

After you enable the permission, the Skill prompts users for their consent to make a call.

To enable the permission

1. In the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask), choose the desired Skill.
2. Choose Tools and then Permission.
3. At the bottom of the page, move the Communication - Calling slider to the on position.

## Use sample customer service Alexa Skill

Once you enabled Alexa Skill calling for your accounts, you can enable Alexa Skill calling for your devices.
Your users use the following steps to enable your Alexa Skill and use your Skill to place a call.

#### Enable Alexa Skill for your Alexa enabled device

To enable Alexa Skill for your Alexa enabled device

1. Login to Alexa Mobile App with the same account as your Alexa Developer account. This allows you to use your Skill without publishing the Skill.
2. After logging on the account, choose **More**, then **Skills & Games**, then **Your Skills**, and then **Dev**
3. Find and choose your newly created Skill. If your Skill is already enabled, disable the Skill and enable the Skill again to accept the **Make and Receive Calls** consent.
4. Choose **Enable**
5. Ensure that **Make and Receive Calls** Account Permissions is checked
6. Choose on **Save Permissions**.

#### Use your Alexa Skill to place a call with your Alexa enabled device

You can invoke your Skill Intent by first opening your Alexa Skill and then speak the name of your Intent.

1. You: "Alexa, open customer support"
2. Alexa: "Welcome to demo customer support. You can say call customer support to reach our customer support team"
3. You: "Alexa, call customer support"
4. Alexa: "Calling from skill"
5. Demo Call Center: "Thank you for calling demo customer support. Our customer representative is currently not available.
   Please call us back during our regular business hours. Goodbye."

Alternatively, you can invoke your Skill Intent by speak a single sentence.

1. You: "Alexa, ask customer support to call customer support"
2. Alexa: "Calling from skill"
3. Demo Call Center: "Thank you for calling demo customer support. Our customer representative is currently not available.
   Please call us back during our regular business hours. Goodbye."
