import {
  find,
  forEach,
  map
} from 'min-dash';

import BpmnTreeWalker from './BpmnTreeWalker';

import { is } from '../util/ModelUtil';


/**
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 *
 * @typedef { {
 *   warnings: string[];
 * } } ImportBPMNDiagramResult
 *
 * @typedef {ImportBPMNDiagramResult & Error} ImportBPMNDiagramError
 */

/**
 * Import the definitions into a diagram.
 *
 * Errors and warnings are reported through the specified callback.
 *
 * @param {ModdleElement} diagram
 * @param {ModdleElement} definitions
 * @param {ModdleElement} [bpmnDiagram] The diagram to be rendered (if not
 * provided, the first one will be rendered).
 *
 * @return {Promise<ImportBPMNDiagramResult>}
 */
export function importBpmnDiagram(diagram, definitions, bpmnDiagram) {

  var importer,
      eventBus,
      canvas;

  var error,
      warnings = [];

  /**
   * Walk the diagram semantically, importing (=drawing)
   * all elements you encounter.
   *
   * @param {ModdleElement} definitions
   * @param {ModdleElement} bpmnDiagram
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

    var walker = new BpmnTreeWalker(visitor);


    bpmnDiagram = bpmnDiagram || (definitions.diagrams && definitions.diagrams[0]);

    var diagramsToImport = getDiagramsToImport(definitions, bpmnDiagram);

    if (!diagramsToImport) {
      throw new Error('no diagram to display');
    }

    // traverse BPMN 2.0 document model,
    // starting at definitions
    forEach(diagramsToImport, function(diagram) {
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
 * Returns all diagrams in the same hierarchy as the requested diagram.
 * Includes all parent and sub process diagrams.
 *
 * @param {ModdleElement} definitions
 * @param {ModdleElement} bpmnDiagram
 *
 * @return {ModdleElement[]}
 */
function getDiagramsToImport(definitions, bpmnDiagram) {
  if (!bpmnDiagram || !bpmnDiagram.plane) {
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
  } else {
    collaboration = find(definitions.rootElements, function(element) {
      if (!is(element, 'bpmn:Collaboration')) {
        return;
      }

      return find(element.participants, function(participant) {
        return participant.processRef === rootElement;
      });
    });
  }

  var rootElements = [ rootElement ];

  // all collaboration processes can contain sub-diagrams
  if (collaboration) {
    rootElements = map(collaboration.participants, function(participant) {
      return participant.processRef;
    });

    rootElements.push(collaboration);
  }

  var allChildren = selfAndAllFlowElements(rootElements);

  // if we have multiple diagrams referencing the same element, we
  // use the first in the file
  var diagramsToImport = [ bpmnDiagram ];
  var handledElements = [ bpmnElement ];

  forEach(definitions.diagrams, function(diagram) {

    if (!diagram.plane) {
      return;
    }

    var businessObject = diagram.plane.bpmnElement;

    if (
      allChildren.indexOf(businessObject) !== -1 &&
      handledElements.indexOf(businessObject) === -1
    ) {
      diagramsToImport.push(diagram);
      handledElements.push(businessObject);
    }
  });


  return diagramsToImport;
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
