/// <reference types="cypress" />

//<gen>cy_plugin_send_receive
describe('send and receive email', function () {
  it('can extract a code from a received email', function () {
    cy.mailslurp()
      .then(mailslurp => mailslurp.createInboxWithOptions({}))
      .then(inbox => {
        expect(inbox.emailAddress).to.match(/^[^@]+@[^@]+$/)
        cy.wrap(inbox.id).as('inboxId')
        cy.wrap(inbox.emailAddress).as('emailAddress')
      })

    cy.mailslurp().then(mailslurp => mailslurp.sendEmail(this.inboxId, {
      to: [this.emailAddress],
      subject: 'Email confirmation',
      body: 'Your code is: ABC-123',
    }))

    // Give Cypress slightly longer than the MailSlurp API wait.
    cy.mailslurp()
      .then({ timeout: 65_000 }, mailslurp =>
        mailslurp.waitForLatestEmail(this.inboxId, 60_000, true)
      )
      .then(email => {
        expect(email.subject).to.contain('Email confirmation')
        const code = /Your code is: (\w+-\d+)/.exec(email.body ?? '')?.[1]
        expect(code).to.equal('ABC-123')
      })
  })
})
//</gen>
