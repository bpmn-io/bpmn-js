import inherits from 'inherits-browser';

import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';

import { is } from '../../util/ModelUtil';


export default function BpmnSpaceTool(injector) {
  injector.invoke(SpaceTool, this);
}

BpmnSpaceTool.$inject = [
  'injector'
];

inherits(BpmnSpaceTool, SpaceTool);

BpmnSpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {
  var adjustments = SpaceTool.prototype.calculateAdjustments.call(this, elements, axis, delta, start);

  // do not resize text annotations
  adjustments.resizingShapes = adjustments.resizingShapes.filter(function(shape) {
    return !is(shape, 'bpmn:TextAnnotation');
  });

  return adjustments;
};