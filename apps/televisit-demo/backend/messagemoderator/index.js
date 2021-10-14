const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
var translate = new AWS.Translate();
var comprehend = new AWS.Comprehend();
const lex = new AWS.LexRuntime();

const {
    sendChannelMessage,
    updateChannelMessage,
    listChannelMessages
} = require("./ChimeMessagingAPI");

console.log('Loading function');

const { DOCUMENT_CLASSIFIER_ENDPOINT, CHIME_APP_INSTANCE_ARN, CHIME_APP_INSTANCE_ADMIN_ROLE_ARN } = process.env;

exports.handler = function(event, context) {


    event.Records.forEach(async(record) => {

        // Kinesis data is base64 encoded so decode here
        var payload = Buffer.from(record.kinesis.data, 'base64').toString();
        console.log('Decoded payload:', payload);

        //Parsing payload as a JSON message payload
        var jsonMessage = JSON.parse(payload);
        var senderId = jsonMessage.Payload.Sender.Arn.substring(jsonMessage.Payload.Sender.Arn.lastIndexOf("/") + 1);
        var channelArn = jsonMessage.Payload.ChannelArn;
        var messageId = jsonMessage.Payload.MessageId;


        console.log('Message content:', jsonMessage.Payload.Content);
        if (jsonMessage.Payload.Content.startsWith("/")) {
            jsonMessage.MessageCommand = jsonMessage.Payload.Content.split(" ")[0];
            jsonMessage.MessageCommandValue = jsonMessage.Payload.Content.split(" ")[1];
            jsonMessage.Payload.Content = jsonMessage.Payload.Content.replace(jsonMessage.MessageCommand + " " + jsonMessage.MessageCommandValue + " ", "");
        }

        // chatbot
        var userinput = jsonMessage.Payload.Content;

        if (jsonMessage.Payload.Redacted == true || jsonMessage.EventType == "UPDATE_CHANNEL_MESSAGE" || jsonMessage.Payload.Sender.Name == "ModeratorBot") {
            return;
        }
        var comprehendParams = {
            Text: userinput
        };
        var detectedLang = await comprehend.detectDominantLanguage(comprehendParams).promise();
        console.log("detectedLang: " + detectedLang.Languages[0].LanguageCode);

        if (detectedLang.Languages[0].LanguageCode != 'en') {
            var translateParams = {
                SourceLanguageCode: detectedLang.Languages[0].LanguageCode,
                TargetLanguageCode: 'en',
                Text: userinput
            };
            var translatedText = await translate.translateText(translateParams).promise();
            console.log("TranslatedText: " + translatedText.TranslatedText);

            await updateChannelMessage(
                channelArn,
                messageId,
                userinput + ' ' + translatedText.TranslatedText,
                jsonMessage.Payload.Metadata,
                senderId)
        }

        if (senderId != 'ModeratorBot' && (userinput.toLowerCase() == 'yes' || userinput.toLowerCase() == 'no')) {
            const messages = await listChannelMessages(channelArn, senderId);
            await updateChannelMessage(
                channelArn,
                messageId,
                messages.Messages.slice(-2)[0].Content + ': ' + userinput,
                jsonMessage.Payload.Metadata,
                senderId)
        }

        var botinput = translatedText ? translatedText.TranslatedText : jsonMessage.Payload.Content
        var params = {
            botName: 'PatientAppointmentDemoBot',
            botAlias: 'demo',
            inputText: botinput,
            userId: senderId,
            sessionAttributes: {
                "userPreferredLocale": 'en'
            }
        };
        var lexResponse = await lex.postText(params).promise();
        console.log("Lex response: " + JSON.stringify(lexResponse));

        if (detectedLang.Languages[0].LanguageCode != 'en') {
            translateParams = {
                SourceLanguageCode: 'en',
                TargetLanguageCode: detectedLang.Languages[0].LanguageCode,
                Text: lexResponse.message
            };
            translatedText = await translate.translateText(translateParams).promise();
            console.log("TranslatedText: " + translatedText.TranslatedText);
            await sendChannelMessage(channelArn, lexResponse.message + ' ' + translatedText.TranslatedText, 'ModeratorBot');
        } else {
            await sendChannelMessage(channelArn, lexResponse.message, 'ModeratorBot');
        }

    });
};