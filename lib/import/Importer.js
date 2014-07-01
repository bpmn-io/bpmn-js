'use strict';

var BpmnTreeWalker = require('./BpmnTreeWalker');


/**
 * Import the definitions into the given diagram, reporting errors and warnings
 * via the specified callback.
 *
 * @param  {Diagram} diagram
 * @param  {ModdleElement} definitions
 * @param  {Function} done the callback, invoked with (err, [ warning ]) once the import is done
 */
function importBpmnDiagram(diagram, definitions, done) {

  var importer = diagram.get('bpmnImporter'),
      commandStack = diagram.get('commandStack');

  var warnings = [];

  var visitor = {

    root: function(element, di) {
      return importer.add(element, di);
    },

    element: function(element, di, parent) {
      return importer.add(element, di, parent);
    },

    error: function(message, context) {
      warnings.push({ message: message, context: context });
    }
  };

  var walker = new BpmnTreeWalker(visitor);

  try {
    // import
    walker.handleDefinitions(definitions);

    // clear command stack
    commandStack.clear();

    done(null, warnings);
  } catch (e) {
    done(e);
  }
}

module.exports.importBpmnDiagram = importBpmnDiagram;