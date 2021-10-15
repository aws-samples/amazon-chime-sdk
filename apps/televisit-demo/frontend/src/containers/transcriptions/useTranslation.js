import { useState, useEffect } from "react";

import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

// React hook to take an array of transcript chunks and return a corresponding array of Comprehend results, one for each
export default function useTranslation(transcriptChunks, targetLanguage) {
  const translatedTranscriptChunks = [];
  const clientParams = {
    apiVersion: "2017-07-01",
    region: "us-east-1",
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken,
  };
  const translate = new AWS.Translate(clientParams);

  useEffect(async () => {
    for (const chunk of transcriptChunks) {
      const translateParams = {
        SourceLanguageCode: "auto",
        TargetLanguageCode: targetLanguage.split("-")[0],
        Text: chunk.text,
      };
      const response = await translate.translateText(translateParams).promise();
      chunk.text = response.TranslatedText;
      translatedTranscriptChunks.push({
        chunk,
      });
    }
  }, [transcriptChunks]);

  return transcriptChunks;
}
