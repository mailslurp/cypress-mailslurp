/// <reference types="cypress" />
import type * as MailSlurpClient from "mailslurp-client";

export type MailSlurpConfig = Omit<MailSlurpClient.Config, "apiKey"> & {
    apiKey?: string;
};

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp(config?: MailSlurpConfig): Chainable<MailSlurpClient.MailSlurp>;
        }
    }
}
