/// <reference types="cypress" />

//<gen>cy_email_wait_imports
import {
  ExtractCodesOptionsMethodEnum,
  MatchOptionFieldEnum,
  MatchOptionShouldEnum,
  WaitForConditionsCountTypeEnum,
} from 'mailslurp-client'
//</gen>

//<gen>cy_email_wait_setup
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
//</gen>

//<gen>cy_wait_count_nth
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
//</gen>

//<gen>cy_wait_matching_emails
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
//</gen>

//<gen>cy_wait_matching_first
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
//</gen>

//<gen>cy_wait_conditions
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
//</gen>

//<gen>cy_extract_email_code
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
//</gen>

//<gen>cy_extract_email_regex
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
//</gen>

//<gen>cy_extract_email_links
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
//</gen>
