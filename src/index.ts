declare global {
  namespace Cypress {
    interface Chainable extends CypressMailSlurp.Chainable {}
  }
}

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};
