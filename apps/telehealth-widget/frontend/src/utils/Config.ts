import ConfigJSON from '../config.json';

/**
 * CDK generates config.json that has uses custom stack name as a key.
 *  {
 *    "__CUSTOM_STACK_NAME__": {
 *      "CognitoIdentityPoolId": "...",
 *      ...
 *    }
 *  }
 * 
 * Instead, export only an object.
 * {
 *    "CognitoIdentityPoolId": "...",
 *    ...
 * }
 */
export default Object.values(ConfigJSON)[0];
