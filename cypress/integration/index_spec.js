/// <reference types="Cypress" />

describe('Index Page', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad: (win) => win.sessionStorage.clear(),
    });
    cy.reload();
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

  describe('Compute', () => {
    it('should compute chance for single card combos', () => {
      cy.get('#name0').type('Final Countdown');
      cy.get('#aid0').clear().type('3');
      cy.get('#ar0').clear().type('1');

      cy.contains('Deck Size').type('40');
      cy.contains('Hand Size').type('5');
      cy.contains('Compute').click();
      cy.get('#results').should('contain.text', 'Combo: 1x Final Countdown').and('contain.text', '33.8%');
    });

    it('should compute chance for multi card combos', () => {
      cy.get('#name0').type('Valhalla, Hall of the Fallen');
      cy.get('#aid0').clear().type('3');
      cy.get('#ar0').clear().type('1');
      cy.contains('Add Row').click();

      cy.get('#name1').type('Archlord Kristya');
      cy.get('#aid1').clear().type('3');
      cy.get('#ar1').clear().type('1');

      cy.contains('Deck Size').type('40');
      cy.contains('Hand Size').type('5');
      cy.contains('Compute').click();
      cy.get('#results').should('contain.text', 'Combo: 1x Valhalla, Hall of the Fallen, 1x Archlord Kristya').and('contain.text', '9.80%');
    });
  });
});
