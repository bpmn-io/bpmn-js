import {
  getLabel,
  isLabel
} from '../../util/LabelUtil.js';

/**
 * @typedef {import('diagram-js/lib/core/Canvas.js').default} Canvas
 * @typedef {import('diagram-js/lib/core/ElementRegistry.js').default} ElementRegistry
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPad.js').default} SearchPad
 *
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider.js').default} SearchPadProvider
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider.js').SearchResult} SearchPadResult
 * @typedef {import('diagram-js/lib/features/search-pad/SearchPadProvider.js').Token} SearchPadToken
 * @typedef {import('diagram-js/lib/features/search/search.js').default} Search
 * @typedef {import('diagram-js/lib/features/search/search.js').SearchResult} SearchResult
 * @typedef {import('diagram-js/lib/features/search/search.js').Token} SearchToken
 */

/**
 * Provides ability to search for BPMN elements.
 *
 * @implements {SearchPadProvider}
 *
 * @param {ElementRegistry} elementRegistry
 * @param {SearchPad} searchPad
 * @param {Canvas} canvas
 * @param {Search} search
 */
export default function BpmnSearchProvider(elementRegistry, searchPad, canvas, search) {
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;
  this._search = search;

  searchPad.registerProvider(this);
}

BpmnSearchProvider.$inject = [
  'elementRegistry',
  'searchPad',
  'canvas',
  'search'
];

/**
 * @param {string} pattern
 *
 * @return {SearchPadResult[]}
 */
BpmnSearchProvider.prototype.find = function(pattern) {
  var rootElements = this._canvas.getRootElements();

  var elements = this._elementRegistry.filter(function(element) {
    return !isLabel(element) && !rootElements.includes(element);
  });

  return this._search(
    elements.map(element => {
      return {
        element,
        label: getLabel(element),
        id: element.id
      };
    }),
    pattern, {
      keys: [
        'label',
        'id'
      ]
    }
  ).map(toSearchPadResult);
};

/**
 * @param {SearchResult} token
 *
 * @return {SearchPadResult}
 */
function toSearchPadResult(result) {

  const {
    item: {
      element
    },
    tokens
  } = result;

  return {
    element,
    primaryTokens: tokens.label,
    secondaryTokens: tokens.id
  };
}