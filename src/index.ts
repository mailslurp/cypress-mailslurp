/// <reference types="./" />
import { MailSlurp } from 'mailslurp-client';
import type * as MailSlurpClient from 'mailslurp-client';

const missingApiKeyError =
  'Error no MailSlurp API Key. Please either pass the mailslurp command a valid Config object or set the `CYPRESS_MAILSLURP_API_KEY` ' +
  'environment variable to the value of your MailSlurp API Key to use the MailSlurp Cypress plugin. ' +
  'Create a free account at https://app.mailslurp.com/sign-up/. See https://docs.cypress.io/app/guides/environment-variables for more information.';

function register(Cypress: Cypress.Cypress) {
  Cypress.Commands.add(
    'mailslurp' as any,
    ((config?: MailSlurpClient.Config) => {
      const createClient = (apiKey: string) =>
        new MailSlurp({
          ...config,
          apiKey,
          basePath: 'https://cypress.api.mailslurp.com',
        });

      if (config?.apiKey) {
        return Promise.resolve(createClient(config.apiKey));
      }

      // API keys are secrets. Cypress 15.10+ retrieves them asynchronously
      // without serializing every configured environment variable into the browser.
      return cy
        .env(['MAILSLURP_API_KEY'], { log: false })
        .then((environment: Record<string, string | undefined>) => {
          const { MAILSLURP_API_KEY } = environment;

          if (!MAILSLURP_API_KEY) {
            throw new Error(missingApiKeyError);
          }

          return createClient(MAILSLURP_API_KEY);
        });
    }) as any
  );
}

register(Cypress as unknown as Cypress.Cypress);
