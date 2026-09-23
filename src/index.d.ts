/// <reference types="cypress" />
import type * as MailSlurpClient from "mailslurp-client";

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp(config?: MailSlurpClient.Config): Chainable<MailSlurpClient.MailSlurp>;
        }
    }
}
