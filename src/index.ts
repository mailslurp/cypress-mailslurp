/// <reference types="./">
import {MailSlurp} from "mailslurp-client";
function register(Cypress: Cypress.Cypress) {
    // check API Key
    const apiKey = Cypress.env('MAILSLURP_API_KEY');
    if (!apiKey) {
        throw new Error(
            'Error no MailSlurp API Key. Please set the CYPRESS_MAILSLURP_API_KEY ' +
            'environment variable to your MailSlurp API Key to use the MailSlurp Cypress plugin. ' +
            'Create a free account at https://app.mailslurp.com/sign-up/'
        );
    }

    // create instance
    const mailslurp = new MailSlurp({ apiKey, basePath: 'https://cypress.api.mailslurp.com' });
    Cypress.Commands.add('mailslurp', () => {
        return Promise.resolve(mailslurp);
    });
}
register(Cypress);
