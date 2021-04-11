/// <reference types="cypress" />
import { MailSlurp } from "mailslurp-client";

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp: () => Promise<MailSlurp>;
        }
    }
}
