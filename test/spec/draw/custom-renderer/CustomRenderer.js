import inherits from 'inherits-browser';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  is,
  isAny
} from 'lib/util/ModelUtil';

import {
  isLabel
} from 'lib/util/LabelUtil';


var HIGH_PRIORITY = 1250;


export default function CustomRenderer(
    bpmnRenderer,
    eventBus) {

  this._bpmnRenderer = bpmnRenderer;

  BaseRenderer.call(this, eventBus, HIGH_PRIORITY);
}

inherits(CustomRenderer, BaseRenderer);

CustomRenderer.prototype.canRender = function(element) {

  if (isLabel(element)) {
    return false;
  }

  return !!(
    isAny(element, [ 'bpmn:Event' ])
  );
};

CustomRenderer.prototype.drawShape = function(parentGfx, element) {

  var renderer = this._bpmnRenderer.handlers[
    [
      'bpmn:StartEvent',
      'bpmn:IntermediateCatchEvent',
      'bpmn:IntermediateThrowEvent',
      'bpmn:BoundaryEvent',
      'bpmn:EndEvent'
    ].find(t => is(element, t))
  ];

  return renderer(parentGfx, element, { renderIcon: false });
};

CustomRenderer.$inject = [
  'bpmnRenderer',
  'eventBus'
];