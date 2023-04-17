
import inherits from 'inherits-browser';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  forEach
} from 'min-dash';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';
import { selfAndAllChildren } from 'diagram-js/lib/util/Elements';

import { isExpanded } from '../../../util/DiUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../Modeling').default} Modeling
 *
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('diagram-js/lib/util/Types').DirectionTRBL} DirectionTRBL
 */

/**
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function ToggleCollapseConnectionBehaviour(
    eventBus, modeling
) {

  CommandInterceptor.call(this, eventBus);

  this.postExecuted('shape.toggleCollapse', 1500, function(context) {

    // var shape = context.shape;
    var shape = context.shape;

    // only change connections when collapsing
    if (isExpanded(shape)) {
      return;
    }

    var allChildren = selfAndAllChildren(shape);

    allChildren.forEach(function(child) {

      // Ensure that the connection array is not modified during iteration
      var incomingConnections = child.incoming.slice(),
          outgoingConnections = child.outgoing.slice();

      forEach(incomingConnections, function(c) {
        handleConnection(c, true);
      });

      forEach(outgoingConnections, function(c) {
        handleConnection(c, false);
      });
    });


    function handleConnection(c, incoming) {
      if (allChildren.indexOf(c.source) !== -1 && allChildren.indexOf(c.target) !== -1) {
        return;
      }

      if (incoming) {
        modeling.reconnectEnd(c, shape, getMid(shape));
      } else {
        modeling.reconnectStart(c, shape, getMid(shape));
      }

    }

  }, true);

}

inherits(ToggleCollapseConnectionBehaviour, CommandInterceptor);

ToggleCollapseConnectionBehaviour.$inject = [
  'eventBus',
  'modeling',
];


