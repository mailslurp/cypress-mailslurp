/// <reference types="cypress" />
/// <reference types="../../src" />
//<gen>cy_plugin_test_usage
describe('sign up using disposable email', function () {
    //<gen>cy_example_short
    it('can sign up using throwaway mailbox', function () {
        // create a mailslurp instance
        cy.mailslurp().then(function (mailslurp) {
            // visit the demo application
            cy.visit('/');
            // create an email address and store it on this
            cy.then(() => mailslurp.createInbox())
                .then((inbox) => {
                    // save inbox id and email address to this
                    cy.wrap(inbox.id).as('inboxId');
                    cy.wrap(inbox.emailAddress).as('emailAddress');
                })
            // fill user details on app
            cy.get('[data-test=sign-in-create-account-link]').click()
            cy.then(function () {
                // access stored email on this, make sure you use Function and not () => {} syntax for correct scope
                cy.get('[name=email]').type(this.emailAddress)
                cy.get('[name=password]').type('test-password')
                return cy.get('[data-test=sign-up-create-account-button]').click();
            })
            // now wait for confirmation mail
            cy.then({
                // add timeout to the step to allow email to arrive
                timeout: 60_000
            }, function () {
                return mailslurp
                    // wait for the email to arrive in the inbox
                    .waitForLatestEmail(this.inboxId, 60_000, true)
                    // extract the code with a pattern
                    .then(email => mailslurp.emailController.getEmailContentMatch({
                        emailId: email.id,
                        contentMatchOptions: {
                            // regex pattern to extract verification code
                            pattern: 'Your Demo verification code is ([0-9]{6})'
                        }
                    }))
                    // save the verification code to this
                    .then(({ matches }) => cy.wrap(matches[1]).as('verificationCode'))
            });
            // confirm the user with the verification code
            cy.then(function () {
                cy.get('[name=code]').type(this.verificationCode)
                cy.get('[data-test=confirm-sign-up-confirm-button]').click()
                // use the email address and a test password
                cy.get('[data-test=username-input]').type(this.emailAddress)
                cy.get('[data-test=sign-in-password-input]').type('test-password')
                // click the submit button
                return cy.get('[data-test=sign-in-sign-in-button]').click();
            })
            cy.get('h1').should('contain', 'Welcome');
        });
    });
    //</gen>
});