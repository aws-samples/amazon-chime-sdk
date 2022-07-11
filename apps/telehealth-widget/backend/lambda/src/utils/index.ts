import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';

import { CognitoUser } from '../../../../frontend/src/types';

/**
 * Convert
 * Array: [{ Name: 'hello', value: 'example@email.com' }, { Name: 'email', value: 'example@email.com' }]
 * to
 * Object: { username: 'hello', email: 'example@email.com' }
 */
export const getCognitoUser = (username: string, data: AdminGetUserCommandOutput): CognitoUser => {
  return {
    username,
    attributes: data.UserAttributes!.reduce(
      (previous, current) => ({
        ...previous,
        [current.Name!]: current.Value,
      }),
      {}
    ) as CognitoUser['attributes'],
  };
};
