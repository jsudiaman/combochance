const _ = require('lodash')

/**
 * Get sum of "Amount Required" values in the table.
 *
 * @param data Form data
 * @returns {number} The sum
 */
exports.getSumRequired = function (data) {
  return _.reduce(data.cards, function (acc, card) {
    return acc + card.numRequired
  }, 0)
}

/**
 * Get sum of "Amount in Deck" values in the table.
 *
 * @param data Form data
 * @returns {number} The sum
 */
exports.getSumInDeck = function (data) {
  return _.reduce(data.cards, function (acc, card) {
    return acc + card.numInDeck
  }, 0)
}
