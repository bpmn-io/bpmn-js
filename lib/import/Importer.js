import { find, forEach, map } from 'min-dash';
import { is } from '../util/ModelUtil';
import BpmnTreeWalker from './BpmnTreeWalker';


/**
 * The importBpmnDiagram result.
 *
 * @typedef {Object} ImportBPMNDiagramResult
 *
 * @property {Array<string>} warnings
 */

/**
* The importBpmnDiagram error.
*
* @typedef {Error} ImportBPMNDiagramError
*
* @property {Array<string>} warnings
*/

/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param  {djs.Diagram} diagram
 * @param  {ModdleElement<Definitions>} definitions
 * @param  {ModdleElement<BPMNDiagram>} [bpmnDiagram] the diagram to be rendered
 * (if not provided, the first one will be rendered)
 *
 * Returns {Promise<ImportBPMNDiagramResult, ImportBPMNDiagramError>}
 */
export function importBpmnDiagram(diagram, definitions, bpmnDiagram) {

  var importer,
      eventBus,
      translate,
      canvas;

  var error,
      warnings = [];

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {ModdleElement<BPMNDiagram>} bpmnDiagram
   */
  function render(definitions, bpmnDiagram) {

    var visitor = {

      root: function(element, di) {
        return importer.add(element, di);
      },

      element: function(element, di, parentShape) {
        return importer.add(element, di, parentShape);
      },

      error: function(message, context) {
        warnings.push({ message: message, context: context });
      }
    };

    var walker = new BpmnTreeWalker(visitor, translate);


    bpmnDiagram = bpmnDiagram || (definitions.diagrams && definitions.diagrams[0]);

    var diagramsToLoad = getDiagramsToLoad(definitions, bpmnDiagram);

    if (!diagramsToLoad) {
      throw new Error(translate('no diagram to display'));
    }

    // traverse BPMN 2.0 document model,
    // starting at definitions
    forEach(diagramsToLoad, function(diagram) {
      walker.handleDefinitions(definitions, diagram);
    });

    var rootId = bpmnDiagram.plane.bpmnElement.id;

    // we do need to account for different ways we create root elements
    // each nested imported <root> do have the `_plane` suffix, while
    // the root <root> is found under the business object ID
    canvas.setRootElement(
      canvas.findRoot(rootId + '_plane') || canvas.findRoot(rootId)
    );
  }

  return new Promise(function(resolve, reject) {
    try {
      importer = diagram.get('bpmnImporter');
      eventBus = diagram.get('eventBus');
      translate = diagram.get('translate');
      canvas = diagram.get('canvas');

      eventBus.fire('import.render.start', { definitions: definitions });

      render(definitions, bpmnDiagram);

      eventBus.fire('import.render.complete', {
        error: error,
        warnings: warnings
      });

      return resolve({ warnings: warnings });
    } catch (e) {

      e.warnings = warnings;
      return reject(e);
    }
  });
}

/**
 * Returns all diagrams in the same hirarchy as the requested Diagram.
 * It includes all parent- and subProcess diagrams.
 *
 * @param {Array} definitions
 * @param {Object} bpmnDiagram
 */
function getDiagramsToLoad(definitions, bpmnDiagram) {
  if (!bpmnDiagram) {
    return;
  }

  var bpmnElement = bpmnDiagram.plane.bpmnElement,
      rootElement = bpmnElement;

  if (!is(bpmnElement, 'bpmn:Process') && !is(bpmnElement, 'bpmn:Collaboration')) {
    rootElement = findRootProcess(bpmnElement);
  }

  // in case the process is part of a collaboration, the plane references the
  // collaboration, not the process
  var collaboration;
  if (is(rootElement, 'bpmn:Collaboration')) {
    collaboration = rootElement;
  }
  else {
    collaboration = find(definitions.rootElements, function(element) {
      if (!is(element, 'bpmn:Collaboration')) {
        return;
      }

      return find(element.participants, function(participant) {
        return participant.processRef === rootElement;
      });
    });
  }

  var roots = [rootElement];

  // all collaboration processes can contain sub-diagrams
  if (collaboration) {
    roots = map(collaboration.participants, function(participant) {
      return participant.processRef;
    });

    roots.push(collaboration);
  }

  var allChildren = selfAndAllFlowElements(roots);

  // if we have multiple diagrams referencing the same element, we
  // use the first in the file
  var diagramsToLoad = [bpmnDiagram];
  var handledElements = [bpmnElement];

  forEach(definitions.diagrams, function(diagram) {
    var bo = diagram.plane.bpmnElement;

    if (
      allChildren.indexOf(bo) !== -1 &&
      handledElements.indexOf(bo) === -1
    ) {
      diagramsToLoad.push(diagram);
      handledElements.push(bo);
    }
  });


  return diagramsToLoad;
}

function selfAndAllFlowElements(elements) {
  var result = [];

  forEach(elements, function(element) {
    if (!element) {
      return;
    }
    result.push(element);
    result = result.concat(selfAndAllFlowElements(element.flowElements));
  });

  return result;
}

function findRootProcess(element) {
  var parent = element;

  while (parent) {
    if (is(parent, 'bpmn:Process')) {
      return parent;
    }
    parent = parent.$parent;
  }
}