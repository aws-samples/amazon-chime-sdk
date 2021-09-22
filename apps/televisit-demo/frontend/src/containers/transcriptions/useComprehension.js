import { useState, useEffect } from 'react';

import { v4 as uuid } from 'uuid';

import detectEntities from './detectEntities';
import inferICD10CM from './inferICD10CM';
import inferRxNorm from './inferRxNorm';
import { sortByScoreDescending } from './conceptUtils';
import AWS from 'aws-sdk';

// This WeakMap links single-line transcript chunks to their responses without directly attaching as a property
const resultMap = new WeakMap();

// React hook to take an array of transcript chunks and return a corresponding array of Comprehend results, one for each
export default function useComprehension(transcriptChunks) {
  const [result, setResult] = useState([]);
  const clientParams = {
    region: 'us-east-1',
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken
  }

  useEffect(() => {
    const addResult = (chunk, entities) => {
      const prev = resultMap.get(chunk);
      let next = [...prev];

      entities.forEach((e) => {
        const matching = prev.find((x) => {
          return (
            x.BeginOffset === e.BeginOffset &&
            x.EndOffset === e.EndOffset &&
            x.Type === e.Type &&
            x.Category === e.Category
          );
        });

        // If there's already an entity with these exact properties, extend it.
        // Specifically, for ICD10CM and RxNorm, there's usually a pre-existing
        // entity returned by the general comprehend response, and we're attaching
        // the concepts to it.
        if (matching) {
          next = next.filter((y) => y !== matching);
          next.push({ ...matching, ...e });
        } else {
          e.id = uuid();
          next.push(e);
        }
      });

      resultMap.set(chunk, next);
      setResult(transcriptChunks.map((chunk) => resultMap.get(chunk) ?? []));
    };

    for (const chunk of transcriptChunks) {
      const existing = resultMap.get(chunk);
      if (!existing) {
        resultMap.set(chunk, []);

        detectEntities(chunk.text, clientParams).then((entities) => {
          addResult(chunk, entities);
        });

        inferRxNorm(chunk.text, clientParams).then((rawEntities) => {
          const entities = addSelectedConceptCodeAndSortConcepts(rawEntities, 'RxNormConcepts');
          addResult(chunk, entities);
        });

        inferICD10CM(chunk.text, clientParams).then((rawEntities) => {
          const entities = addSelectedConceptCodeAndSortConcepts(rawEntities, 'ICD10CMConcepts');
          addResult(chunk, entities);
        });
      }
    }
  }, [transcriptChunks, clientParams]);

  return [result, setResult];
}

const addSelectedConceptCodeAndSortConcepts = (rawEntities, conceptAttribute) =>
  rawEntities.map((entity) => {
    if (entity[conceptAttribute].length === 0) return entity;

    const sortedConcepts = sortByScoreDescending(entity[conceptAttribute]);

    return { ...entity, [conceptAttribute]: sortedConcepts, selectedConceptCode: sortedConcepts[0].Code };
  });