/// <reference types="cypress" />
//<gen>cy_plugin_test_usage
describe('basic usage', function () {
  it('can load the plugin', function () {
    // test we can connect to mailslurp
    cy.mailslurp()
      .then(mailslurp => mailslurp.userController.getUserInfo())
      .then(userInfo => {
        expect(userInfo.id).to.exist
      })
  })
});
//</gen>
describe('store values', function () {
  //<gen>cy_store_values
  beforeEach(function() {
    return cy
        .mailslurp()
        .then(mailslurp => mailslurp.createInbox())
        .then(inbox => {
          // save inbox id and email address to this (make sure you use function and not arrow syntax)
          cy.wrap(inbox.id).as('inboxId');
          cy.wrap(inbox.emailAddress).as('emailAddress');
        });
  });
  it('can access values on this', function() {
    // get wrapped email address and assert it is valid
    expect(this.emailAddress).to.match(/^[^@]+@[^@]+$/);
  });
  //</gen>
})
//<gen>cy_example_test
describe('user sign up test with mailslurp plugin', function() {
  it('can verify a new user by email', function() {
    cy.mailslurp().then(function(mailslurp) {
      cy.then(() => mailslurp.createInbox()).then(inbox => {
        cy.wrap(inbox.id).as('inboxId')
        cy.wrap(inbox.emailAddress).as('emailAddress')
      })

      cy.visit('/')
      cy.get('[data-test=sign-in-create-account-link]').click()
      cy.then(function() {
        cy.get('[name=email]').type(this.emailAddress)
        cy.get('[name=password]').type('test-password')
        cy.get('[data-test=sign-up-create-account-button]').click()
      })

      cy.then({ timeout: 60_000 }, function() {
        return mailslurp.waitForLatestEmail(this.inboxId, 60_000, true)
      })
        .then(email => {
          const code = /verification code is (\d{6})/.exec(
            email.body ?? ''
          )?.[1]
          if (!code) {
            throw new Error('Verification email did not contain a code')
          }
          return code
        })
        .then(code => {
          cy.get('[name=code]').type(code)
          cy.get('[data-test=confirm-sign-up-confirm-button]').click()
        })

      cy.then(function() {
        cy.get('[data-test=username-input]').type(this.emailAddress)
        cy.get('[data-test=sign-in-password-input]').type('test-password')
        cy.get('[data-test=sign-in-sign-in-button]').click()
      })
      cy.get('h1').should('contain', 'Welcome')
    })
  })
});
//</gen>
