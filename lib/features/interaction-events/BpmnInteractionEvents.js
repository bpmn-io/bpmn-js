import { is } from '../../util/ModelUtil';

import { isExpanded } from '../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/features/interaction-events/InteractionEvents').default} InteractionEvents
 *
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Shape} Shape
 */

var LABEL_WIDTH = 30,
    LABEL_HEIGHT = 30;


/**
 * BPMN-specific hit zones and interaction fixes.
 *
 * @param {EventBus} eventBus
 * @param {InteractionEvents} interactionEvents
 */
export default function BpmnInteractionEvents(eventBus, interactionEvents) {

  this._interactionEvents = interactionEvents;

  var self = this;

  eventBus.on([
    'interactionEvents.createHit',
    'interactionEvents.updateHit'
  ], function(context) {
    var element = context.element,
        gfx = context.gfx;

    if (is(element, 'bpmn:Lane')) {
      return self._createParticipantHit(element, gfx);
    } else

    if (is(element, 'bpmn:Participant')) {
      if (isExpanded(element)) {
        return self._createParticipantHit(element, gfx);
      } else {
        return self._createDefaultHit(element, gfx);
      }
    } else

    if (is(element, 'bpmn:SubProcess')) {
      if (isExpanded(element)) {
        return self._createSubProcessHit(element, gfx);
      } else {
        return self._createDefaultHit(element, gfx);
      }
    }
  });

}

BpmnInteractionEvents.$inject = [
  'eventBus',
  'interactionEvents'
];

/**
 * @param {Element} element
 * @param {SVGElement} gfx
 *
 * @return {boolean}
 */
BpmnInteractionEvents.prototype._createDefaultHit = function(element, gfx) {
  this._interactionEvents.removeHits(gfx);

  this._interactionEvents.createDefaultHit(element, gfx);

  // indicate that we created a hit
  return true;
};

/**
 * @param {Shape} element
 * @param {SVGElement} gfx
 *
 * @return {boolean}
 */
BpmnInteractionEvents.prototype._createParticipantHit = function(element, gfx) {

  // remove existing hits
  this._interactionEvents.removeHits(gfx);

  // add body hit
  this._interactionEvents.createBoxHit(gfx, 'no-move', {
    width: element.width,
    height: element.height
  });

  // add outline hit
  this._interactionEvents.createBoxHit(gfx, 'click-stroke', {
    width: element.width,
    height: element.height
  });

  // add label hit
  this._interactionEvents.createBoxHit(gfx, 'all', {
    width: LABEL_WIDTH,
    height: element.height
  });

  // indicate that we created a hit
  return true;
};

/**
 * @param {Shape} element
 * @param {SVGElement} gfx
 *
 * @return {boolean}
 */
BpmnInteractionEvents.prototype._createSubProcessHit = function(element, gfx) {

  // remove existing hits
  this._interactionEvents.removeHits(gfx);

  // add body hit
  this._interactionEvents.createBoxHit(gfx, 'no-move', {
    width: element.width,
    height: element.height
  });

  // add outline hit
  this._interactionEvents.createBoxHit(gfx, 'click-stroke', {
    width: element.width,
    height: element.height
  });

  // add label hit
  this._interactionEvents.createBoxHit(gfx, 'all', {
    width: element.width,
    height: LABEL_HEIGHT
  });

  // indicate that we created a hit
  return true;
};