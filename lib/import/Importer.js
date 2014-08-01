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

  var importer = diagram.get('bpmnImporter');

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

  // import
  walker.handleDefinitions(definitions);

  done(null, warnings);
}

module.exports.importBpmnDiagram = importBpmnDiagram;