/* eslint-env amd */

define(['lodash'], function (_) {
  var common = {}

  /**
   * Get sum of "Amount Required" values in the table.
   *
   * @param data Form data
   * @returns {number} The sum
   */
  common.getSumRequired = function (data) {
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
  common.getSumInDeck = function (data) {
    return _.reduce(data.cards, function (acc, card) {
      return acc + card.numInDeck
    }, 0)
  }

  return common
})
