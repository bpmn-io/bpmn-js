import { omit } from 'min-dash';

import {
  getLabel,
  isLabel
} from '../../util/LabelUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry').default} ElementRegistry
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPad').default} SearchPad
 *
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').default} SearchPadProvider
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider').SearchResult} SearchResult
 */

/**
 * Provides ability to search for BPMN elements.
 *
 * @implements {SearchPadProvider}
 *
 * @param {ElementRegistry} elementRegistry
 * @param {SearchPad} searchPad
 * @param {Canvas} canvas
 */
export default function BpmnSearchProvider(elementRegistry, searchPad, canvas) {
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;

  searchPad.registerProvider(this);
}

BpmnSearchProvider.$inject = [
  'elementRegistry',
  'searchPad',
  'canvas'
];

/**
 * @param {string} pattern
 *
 * @return {SearchResult[]}
 */
BpmnSearchProvider.prototype.find = function(pattern) {
  var rootElements = this._canvas.getRootElements();

  var elements = this._elementRegistry.filter(function(element) {
    return !isLabel(element) && !rootElements.includes(element);
  });

  return elements
    .reduce(function(results, element) {
      var label = getLabel(element);

      var primaryTokens = findMatches(label, pattern),
          secondaryTokens = findMatches(element.id, pattern);

      if (hasMatch(primaryTokens) || hasMatch(secondaryTokens)) {
        return [
          ...results,
          {
            primaryTokens,
            secondaryTokens,
            element
          }
        ];
      }

      return results;
    }, [])
    .sort(function(a, b) {
      return compareTokens(a.primaryTokens, b.primaryTokens)
        || compareTokens(a.secondaryTokens, b.secondaryTokens)
        || compareStrings(getLabel(a.element), getLabel(b.element))
        || compareStrings(a.element.id, b.element.id);
    })
    .map(function(result) {
      return {
        element: result.element,
        primaryTokens: result.primaryTokens.map(function(token) {
          return omit(token, [ 'index' ]);
        }),
        secondaryTokens: result.secondaryTokens.map(function(token) {
          return omit(token, [ 'index' ]);
        })
      };
    });
};

/**
 * @param {Token} token
 *
 * @return {boolean}
 */
function isMatch(token) {
  return 'matched' in token;
}

/**
 * @param {Token[]} tokens
 *
 * @return {boolean}
 */
function hasMatch(tokens) {
  return tokens.find(isMatch);
}

/**
 * Compares two token arrays.
 *
 * @param {Token[]} tokensA
 * @param {Token[]} tokensB
 *
 * @returns {number}
 */
function compareTokens(tokensA, tokensB) {
  const tokensAHasMatch = hasMatch(tokensA),
        tokensBHasMatch = hasMatch(tokensB);

  if (tokensAHasMatch && !tokensBHasMatch) {
    return -1;
  }

  if (!tokensAHasMatch && tokensBHasMatch) {
    return 1;
  }

  if (!tokensAHasMatch && !tokensBHasMatch) {
    return 0;
  }

  const tokensAFirstMatch = tokensA.find(isMatch),
        tokensBFirstMatch = tokensB.find(isMatch);

  if (tokensAFirstMatch.index < tokensBFirstMatch.index) {
    return -1;
  }

  if (tokensAFirstMatch.index > tokensBFirstMatch.index) {
    return 1;
  }

  return 0;
}

/**
 * Compares two strings.
 *
 * @param {string} [a]
 * @param {string} [b]
 *
 * @returns {number}
 */
function compareStrings(a = '', b = '') {
  return a.localeCompare(b);
}

/**
 * @param {string} text
 * @param {string} pattern
 *
 * @return {Token[]}
 */
function findMatches(text, pattern) {
  var tokens = [],
      originalText = text;

  if (!text) {
    return tokens;
  }

  text = text.toLowerCase();
  pattern = pattern.toLowerCase();

  var index = text.indexOf(pattern);

  if (index > -1) {
    if (index !== 0) {
      tokens.push({
        normal: originalText.slice(0, index),
        index: 0
      });
    }

    tokens.push({
      matched: originalText.slice(index, index + pattern.length),
      index: index
    });

    if (pattern.length + index < text.length) {
      tokens.push({
        normal: originalText.slice(index + pattern.length),
        index: index + pattern.length
      });
    }
  } else {
    tokens.push({
      normal: originalText,
      index: 0
    });
  }

  return tokens;
}