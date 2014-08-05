'use strict';

var BpmnTreeWalker = require('./BpmnTreeWalker');


/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {Diagram} diagram
 * @param  {ModdleElement} definitions
 * @param  {Function} done the callback, invoked with (err, [ warning ]) once the import is done
 */
function importBpmnDiagram(diagram, definitions, done) {

  var importer = diagram.get('bpmnImporter'),
      eventBus = diagram.get('eventBus');

  var warnings = [];

  var visitor = {

    root: function(element) {
      return importer.add(element);
    },

    element: function(element, parentShape) {
      return importer.add(element, parentShape);
    },

    error: function(message, context) {
      warnings.push({ message: message, context: context });
    }
  };

  var walker = new BpmnTreeWalker(visitor);

  try {
    eventBus.fire('import.start');

    // import
    walker.handleDefinitions(definitions);

    eventBus.fire('import.success', warnings);

    done(null, warnings);
  } catch (e) {
    eventBus.fire('import.error', e);
    done(e);
  }
}

module.exports.importBpmnDiagram = importBpmnDiagram;