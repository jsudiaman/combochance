/**
 * Calculator module.
 *
 * @module calculator
 */
import _ from 'lodash';
import * as math from './math';

const MAX_N = 26; // Maximum length of a power set is 2^MAX_N
const MONTE_CARLO_TRIALS = 10000; // Number of trials to use for Monte Carlo simulation

/**
 * Get sum of "Amount Required" values in the table.
 *
 * @param {Data} data Form data
 * @returns {number} The sum
 */
export function getSumRequired(data) {
  return _.reduce(data.cards, (acc, card) => acc + card.numRequired, 0);
}

/**
 * Get sum of "Amount in Deck" values in the table.
 *
 * @param {Data} data Form data
 * @returns {number} The sum
 */
export function getSumInDeck(data) {
  return _.reduce(data.cards, (acc, card) => acc + card.numInDeck, 0);
}

/**
 * Compute the chance of the given combo, with EXACT amount required (no more, no less).
 *
 * @param {Data} data Form data
 * @return {number} Probability in decimal form
 * @private
 */
function getChanceExact(data) {
  // Use multivariate hypergeometric formula to compute chance
  const num = _.reduce(
    data.cards,
    (acc, card) => acc * math.choose(card.numInDeck, card.numRequired),
    math.choose(data.deckSize - getSumInDeck(data), data.handSize - getSumRequired(data)),
  );
  const den = math.choose(data.deckSize, data.handSize);
  return num / den;
}

/**
 * Compute the chance of the given combo using Monte Carlo method. (Used if standard computation
 * would require an extraordinarily large power set.)
 *
 * @param {Data} data Form data
 * @return {number} Probability in decimal form
 * @private
 */
function getChanceExperimental(data) {
  // Define variables
  let successes = 0;
  const deck = [];
  const requiredHand = [];

  _.forEach(data.cards, (card) => {
    for (let i = 0; i < card.numInDeck; i += 1) {
      deck.push(card);
    }

    for (let j = 0; j < card.numRequired; j += 1) {
      requiredHand.push(card);
    }
  });

  for (let i = 0, len = deck.length; i < data.deckSize - len; i += 1) {
    deck.push({});
  }
  for (let j = 0; j < MONTE_CARLO_TRIALS; j += 1) {
    const hand = _.shuffle(deck).slice(0, data.handSize);
    if (_.difference(requiredHand, hand).length === 0) {
      successes += 1;
    }
  }

  return successes / MONTE_CARLO_TRIALS;
}

/**
 * Compute the chance of the combo (given by form data). Accounts for the possibility of having more
 * than required.
 *
 * @param {Data} data Form data
 * @return {Chance} The chance
 */
export function getChance(data) {
  // Obtain required data
  const tmpData = JSON.parse(JSON.stringify(data));
  const tmpCards = JSON.stringify(tmpData.cards);
  let prob = 0;
  const freeCards = tmpData.handSize - getSumRequired(tmpData);

  // Each node points back to a card
  const nodes = [];
  for (let i = 0; i < tmpData.cards.length; i += 1) {
    const card = tmpData.cards[i];
    for (let j = 0; j < card.numInDeck - card.numRequired; j += 1) {
      nodes.push(i);
    }
  }

  // Monte Carlo if computation would be too expensive
  if (nodes.length > MAX_N && freeCards > 1) {
    return {
      percent: getChanceExperimental(tmpData) * 100,
      experimental: true,
    };
  }

  // Compute power set of nodes, but only keep elements of n <= freeCards
  const ps = math.powerset(nodes, freeCards);

  // Loop through power set
  for (let k = 0; k < ps.length; k += 1) {
    const nodeArr = ps[k];
    for (let l = 0; l < nodeArr.length; l += 1) {
      // For each node, add one to its 'numRequired' value
      tmpData.cards[nodeArr[l]].numRequired += 1;
    }
    prob += getChanceExact(tmpData);
    tmpData.cards = JSON.parse(tmpCards); // Reset cards
  }

  // Get chance
  const chance = {
    percent: prob * 100,
    experimental: false,
  };

  // Return it
  const { experimental, percent } = chance;
  if (percent >= 99.9 && percent < 100) {
    return {
      percent: 99.9,
      experimental,
    }; // Avoid rounding to 100
  }
  return {
    percent,
    experimental,
  };
}
