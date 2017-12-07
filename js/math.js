/**
 * Math module.
 *
 * @module math
 */
import _ from 'lodash';

/**
 * Compute the power set of the array.
 *
 * @param {Array}  arr         An array
 * @param {number} [maxLength] Maximum cardinality of subsets
 * @return {Array[]} All possible subsets of the array
 */
export function powerset(arr, maxLength) {
  let ps = [[]];
  if (maxLength === 0) {
    return ps;
  } else if (maxLength === 1) {
    ps = ps.concat(_.map(arr, x => [x]));
  } else {
    for (let i = 0; i < arr.length; i += 1) {
      for (let j = 0, len = ps.length; j < len; j += 1) {
        if (typeof maxLength === 'undefined' || ps[j].length < maxLength) {
          ps.push(ps[j].concat(arr[i]));
        }
      }
    }
  }

  // Return unique elements
  return _.uniqWith(ps, (arr1, arr2) => {
    // if the other array is a falsy value, return
    if (!arr2) {
      return false;
    }

    // compare lengths - can save a lot of time
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0, l = arr1.length; i < l; i += 1) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Create Pascal's triangle with the specified amount of rows.
 *
 * @param {number} numRows Number of rows
 * @return {Array[]} 2D (NOT rectangular) array which represents Pascal's triangle
 */
export function createPascalTriangle(numRows) {
  const pascalTriangle = [];

  for (let i = 0; i < numRows + 1; i += 1) {
    pascalTriangle[i] = new Array(i + 1);

    for (let j = 0; j < i + 1; j += 1) {
      if (j === 0 || j === i) {
        pascalTriangle[i][j] = 1;
      } else {
        pascalTriangle[i][j] = pascalTriangle[i - 1][j - 1] + pascalTriangle[i - 1][j];
      }
    }
  }

  return pascalTriangle;
}

/**
 * Number of rows in the currently built Pascal's triangle.
 *
 * @type {number}
 * @private
 */
let ptRows = 0;

/**
 * Currently built Pascal's triangle, used for calculating binomial coefficients.
 *
 * @type {Array[]}
 * @private
 */
let pascalTriangle = createPascalTriangle(ptRows);

/**
 * Compute n-choose-k.
 *
 * @param {number} n Number of elements in total
 * @param {number} k Number of elements to choose
 * @returns {number} Value of the binomial coefficient
 */
export function choose(n, k) {
  // Validation
  if (k > n) {
    return 0;
  }
  if (n < 0 || k < 0) {
    throw RangeError('Please use positive numbers.');
  }

  // Expand Pascal's Triangle, if necessary
  if (n > ptRows) {
    ptRows = n;
    pascalTriangle = createPascalTriangle(n);
  }
  return pascalTriangle[n][k];
}
