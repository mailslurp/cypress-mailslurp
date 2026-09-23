import { defineConfig } from 'cypress'
import 'dotenv/config'

export default defineConfig({
  // set timeouts so MailSlurp can wait for emails and sms
  defaultCommandTimeout: 30000,
  responseTimeout: 30000,
  requestTimeout: 30000,
  // Pass the local .env API_KEY to cy.env() for this project's end-to-end tests.
  // CYPRESS_MAILSLURP_API_KEY, when set by a user or CI, takes precedence.
  env: {
    MAILSLURP_API_KEY: process.env.API_KEY,
  },
  e2e: {
    // examples run against the playground app
    baseUrl: 'https://playground.mailslurp.com',
    // these examples require no test isolation
    testIsolation: false
  },
})
