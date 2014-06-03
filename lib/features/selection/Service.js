require('../../core/EventBus');

var Diagram = require('../../Diagram'),
    _ = require('lodash');


/**
 * @class
 *
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 *
 * @param {EventBus} events the event bus
 */
function SelectionService(events) {

  var selectedElements = [];

  function getSelection() {
    return selectedElements;
  }

  function isSelected(shape) {
    return selectedElements.indexOf(shape) !== -1;
  }

  /**
   * This method selects one or more elements on the diagram.
   *
   * By passing an additional add parameter you can decide whether or not the element(s)
   * should be added to the already existing selection or not.
   *
   * @method Selection#select
   *
   * @param  {Object|Object[]} elements element or array of elements to be selected
   * @param  {boolean} [add] whether the element(s) should be appended to the current selection, defaults to false
   */
  function select(elements, add) {
    var oldSelection = selectedElements.slice();

    if (!_.isArray(elements)) {
      elements = elements ? [ elements ] : [];
    }

    // selection may be cleared by passing an empty array or null
    // to the method
    if (elements.length && add) {
      _.forEach(elements, function(element) {
        if (selectedElements.indexOf(element) !== -1) {
          // already selected
          return;
        } else {
          selectedElements.push(element);
        }
      });
    } else {
      selectedElements = elements.slice();
    }

    events.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
  }

  function deselect(element) {
    throw new Error('not implemented');
  }

  return {
    getSelection: getSelection,
    isSelected: isSelected,
    select: select,
    deselect: deselect
  };
}

Diagram.plugin('selection', [ 'eventBus', SelectionService ]);

module.exports = SelectionService;