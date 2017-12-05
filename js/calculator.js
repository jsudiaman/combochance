/**
 * Calculator module.
 *
 * @module calculator
 */
const _ = require('lodash');
const math = require('./math.js');

const MAX_N = 26;                 // Maximum length of a power set is 2^MAX_N
const MONTE_CARLO_TRIALS = 10000; // Number of trials to use for Monte Carlo simulation

/**
 * Get sum of "Amount Required" values in the table.
 *
 * @param {Data} data Form data
 * @returns {number} The sum
 */
exports.getSumRequired = function (data) {
  return _.reduce(data.cards, (acc, card) => acc + card.numRequired, 0);
};

/**
 * Get sum of "Amount in Deck" values in the table.
 *
 * @param {Data} data Form data
 * @returns {number} The sum
 */
exports.getSumInDeck = function (data) {
  return _.reduce(data.cards, (acc, card) => acc + card.numInDeck, 0);
};

/**
 * Compute the chance of the combo (given by form data). Accounts for the possibility of having more than required.
 *
 * @param {Data} data Form data
 * @return {Chance} The chance
 */
exports.getChance = function (data) {
  // Obtain required data
  let prob = 0;
  const freeCards = data.handSize - this.getSumRequired(data);

  // Compute chance
  const tmpCards = JSON.stringify(data.cards);
  try {
    // Each node points back to a card
    const nodes = [];
    for (let i = 0; i < data.cards.length; i++) {
      const card = data.cards[i];
      for (let j = 0; j < card.numInDeck - card.numRequired; j++) {
        nodes.push(i);
      }
    }

    // Monte Carlo if computation would be too expensive
    if (nodes.length > MAX_N && freeCards > 1) {
      return {
        percent: this.getChance3(data) * 100,
        experimental: true
      };
    }

    // Compute power set of nodes, but only keep elements of n <= freeCards
    const ps = math.powerset(nodes, freeCards);

    // Loop through power set
    for (let k = 0; k < ps.length; k++) {
      const nodeArr = ps[k];
      for (let l = 0; l < nodeArr.length; l++) {
        // For each node, add one to its 'numRequired' value
        data.cards[nodeArr[l]].numRequired++;
      }
      prob += this.getChance2(data);
      data.cards = JSON.parse(tmpCards); // Reset cards
    }
  } finally {
    data.cards = JSON.parse(tmpCards);
  }

  // Get chance
  const chance = {
    percent: prob * 100,
    experimental: false
  };

  // Return it
  const percent = chance.percent;
  const experimental = chance.experimental;
  if (percent >= 99.9 && percent < 100) {
    return {
      percent: 99.9,
      experimental: experimental
    }; // Avoid rounding to 100
  } else {
    return {
      percent: percent,
      experimental: experimental
    };
  }
};

/**
 * Compute the chance of the given combo, with EXACT amount required (no more, no less).
 *
 * @param {Data} data Form data
 * @return {number} Probability in decimal form
 */
exports.getChance2 = function (data) {
  // Use multivariate hypergeometric formula to compute chance
  const num = _.reduce(data.cards, (acc, card) => {
    return acc * math.choose(card.numInDeck, card.numRequired);
  }, math.choose(data.deckSize - this.getSumInDeck(data), data.handSize - this.getSumRequired(data)));
  const den = math.choose(data.deckSize, data.handSize);
  return num / den;
};

/**
 * Compute the chance of the given combo using Monte Carlo method. (Used if standard computation would require
 * an extraordinarily large power set.)
 *
 * @param {Data} data Form data
 * @return {number} Probability in decimal form
 */
exports.getChance3 = function (data) {
  // Define variables
  let successes = 0;
  const deck = [];
  const requiredHand = [];

  _.forEach(data.cards, card => {
    for (let i = 0; i < card.numInDeck; i++) {
      deck.push(card);
    }

    for (let j = 0; j < card.numRequired; j++) {
      requiredHand.push(card);
    }
  });

  for (let i = 0, len = deck.length; i < data.deckSize - len; i++) {
    deck.push({});
  }
  for (let j = 0; j < MONTE_CARLO_TRIALS; j++) {
    const hand = _.shuffle(deck).slice(0, data.handSize);
    if (_.difference(requiredHand, hand).length === 0) {
      successes++;
    }
  }

  return successes / MONTE_CARLO_TRIALS;
};
