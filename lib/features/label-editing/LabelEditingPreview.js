import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  getDi,
  is
} from '../../util/ModelUtil';

import {
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

/**
 * @typedef {import('diagram-js/lib/core/Canvas').default} Canvas
 * @typedef {import('diagram-js/lib/core/EventBus').default} EventBus
 * @typedef {import('../../draw/PathMap').default} PathMap
 */

var MARKER_HIDDEN = 'djs-element-hidden',
    MARKER_LABEL_HIDDEN = 'djs-label-hidden';

/**
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {PathMap} pathMap
 */
export default function LabelEditingPreview(eventBus, canvas, pathMap) {

  var self = this;

  var defaultLayer = canvas.getDefaultLayer();

  var element, absoluteElementBBox, gfx;

  eventBus.on('directEditing.activate', function(context) {
    var activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;

    // text annotation
    if (is(element, 'bpmn:TextAnnotation')) {
      absoluteElementBBox = canvas.getAbsoluteBBox(element);

      gfx = svgCreate('g');

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      var path = self.path = svgCreate('path');

      svgAttr(path, {
        d: textPathData,
        strokeWidth: 2,
        stroke: getStrokeColor(element)
      });

      svgAppend(gfx, path);

      svgAppend(defaultLayer, gfx);

      translate(gfx, element.x, element.y);
    }

    if (is(element, 'bpmn:TextAnnotation') ||
        element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    } else if (is(element, 'bpmn:Task') ||
               is(element, 'bpmn:CallActivity') ||
               is(element, 'bpmn:SubProcess') ||
               is(element, 'bpmn:Participant')) {
      canvas.addMarker(element, MARKER_LABEL_HIDDEN);
    }
  });

  eventBus.on('directEditing.resize', function(context) {

    // text annotation
    if (is(element, 'bpmn:TextAnnotation')) {
      var height = context.height,
          dy = context.dy;

      var newElementHeight = Math.max(element.height / absoluteElementBBox.height * (height + dy), 0);

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: newElementHeight,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      svgAttr(self.path, {
        d: textPathData
      });
    }
  });

  eventBus.on([ 'directEditing.complete', 'directEditing.cancel' ], function(context) {
    var activeProvider = context.active;

    if (activeProvider) {
      canvas.removeMarker(activeProvider.element.label || activeProvider.element, MARKER_HIDDEN);
      canvas.removeMarker(element, MARKER_LABEL_HIDDEN);
    }

    element = undefined;
    absoluteElementBBox = undefined;

    if (gfx) {
      svgRemove(gfx);

      gfx = undefined;
    }
  });
}

LabelEditingPreview.$inject = [
  'eventBus',
  'canvas',
  'pathMap'
];


// helpers //////////

function getStrokeColor(element, defaultColor) {
  var di = getDi(element);

  return di.get('stroke') || defaultColor || 'black';
}