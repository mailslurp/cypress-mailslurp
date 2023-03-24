/// <reference types="./">
//<gen>cy_import_mailslurp
import {MailSlurp} from "mailslurp-client";
//</gen>
function register(Cypress: Cypress.Cypress) {
    //<gen>cy_add_plugin
    // read the API Key from environment variable (see the API Key section of README)
    const apiKey = Cypress.env('MAILSLURP_API_KEY');
    if (!apiKey) {
        throw new Error(
            'Error no MailSlurp API Key. Please set the `CYPRESS_MAILSLURP_API_KEY` ' +
            'environment variable to the value of your MailSlurp API Key to use the MailSlurp Cypress plugin. ' +
            'Create a free account at https://app.mailslurp.com/sign-up/. See https://docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_ for more information.'
        );
    }
    // create an instance of mailslurp-client
    const mailslurp = new MailSlurp({ apiKey, basePath: 'https://cypress.api.mailslurp.com' });
    // register MailSlurp with cypress under "mailslurp" command
    // afterwards you can access it in tests using `cy.mailslurp().then(mailslurp => /* do stuff */)`
    Cypress.Commands.add('mailslurp' as  any, () => {
        return Promise.resolve(mailslurp);
    });
    //</gen>
}
register(Cypress);
