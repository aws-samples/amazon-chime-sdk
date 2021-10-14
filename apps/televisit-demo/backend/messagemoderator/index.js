const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION });
const translate = new AWS.Translate();
const comprehend = new AWS.Comprehend();
const lex = new AWS.LexRuntime();

const {
  sendChannelMessage,
  updateChannelMessage,
  listChannelMessages
} = require('./ChimeMessagingAPI');

console.log('Loading function');

const { DOCUMENT_CLASSIFIER_ENDPOINT, CHIME_APP_INSTANCE_ARN, CHIME_APP_INSTANCE_ADMIN_ROLE_ARN } = process.env; 

exports.handler = function(event, context) {
  try {
    event.Records.forEach(async (record) => {  // If event.Records has many items, e.g. 100 times, this Lambda will make 100 sendChannelMessage API calls simultaneously, so please consider throttling exceptions. 
      // Kinesis data is base64 encoded so decode here
      const payload = Buffer.from(record.kinesis.data, 'base64').toString();
      console.log('Decoded payload:', payload);
      //Parsing payload as a JSON message payload
      const jsonMessage = JSON.parse(payload);
      const senderId = jsonMessage.Payload.Sender.Arn.substring(jsonMessage.Payload.Sender.Arn.lastIndexOf("/")+1);
      const channelArn = jsonMessage.Payload.ChannelArn;
      const messageId = jsonMessage.Payload.MessageId;
      console.log('Message content:', jsonMessage.Payload.Content);
      // chatbot
      const userinput = jsonMessage.Payload.Content;
      if (jsonMessage.Payload.Redacted === true || jsonMessage.EventType === "UPDATE_CHANNEL_MESSAGE" || jsonMessage.Payload.Sender.Name === "ModeratorBot"){
        return;
      }
      const comprehendParams = {
        Text: userinput
      };
      const detectedLang = await comprehend.detectDominantLanguage(comprehendParams).promise();
      console.log('detectedLang: ' + detectedLang.Languages[0].LanguageCode);
      
      let translatedText;
      if (detectedLang.Languages[0].LanguageCode !== 'en') {
        const translateParams = {
          SourceLanguageCode: detectedLang.Languages[0].LanguageCode, 
          TargetLanguageCode: 'en', 
          Text: userinput
        };
        translatedText = await translate.translateText(translateParams).promise();
        console.log('TranslatedText: ' + translatedText.TranslatedText);
        await updateChannelMessage(
          channelArn,
          messageId,
          userinput+' '+translatedText.TranslatedText,
          jsonMessage.Payload.Metadata,
          senderId)
      }
      
      if (senderId !== 'ModeratorBot' && (userinput.toLowerCase()==='yes' || userinput.toLowerCase()==='no')) {
        const messages = await listChannelMessages(channelArn,senderId);
        await updateChannelMessage(
          channelArn,
          messageId,
          messages.Messages.slice(-2)[0].Content + ': ' + userinput,
          jsonMessage.Payload.Metadata,
          senderId)
      }
      
      const botinput = translatedText? translatedText.TranslatedText : jsonMessage.Payload.Content
      const params = {
          botName: 'PatientAppointmentDemoBot',
          botAlias: 'demo',
          inputText: botinput,
          userId: senderId,
          sessionAttributes: {
              'userPreferredLocale': 'en'
          }
      };
      const lexResponse = await lex.postText(params).promise();
      console.log('Lex response: ' + JSON.stringify(lexResponse));
      
      if (detectedLang.Languages[0].LanguageCode !== 'en') {
        const translateParams = {
          SourceLanguageCode: 'en', 
          TargetLanguageCode: detectedLang.Languages[0].LanguageCode, 
          Text: lexResponse.message
        };
        translatedText = await translate.translateText(translateParams).promise();
        console.log('TranslatedText: ' + translatedText.TranslatedText);
        await sendChannelMessage(channelArn, lexResponse.message + ' ' + translatedText.TranslatedText, 'ModeratorBot');    
      } else {
        await sendChannelMessage(channelArn, lexResponse.message, 'ModeratorBot');    
      }
    });
  } catch (e) {
    console.log(JSON.stringify(e));
    return;
  }
};