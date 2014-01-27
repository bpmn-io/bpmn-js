require('../core/Events');

var Diagram = require('../Diagram'),
    _ = require('../util/underscore');


/**
 * @class
 *
 * A service that offers the current selection in a diagram.
 * Offers the api to control the selection, too.
 * 
 * @param {Events} events the event bus
 */
function Selection(events) {

  var selectedElements = [];

  function getSelection() {
    return selectedElements;
  }

  function isSelected(shape) {
    return selectedElements.indexOf(shape) != -1;
  }

  function select(element, add) {
    var oldSelection = selectedElements.slice();
    if (element && add) {
      if (selectedElements.indexOf(element) != -1) {
        // already selected
        return;
      } else {
        selectedElements.push(element);
      }
    } else {
      selectedElements.length = 0;
      if (element) {
        selectedElements.push(element);
      }
    }

    events.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
  }

  function deselect(element) {
    throw new Error('[mod] not implemented');
  }

  return {
    getSelection: getSelection,
    isSelected: isSelected,
    select: select,
    deselect: deselect
  };
}

Diagram.plugin('selection', [ 'events', Selection ]);

module.exports = Selection;