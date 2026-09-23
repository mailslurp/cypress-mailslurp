/// <reference types="cypress" />
import { MailSlurp, Config as MailSlurpConfig } from "mailslurp-client";

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp(config?: MailSlurpConfig): Chainable<MailSlurp>;
        }
    }
}
