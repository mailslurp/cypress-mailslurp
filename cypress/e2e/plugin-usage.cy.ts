/// <reference types="cypress" />
import type { MailSlurp } from 'mailslurp-client'

type ClientConfiguration = {
  apiKey?: (name: string) => string
  basePath: string
  headers?: Record<string, string>
}

function getClientConfiguration(mailslurp: MailSlurp): ClientConfiguration {
  return (
    mailslurp.userController as unknown as {
      configuration: ClientConfiguration
    }
  ).configuration
}

describe('plugin usage patterns', () => {
  it('loads configuration from cy.env while preserving other client options', () => {
    cy.mailslurp({
      headers: { 'x-plugin-test': 'configured' },
    }).then(mailslurp => {
      const configuration = getClientConfiguration(mailslurp)
      expect(configuration.basePath).to.equal(
        'https://cypress.api.mailslurp.com'
      )
      expect(configuration.headers?.['x-plugin-test']).to.equal(
        'configured'
      )
    })
  })

  it('accepts an explicit API key and custom API base path', () => {
    cy.mailslurp({
      apiKey: 'example-api-key',
      basePath: 'https://mail.example.test',
    }).then(mailslurp => {
      const configuration = getClientConfiguration(mailslurp)
      expect(configuration.basePath).to.equal('https://mail.example.test')
      expect(configuration.apiKey?.('x-api-key')).to.equal('example-api-key')
    })
  })

  it('can alias and retrieve a client in the same test', () => {
    cy.mailslurp({ apiKey: 'example-api-key' }).as('mailslurpClient')

    cy.get<MailSlurp>('@mailslurpClient').then(mailslurp => {
      expect(mailslurp.createInbox).to.be.a('function')
      expect(mailslurp.inboxController).to.exist
    })
  })

  it('creates independent clients on repeated calls', () => {
    cy.mailslurp({ apiKey: 'first-example-key' }).then(firstClient => {
      cy.mailslurp({ apiKey: 'second-example-key' }).then(secondClient => {
        expect(secondClient).not.to.equal(firstClient)
        expect(secondClient.emailController).to.exist
      })
    })
  })
})
