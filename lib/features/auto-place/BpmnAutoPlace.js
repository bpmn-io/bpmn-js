import { getNewShapePosition, getScrollOffset } from './BpmnAutoPlaceUtil';


/**
 * BPMN auto-place behavior.
 *
 * @param {EventBus} eventBus
 */
export default function AutoPlace(eventBus, canvas) {
  eventBus.on('autoPlace', function(context) {
    var shape = context.shape,
        source = context.source;

    return getNewShapePosition(source, shape);
  });


  eventBus.on('autoPlace.end', function(event) {
    var viewBox = canvas.viewbox();
    var shape = event.shape;

    canvas.scroll(getScrollOffset(shape, viewBox));
  });
}

AutoPlace.$inject = [ 'eventBus', 'canvas' ];