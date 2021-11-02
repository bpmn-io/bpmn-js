import { getBusinessObject, is } from '../../util/ModelUtil';

/**
 * Add secondary shape for boundary events on expanded subprocess views.
 * The position is determined relative to the primary element.
 *
 * @param {eventBus} eventBus
 * @param {elementRegistry} elementRegistry
 * @param {canvas} canvas
 * @param {elementFactory} elementFactory
 */
export default function SubprocessFakeBoundaries(
    eventBus, elementRegistry,
    canvas, elementFactory) {

  var attachBoundaries = function() {
    var secondaryShapes = elementRegistry.filter(function(el) {
      return is(el, 'bpmn:SubProcess') && el.isSecondary;
    });

    secondaryShapes.forEach(function(process) {
      if (!process.primaryShape || !process.primaryShape.attachers) {
        return;
      }

      process.primaryShape.attachers.forEach(function(boundary) {
        var bo = getBusinessObject(boundary);

        var primary = process.primaryShape;

        var relativeXPos = (boundary.x + 15 - primary.x) / primary.width;
        var relativeYPos = (boundary.y + 15 - primary.y) / primary.height;

        var dx = process.x + (process.width * relativeXPos) - 15;
        var dy = process.y + (process.height * relativeYPos) - 15;

        var boundaryShape = elementFactory.createShape({
          id: bo.id + '_secondary',
          businessObject: bo,
          type: 'bpmn:BoundaryEvent',
          hidden: false,
          x: dx,
          y: dy,
          width: 30,
          height: 30,
          isFrame: false,
          isSecondary: true,
          primaryShape: boundary,
          di: boundary.di
        });

        canvas.addShape(boundaryShape, process.parent);

        if (!process.attachers) {
          process.attachers = [];
        }

        process.attachers.push(boundaryShape);
      });

    });
  };

  eventBus.on('import.done', attachBoundaries);
}


SubprocessFakeBoundaries.$inject = [
  'eventBus',
  'elementRegistry',
  'canvas',
  'elementFactory'
];
