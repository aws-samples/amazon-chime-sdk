<<<<<<< HEAD
import { ComprehendMedical } from "aws-sdk";
import { Entity } from "aws-sdk/clients/comprehendmedical";

const detectEntities = async (
  text: string | undefined,
  clientParams?: ComprehendMedical.Types.ClientConfiguration
): Promise<Entity[]> => {
  const comprehendMedical = new ComprehendMedical(clientParams);

  if (text === undefined || text.replace(/\s/g, "") === "") return [];
=======
import { ComprehendMedical } from 'aws-sdk';
import { Entity } from 'aws-sdk/clients/comprehendmedical';

const detectEntities = async (
  text: string | undefined,
  clientParams?: ComprehendMedical.Types.ClientConfiguration,
): Promise<Entity[]> => {
  const comprehendMedical = new ComprehendMedical(clientParams);

  if (text === undefined || text.replace(/\s/g, '') === '') return [];
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  const resp = await comprehendMedical.inferICD10CM({ Text: text }).promise();
  return resp.Entities;
};

<<<<<<< HEAD
export default detectEntities;
=======
export default detectEntities;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
