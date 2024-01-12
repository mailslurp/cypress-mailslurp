/// <reference types="./">
import {Config, MailSlurp} from "mailslurp-client";
function register(Cypress: Cypress.Cypress) {
    Cypress.Commands.add('mailslurp' as any, ((config?: Config) => {
        // read the API Key from environment variable (see the API Key section of README)
        const apiKey = config?.apiKey ?? Cypress.env('MAILSLURP_API_KEY');
        if (!apiKey) {
            throw new Error(
                'Error no MailSlurp API Key. Please either pass the mailslurp command a valid Config object or set the `CYPRESS_MAILSLURP_API_KEY` ' +
                'environment variable to the value of your MailSlurp API Key to use the MailSlurp Cypress plugin. ' +
                'Create a free account at https://app.mailslurp.com/sign-up/. See https://docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_ for more information.'
            );
        }
        const mailslurp = new MailSlurp({ ...config, apiKey, basePath: 'https://cypress.api.mailslurp.com' });
        return Promise.resolve(mailslurp);
    }) as any);
}
register(Cypress);
