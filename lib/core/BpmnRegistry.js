var _ = require('lodash');

var bpmnModule = require('../di').defaultModule;

/**
 * @class
 *
 * A registry that keeps track of bpmn semantic / di elements and the
 * corresponding shapes.
 *
 * @param {EventBus} events
 * @param {ElementRegistry} elementRegistry
 */
function BpmnRegistry(events, elementRegistry) {

  var elements = {
    di: {},
    semantic: {},
    diagramElement: {}
  };

  events.on('bpmn.element.add', function(e) {
    var semantic = e.semantic,
        id = semantic.id;

    elements.di[id] = e.di;
    elements.semantic[id] = e.semantic;
    elements.diagramElement[id] = e.diagramElement;
  });

  events.on('bpmn.element.removed', function(e) {
    var semantic = e.semantic,
        id = semantic.id;

    delete elements.di[id];
    delete elements.semantic[id];
    delete elements.diagramElement[id];
  });

  function get(type) {
    var collection = elements[type];

    return function(element) {
      return collection[_.isObject(element) ? element.id : element];
    };
  }

  // API
  this.getSemantic = get('semantic');
  this.getDi = get('di');
  this.getDiagramElement = get('diagramElement');
}

bpmnModule.type('bpmnRegistry', [ 'eventBus', 'elementRegistry', BpmnRegistry ]);

module.exports = BpmnRegistry;