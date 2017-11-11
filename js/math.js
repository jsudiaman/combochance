/* global _, common */

(function (window) {
  /** Maximum length of a power set is 2^MAX_N */
  const MAX_N = 26

  /** Maximum rows to compute for Pascal's Triangle */
  const MAX_PASCAL = 10000

  /** Number of trials to use for Monte Carlo simulation */
  const MONTE_CARLO_TRIALS = 1000

  var math = {}

  /**
   * Compute the power set of the array.
   *
   * @param arr An array
   * @param maxLength Maximum cardinality of subsets
   * @return {*[]} All possible subsets of the array
   */
  math.powerset = function (arr, maxLength) {
    var ps = [[]]
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

      for (var i = 0; i < arr.length; i++) {
        for (var j = 0, len = ps.length; j < len; j++) {
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

      for (var i = 0, l = arr1.length; i < l; i++) {
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
  math.createPascalTriangle = function (numRows) {
    numRows++
    var pascalTriangle = []

    for (var i = 0; i < numRows; i++) {
      pascalTriangle[i] = new Array(i + 1)

      for (var j = 0; j < i + 1; j++) {
        if (j === 0 || j === i) {
          pascalTriangle[i][j] = 1
        } else {
          pascalTriangle[i][j] = pascalTriangle[i - 1][j - 1] + pascalTriangle[i - 1][j]
        }
      }
    }

    return pascalTriangle
  }

  var ptRows = 0
  var pascalTriangle = math.createPascalTriangle(ptRows)

  /**
   * Compute n-choose-k.
   *
   * @param n Number of elements in total
   * @param k Number of elements to choose
   * @returns {number} Value of the binomial coefficient
   */
  math.choose = function (n, k) {
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
    if (n > ptRows) {
      pascalTriangle = math.createPascalTriangle(n)
    }
    return pascalTriangle[n][k]
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
  math.getChance = function (data) {
    // Obtain required data
    var prob = 0
    var freeCards = data.handSize - _.reduce(data.cards, function (acc, card) {
      return acc + card.numRequired
    }, 0)

    // Compute chance
    const tmpCards = JSON.stringify(data.cards)
    try {
      // Each node points back to a card
      var nodes = []
      for (var i = 0; i < data.cards.length; i++) {
        var card = data.cards[i]
        for (var j = 0; j < card.numInDeck - card.numRequired; j++) {
          nodes.push(i)
        }
      }

      // Monte Carlo if computation would be too expensive
      if (nodes.length > MAX_N && freeCards > 1) {
        return {
          percent: getChance3(data) * 100,
          experimental: true
        }
      }

      // Compute power set of nodes, but only keep elements of n <= freeCards
      var ps = math.powerset(nodes, freeCards)

      // Loop through power set
      for (var k = 0; k < ps.length; k++) {
        var nodeArr = ps[k]
        for (var l = 0; l < nodeArr.length; l++) {
          // For each node, add one to its 'numRequired' value
          data.cards[nodeArr[l]].numRequired++
        }
        prob += getChance2(data)
        data.cards = JSON.parse(tmpCards) // Reset cards
      }
    } finally {
      data.cards = JSON.parse(tmpCards)
    }

    // Get chance
    var chance = {
      percent: prob * 100,
      experimental: false
    }

    // Return it
    var percent = chance.percent
    var experimental = chance.experimental
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
  function getChance2 (data) {
    // Use multivariate hypergeometric formula to compute chance
    var num = _.reduce(data.cards, function (acc, card) {
      return acc * math.choose(card.numInDeck, card.numRequired)
    }, math.choose(data.deckSize - common.getSumInDeck(data), data.handSize - common.getSumRequired(data)))
    var den = math.choose(data.deckSize, data.handSize)
    return num / den
  }

  /**
   * Compute the chance of the given combo using Monte Carlo method. (Used if standard computation would require
   * an extraordinarily large power set.)
   *
   * @param data Form data
   * @return {number} Probability in decimal form
   */
  function getChance3 (data) {
    // Define variables
    var successes = 0
    var deck = []
    var requiredHand = []
    var hand
    _.forEach(data.cards, function (card) {
      for (var i = 0; i < card.numInDeck; i++) {
        deck.push(card)
      }

      for (var j = 0; j < card.numRequired; j++) {
        requiredHand.push(card)
      }
    })

    for (var i = 0, len = deck.length; i < data.deckSize - len; i++) {
      deck.push({})
    }
    for (var j = 0; j < MONTE_CARLO_TRIALS; j++) {
      hand = _.shuffle(deck).slice(0, data.handSize)
      if (_.difference(requiredHand, hand).length === 0) {
        successes++
      }
    }

    return successes / MONTE_CARLO_TRIALS
  }

  window.math = math
})(this)
