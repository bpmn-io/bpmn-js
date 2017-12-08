'use strict';

/**
 * Select element after auto placement.
 *
 * @param {EventBus} eventBus
 * @param {Selection} selection
 */
function AutoPlaceSelectionBehavior(eventBus, selection) {

  eventBus.on('autoPlace.end', 500, function(e) {
    selection.select(e.shape);
  });

}

AutoPlaceSelectionBehavior.$inject = [
  'eventBus',
  'selection'
];

module.exports = AutoPlaceSelectionBehavior;
