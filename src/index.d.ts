/// <reference types="cypress" />
import { MailSlurp, Config } from "mailslurp-client";

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp: (config?: Config) => Promise<MailSlurp>;
        }
    }
}
