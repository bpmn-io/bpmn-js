import { getNewShapePosition } from './AutoPlaceUtil';


/**
 * A service that places elements connected to existing ones
 * to an appropriate position in an _automated_ fashion.
 *
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 */
export default function AutoPlace(eventBus, modeling) {

  function emit(event, payload) {
    return eventBus.fire(event, payload);
  }


  /**
   * Append shape to source at appropriate position.
   *
   * @param {djs.model.Shape} source
   * @param {djs.model.Shape} shape
   *
   * @return {djs.model.Shape} appended shape
   */
  this.append = function(source, shape) {

    // allow others to provide the position
    var position = emit('autoPlace', {
      source: source,
      shape: shape
    });

    if (!position) {
      position = getNewShapePosition(source, shape);
    }

    var newShape = modeling.appendShape(source, shape, position, source.parent);

    // notify interested parties on new shape placed
    emit('autoPlace.end', {
      shape: newShape
    });

    return newShape;
  };

}

AutoPlace.$inject = [
  'eventBus',
  'modeling'
];