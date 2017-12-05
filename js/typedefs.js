/**
 * Card object.
 *
 * @typedef {Object} Card
 * @property {string} name        Name of the card
 * @property {number} numInDeck   Number of copies in deck
 * @property {number} numRequired Number of copies required in starting hand
 */

/**
 * Form data object.
 *
 * @typedef {Object} Data
 * @property {number} deckSize Number of cards in deck
 * @property {number} handSize Number of cards in starting hand
 * @property {Card[]} cards    Cards required in starting hand
 */

/**
 * Chance object.
 *
 * @typedef {Object} Chance
 * @property {number}  percent      Probability in percent form.
 * @property {boolean} experimental `true` if the probability was determined experimentally.
 */
