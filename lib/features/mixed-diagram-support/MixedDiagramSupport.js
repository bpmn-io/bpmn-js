import { is } from '../../util/ModelUtil';


export default function MixedDiagramSupport(injector, eventBus, elementRegistry, canvas) {
  var self = this;

  this.initialized = false;

  this._injector = injector;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;

  eventBus.on('import.render.complete', function(event) {

    if (isMixedDiagram()) {
      self.init();
    }
  });

  /**
   * Check if current diagram is a collaboration with a free-floating process
   *
   * @returns {boolean}
   */
  function isMixedDiagram() {
    var root = canvas.getRootElement();

    if (!is(root, 'bpmn:Collaboration')) {
      return false;
    }

    var freeFloatingProcessChild = elementRegistry.find(function(element) {

      if (!is(element, 'bpmn:FlowElement')) {
        return false;
      }

      return (
        is(element.parent, 'bpmn:Collaboration') &&
        is(element.businessObject.$parent, 'bpmn:Process')
      );
    });

    return !!freeFloatingProcessChild;
  }
}

MixedDiagramSupport.$inject = [
  'injector',
  'eventBus',
  'elementRegistry',
  'canvas'
];

MixedDiagramSupport.prototype.init = function() {
  this.initialized = true;
};
