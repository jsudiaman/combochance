/// <reference types="Cypress" />

describe('Index Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Examples', () => {
    const examples = [
      {
        title: 'Exodia OTK',
        chance: '0.000152%',
      },
      {
        title: 'Channel + Fireball OTK',
        chance: '0.332%',
      },
      {
        title: 'Leyline of Sanctity Opening',
        chance: '39.9%',
      },
      {
        title: 'Birds of Paradise Opening',
        chance: '38.7%',
      },
    ];

    examples.forEach((example) => {
      it(`should compute chance for ${example.title}`, () => {
        cy.contains('Examples').click();
        cy.contains(example.title).click();
        cy.get('#results').should('contain.text', example.chance);
      });
    });
  });
});
