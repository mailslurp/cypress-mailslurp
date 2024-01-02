/// <reference types="cypress" />
/// <reference types="../../src" />
import {MailSlurp} from "mailslurp-client";

describe('methods', function () {
  it('can call common methods', async function () {
      cy.log("Creating inbox")
    //<gen>cy_plugin_create_inbox
    await cy.mailslurp()
        .then((mailslurp: MailSlurp) => mailslurp.createInboxWithOptions({}))
        .then(inbox => {
          expect(inbox.emailAddress).to.contain("@mailslurp")
          // save the inbox values for access in other tests
          cy.wrap(inbox.id).as('inboxId')
          cy.wrap(inbox.emailAddress).as('emailAddress')
        })
    //</gen>
      cy.log("Sending email")
    //<gen>cy_plugin_send_email
    await cy.mailslurp()
        .then((mailslurp: MailSlurp) => mailslurp.sendEmail(this.inboxId, {
          to: [this.emailAddress  ],
          subject: 'Email confirmation',
          body: 'Your code is: ABC-123',
        }))
    //</gen>
    //<gen>cy_plugin_wait
      cy.log("Waiting for email")
      await cy.mailslurp().then({
          // set a long timeout when waiting for an email to arrive
          timeout: 60_000,
      }, (mailslurp: MailSlurp) => mailslurp.waitForLatestEmail(this.inboxId, 60_000, true))
          .then(email => {
              expect(email.subject).toContain('Email confirmation')
              const code = email.body.match(/Your code is: (\w+-\d+)/)[1]
              expect(code).toEqual('ABC-1223')
          })
      //</gen>
  })
});