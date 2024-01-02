/// <reference types="./">
//<gen>cy_import_mailslurp
import {Config, MailSlurp, CreateInboxDto, WaitForConditions, InboxDto} from "mailslurp-client";
//</gen>
function register(Cypress: Cypress.Cypress) {
    const getMailSlurp = (config?: Config) => {
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
    }
    const createInbox = (options: CreateInboxDto = {}) => {
        return getMailSlurp().then((mailslurp: MailSlurp)=> {
            return mailslurp.createInboxWithOptions(options).then((inbox: InboxDto) => {
                cy.wrap({
                    inbox: inbox,
                    inboxId: inbox.id,
                    emailAddress: inbox.emailAddress
                })
                return inbox
            })
        });
    };
    Cypress.Commands.add('mailslurp' as any, getMailSlurp as any);
    Cypress.Commands.add('createEmailAddress' as any, createInbox as any)
    Cypress.Commands.add('createInbox' as any, createInbox as any)
    Cypress.Commands.add('getEmail' as any, ((options?: WaitForConditions) => {
        return getMailSlurp().then((mailslurp: MailSlurp)=> {
            const inboxId = options?.inboxId ?? (this as any).inboxId
            const opts = { ...options, inboxId, timeout: options?.timeout ?? 120_000 }
                    return mailslurp.waitController.waitFor({ waitForConditions: opts })
        });
    }) as any)
}
register(Cypress);
