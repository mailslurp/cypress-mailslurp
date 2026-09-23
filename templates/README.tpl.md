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
Version 2 of this plugin requires Cypress 15.10 or newer and supports Cypress 16. Ensure you have Cypress installed first, then run:

```sh
npm install --save-dev cypress-mailslurp
```

Then include the plugin in your `cypress/support/e2e.{js,ts}` file.

```typescript
import 'cypress-mailslurp'
```

For a CommonJS support file, use `require('cypress-mailslurp')` instead. The package tests both entry points.

> [!IMPORTANT]  
> Load `cypress-mailslurp` from your support file, such as `cypress/support/e2e.ts`, so the command is registered before specs run.

### Configuration
See the [example project](https://github.com/mailslurp/examples/tree/master/javascript-cypress-mailslurp-plugin) for example code.

### API Key
MailSlurp is free but requires an API Key. Get yours by [creating a free account](https://www.mailslurp.com/sign-up/).

API keys are secrets. The plugin reads `MAILSLURP_API_KEY` with Cypress's secure, asynchronous `cy.env()` command. It does not use the removed `Cypress.env()` API and does not expose your key to the application under test.

#### Environment variable
The simplest option for local runs and CI is an operating-system environment variable. Cypress removes the `CYPRESS_` prefix before making the key available to `cy.env()`.

For macOS/Linux:

```bash
CYPRESS_MAILSLURP_API_KEY=your-api-key npx cypress run
```

For Windows PowerShell:

```powershell
$env:CYPRESS_MAILSLURP_API_KEY=your-api-key;
npx cypress run;
```

#### Load the API key from `.env`

Cypress does not load generic `.env` files itself. Install `dotenv`, ignore `.env` in git, and map one value into the Cypress `env` configuration from the Node.js config process:

```bash
npm install --save-dev dotenv
```

```dotenv
# .env
MAILSLURP_API_KEY=your-api-key
```

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress'
import 'dotenv/config'

export default defineConfig({
  env: {
    MAILSLURP_API_KEY: process.env.MAILSLURP_API_KEY,
  }
})
```

Do not commit `.env` or hard-code the key in `cypress.config.ts`. Cypress also supports `cypress.env.json`, `--env`, and values returned from `setupNodeEvents`; see the [Cypress environment variables and secrets guide](https://docs.cypress.io/app/guides/environment-variables).

#### Configure dynamically
You can also pass `cy.mailslurp()` a config containing an `apiKey`. Prefer environment configuration for real secrets so they do not become part of your test bundle. Other MailSlurp client options, such as `basePath` and `headers`, can be combined with an API key loaded from the environment.

```typescript
{{cy_config_dynamic}}
```

### Timeouts
MailSlurp requires timeouts to wait for inbound emails. You can set global timeouts in `cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  defaultCommandTimeout: 30_000,
  responseTimeout: 30_000,
  requestTimeout: 30_000,
})
```

Or you can set timeouts on a per-method basis using the first argument as a timeout config: 

```typescript
cy.then({ timeout: 60_000 }, () => { /* use mailslurp */ })
```

#### TypeScript support
MailSlurp adds the `mailslurp` command to the Cypress `cy` object. Importing the package from the support file normally loads its type augmentation automatically. If your Cypress TypeScript configuration uses an explicit `types` list, include this reference in your spec or support file:

```typescript
/// <reference types="cypress-mailslurp" />
```

Or define the type yourself like so:

```typescript
import type { MailSlurpConfig } from 'cypress-mailslurp'
import type { MailSlurp } from 'mailslurp-client'

declare global {
  namespace Cypress {
    interface Chainable {
      mailslurp(config?: MailSlurpConfig): Chainable<MailSlurp>
    }
  }
}
```

## Usage
The Cypress MailSlurp plugin provides one simple command attached to the Cypress object: `cy.mailslurp()`. This method returns a MailSlurp client instance that has all the same methods and properties as the [official MailSlurp client](https://www.npmjs.com/package/mailslurp-client). Use the command with the `then()` method to access the instance:

```typescript
cy.mailslurp().then(mailslurp => mailslurp.createInbox() /* etc */)
```

You can test that you have set up MailSlurp correctly like this:

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

### Sharing values with tests
Cypress commands are asynchronous. Chain MailSlurp work with [`then()`](https://docs.cypress.io/api/commands/then), or store results in aliases using [`wrap()`](https://docs.cypress.io/api/commands/wrap) and [`as()`](https://docs.cypress.io/api/commands/as). Cypress resets aliases before every test, so create aliases in `beforeEach()` when multiple tests need them:

```typescript
{{cy_store_values}}
```

> [!NOTE]
> Accessing aliases with `this` requires `function` syntax instead of an arrow function. You can avoid `this` by retrieving an alias with `cy.get('@emailAddress')` in the same test.

## Example test
Here is an example of testing user sign up on a demo application hosted at [playground.mailslurp.com](https://playground.mailslurp.com). 
The test creates a MailSlurp inbox and saves its `id` and `emailAddress` as aliases within the same test. It then fills out the sign-up form, waits for the verification email with `waitForLatestEmail`, extracts the confirmation code, and signs in.

```typescript
{{cy_example_test}}
```

### More examples
See the [Cypress example test suite](https://github.com/mailslurp/cypress-mailslurp/tree/master/cypress) for real tests that use this plugin.

## Development

Cypress 16 requires Node.js 22.x, 24.x, or 26.x and newer. The live end-to-end suite runs in Chrome because Cypress 16 deprecates Electron and uses its native browser network in Chrome. Copy `.env.example` to `.env`, replace the placeholder `API_KEY`, then run:

```bash
npm install
npm test
npm run cypress
```

The repository's `cypress.config.ts` loads `API_KEY` from `.env` in its Node.js process and maps it to `MAILSLURP_API_KEY` for the plugin's `cy.env()` call. The `.env` file is ignored by git.

README examples are generated from the tested `<gen>` blocks in the Cypress specs. After changing one of those blocks or this template, run `npm run readme`; `npm test` verifies that `README.md` is current.
