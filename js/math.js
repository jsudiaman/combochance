const _ = require('lodash')
const common = require('./common.js')

const MAX_N = 26                // Maximum length of a power set is 2^MAX_N
const MAX_PASCAL = 10000        // Maximum rows to compute for Pascal's Triangle
const MONTE_CARLO_TRIALS = 1000 // Number of trials to use for Monte Carlo simulation

/**
 * Compute the power set of the array.
 *
 * @param arr An array
 * @param maxLength Maximum cardinality of subsets
 * @return {*[]} All possible subsets of the array
 */
exports.powerset = function (arr, maxLength) {
  let ps = [[]]
  if (maxLength === 0) {
    return ps
  } else if (maxLength === 1) {
    ps = ps.concat(_.map(arr, function (x) {
      return [x]
    }))
  } else {
    if (arr.length > MAX_N) {
      throw new Error('This would require processing a very large power set (2^' + arr.length + ' elements).')
    }

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = ps.length; j < len; j++) {
        if (typeof maxLength === 'undefined' || ps[j].length < maxLength) {
          ps.push(ps[j].concat(arr[i]))
        }
      }
    }
  }

  // Return unique elements
  return _.uniqWith(ps, function (arr1, arr2) {
    // if the other array is a falsy value, return
    if (!arr2) {
      return false
    }

    // compare lengths - can save a lot of time
    if (arr1.length !== arr2.length) {
      return false
    }

    for (let i = 0, l = arr1.length; i < l; i++) {
      if (arr1[i] !== arr2[i]) {
        return false
      }
    }
    return true
  })
}

/**
 * Create Pascal's triangle with the specified amount of rows.
 *
 * @param numRows Number of rows
 * @return {Array} 2D (NOT rectangular) array which represents Pascal's triangle
 */
exports.createPascalTriangle = function (numRows) {
  numRows++
  const pascalTriangle = []

  for (let i = 0; i < numRows; i++) {
    pascalTriangle[i] = new Array(i + 1)

    for (let j = 0; j < i + 1; j++) {
      if (j === 0 || j === i) {
        pascalTriangle[i][j] = 1
      } else {
        pascalTriangle[i][j] = pascalTriangle[i - 1][j - 1] + pascalTriangle[i - 1][j]
      }
    }
  }

  return pascalTriangle
}

exports.ptRows = 0
exports.pascalTriangle = exports.createPascalTriangle(exports.ptRows)

/**
 * Compute n-choose-k.
 *
 * @param n Number of elements in total
 * @param k Number of elements to choose
 * @returns {number} Value of the binomial coefficient
 */
exports.choose = function (n, k) {
  // Validation
  if (k > n) {
    return 0
  }
  if (n > MAX_PASCAL) {
    throw RangeError('n is too large')
  }
  if (n < 0 || k < 0) {
    throw RangeError('Please use positive numbers.')
  }

  // Expand Pascal's Triangle, if necessary
  if (n > this.ptRows) {
    this.ptRows = n
    this.pascalTriangle = this.createPascalTriangle(n)
  }
  return this.pascalTriangle[n][k]
}

/**
 * Compute the chance of the combo (given by form data). Accounts for the possibility of having more than required.
 *
 * @param data Form data
 * @return {{percent: number, experimental: boolean}}
 *
 * percent: Probability in percent form.
 * experimental: true if the probability was determined experimentally.
 */
exports.getChance = function (data) {
  // Obtain required data
  let prob = 0
  const freeCards = data.handSize - _.reduce(data.cards, function (acc, card) {
    return acc + card.numRequired
  }, 0)

  // Compute chance
  const tmpCards = JSON.stringify(data.cards)
  try {
    // Each node points back to a card
    const nodes = []
    for (let i = 0; i < data.cards.length; i++) {
      const card = data.cards[i]
      for (let j = 0; j < card.numInDeck - card.numRequired; j++) {
        nodes.push(i)
      }
    }

    // Monte Carlo if computation would be too expensive
    if (nodes.length > MAX_N && freeCards > 1) {
      return {
        percent: this.getChance3(data) * 100,
        experimental: true
      }
    }

    // Compute power set of nodes, but only keep elements of n <= freeCards
    const ps = this.powerset(nodes, freeCards)

    // Loop through power set
    for (let k = 0; k < ps.length; k++) {
      const nodeArr = ps[k]
      for (let l = 0; l < nodeArr.length; l++) {
        // For each node, add one to its 'numRequired' value
        data.cards[nodeArr[l]].numRequired++
      }
      prob += this.getChance2(data)
      data.cards = JSON.parse(tmpCards) // Reset cards
    }
  } finally {
    data.cards = JSON.parse(tmpCards)
  }

  // Get chance
  const chance = {
    percent: prob * 100,
    experimental: false
  }

  // Return it
  const percent = chance.percent
  const experimental = chance.experimental
  if (percent >= 99.9 && percent < 100) {
    return {
      percent: 99.9,
      experimental: experimental
    } // Avoid rounding to 100
  } else {
    return {
      percent: percent,
      experimental: experimental
    }
  }
}

/**
 * Compute the chance of the given combo, with EXACT amount required (no more, no less).
 *
 * @param data Form data
 * @return {number} Probability in decimal form
 */
exports.getChance2 = function (data) {
  // Use multiconstiate hypergeometric formula to compute chance
  const num = _.reduce(data.cards, (acc, card) => {
    return acc * this.choose(card.numInDeck, card.numRequired)
  }, this.choose(data.deckSize - common.getSumInDeck(data), data.handSize - common.getSumRequired(data)))
  const den = this.choose(data.deckSize, data.handSize)
  return num / den
}

/**
 * Compute the chance of the given combo using Monte Carlo method. (Used if standard computation would require
 * an extraordinarily large power set.)
 *
 * @param data Form data
 * @return {number} Probability in decimal form
 */
exports.getChance3 = function (data) {
  // Define constiables
  let successes = 0
  const deck = []
  const requiredHand = []
  let hand
  _.forEach(data.cards, function (card) {
    for (let i = 0; i < card.numInDeck; i++) {
      deck.push(card)
    }

    for (let j = 0; j < card.numRequired; j++) {
      requiredHand.push(card)
    }
  })

  for (let i = 0, len = deck.length; i < data.deckSize - len; i++) {
    deck.push({})
  }
  for (let j = 0; j < MONTE_CARLO_TRIALS; j++) {
    hand = _.shuffle(deck).slice(0, data.handSize)
    if (_.difference(requiredHand, hand).length === 0) {
      successes++
    }
  }

  return successes / MONTE_CARLO_TRIALS
}
