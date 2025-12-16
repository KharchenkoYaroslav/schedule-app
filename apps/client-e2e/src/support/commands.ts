/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
// ***********************************************

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
      login(login: string, password: string): void;
    }
  }
}


Cypress.Commands.add('login', (login, password) => {
  cy.session(
    [login, password],
    () => {
      cy.visit('/admin/auth');

      cy.intercept('POST', '**/auth/login').as('loginReq');

      cy.get('input[placeholder="Login"]').should('be.visible').type(login);
      cy.get('input[placeholder="Password"]').type(password);
      cy.get('button').contains('Login').click();

      cy.wait('@loginReq').its('response.statusCode').should('eq', 201);

      cy.url().should('include', '/admin');
      cy.url().should('not.include', '/auth');
    },
    {
      validate: () => {
        cy.visit('/admin');
        cy.url().should('include', '/admin');
        cy.url().should('not.include', '/auth');
      },

      cacheAcrossSpecs: true,
    }
  );
});
