var _ = require('lodash');

function BpmnTreeWalker(handler) {

  var elementDiMap = {};
  var elementGfxMap = {};

  // list of containers already walked
  var handledProcesses = [];

  ///// Helpers /////////////////////////////////

  function contextual(fn, ctx) {
    return function(e) {
      fn(e, ctx);
    };
  }

  function is(element, type) {
    return element.$instanceOf(type);
  }

  function visit(element, di, ctx) {

    var gfx = elementGfxMap[element.id];

    // avoid multiple rendering of elements
    if (gfx) {
      throw new Error('already rendered <' + element.id + '>');
    }

    // call handler
    gfx = handler.element(element, di, ctx);

    // and log returned result
    elementGfxMap[element.id] = gfx;

    return gfx;
  }

  function visitIfDi(element, ctx) {
    var di = getDi(element);

    if (di) {
      return visit(element, di, ctx);
    }
  }

  function logError(message, context) {
    handler.error(message, context);
  }

  ////// DI handling ////////////////////////////

  function buildDiMap(definitions) {
    _.forEach(definitions.diagrams, handleDiagram);
  }

  function registerDi(element) {
    var bpmnElement = element.bpmnElement;
    if (bpmnElement) {
      elementDiMap[bpmnElement.id] = element;
    } else {
      logError('no bpmnElement for <' + element.$type + '#' + element.id + '>', { element: element });
    }
  }

  function getDi(bpmnElement) {
    var id = bpmnElement.id;
    return id ? elementDiMap[id] : null;
  }

  function handleDiagram(diagram) {
    handlePlane(diagram.plane);
  }

  function handlePlane(plane) {
    registerDi(plane);

    _.forEach(plane.planeElement, handlePlaneElement);
  }

  function handlePlaneElement(planeElement) {
    registerDi(planeElement);
  }


  ////// Semantic handling //////////////////////

  function handleDefinitions(definitions, diagram) {
    // make sure we walk the correct bpmnElement

    var diagrams = definitions.diagrams;

    if (diagram && diagrams.indexOf(diagram) === -1) {
      throw new Error('diagram not part of bpmn:Definitions');
    }

    if (!diagram) {
      if (diagrams && diagrams.length) {
        diagram = diagrams[0];
      }
    }

    // no diagram -> nothing to import
    if (!diagram) {
      return;
    }

    // load DI from selected diagram only
    handleDiagram(diagram);

    var rootElement = diagram.plane.bpmnElement;

    if (!rootElement) {
      throw new Error('no rootElement referenced in BPMNPlane <' + diagram.plane.id + '>');
    }

    if (is(rootElement, 'bpmn:Process')) {
      handleProcess(rootElement);
    } else
    if (is(rootElement, 'bpmn:Collaboration')) {
      handleCollaboration(rootElement);

      // force drawing of everything not yet drawn that is part of the target DI
      handleUnhandledProcesses(definitions.rootElements);
    } else {
      throw new Error('unsupported root element for bpmndi:Diagram <' + rootElement.$type + '>');
    }
  }

  function handleUnhandledProcesses(rootElements) {

    // walk through all processes that have not yet been drawn and draw them
    // (in case they contain lanes with DI information)
    var processes = _.filter(rootElements, function(e) {
      return e.$type === 'bpmn:Process' && e.laneSets && handledProcesses.indexOf(e) === -1;
    });

    processes.forEach(contextual(handleProcess));
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
    _.forEach(artifacts, contextual(handleArtifact, context));
  }

  function handleIoSpecification(ioSpecification, context) {

    if (!ioSpecification) {
      return;
    }

    _.forEach(ioSpecification.dataInputs, contextual(handleDataInput, context));
    _.forEach(ioSpecification.dataOutputs, contextual(handleDataOutput, context));
  }

  function handleSubProcess(subProcess, context) {
    handleFlowElementsContainer(subProcess, context);
    handleArtifacts(subProcess.artifacts, context);
  }

  function handleFlowNode(flowNode, context) {
    var childCtx = visitIfDi(flowNode, context);

    if (is(flowNode, 'bpmn:SubProcess')) {
      handleSubProcess(flowNode, childCtx || context);
    }

    if (is(flowNode, 'bpmn:Activity')) {
      _.forEach(flowNode.dataInputAssociations, contextual(handleDataAssociation, null));
      _.forEach(flowNode.dataOutputAssociations, contextual(handleDataAssociation, null));

      handleIoSpecification(flowNode.ioSpecification, context);
    }
  }

  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context);
  }

  function handleDataElement(dataObject, context) {
    visitIfDi(dataObject, context);
  }

  function handleLane(lane, context) {
    var newContext = visitIfDi(lane, context);

    if (lane.childLaneSet) {
      handleLaneSet(lane.childLaneSet, newContext || context);
    } else {
      handleFlowElements(lane.flowNodeRef, newContext || context);
    }
  }

  function handleLaneSet(laneSet, context) {
    _.forEach(laneSet.lanes, contextual(handleLane, context));
  }

  function handleLaneSets(laneSets, context) {
    _.forEach(laneSets, contextual(handleLaneSet, context));
  }

  function handleFlowElementsContainer(container, context) {

    if (container.laneSets) {
      handleLaneSets(container.laneSets, context);
      handleNonFlowNodes(container.flowElements);
    } else {
      handleFlowElements(container.flowElements, context);
    }
  }

  function handleNonFlowNodes(flowElements, context) {
    var sequenceFlows = [];

    _.forEach(flowElements, function(e) {
      if (is(e, 'bpmn:SequenceFlow')) {
        sequenceFlows.push(e);
      } else
      if (is(e, 'bpmn:DataObject')) {
        // SKIP (assume correct referencing via DataObjectReference)
      } else
      if (is(e, 'bpmn:DataStoreReference')) {
        handleDataElement(e, context);
      } else
      if (is(e, 'bpmn:DataObjectReference')) {
        handleDataElement(e, context);
      }
    });

    // handle SequenceFlows
    _.forEach(sequenceFlows, contextual(handleSequenceFlow, context));
  }

  function handleFlowElements(flowElements, context) {
    var sequenceFlows = [];

    _.forEach(flowElements, function(e) {
      if (is(e, 'bpmn:SequenceFlow')) {
        sequenceFlows.push(e);
      } else
      if (is(e, 'bpmn:FlowNode')) {
        handleFlowNode(e, context);
      } else
      if (is(e, 'bpmn:DataObject')) {
        // SKIP (assume correct referencing via DataObjectReference)
      } else
      if (is(e, 'bpmn:DataStoreReference')) {
        handleDataElement(e, context);
      } else
      if (is(e, 'bpmn:DataObjectReference')) {
        handleDataElement(e, context);
      } else {
        logError(
          'unrecognized flowElement <' + e.$type + '> in context ' + (context ? context.id : null),
          { element: e, context: context });
      }
    });

    // handle SequenceFlows
    _.forEach(sequenceFlows, contextual(handleSequenceFlow, context));
  }

  function handleParticipant(participant, context) {
    var newCtx = visitIfDi(participant, context);

    var process = participant.processRef;
    if (process) {
      handleProcess(process, newCtx || context);
    }
  }

  function handleProcess(process, context) {
    handleFlowElementsContainer(process, context);
    handleIoSpecification(process.ioSpecification, context);

    handleArtifacts(process.artifacts, context);

    // log process handled
    handledProcesses.push(process);
  }

  function handleMessageFlow(messageFlow, context) {
    visitIfDi(messageFlow, context);
  }

  function handleMessageFlows(messageFlows, context) {
    if (messageFlows) {
      _.forEach(messageFlows, contextual(handleMessageFlow, context));
    }
  }

  function handleCollaboration(collaboration) {

    _.forEach(collaboration.participants, contextual(handleParticipant));

    handleArtifacts(collaboration.artifacts);

    handleMessageFlows(collaboration.messageFlows);
  }


  ///// API ////////////////////////////////

  return {
    handleDefinitions: handleDefinitions
  };
}

module.exports = BpmnTreeWalker;