/// <reference types="cypress" />
/// <reference types="../../src" />
//<gen>cy_plugin_test_usage
describe('basic usage', function () {
  it('can load the plugin', async function () {
    // test we can connect to mailslurp
    const mailslurp = await cy.mailslurp();
    const userInfo = await mailslurp.userController.getUserInfo();
    expect(userInfo.id).to.exist
  })
});
describe('store values', function () {
  //<gen>cy_store_values
  before(function() {
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
    // get wrapped email address and assert contains a mailslurp email address
    expect(this.emailAddress).to.contain('@mailslurp');
  });
  //</gen>
})
//</gen>
//<gen>cy_example_test
describe('user sign up test with mailslurp plugin', function() {
  // use cypress-mailslurp plugin to create an email address before test
  before(function() {
    return cy
      .mailslurp()
      .then(mailslurp => mailslurp.createInbox())
      .then(inbox => {
        // save inbox id and email address to this (make sure you use function and not arrow syntax)
        cy.wrap(inbox.id).as('inboxId');
        cy.wrap(inbox.emailAddress).as('emailAddress');
      });
  });
  it('01 - can load the demo application', function() {
    // get wrapped email address and assert contains a mailslurp email address
    expect(this.emailAddress).to.contain('@mailslurp');
    // visit the demo application
    cy.visit('/');
    cy.title().should('contain', 'React App');
  });
  // use function instead of arrow syntax to access aliased values on this
  it('02 - can sign up using email address', function() {
    // click sign up and fill out the form
    cy.get('[data-test=sign-in-create-account-link]').click();
    // use the email address and a test password
    cy.get('[name=email]')
      .type(this.emailAddress)
      .trigger('change');
    cy.get('[name=password]')
      .type('test-password')
      .trigger('change');
    // click the submit button
    cy.get('[data-test=sign-up-create-account-button]').click();
  });
  it('03 - can receive confirmation code by email', function() {
    // app will send user an email containing a code, use mailslurp to wait for the latest email
    cy.mailslurp()
      // use inbox id and a timeout of 30 seconds
      .then(mailslurp =>
        mailslurp.waitForLatestEmail(this.inboxId, 30000, true)
      )
      // extract the confirmation code from the email body
      .then(email => /.*verification code is (\d{6}).*/.exec(email.body!!)!![1])
      // fill out the confirmation form and submit
      .then(code => {
        cy.get('[name=code]')
          .type(code)
          .trigger('change');
        cy.get('[data-test=confirm-sign-up-confirm-button]').click();
      });
  });
  // fill out sign in form
  it('04 - can sign in with confirmed account', function() {
    // use the email address and a test password
    cy.get('[data-test=username-input]')
      .type(this.emailAddress)
      .trigger('change');
    cy.get('[data-test=sign-in-password-input]')
      .type('test-password')
      .trigger('change');
    // click the submit button
    cy.get('[data-test=sign-in-sign-in-button]').click();
  });
  // can see authorized welcome screen
  it('05 - can see welcome screen', function() {
    // click sign up and fill out the form
    cy.get('h1').should('contain', 'Welcome');
  });
});
//</gen>