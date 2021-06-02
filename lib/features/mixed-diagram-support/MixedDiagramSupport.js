import {
  getBusinessObject,
  is
} from '../../util/ModelUtil';


export default function MixedDiagramSupport(eventBus, elementRegistry, canvas) {
  var update = this._update.bind(this);

  this._eventBus = eventBus;
  this._elementRegistry = elementRegistry;
  this._canvas = canvas;

  eventBus.on('import.render.complete', function() {
    eventBus.on('root.added', update);
    update();
  });

  // disable to not break the import
  eventBus.on('import.render.start', function() {
    eventBus.off('root.added', update);
  });
}

MixedDiagramSupport.$inject = [
  'eventBus',
  'elementRegistry',
  'canvas'
];

MixedDiagramSupport.prototype.getTopLevelProcess = function() {
  return this._topLevelProcess;
};

MixedDiagramSupport.prototype._update = function() {
  this._topLevelProcess = this._findTopLevelProcess() || null;
};

MixedDiagramSupport.prototype._findTopLevelProcess = function() {
  var root = this._canvas.getRootElement();

  if (!is(root, 'bpmn:Collaboration')) {
    return null;
  }

  var topLevelProcessChild = this._elementRegistry.find(function(element) {
    var semanticParent = getSemanticParent(element);

    if (is(element.parent, 'bpmn:Collaboration') && is(semanticParent, 'bpmn:Process')) {
      return true;
    }
  });

  return topLevelProcessChild && getSemanticParent(topLevelProcessChild);
};

function getSemanticParent(element) {
  return getBusinessObject(element).$parent;
}