# MailSlurp Cypress Plugin
Official MailSlurp email plugin for Cypress JS. Create real test email accounts. Send and receive emails, SMS, and attachments in Cypress tests. For examples and usage see the standard [MailSlurp library](https://www.npmjs.com/package/mailslurp-client).

## Tutorial
[![Cypress email test tutorial](https://www.mailslurp.com/video-thumbnails/cypress-test-still.jpg)](https://www.youtube.com/watch?v=Ud274da6NIE)

## Test email and SMS/TXT messages in Cypress
With MailSlurp and Cypress you can:
- create unlimited, disposable email addresses for testing
- send and receive emails in tests
- send and receive SMS messages in tests
- capture outbound emails with fake mailservers
- extract email verification codes and OTP magic links

### Example

```typescript
{{cy_example_short}}
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
{{cy_config_dynamic}}
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
{{cy_plugin_test_usage}}
```

### Common methods
The client chained by the `cy.mailslurp()` has all the same methods and properties as the official MailSlurp client. See the [Javascript documentation](https://www.mailslurp.com/docs/js/) for a full [API reference](https://www.mailslurp.com/docs/js/docs/) or see the examples below.

The MailSlurp client has a number of convenience methods and also exposes the full MailSlurp API as controllers. See the [class reference for full method documentation](https://www.mailslurp.com/docs/js/docs/classes/MailSlurp/).

#### Create email address
You can create test email accounts with MailSlurp by creating inboxes. Inboxes have an `id` and an `emailAddress`. Save the `id` for later use when fetching or sending emails.

```typescript
{{cy_plugin_create_inbox}}
```

#### Send emails
To send emails in Cypress tests first create an inbox then use the `sendEmail` method.

```typescript
{{cy_plugin_send_email}}
```

#### Receive emails in tests
Use the `waitFor` methods to wait for emails for an inbox. See the [email object docs](https://www.mailslurp.com/docs/js/docs/interfaces/email/) for full properties.

```typescript
{{cy_plugin_wait}}
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
{{cy_store_values}}
```

> [!NOTE]
> Using `wrap` to store values across test methods requires you to use `function` syntax instead of `() =>` arrow syntax. This ensure that `this` is dynamically scoped and includes the aliased variables.

## Example test
Here is an example of testing user sign up on a demo application hosted at [playground.mailslurp.com](https://playground.mailslurp.com). 
It creates a new MailSlurp inbox before all tests and saves the `inbox.id` and `inbox.emailAddress` to a shared text context using the `cy.wrap().as()` methods. 
It then loads the demo application, fills out a sign up form using the email address and receives a user confirmation code. 
We wait for the email to arrive using the `waitForLatestEmail` method and then extract a confirmation code that can be submitted to the app to confirm the user.

```typescript
{{cy_example_test}}
```

### More examples
See the [Cypress example test suite](https://github.com/mailslurp/cypress-mailslurp/tree/master/cypress) for real tests that use this plugin.
