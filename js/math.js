// @flow
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

/**
 * Compute the power set of the array.
 */
export function powerset<T>(arr: T[], maxSubsetLength: number): T[][] {
  let ps = [[]];
  if (maxSubsetLength === 0) {
    return ps;
  }
  if (maxSubsetLength === 1) {
    ps = ps.concat(arr.map((x) => [x]));
  } else {
    for (let i = 0; i < arr.length; i += 1) {
      for (let j = 0, len = ps.length; j < len; j += 1) {
        if (typeof maxSubsetLength === 'undefined' || ps[j].length < maxSubsetLength) {
          ps.push(ps[j].concat(arr[i]));
        }
      }
    }
  }

  // Return unique elements
  return uniqWith(ps, isEqual);
}

/**
 * Create Pascal's triangle with the specified amount of rows.
 */
function createPascalTriangle(numRows: number): number[][] {
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
 */
let ptRows = 0;

/**
 * Currently built Pascal's triangle, used for calculating binomial coefficients.
 */
let pascalTriangle = createPascalTriangle(ptRows);

/**
 * Compute n-choose-k.
 */
export function choose(n: number, k: number): number {
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
