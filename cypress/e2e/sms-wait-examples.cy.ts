/// <reference types="cypress" />

//<gen>cy_sms_wait_imports
import {
  ExtractCodesOptionsMethodEnum,
  SmsMatchOptionFieldEnum,
  SmsMatchOptionShouldEnum,
  WaitForSmsConditionsCountTypeEnum,
} from 'mailslurp-client'
//</gen>

// These are HTTP contract tests. No phone number is purchased or SMS sent.
// The generated snippets call the real SDK; intercepts supply test responses.
describe('SMS wait examples (mocked API)', () => {
  const phoneId = '00000000-0000-4000-8000-000000000001'
  const smsId = '00000000-0000-4000-8000-000000000002'

  beforeEach(() => {
    const createdAt = new Date().toISOString()
    const sms = {
      id: smsId,
      userId: '00000000-0000-4000-8000-000000000003',
      phoneNumber: phoneId,
      fromNumber: '+12025550100',
      toNumber: '+12025550101',
      favourite: false,
      body: 'Your verification code is 123456',
      read: false,
      createdAt,
      updatedAt: createdAt,
      media: [],
    }

    cy.intercept('POST', 'https://cypress.api.mailslurp.com/waitForLatestSms', request => {
      expect(request.body).to.include({ phoneNumberId: phoneId, timeout: 60_000, unreadOnly: true })
      expect(new Date(request.body.since).toISOString()).to.equal(request.body.since)
      request.reply({ body: sms })
    }).as('latestSms')

    cy.intercept('POST', `https://cypress.api.mailslurp.com/sms/${smsId}/codes`, request => {
      expect(request.body).to.deep.equal({ method: 'PATTERN', allowFallback: false, minLength: 6, maxLength: 6 })
      request.reply({
        found: true,
        code: '123456',
        methodUsed: 'PATTERN',
        candidates: [],
        warnings: [],
      })
    }).as('smsCodes')

    cy.intercept('POST', 'https://cypress.api.mailslurp.com/waitForSms', request => {
      expect(request.body).to.include({ phoneNumberId: phoneId, count: 2, countType: 'ATLEAST', timeout: 60_000, unreadOnly: true })
      expect(request.body.matches).to.deep.equal([{ field: 'BODY', should: 'CONTAIN', value: 'verification code' }])
      expect(new Date(request.body.since).toISOString()).to.equal(request.body.since)
      request.reply([
        sms,
        { ...sms, id: '00000000-0000-4000-8000-000000000004', body: 'Your verification code is 654321' },
      ])
    }).as('matchingSms')
  })

  it('waits for the latest SMS and extracts its OTP', () => {
    //<gen>cy_wait_latest_sms
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
    //</gen>
    cy.wait('@latestSms')
    cy.wait('@smsCodes')
  })

  it('waits for two SMS messages with matching body content', () => {
    //<gen>cy_wait_matching_sms
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
    //</gen>
    cy.wait('@matchingSms')
  })
})
