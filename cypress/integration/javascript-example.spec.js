/// <reference types="cypress" />
describe('MailSlurp plugin example', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Can get mailslurp instance', () => {
    cy.mailslurp().then(mailslurp => {
      // has instance and methods
      expect(mailslurp).to.exist;
      expect(typeof mailslurp.createInbox).to.equal('function');
      // has controllers
      expect(mailslurp.inboxController).to.exist;
    })
  })
})
