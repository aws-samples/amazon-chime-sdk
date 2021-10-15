import { ComprehendMedical } from "aws-sdk";
import { Entity } from "aws-sdk/clients/comprehendmedical";

const detectEntities = async (
  text: string | undefined,
  clientParams?: ComprehendMedical.Types.ClientConfiguration
): Promise<Entity[]> => {
  const comprehendMedical = new ComprehendMedical(clientParams);

  if (text === undefined || text.replace(/\s/g, "") === "") return [];
  const resp = await comprehendMedical
    .detectEntitiesV2({ Text: text })
    .promise();
  return resp.Entities;
};

export default detectEntities;
