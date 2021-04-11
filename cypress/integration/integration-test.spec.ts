/// <reference types="cypress" />
/// <reference types="../../src" />

describe("user sign up test with mailslurp plugin", () => {
    before(() => {
        return cy.mailslurp()
            .then(mailslurp => mailslurp.createInbox())
            .then(inbox => cy.wrap(inbox).as('inbox'))
    });
    it("can access context", function () {
        expect(this.inbox.emailAddress).to.contain("@mailslurp");
    })
});