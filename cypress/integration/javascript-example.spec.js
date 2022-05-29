describe('MailSlurp plugin example', () => {
  it('Can get mailslurp instance and controllers', () => {
    cy.mailslurp().then(mailslurp => {
      // has instance and methods
      expect(mailslurp).to.exist;
      expect(typeof mailslurp.createInbox).to.equal('function');
      // has controllers
      expect(mailslurp.inboxController).to.exist;
    });
  });
  it('Can call mailslurp methods', () => {
    cy.mailslurp()
      .then(mailslurp => mailslurp.createInbox())
      .then(inbox => {
        expect(inbox.emailAddress).to.contain('@mailslurp');
        return inbox;
      });
  });
  context('Share variables', () => {
    before(() => {
      return cy
        .mailslurp()
        .then(mailslurp => mailslurp.createInbox())
        .then(inbox => {
          expect(inbox).to.exist;
          cy.wrap(inbox.id).as('inboxId');
          cy.wrap(inbox.emailAddress).as('emailAddress');
        });
    });
    it('can access inbox using this', function() {
      expect(this.inboxId).to.exist;
      expect(this.emailAddress).to.contain('@mailslurp');
    });
  });
});
