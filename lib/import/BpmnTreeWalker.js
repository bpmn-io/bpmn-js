import {
  filter,
  find,
  forEach
} from 'min-dash';

import {
  elementToString
} from './Util';

import {
  ensureCompatDiRef
} from '../util/CompatibilityUtil';

/**
 * @typedef {import('../model/Types').ModdleElement} ModdleElement
 */

/**
 * Returns true if an element is of the given meta-model type.
 *
 * @param {ModdleElement} element
 * @param {string} type
 *
 * @return {boolean}
 */
function is(element, type) {
  return element.$instanceOf(type);
}


/**
 * Find a suitable display candidate for definitions where the DI does not
 * correctly specify one.
 *
 * @param {ModdleElement} definitions
 *
 * @return {ModdleElement}
 */
function findDisplayCandidate(definitions) {
  return find(definitions.rootElements, function(e) {
    return is(e, 'bpmn:Process') || is(e, 'bpmn:Collaboration');
  });
}

/**
 * @param {Record<'element' | 'root' | 'error', Function>} handler
 */
export default function BpmnTreeWalker(handler) {

  // list of containers already walked
  var handledElements = {};

  // list of elements to handle deferred to ensure
  // prerequisites are drawn
  var deferred = [];

  var diMap = {};

  // Helpers //////////////////////

  function contextual(fn, ctx) {
    return function(e) {
      fn(e, ctx);
    };
  }

  function handled(element) {
    handledElements[element.id] = element;
  }

  function isHandled(element) {
    return handledElements[element.id];
  }

  function visit(element, ctx) {

    var gfx = element.gfx;

    // avoid multiple rendering of elements
    if (gfx) {
      throw new Error(
        `already rendered ${ elementToString(element) }`
      );
    }

    // call handler
    return handler.element(element, diMap[element.id], ctx);
  }

  function visitRoot(element, diagram) {
    return handler.root(element, diMap[element.id], diagram);
  }

  function visitIfDi(element, ctx) {

    try {
      var gfx = diMap[element.id] && visit(element, ctx);

      handled(element);

      return gfx;
    } catch (error) {
      logError(error.message, { element, error });

      console.error(`failed to import ${ elementToString(element) }`, error);
    }
  }

  function logError(message, context) {
    handler.error(message, context);
  }

  // DI handling //////////////////////

  var registerDi = this.registerDi = function registerDi(di) {
    var bpmnElement = di.bpmnElement;

    if (bpmnElement) {
      if (diMap[bpmnElement.id]) {
        logError(
          `multiple DI elements defined for ${ elementToString(bpmnElement) }`,
          { element: bpmnElement }
        );
      } else {
        diMap[bpmnElement.id] = di;

        ensureCompatDiRef(bpmnElement);
      }
    } else {
      logError(
        `no bpmnElement referenced in ${ elementToString(di) }`,
        { element: di }
      );
    }
  };

  function handleDiagram(diagram) {
    handlePlane(diagram.plane);
  }

  function handlePlane(plane) {
    registerDi(plane);

    forEach(plane.planeElement, handlePlaneElement);
  }

  function handlePlaneElement(planeElement) {
    registerDi(planeElement);
  }


  // Semantic handling //////////////////////

  /**
   * Handle definitions and return the rendered diagram (if any).
   *
   * @param {ModdleElement} definitions to walk and import
   * @param {ModdleElement} [diagram] specific diagram to import and display
   *
   * @throws {Error} if no diagram to display could be found
   */
  this.handleDefinitions = function handleDefinitions(definitions, diagram) {

    // make sure we walk the correct bpmnElement

    var diagrams = definitions.diagrams;

    if (diagram && diagrams.indexOf(diagram) === -1) {
      throw new Error('diagram not part of <bpmn:Definitions />');
    }

    if (!diagram && diagrams && diagrams.length) {
      diagram = diagrams[0];
    }

    // no diagram -> nothing to import
    if (!diagram) {
      throw new Error('no diagram to display');
    }

    // load DI from selected diagram only
    diMap = {};
    handleDiagram(diagram);


    var plane = diagram.plane;

    if (!plane) {
      throw new Error(
        `no plane for ${ elementToString(diagram) }`
      );
    }

    var rootElement = plane.bpmnElement;

    // ensure we default to a suitable display candidate (process or collaboration),
    // even if non is specified in DI
    if (!rootElement) {
      rootElement = findDisplayCandidate(definitions);

      if (!rootElement) {
        throw new Error('no process or collaboration to display');
      } else {

        logError(
          `correcting missing bpmnElement on ${ elementToString(plane) } to ${ elementToString(rootElement) }`
        );

        // correct DI on the fly
        plane.bpmnElement = rootElement;
        registerDi(plane);
      }
    }


    var ctx = visitRoot(rootElement, plane);

    if (is(rootElement, 'bpmn:Process') || is(rootElement, 'bpmn:SubProcess')) {
      handleProcess(rootElement, ctx);
    } else if (is(rootElement, 'bpmn:Collaboration')) {
      handleCollaboration(rootElement, ctx);

      // force drawing of everything not yet drawn that is part of the target DI
      handleUnhandledProcesses(definitions.rootElements, ctx);
    } else {
      throw new Error(
        `unsupported bpmnElement for ${ elementToString(plane) }: ${ elementToString(rootElement) }`
      );
    }

    // handle all deferred elements
    handleDeferred(deferred);
  };

  var handleDeferred = this.handleDeferred = function handleDeferred() {

    var fn;

    // drain deferred until empty
    while (deferred.length) {
      fn = deferred.shift();

      fn();
    }
  };

  function handleProcess(process, context) {
    handleFlowElementsContainer(process, context);
    handleIoSpecification(process.ioSpecification, context);

    handleArtifacts(process.artifacts, context);

    // log process handled
    handled(process);
  }

  function handleUnhandledProcesses(rootElements, ctx) {

    // walk through all processes that have not yet been drawn and draw them
    // if they contain lanes with DI information.
    // we do this to pass the free-floating lane test cases in the MIWG test suite
    var processes = filter(rootElements, function(e) {
      return !isHandled(e) && is(e, 'bpmn:Process') && e.laneSets;
    });

    processes.forEach(contextual(handleProcess, ctx));
  }

  function handleMessageFlow(messageFlow, context) {
    visitIfDi(messageFlow, context);
  }

  function handleMessageFlows(messageFlows, context) {
    forEach(messageFlows, contextual(handleMessageFlow, context));
  }

  function handleDataAssociation(association, context) {
    visitIfDi(association, context);
  }

  function handleDataInput(dataInput, context) {
    visitIfDi(dataInput, context);
  }

  function handleDataOutput(dataOutput, context) {
    visitIfDi(dataOutput, context);
  }

  function handleArtifact(artifact, context) {

    // bpmn:TextAnnotation
    // bpmn:Group
    // bpmn:Association

    visitIfDi(artifact, context);
  }

  function handleArtifacts(artifacts, context) {

    forEach(artifacts, function(e) {
      if (is(e, 'bpmn:Association')) {
        deferred.push(function() {
          handleArtifact(e, context);
        });
      } else {
        handleArtifact(e, context);
      }
    });
  }

  function handleIoSpecification(ioSpecification, context) {

    if (!ioSpecification) {
      return;
    }

    forEach(ioSpecification.dataInputs, contextual(handleDataInput, context));
    forEach(ioSpecification.dataOutputs, contextual(handleDataOutput, context));
  }

  var handleSubProcess = this.handleSubProcess = function handleSubProcess(subProcess, context) {
    handleFlowElementsContainer(subProcess, context);
    handleArtifacts(subProcess.artifacts, context);
  };

  function handleFlowNode(flowNode, context) {
    var childCtx = visitIfDi(flowNode, context);

    if (is(flowNode, 'bpmn:SubProcess')) {
      handleSubProcess(flowNode, childCtx || context);
    }

    if (is(flowNode, 'bpmn:Activity')) {
      handleIoSpecification(flowNode.ioSpecification, context);
    }

    // defer handling of associations
    // affected types:
    //
    //   * bpmn:Activity
    //   * bpmn:ThrowEvent
    //   * bpmn:CatchEvent
    //
    deferred.push(function() {
      forEach(flowNode.dataInputAssociations, contextual(handleDataAssociation, context));
      forEach(flowNode.dataOutputAssociations, contextual(handleDataAssociation, context));
    });
  }

  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context);
  }

  function handleDataElement(dataObject, context) {
    visitIfDi(dataObject, context);
  }

  function handleLane(lane, context) {

    deferred.push(function() {

      var newContext = visitIfDi(lane, context);

      if (lane.childLaneSet) {
        handleLaneSet(lane.childLaneSet, newContext || context);
      }

      wireFlowNodeRefs(lane);
    });
  }

  function handleLaneSet(laneSet, context) {
    forEach(laneSet.lanes, contextual(handleLane, context));
  }

  function handleLaneSets(laneSets, context) {
    forEach(laneSets, contextual(handleLaneSet, context));
  }

  function handleFlowElementsContainer(container, context) {
    handleFlowElements(container.flowElements, context);

    if (container.laneSets) {
      handleLaneSets(container.laneSets, context);
    }
  }

  function handleFlowElements(flowElements, context) {
    forEach(flowElements, function(flowElement) {
      if (is(flowElement, 'bpmn:SequenceFlow')) {
        deferred.push(function() {
          handleSequenceFlow(flowElement, context);
        });
      } else if (is(flowElement, 'bpmn:BoundaryEvent')) {
        deferred.unshift(function() {
          handleFlowNode(flowElement, context);
        });
      } else if (is(flowElement, 'bpmn:FlowNode')) {
        handleFlowNode(flowElement, context);
      } else if (is(flowElement, 'bpmn:DataObject')) {

        // SKIP (assume correct referencing via DataObjectReference)
      } else if (is(flowElement, 'bpmn:DataStoreReference')) {
        handleDataElement(flowElement, context);
      } else if (is(flowElement, 'bpmn:DataObjectReference')) {
        handleDataElement(flowElement, context);
      } else {
        logError(
          `unrecognized flowElement ${ elementToString(flowElement) } in context ${ elementToString(context && context.businessObject) }`,
          {
            element: flowElement,
            context
          }
        );
      }
    });
  }

  function handleParticipant(participant, context) {
    var newCtx = visitIfDi(participant, context);

    var process = participant.processRef;
    if (process) {
      handleProcess(process, newCtx || context);
    }
  }

  function handleCollaboration(collaboration, context) {

    forEach(collaboration.participants, contextual(handleParticipant, context));

    deferred.push(function() {
      handleMessageFlows(collaboration.messageFlows, context);
    });

    handleArtifacts(collaboration.artifacts, context);
  }


  function wireFlowNodeRefs(lane) {

    // wire the virtual flowNodeRefs <-> relationship
    forEach(lane.flowNodeRef, function(flowNode) {
      var lanes = flowNode.get('lanes');

      if (lanes) {
        lanes.push(lane);
      }
    });
  }
}
