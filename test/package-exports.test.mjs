import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { after, test } from 'node:test';

const originalCypress = globalThis.Cypress;
const originalCy = globalThis.cy;

function captureRegistration(load) {
  const registrations = [];
  globalThis.Cypress = {
    Commands: {
      add(name, implementation) {
        registrations.push({ implementation, name });
      },
    },
  };

  return Promise.resolve(load()).then(module => ({ module, registrations }));
}

const esm = await captureRegistration(() => import('cypress-mailslurp'));
const cjs = await captureRegistration(() => {
  const require = createRequire(import.meta.url);
  return require('cypress-mailslurp');
});

after(() => {
  globalThis.Cypress = originalCypress;
  globalThis.cy = originalCy;
});

test('ES module package export registers cy.mailslurp', () => {
  assert.equal(esm.registrations.length, 1);
  assert.equal(esm.registrations[0].name, 'mailslurp');
  assert.equal(typeof esm.registrations[0].implementation, 'function');
});

test('CommonJS package export registers cy.mailslurp', () => {
  assert.equal(cjs.registrations.length, 1);
  assert.equal(cjs.registrations[0].name, 'mailslurp');
  assert.equal(typeof cjs.registrations[0].implementation, 'function');
});

test('explicit configuration bypasses cy.env and preserves client options', async () => {
  globalThis.cy = {
    env() {
      throw new Error('cy.env should not be called for an explicit API key');
    },
  };

  const client = await esm.registrations[0].implementation({
    apiKey: 'example-api-key',
    basePath: 'https://mail.example.test',
    headers: { 'x-plugin-test': 'configured' },
  });
  const configuration = client.userController.configuration;

  assert.equal(configuration.basePath, 'https://mail.example.test');
  assert.equal(configuration.apiKey('x-api-key'), 'example-api-key');
  assert.equal(configuration.headers['x-plugin-test'], 'configured');
});

test('environment configuration is read securely with logging disabled', async () => {
  const calls = [];
  globalThis.cy = {
    env(names, options) {
      calls.push({ names, options });
      return Promise.resolve({ MAILSLURP_API_KEY: 'environment-api-key' });
    },
  };

  const client = await esm.registrations[0].implementation();
  const configuration = client.userController.configuration;

  assert.deepEqual(calls, [
    {
      names: ['MAILSLURP_API_KEY'],
      options: { log: false },
    },
  ]);
  assert.equal(configuration.basePath, 'https://cypress.api.mailslurp.com');
  assert.equal(configuration.apiKey('x-api-key'), 'environment-api-key');
});

test('missing environment configuration gives an actionable error', async () => {
  globalThis.cy = {
    env() {
      return Promise.resolve({});
    },
  };

  await assert.rejects(
    () => esm.registrations[0].implementation(),
    error => {
      assert.match(error.message, /No MailSlurp API key was provided/);
      assert.match(error.message, /CYPRESS_MAILSLURP_API_KEY/);
      return true;
    }
  );
});
