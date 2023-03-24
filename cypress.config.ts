//<gen>cy_config
import { defineConfig } from 'cypress'

export default defineConfig({
  // set timeouts so MailSlurp can wait for emails and sms
  defaultCommandTimeout: 30000,
  responseTimeout: 30000,
  requestTimeout: 30000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    // examples run against the playground app
    baseUrl: 'https://playground.mailslurp.com',
    // these examples require no test isolation
    testIsolation: false
  },
})
//</gen>