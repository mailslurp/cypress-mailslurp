import { jest, describe, it, expect, beforeEach } from '@jest/globals';
describe('plugin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
    (global as any).Cypress = {};
  });
  it('requires api key', async () => {
    let config: any = null;
    jest.mock('mailslurp-client', () => {
      return {
        MailSlurp: function(args: any) {
          config = args;
        },
      };
    });
    const apiKey = 'test-api-key';
    const add = jest.fn();
    const env = jest.fn().mockReturnValue(apiKey);
    (global as any).Cypress = {
      env,
      Commands: {
        add,
      },
    };
    let e: any = null;
    try {
      await import('../src/index');
    } catch (err) {
      e = err;
    }
    expect(env).toHaveBeenCalledWith('MAILSLURP_API_KEY');
    expect(e).toBeFalsy();
    expect(add.mock.calls[0][0]).toEqual('mailslurp');
    expect(add.mock.calls[0][1]).toBeTruthy();
    const mailslurp = await (add.mock.calls[0][1] as any)();
    expect(mailslurp).toEqual({});
    expect(config).toEqual({
      apiKey: 'test-api-key',
      basePath: 'https://cypress.api.mailslurp.com',
    });
  });
  it('requires api key', async () => {
    const add = jest.fn();
    (global as any).Cypress = {
      env: jest.fn().mockReturnValue(null),
      Commands: {
        add,
      },
    };
    let e: any = null;
    try {
      await import('../src/index');
    } catch (err) {
      e = err;
    }
    expect(add).not.toHaveBeenCalled();
    expect(e.message).toContain(
      'Error no MailSlurp API Key.'
    );
  });
});
