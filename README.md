# MailSlurp Cypress Plugin
Official MailSlurp email plugin for Cypress JS. Create real test email accounts. Send and receive emails, SMS, and attachments in Cypress tests. For examples and usage see the standard [MailSlurp library](https://www.npmjs.com/package/mailslurp-client).

## Test email and SMS/TXT messages in Cypress
With MailSlurp and Cypress you can:
- create unlimited, disposable email addresses for testing
- send and receive emails in tests
- send and receive SMS messages in tests
- capture outbound emails with fake mailservers
- extract email verification codes and OTP magic links

### Example

```typescript
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
                .then(({matches}) => cy.wrap(matches[1]).as('verificationCode'))
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
```

### Quick links
- [API documentation](https://docs.mailslurp.com/js/)
- [JSDocs](https://js.mailslurp.com/)
- [Example project](https://github.com/mailslurp/examples/tree/master/javascript-cypress-mailslurp-plugin)
- [Use without plugin](https://github.com/mailslurp/examples/tree/master/javascript-cypress-js)
- [SMS testing](https://github.com/mailslurp/examples/tree/master/javascript-cypress-sms-testing)
- [Test email verification](https://www.mailslurp.com/examples/cypress-js/)

## Install
Ensure you have Cypress installed first then run:

```sh
npm install --save-dev cypress-mailslurp
```

Then include the plugin in your `cypress/support/index.{js,ts}` file.

```typescript
import 'cypress-mailslurp';
```

> [!IMPORTANT]  
> You must import/require `cypress-mailslurp` in your support file `cypress/support/e2e.ts` or `cypress/support/index.{js,ts}`

### Configuration
See the [example project](https://github.com/mailslurp/examples/tree/master/javascript-cypress-mailslurp-plugin) for example code.

### API Key
MailSlurp is free but requires an API Key. Get yours by [creating a free account](https://www.mailslurp.com/sign-up/).
Set the environment variable `CYPRESS_MAILSLURP_API_KEY` or use the `cypress.json` file `env` property:

#### Environment variable
For Mac/Linux set the `CYPRESS_MAILSLURP_API_KEY` environment variable:

```bash
CYPRESS_MAILSLURP_API_KEY=your-api-key cypress run
```

For Windows machines use the Powershell format `$env:CYPRESS_MAILSLURP_API_KEY`

```
$env:CYPRESS_MAILSLURP_API_KEY=your-api-key;
cypress run;
```

#### Cypress env property
You can also configure Cypress using the config format.

```json
{
  "env": {
    "MAILSLURP_API_KEY": "your-mailslurp-api-key"
  }
}
```

#### Configure dynamically
You can also pass the `cy.mailslurp()` function a config containing an `apiKey` like so:

```typescript
cy.mailslurp({ apiKey: 'YOUR_KEY' })
```

### Timeouts
MailSlurp requires timeouts to wait for inbound emails. You can set global timeouts in `cypress.json`:

```json
{
  "defaultCommandTimeout": 30000,
  "responseTimeout": 30000,
  "requestTimeout": 30000
}
```

Or you can set timeouts on a per-method basis using the first argument as a timeout config: 

```typescript
cy.then({ timeout: 60_000 }, () => { /* use mailslurp */ })
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

You can test that you have setup MailSlurp correctly in a test like so:

```typescript
describe('sign up using disposable email', function () {
    it('can set config', () => {
        //<gen>cy_config_dynamic
        cy.mailslurp({ apiKey: 'YOUR_KEY' })
        
```

### Common methods
The client chained by the `cy.mailslurp()` has all the same methods and properties as the official MailSlurp client. See the [Javascript documentation](https://www.mailslurp.com/docs/js/) for a full [API reference](https://www.mailslurp.com/docs/js/docs/) or see the examples below.

The MailSlurp client has a number of convenience methods and also exposes the full MailSlurp API as controllers. See the [class reference for full method documentation](https://www.mailslurp.com/docs/js/docs/classes/MailSlurp/).

#### Create email address
You can create test email accounts with MailSlurp by creating inboxes. Inboxes have an `id` and an `emailAddress`. Save the `id` for later use when fetching or sending emails.

```typescript
await cy.mailslurp()
    .then((mailslurp: MailSlurp) => mailslurp.createInboxWithOptions({}))
    .then(inbox => {
      expect(inbox.emailAddress).to.contain("@mailslurp")
      // save the inbox values for access in other tests
      cy.wrap(inbox.id).as('inboxId')
      cy.wrap(inbox.emailAddress).as('emailAddress')
    })
```

#### Send emails
To send emails in Cypress tests first create an inbox then use the `sendEmail` method.

```typescript
await cy.mailslurp()
    .then((mailslurp: MailSlurp) => mailslurp.sendEmail(this.inboxId, {
      to: [this.emailAddress  ],
      subject: 'Email confirmation',
      body: 'Your code is: ABC-123',
    }))
```

#### Receive emails in tests
Use the `waitFor` methods to wait for emails for an inbox. See the [email object docs](https://www.mailslurp.com/docs/js/docs/interfaces/email/) for full properties.

```typescript
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
```

> [!NOTE]
> Using `wrap` to store values across test methods requires you to use `function` syntax instead of `() =>` arrow syntax. This ensure that `this` is dynamically scoped and includes the aliased variables.

## Example test
Here is an example of testing user sign up on a demo application hosted at [playground.mailslurp.com](https://playground.mailslurp.com). 
It creates a new MailSlurp inbox before all tests and saves the `inbox.id` and `inbox.emailAddress` to a shared text context using the `cy.wrap().as()` methods. 
It then loads the demo application, fills out a sign up form using the email address and receives a user confirmation code. 
We wait for the email to arrive using the `waitForLatestEmail` method and then extract a confirmation code that can be submitted to the app to confirm the user.

```typescript
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
```

### More examples
See the [Cypress example test suite](https://github.com/mailslurp/cypress-mailslurp/tree/master/cypress) for real tests that use this plugin.
