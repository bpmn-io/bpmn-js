'use strict';

var _ = require('lodash');


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

  // we attach to element.add rather than element.added to ensure
  // the meta-data (semantic, di) for the element is already present
  // during rendering
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
      var id = _.isObject(element) ? element.id : element;

      // strip label suffix
      id = id.replace(/_label$/, '');

      return collection[id];
    };
  }

  // API
  this.getSemantic = get('semantic');
  this.getDi = get('di');
  this.getDiagramElement = get('diagramElement');
}

BpmnRegistry.$inject = [ 'eventBus', 'elementRegistry' ];

module.exports = BpmnRegistry;