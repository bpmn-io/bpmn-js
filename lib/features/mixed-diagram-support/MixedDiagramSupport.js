import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';


export default function MixedDiagramSupport(injector, eventBus, elementRegistry, canvas) {
  var self = this;

  this.initialized = false;

  this._injector = injector;
  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;

  eventBus.on('import.render.complete', function() {
    eventBus.on('root.added', refresh);
    refresh();
  });

  // disable to not break the import
  eventBus.on('import.render.start', function() {
    eventBus.off('root.added', refresh);
  });

  function refresh() {
    var topLevelProcess = findTopLevelProcess();

    if (topLevelProcess) {
      self.enable(topLevelProcess);
    } else {
      self.disable();
    }
  }

  function findTopLevelProcess() {
    var root = canvas.getRootElement();

    if (!is(root, 'bpmn:Collaboration')) {
      return null;
    }

    var topLevelProcessChild = elementRegistry.find(function(element) {
      var semanticParent = getSemanticParent(element);

      if (is(element.parent, 'bpmn:Collaboration') && is(semanticParent, 'bpmn:Process')) {
        return true;
      }
    });

    return topLevelProcessChild && getSemanticParent(topLevelProcessChild);
  }
}

MixedDiagramSupport.$inject = [
  'injector',
  'eventBus',
  'elementRegistry',
  'canvas'
];

MixedDiagramSupport.prototype.enable = function() {
  this.initialized = true;
};

MixedDiagramSupport.prototype.disable = function() {
  this.initialized = false;
};

function getSemanticParent(element) {
  return getBusinessObject(element).$parent;
}