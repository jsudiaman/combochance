// @flow
import difference from 'lodash/difference';
import shuffle from 'lodash/shuffle';
import * as math from './math';
import type { Chance, Data } from './typedefs';

const MAX_N = 26; // Maximum length of a power set is 2^MAX_N
const MONTE_CARLO_TRIALS = 10000; // Number of trials to use for Monte Carlo simulation

/**
 * Get sum of "Amount Required" values in the table.
 */
export function getSumRequired(data: Data): number {
  return data.cards.reduce((acc, card) => acc + card.numRequired, 0);
}

/**
 * Get sum of "Amount in Deck" values in the table.
 */
export function getSumInDeck(data: Data): number {
  return data.cards.reduce((acc, card) => acc + card.numInDeck, 0);
}

/**
 * Compute the chance of the given combo, with EXACT amount required (no more, no less).
 */
function getChanceExact(data: Data): number {
  // Use multivariate hypergeometric formula to compute chance
  const num = data.cards.reduce(
    (acc, card) => acc * math.choose(card.numInDeck, card.numRequired),
    math.choose(data.deckSize - getSumInDeck(data), data.handSize - getSumRequired(data)),
  );
  const den = math.choose(data.deckSize, data.handSize);
  return num / den;
}

/**
 * Compute the chance of the given combo using Monte Carlo method. (Used if standard computation
 * would require an extraordinarily large power set.)
 */
function getChanceExperimental(data: Data): number {
  // Define variables
  let successes = 0;
  const deck = [];
  const requiredHand = [];

  data.cards.forEach((card) => {
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
    const hand = shuffle(deck).slice(0, data.handSize);
    if (difference(requiredHand, hand).length === 0) {
      successes += 1;
    }
  }

  return successes / MONTE_CARLO_TRIALS;
}

/**
 * Compute the chance of the combo (given by form data). Accounts for the possibility of having more
 * than required.
 */
export function getChance(data: Data): Chance {
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
