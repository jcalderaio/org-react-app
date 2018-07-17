import { execute, makePromise } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import gql from 'graphql-tag';
import { logger } from '../logger';
import { getConfig } from '../configuration/config';

const provisioningKey = 'provisioningUrl';
const log = logger('auth:provisioning');

export default function loadProfile(username) {
  let user;
  if (!username) return Promise.resolve({});
  if (username.substring('WSO2.ORG/')) user = username.replace('WSO2.ORG/', '');
  log(`Loading user profile for user ${username}`);
  const config = getConfig() || {};
  const provisioningUrl = config.auth && config.auth[provisioningKey];
  if (!provisioningUrl) {
    throw new Error(`The application configuration is missing the "${provisioningKey}" property under "auth".`);
  }
  const link = new HttpLink({ uri: provisioningUrl });
  const operation = {
    query: gql`
      query user($username: String!) {
        user {
          get(userId: $username) {
            id
            directEmail
            directId
            firstName
            lastName
            directEmail
            providerId
            groups
          }
        }
      }
    `,
    variables: {
      username: user
    }
    // operationName: {} //optional
    // context: {} //optional
    // extensions: {} //optional
  };

  return makePromise(execute(link, operation))
    .then(data => {
      log(`received data ${JSON.stringify(data, null, 2)}`);
      return data.data.user.get;
    })
    .catch(error => {
      log(`received error ${error}`);
      return Promise.reject(error);
    });
}
