# MailSlurp Cypress Plugin
Official MailSlurp email plugin for Cypress JS. Create real test email accounts. Send and receive emails and attachments in Cypress tests. For more advanced usage see the standard [MailSlurp library](https://www.npmjs.com/package/mailslurp-client).

## Install

`npm install --save-dev cypress-mailslurp`

Then include the plugin in your `cypress/support/index.{js,ts}` file.

```typescript
import "cypress-mailslurp";
```

See the [example project](https://github.com/mailslurp/examples/tree/master/javascript-cypress-mailslurp-plugin) for setup help. Or run the example integration tests with `CYPRESS_MAILSLURP_API_KEY=your-api-key npm run cypress`.

## Setup
MailSlurp is free but requires an API Key. Get yours by [creating a free account](https://www.mailslurp.com/sign-up/).

### API Key
Set the environment variable `CYPRESS_MAILSLURP_API_KEY` or use the `cypress.json` file `env` property:

#### Environment variable

```bash
CYPRESS_MAILSLURP_API_KEY=your-api-key cypress run
```

#### Cypress env property
```json
{
  "env": {
    "MAILSLURP_API_KEY": "your-mailslurp-api-key"
  }
}
```

#### Timeouts
MailSlurp requires timeouts to wait for inbound emails. Set timeouts in `cypress.json`:

```json
{
  "defaultCommandTimeout": 30000,
  "responseTimeout": 30000,
  "requestTimeout": 30000
}
```

#### Typescript support
MailSlurp adds the `mailslurp` command to the Cypress `cy` object. Include the type definition reference comment in your test file or support index.ts:

```typescript
/// <reference types="cypress-mailslurp" />
```

Or define the type yourself like so:

```typescript
import { MailSlurp } from "mailslurp-client";

declare global {
    namespace Cypress {
        interface Chainable {
            mailslurp: () => Promise<MailSlurp>;
        }
    }
}
```

## Usage
The Cypress MailSlurp plugin provide one simple command attached to the Cypress object: `cy.mailslurp()`. This method returns a MailSlurp client instance that has all the same methods and properties as the [official MailSlurp client](https://www.npmjs.com/package/mailslurp-client). Use the command with the `then()` method to access the instance:

```typescript
cy.mailslurp().then(mailslurp => mailslurp.createInbox() /* etc */)
```

### Common methods
The client chained by the `cy.mailslurp()` has all the same methods and properties as the official MailSlurp client. See the [Javascript documentation](https://www.mailslurp.com/docs/js/) for a full [API reference](https://www.mailslurp.com/docs/js/docs/) or see the examples below.

The MailSlurp client has a number of convenience methods and also exposes the full MailSlurp API as controllers. See the [class reference for full method documentation](https://www.mailslurp.com/docs/js/docs/classes/MailSlurp/).

#### Create email address
You can create test email accounts with MailSlurp by creating inboxes. Inboxes have an `id` and an `emailAddress`. Save the `id` for later use when fetching or sending emails.

```typescript
cy.mailslurp()
    .then(mailslurp => mailslurp.createInbox())
    .then(inbox => expect(inbox.emailAddress).to.contain("@mailslurp"));
```

#### Receive emails in tests
Use the `waitFor` methods to wait for emails for an inbox. See the [email object docs](https://www.mailslurp.com/docs/js/docs/interfaces/email/) for full properties.
```typescript
cy.mailslurp()
    .then(mailslurp => mailslurp.waitForLatestEmail(undefined,undefined,inboxId,undefined,undefined, 30000, true))
    .then(email => expect(email.subject).to.contain("My email"))
```

#### Send emails
To send emails in Cypress tests first create an inbox then use the `sendEmail` method.

```typescript
cy.mailslurp()
    .then(mailslurp => mailslurp.sendEmail(inboxId, { to: ['test@example.com'], subject: 'test', body: '<html></html>', isHTML: true }))
```

#### Accessing more methods
To access all the MailSlurp methods available in the [REST API](https://api.mailslurp.com/swagger-ui.html) and [Javascript Client](https://www.mailslurp.com/docs/js/) use the controllers on the mailslurp instance.

```typescript
cy.mailslurp().then(mailslurp => mailslurp.attachmentController.uploadAttachment({
    base64Contents: fileBase64Encoded,
    contentType: 'text/plain',
    filename: basename(pathToAttachment)
}))
```

### Storing values between tests
Cypress has a unique async nature. To use MailSlurp effectively with Cypress chain your commands using [`then()`](https://docs.cypress.io/api/commands/then) or store results in wrapped aliases using [`wrap()`](https://docs.cypress.io/api/commands/wrap) and [`as()`](https://docs.cypress.io/api/commands/as).

```typescript
before(function () {
    return cy.mailslurp()
        .then(mailslurp => mailslurp.createInbox())
        .then(inbox => {
            // save inbox id and email address to this (make sure you use function and not arrow syntax)
            cy.wrap(inbox.id).as('inboxId')
            cy.wrap(inbox.emailAddress).as('emailAddress')
        })
});
it("01 - can load the demo application", function () {
    // get wrapped email address and assert contains a mailslurp email address
    expect(this.emailAddress).to.contain("@mailslurp");
    // visit the demo application
    cy.visit("https://playground.mailslurp.com")
    cy.title().should('contain', 'React App');
});
```

> **Note:** using `wrap` to store values accross test methods requires you to use `function` syntax instead of `() =>` arrow syntax. This ensure that `this` is dynamically scoped and includes the aliased variables.

## Example test
Here is an example of testing user sign up on a demo application hosted at [playground.mailslurp.com](https://playground.mailslurp.com). 
It creates a new MailSlurp inbox before all tests and saves the `inbox.id` and `inbox.emailAddress` to a shared text context using the `cy.wrap().as()` methods. 
It then loads the demo application, fills out a sign up form using the email address and receives a user confirmation code. 
We wait for the email to arrive using the `waitForLatestEmail` method and then extract a confirmation code that can be submitted to the app to confirm the user.

```typescript
/// <reference types="cypress-mailslurp" />
describe("user sign up test with mailslurp plugin", function () {
    // use cypress-mailslurp plugin to create an email address before test
    before(function () {
        return cy.mailslurp()
            .then(mailslurp => mailslurp.createInbox())
            .then(inbox => {
                // save inbox id and email address to this (make sure you use function and not arrow syntax)
                cy.wrap(inbox.id).as('inboxId')
                cy.wrap(inbox.emailAddress).as('emailAddress')
            })
    });
    it("01 - can load the demo application", function () {
        // get wrapped email address and assert contains a mailslurp email address
        expect(this.emailAddress).to.contain("@mailslurp");
        // visit the demo application
        cy.visit("https://playground.mailslurp.com")
        cy.title().should('contain', 'React App');
    });
    // use function instead of arrow syntax to access aliased values on this
    it("02 - can sign up using email address", function () {
        // click sign up and fill out the form
        cy.get("[data-test=sign-in-create-account-link]").click()
        // use the email address and a test password
        cy.get("[name=email]").type(this.emailAddress).trigger('change');
        cy.get("[name=password]").type('test-password').trigger('change');
        // click the submit button
        cy.get("[data-test=sign-up-create-account-button]").click();
    });
    it("03 - can receive confirmation code by email", function () {
        // app will send user an email containing a code, use mailslurp to wait for the latest email
        cy.mailslurp()
            // use inbox id and a timeout of 30 seconds
            .then(mailslurp => mailslurp.waitForLatestEmail(undefined,undefined,this.inboxId,undefined,undefined,30000, true))
            // extract the confirmation code from the email body
            .then(email => /.*verification code is (\d{6}).*/.exec(email.body!!)!![1])
            // fill out the confirmation form and submit
            .then(code => {
                cy.get("[name=code]").type(code).trigger('change');
                cy.get("[data-test=confirm-sign-up-confirm-button]").click();
            })
    });
    // fill out sign in form
    it("04 - can sign in with confirmed account", function () {
        // use the email address and a test password
        cy.get("[data-test=username-input]").type(this.emailAddress).trigger('change');
        cy.get("[data-test=sign-in-password-input]").type('test-password').trigger('change');
        // click the submit button
        cy.get("[data-test=sign-in-sign-in-button]").click();
    });
    // can see authorized welcome screen
    it("05 - can see welcome screen", function () {
        // click sign up and fill out the form
        cy.get("h1").should("contain", "Welcome");
    });
});
```

### More examples
See the [Cypress example test suite](https://github.com/mailslurp/cypress-mailslurp/tree/master/cypress) for real tests that use this plugin.
