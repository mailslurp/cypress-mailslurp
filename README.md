# MailSlurp Cypress Plugin

Test email and SMS flows with real MailSlurp inboxes and phone numbers. The plugin adds `cy.mailslurp()`, which yields the [MailSlurp JavaScript client](https://www.npmjs.com/package/mailslurp-client) inside a Cypress command chain.

[Quick start](#quick-start) · [Email tests](#write-email-tests) · [Wait methods](#wait-for-specific-emails) · [Extraction](#extract-codes-text-and-links) · [SMS](#wait-for-sms-messages) · [Troubleshooting](#troubleshooting)

## Quick start

This setup uses **cypress-mailslurp 2 and Cypress 16**. Have Google Chrome and Node.js 22.x, 24.x, or 26+ installed; see [Cypress's current requirements](https://docs.cypress.io/app/references/migration-guide#nodejs-20-and-25-no-longer-supported). The plugin also supports Cypress 15.10 and newer within version 15.

### 1. Get your MailSlurp API key

[Create a MailSlurp account](https://app.mailslurp.com/sign-up/) and copy your API key from the [dashboard](https://app.mailslurp.com). The connection test below checks authentication without creating an inbox or sending a message. Email and SMS features depend on your account's available resources and limits.

### 2. Install the plugin

With Cypress already installed, run this in the project containing your tests:

```sh
npm install --save-dev cypress-mailslurp
```

The plugin installs `mailslurp-client` as a dependency. You do not need to create a separate `new MailSlurp()` instance. If your own code imports SDK types or enums directly, also declare `mailslurp-client` as a direct dependency.

For Cypress versions older than 15.10, use version 1 of the plugin instead:

```sh
npm install --save-dev 'cypress-mailslurp@^1'
```

The instructions below cover plugin version 2. Follow the [Cypress upgrade guide](https://docs.cypress.io/app/references/migration-guide) when you are ready to upgrade an older project.

### 3. Configure Cypress and register the command

For a new project, create this config at the project root. The `.cjs` extension works even when your package uses `"type": "module"`. If you already have a Cypress config, merge the settings into that file instead of creating a second config.

```javascript
// cypress.config.cjs
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 30_000,
  e2e: {
    baseUrl: 'https://playground.mailslurp.com',
  },
})
```

Create or edit the **support file**, which Cypress loads before each spec:

```javascript
// cypress/support/e2e.js
import 'cypress-mailslurp'
```

Use `cypress/support/e2e.ts` if your project uses TypeScript. A CommonJS support file can use `require('cypress-mailslurp')`. If you configured a custom `e2e.supportFile`, put the import there.

The import belongs in the support file, **not** `cypress.config.*` or `setupNodeEvents`. No Node event hook is needed to register this plugin.

### 4. Add a connection test

Create `cypress/e2e/mailslurp.cy.js` (or `.cy.ts`):

```javascript
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
```

### 5. Set the key and run

For macOS/Linux:

```sh
CYPRESS_MAILSLURP_API_KEY=your-api-key npx cypress run --browser chrome --spec cypress/e2e/mailslurp.cy.js
```

For Windows PowerShell:

```powershell
$env:CYPRESS_MAILSLURP_API_KEY = 'your-api-key'
npx cypress run --browser chrome --spec cypress/e2e/mailslurp.cy.js
```

Replace the placeholder with your key and use `.cy.ts` in the command if that is your spec's extension. A passing test confirms the support import, API key, and API connection. To use a `.env` file instead, follow [API key configuration](#api-key-configuration).

## Video walkthrough

[![Cypress email test tutorial](https://www.mailslurp.com/video-thumbnails/cypress-test-still.jpg)](https://www.youtube.com/watch?v=Ud274da6NIE)

Use the Quick Start above for the current version 2 installation and configuration.

## API key configuration

The plugin reads `MAILSLURP_API_KEY` through asynchronous [`cy.env()`](https://docs.cypress.io/api/commands/env), with logging disabled for that lookup. Keep the key out of committed files, test assertions, and application code. The client uses the key to authenticate requests to MailSlurp.

| Where you set the key | Name to use |
| --- | --- |
| Shell or CI secret environment variable | `CYPRESS_MAILSLURP_API_KEY` |
| Cypress config's `env` object | `MAILSLURP_API_KEY` |
| `.env` with the config below | `MAILSLURP_API_KEY` or `API_KEY` |
| Explicit `cy.mailslurp()` option | `apiKey` |

Cypress strips the `CYPRESS_` prefix from shell variables. An exported `CYPRESS_MAILSLURP_API_KEY` takes precedence over the config value. A plain shell variable called `API_KEY` or `MAILSLURP_API_KEY` needs the config mapping below. See [Cypress's environment variable guide](https://docs.cypress.io/app/guides/environment-variables).

### Load a local .env file

Cypress does not automatically read a generic `.env` file. Install its loader:

```sh
npm install --save-dev dotenv
```

Create `.env` at the project root, where you run Cypress:

```dotenv
MAILSLURP_API_KEY=your-api-key
```

Add `.env` to `.gitignore`:

```gitignore
.env
```

Update the **same** Cypress config from Quick Start:

```javascript
// cypress.config.cjs
const { defineConfig } = require('cypress')
require('dotenv').config()

module.exports = defineConfig({
  defaultCommandTimeout: 30_000,
  env: {
    MAILSLURP_API_KEY: process.env.MAILSLURP_API_KEY || process.env.API_KEY,
  },
  e2e: {
    baseUrl: 'https://playground.mailslurp.com',
  },
})
```

For an ESM or TypeScript config, use `import { defineConfig } from 'cypress'`, `import 'dotenv/config'`, and `export default defineConfig(...)` with the same options.

Now run `npx cypress run --browser chrome`. Restart Cypress after changing environment variables or `.env`. In CI, supply `CYPRESS_MAILSLURP_API_KEY` from the CI secret store; a `.env` file is not required.

### Client options

Options such as `headers`, `basePath`, and `fetchApi` are passed to the SDK. You can keep loading the key from the environment while setting other options:

```javascript
cy.mailslurp({ headers: { 'x-test-suite': 'checkout' } })
  .then(mailslurp => mailslurp.userController.getUserInfo())
```

An explicit `apiKey` takes precedence over the environment value. This example uses a placeholder and only checks that the client was created; it does not authenticate a request:

```javascript
cy.mailslurp({ apiKey: 'YOUR_KEY' }).then(mailslurp => {
    expect(mailslurp.inboxController).to.exist
})
```

Use environment configuration for real keys. The default API base URL is `https://cypress.api.mailslurp.com`; your application's URL belongs in Cypress's `e2e.baseUrl`.

## Write email tests

`cy.mailslurp()` yields a client through `.then()`. Return the SDK promise from the callback so Cypress waits for it; do not assign the command's immediate return value to a client variable or use `await cy.mailslurp()`.

### Send and receive an email

Save this complete example as a spec. It creates an inbox, sends an email to that inbox, waits for delivery, and checks the code. It uses the API key configured above and requires email sending capacity on your account.

```javascript
describe('send and receive email', function () {
  it('can extract a code from a received email', function () {
    cy.mailslurp()
      .then(mailslurp => mailslurp.createInboxWithOptions({}))
      .then(inbox => {
        expect(inbox.emailAddress).to.match(/^[^@]+@[^@]+$/)
        cy.wrap(inbox.id).as('inboxId')
        cy.wrap(inbox.emailAddress).as('emailAddress')
      })

    cy.mailslurp().then(mailslurp => mailslurp.sendEmail(this.inboxId, {
      to: [this.emailAddress],
      subject: 'Email confirmation',
      body: 'Your code is: ABC-123',
    }))

    // Give Cypress slightly longer than the MailSlurp API wait.
    cy.mailslurp()
      .then({ timeout: 65_000 }, mailslurp =>
        mailslurp.waitForLatestEmail(this.inboxId, 60_000, true)
      )
      .then(email => {
        expect(email.subject).to.contain('Email confirmation')
        const code = /Your code is: (\w+-\d+)/.exec(email.body ?? '')?.[1]
        expect(code).to.equal('ABC-123')
      })
  })
})
```

There are two timeouts: the MailSlurp API's wait in milliseconds and Cypress's `.then({ timeout })`. Give Cypress slightly longer than the API wait. Changing `requestTimeout` alone does not extend an SDK promise's Cypress timeout. `unreadOnly: true` (the third argument to `waitForLatestEmail`) filters out previously read messages; a fresh inbox per test also avoids matching old mail.

### Verify a signup email

This complete example uses the Quick Start's `baseUrl`, [playground.mailslurp.com](https://playground.mailslurp.com). Copy it into another spec. For your own application, update `baseUrl`, the form selectors, and the verification-code pattern.

```javascript
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
```

### Keep aliases within their test

Cypress resets aliases before every test, even with `testIsolation: false`. Use `beforeEach()` when each test needs an inbox, or keep a signup/verification/login flow in one test.

```javascript
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
```

Accessing aliases through `this` requires `function` syntax. With arrow functions, retrieve an alias through `cy.get('@emailAddress')` instead. Chain work that uses an alias after the command that creates it.

## Wait for specific emails

Choose the method that matches what your test needs. Wait methods return immediately if the condition is already met; otherwise they wait until their timeout. They do not send or trigger messages.

| Method | Use it for | Result |
| --- | --- | --- |
| `waitForLatestEmail` | One latest email | Full email |
| `waitForEmailCount` | A number of emails | Email previews |
| `waitForNthEmail` | An email at a zero-based index | Full email |
| `waitForMatchingEmails` | Several emails matching subject, sender, or recipient conditions | Email previews |
| `waitController.waitForMatchingFirstEmail` | One matching email | Full email |
| `waitController.waitFor` | Count, matching, and date conditions together | Email previews |

The examples below are TypeScript. Install `mailslurp-client` directly when importing its enums, then put these imports at the top of your spec:

```sh
npm install --save-dev mailslurp-client
```

```typescript
import {
  ExtractCodesOptionsMethodEnum,
  MatchOptionFieldEnum,
  MatchOptionShouldEnum,
  WaitForConditionsCountTypeEnum,
} from 'mailslurp-client'
```

For JavaScript, use the enum strings instead, such as `field: 'SUBJECT'`, `should: 'CONTAIN'`, and `countType: 'ATLEAST'`. The API uses `CONTAIN` and `EQUAL`, without a trailing `S`.

Each example uses `inboxId` and `since` from the shared setup below. Copy the setup and the tests you want into one spec file. In your own application, create an inbox and trigger your application's messages instead of sending these sample emails.

<details>
<summary>Shared setup: a fresh inbox, one newsletter, and two order emails</summary>

```typescript
let inboxId: string
const since = new Date()

before(() => {
  cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
    const inbox = await mailslurp.createInbox()
    inboxId = inbox.id
    await mailslurp.sendEmail(inboxId, {
      to: [inbox.emailAddress],
      subject: 'Newsletter',
      body: 'An unrelated message',
    })
    // Ensure the unrelated message arrives before the two order emails.
    await mailslurp.waitForLatestEmail(inboxId, 60_000)
    await Promise.all(['Order received', 'Order shipped'].map(subject =>
      mailslurp.sendEmail(inboxId, {
        to: [inbox.emailAddress],
        subject,
        isHTML: true,
        body: '<p>Your verification code is 123456</p>' +
          '<a href="https://example.com/verify?token=sample-token">Verify</a>',
      })
    ))
  })
})

after(() => {
  // Delete only the inbox this example created.
  if (inboxId) cy.mailslurp().then(mailslurp => mailslurp.deleteInbox(inboxId))
})
```

</details>

These examples deliberately use `unreadOnly: false` because they inspect the same three messages more than once. Fetching a full email can mark it as read. Use `unreadOnly: true` when you want unread messages only, and capture `since` before triggering delivery to exclude old messages in a reused inbox.

### Wait for a count or a specific email index

```typescript
it('waits for three emails and reads the third', () => {
  cy.mailslurp()
    .then({ timeout: 65_000 }, mailslurp =>
      mailslurp.waitForEmailCount(3, inboxId, 60_000, false)
    )
    .then(emails => {
      expect(emails).to.have.length(3)
      expect(emails.map(email => email.subject)).to.include.members([
        'Newsletter', 'Order received', 'Order shipped',
      ])
    })

  cy.mailslurp()
    .then({ timeout: 65_000 }, mailslurp =>
      // Indexes start at zero: 2 selects the third email.
      mailslurp.waitForNthEmail(inboxId, 2, 60_000, false)
    )
    .then(email => {
      expect(email.subject).to.match(/^Order /)
      expect(email.body).to.contain('Your verification code is 123456')
    })
})
```

### Wait for multiple matching emails

This filters out the newsletter and returns the two order emails. List results are previews; fetch an email by its ID when you need the complete body.

```typescript
it('waits for two order emails and fetches one full body', () => {
  cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
    const previews = await mailslurp.waitForMatchingEmails({
      matches: [{
        field: MatchOptionFieldEnum.SUBJECT,
        should: MatchOptionShouldEnum.CONTAIN,
        value: 'Order',
      }],
    }, 2, inboxId, 60_000, false)

    expect(previews).to.have.length(2)
    expect(previews.map(email => email.subject)).to.have.members([
      'Order received', 'Order shipped',
    ])
    // Matching a list returns previews. Fetch an email to access its full body.
    const email = await mailslurp.emailController.getEmail({ emailId: previews[0].id })
    expect(email.body).to.contain('Your verification code is 123456')
  })
})
```

### Wait for one matching email

Use an exact subject when an inbox receives several kinds of messages. This controller method takes a request object and returns a full email.

```typescript
it('waits for the first email with an exact subject', () => {
  cy.mailslurp()
    .then({ timeout: 65_000 }, mailslurp =>
      mailslurp.waitController.waitForMatchingFirstEmail({
        inboxId,
        timeout: 60_000,
        unreadOnly: false,
        since,
        matchOptions: {
          matches: [{
            field: MatchOptionFieldEnum.SUBJECT,
            should: MatchOptionShouldEnum.EQUAL,
            value: 'Order shipped',
          }],
        },
      })
    )
    .then(email => {
      // The single-match method returns the full email, including its body.
      expect(email.subject).to.equal('Order shipped')
      expect(email.body).to.contain('Your verification code is 123456')
    })
})
```

### Combine matching, counts, and a time window

`ATLEAST` accepts extra matching messages. Use `EXACTLY` only when the exact count is part of your test's requirement. All entries in `matches` are applied together.

```typescript
it('waits for at least two matching emails received since this run began', () => {
  cy.mailslurp()
    .then({ timeout: 65_000 }, mailslurp =>
      mailslurp.waitController.waitFor({
        waitForConditions: {
          inboxId,
          count: 2,
          countType: WaitForConditionsCountTypeEnum.ATLEAST,
          timeout: 60_000,
          unreadOnly: false,
          since,
          matches: [{
            field: MatchOptionFieldEnum.SUBJECT,
            should: MatchOptionShouldEnum.CONTAIN,
            value: 'Order',
          }],
        },
      })
    )
    .then(emails => {
      expect(emails.length).to.be.at.least(2)
      expect(emails.every(email => email.subject?.includes('Order'))).to.equal(true)
    })
})
```

## Extract codes, text, and links

These tests reuse the imports and shared inbox setup above. Matching waits select messages by metadata; extraction reads the content of the selected email.

### Extract an email verification code

`getEmailCodes` returns `found`, a preferred `code`, candidate codes, and warnings. Always check `found` before using `code`. This example uses deterministic `PATTERN` extraction with a custom pattern for the expected message format, so the six-digit code is selected explicitly.

```typescript
it('extracts an OTP with the code extraction endpoint', () => {
  cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
    const email = await mailslurp.waitForNthEmail(inboxId, 2, 60_000, false)
    const result = await mailslurp.emailController.getEmailCodes({
      emailId: email.id,
      extractCodesOptions: {
        method: ExtractCodesOptionsMethodEnum.PATTERN,
        allowFallback: false,
        minLength: 6,
        maxLength: 6,
        customPatterns: ['Your verification code is ([0-9]{6})'],
      },
    })
    expect(result.found).to.equal(true)
    expect(result.code).to.equal('123456')
  })
})
```

### Extract a custom regex capture group

`getEmailContentMatch` runs a Java regex on the email body. `matches[0]` is the full match and `matches[1]` is the first capture group. The `[0-9]` form below avoids extra string escaping; a `\d` regex would need `\\d` inside a JavaScript string.

```typescript
it('extracts a capture group with a custom regex', () => {
  cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
    const email = await mailslurp.waitForNthEmail(inboxId, 2, 60_000, false)
    const result = await mailslurp.emailController.getEmailContentMatch({
      emailId: email.id,
      contentMatchOptions: {
        pattern: 'Your verification code is ([0-9]{6})',
      },
    })
    // Index 0 is the full match; index 1 is the first capture group.
    expect(result.matches[0]).to.equal('Your verification code is 123456')
    expect(result.matches[1]).to.equal('123456')
  })
})
```

### Extract a verification URL

`getEmailLinks` extracts `href` values from HTML emails. Select the expected origin and path before using the link in your test. Replace the sample URL and assertions with your application's verification URL.

```typescript
it('extracts a verification link from an HTML email', () => {
  cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
    const email = await mailslurp.waitForNthEmail(inboxId, 2, 60_000, false)
    const { links } = await mailslurp.emailController.getEmailLinks({ emailId: email.id })
    const verificationLink = links.find(link => {
      const url = new URL(link)
      return url.origin === 'https://example.com' && url.pathname === '/verify'
    })
    expect(verificationLink).to.equal('https://example.com/verify?token=sample-token')
    // In your application, visit the expected link to complete verification.
  })
})
```

## Wait for SMS messages

Use an **existing MailSlurp phone number ID**, not the phone's `+1...` address or an inbox ID. Trigger your application's SMS flow before waiting. Capture `since` before that action so an old message cannot satisfy the wait.

For a separate TypeScript SMS spec, import these enums from your direct `mailslurp-client` dependency:

```typescript
import {
  ExtractCodesOptionsMethodEnum,
  SmsMatchOptionFieldEnum,
  SmsMatchOptionShouldEnum,
  WaitForSmsConditionsCountTypeEnum,
} from 'mailslurp-client'
```

### Wait for the latest SMS and extract its code

Put this snippet inside an `it(...)` test, replace the placeholder phone number ID, and add your application's SMS trigger where indicated. After receiving the SMS, `getSmsCodes` extracts the OTP using the same options and result shape as `getEmailCodes`.

```typescript
// Replace this with the ID of an existing MailSlurp phone number.
const phoneNumberId = '00000000-0000-4000-8000-000000000001'
const since = new Date()
// Trigger your application to send its verification SMS before waiting.
cy.mailslurp().then({ timeout: 65_000 }, async mailslurp => {
  const sms = await mailslurp.waitController.waitForLatestSms({
    waitForSingleSmsOptions: {
      phoneNumberId,
      timeout: 60_000,
      unreadOnly: true,
      since,
    },
  })
  expect(sms.body).to.contain('verification code')
  const result = await mailslurp.smsController.getSmsCodes({
    smsId: sms.id,
    extractCodesOptions: {
      method: ExtractCodesOptionsMethodEnum.PATTERN,
      allowFallback: false,
      minLength: 6,
      maxLength: 6,
    },
  })
  expect(result.found).to.equal(true)
  expect(result.code).to.match(/^[0-9]{6}$/)
  // Use result.code in your application's confirmation form.
})
```

### Wait for matching SMS messages

`waitForSms` supports message-body and sender matching, a count, and a date window. This snippet waits for at least two unread verification messages. Run it as a separate test with its own message triggers; reading an SMS in the previous example can mark it as read.

```typescript
// Replace this with your existing phone number ID, not its +1... address.
const phoneNumberId = '00000000-0000-4000-8000-000000000001'
const since = new Date()
// Trigger the two SMS messages from your application before waiting.
cy.mailslurp()
  .then({ timeout: 65_000 }, mailslurp =>
    mailslurp.waitController.waitForSms({
      waitForSmsConditions: {
        phoneNumberId,
        count: 2,
        countType: WaitForSmsConditionsCountTypeEnum.ATLEAST,
        timeout: 60_000,
        unreadOnly: true,
        since,
        matches: [{
          field: SmsMatchOptionFieldEnum.BODY,
          should: SmsMatchOptionShouldEnum.CONTAIN,
          value: 'verification code',
        }],
      },
    })
  )
  .then(messages => {
    expect(messages.length).to.be.at.least(2)
    expect(messages.every(sms => sms.body.includes('verification code'))).to.equal(true)
  })
```

The repository executes the SMS snippets with mocked HTTP responses to check request serialization, response handling, and code extraction chaining without requiring a paid phone number. Real SMS delivery still requires your account's phone number and an application that sends the messages. The email examples above run against the live API.

## TypeScript

Importing the plugin in your support file registers its bundled types. You do not need an `@types/cypress-mailslurp` package or a hand-written `Chainable` declaration.

If TypeScript cannot find `cy.mailslurp`, make sure your Cypress files are included by the relevant `tsconfig.json`. Add `cypress-mailslurp` to an existing `compilerOptions.types` list, or add this reference at the top of your spec or support file:

```typescript
/// <reference types="cypress-mailslurp" />
```

A type reference only supplies declarations; it does not replace the support-file import needed at runtime. If you use `.ts` config or spec files, install `typescript` as a development dependency too.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `cy.mailslurp is not a function` | Import `cypress-mailslurp` in the active support file. Check that `e2e.supportFile` is not `false` or pointing elsewhere. |
| `cy.env is not a function` | Plugin 2 requires Cypress 15.10+. Check the version actually running with `npx cypress version`. |
| An older plugin fails on `Cypress.env()` | Upgrade to `cypress-mailslurp@2`. Cypress 16 removed `Cypress.env()`. |
| `No MailSlurp API key was provided` | Check the names in the key table. A `.env` file needs `dotenv` and the `env` mapping; restart Cypress afterward. |
| HTTP 401 or 403 | Check the key against the dashboard and confirm its account permissions. Start with the connection test before debugging your app's signup flow. |
| `Cypress is not defined` while loading config | Move the plugin import out of the Node config and into the Cypress support file. |
| `require is not defined` in config | Use CommonJS syntax in a `.cjs` config, or ESM imports and `export default` in your ESM config. Keep only one Cypress config. |
| Email wait times out | Check the destination inbox, whether the application sent the email, and both wait timeouts. Use a new inbox or a suitable unread filter. |
| `this.inboxId` is undefined | Use `function` for access through `this`, create aliases before consuming them, and do not share aliases across tests. |
| SMS example has no phone number | Use an account with an existing suitable phone number. Creating an email inbox does not create a phone number. |

## Examples and API reference

- [Email plugin example](https://github.com/mailslurp/examples/tree/master/javascript-cypress-mailslurp-plugin)
- [SMS verification example](https://github.com/mailslurp/examples/tree/master/javascript-cypress-sms-testing): requires an existing US number not already registered with the SMS playground.
- [Using the SDK without this plugin](https://github.com/mailslurp/examples/tree/master/javascript-cypress-js)
- [MailSlurp JavaScript API reference](https://js.mailslurp.com/): convenience methods and controllers such as `emailController`, `phoneController`, and `waitController` are available on the yielded client.
- [Plugin test suite](https://github.com/mailslurp/cypress-mailslurp/tree/master/cypress)

## Developing this plugin

To run this repository's tests, copy `.env.example` to `.env` and replace the `API_KEY` placeholder. The repository config maps `API_KEY` to the plugin's `MAILSLURP_API_KEY`. Then run:

```sh
npm ci
npm test
npm run cypress
```

`npm test` checks the build, CommonJS/ESM package exports, types, lint, and README generation. `npm run cypress` runs the Chrome suite with real inboxes and emails, plus the mocked SMS request/response tests.

Edit `templates/README.tpl.md` to change this page. Code excerpts come from the tested `<gen>` blocks in the Cypress specs. Run `npm run readme` to regenerate `README.md`; `npm test` checks that it matches.
