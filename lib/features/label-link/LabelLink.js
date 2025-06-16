import { createLine } from 'diagram-js/lib/util/RenderUtil';
import { queryAll as domQueryAll } from 'min-dom';
import {
  append as svgAppend,
  remove as svgRemove
} from 'tiny-svg';

import { is, isAny } from '../modeling/util/ModelingUtil';

/**
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 */

/**
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function LabelLink(eventBus, canvas) {

  // TODO: The links are not shown in subprocesses. Find the proper layer.
  const defaultLayer = canvas.getDefaultLayer();

  eventBus.on('selection.changed', function({ newSelection }) {

    removeAllLinks(defaultLayer);

    newSelection
      .filter(element => isAny(element, [ 'bpmn:Event', 'bpmn:SequenceFlow' ]))

      // when both label and target are selected
      .filter(element => !newSelection.some(i => i.labelTarget === element))
      .forEach(element => {

        const target = element.labelTarget || element.labels[0];

        if (!target) return;

        const points = [
          getMiddle(element),
          getMiddle(target)
        ];

        const line = createLine(
          points,
          {
            class: 'bjs-label-link',
            stroke: 'hsl(225, 10%, 15%)',
            strokeDasharray: '1, 5'
          }
        );

        svgAppend(defaultLayer, line);

      });
  });
}

LabelLink.$inject = [ 'eventBus', 'canvas' ];

// TODO: Works kinda weird with complicated sequence flows.
function getMiddle(element) {
  if (is(element, 'bpmn:SequenceFlow') && element.waypoints) {
    return {
      x: (element.waypoints[0].x + element.waypoints[1].x) / 2,
      y: (element.waypoints[0].y + element.waypoints[1].y) / 2,
    };
  }

  return {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };
}

function removeAllLinks(contaienr) {
  const links = domQueryAll('.bjs-label-link', contaienr);
  links.forEach(svgRemove);
}