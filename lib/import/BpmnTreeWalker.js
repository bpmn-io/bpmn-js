'use strict';

var _ = require('lodash');

var Refs = require('object-refs');

var diRefs = new Refs({ name: 'bpmnElement', enumerable: true }, { name: 'di' });


function BpmnTreeWalker(handler) {

  // list of containers already walked
  var handledProcesses = [];

  // list of elements to handle deferred to ensure
  // prerequisites are drawn
  var deferred = [];

  ///// Helpers /////////////////////////////////

  function contextual(fn, ctx) {
    return function(e) {
      fn(e, ctx);
    };
  }

  function is(element, type) {
    return element.$instanceOf(type);
  }

  function visit(element, ctx) {

    var gfx = element.gfx;

    // avoid multiple rendering of elements
    if (gfx) {
      throw new Error('already rendered <' + element.id + '>');
    }

    // call handler
    return handler.element(element, ctx);
  }

  function visitRoot(element, diagram) {
    return handler.root(element, diagram);
  }

  function visitIfDi(element, ctx) {
    try {
      if (element.di) {
        return visit(element, ctx);
      }
    } catch (e) {
      logError(e.message, { element: element, error: e });
    }
  }

  function logError(message, context) {
    handler.error(message, context);
  }

  ////// DI handling ////////////////////////////

  function registerDi(di) {
    var bpmnElement = di.bpmnElement;

    if (bpmnElement) {
      diRefs.bind(bpmnElement, 'di');
      bpmnElement.di = di;
    } else {
      logError('no bpmnElement for <' + di.$type + '#' + di.id + '>', { element: di });
    }
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

    if (!diagram && diagrams && diagrams.length) {
      diagram = diagrams[0];
    }

    // no diagram -> nothing to import
    if (!diagram) {
      return;
    }

    // load DI from selected diagram only
    handleDiagram(diagram);

    var plane = diagram.plane,
        rootElement = plane.bpmnElement;

    if (!rootElement) {
      throw new Error('no rootElement referenced in BPMNPlane <' + diagram.plane.id + '>');
    }


    var ctx = visitRoot(rootElement, plane);

    if (is(rootElement, 'bpmn:Process')) {
      handleProcess(rootElement, ctx);
    } else if (is(rootElement, 'bpmn:Collaboration')) {
      handleCollaboration(rootElement, ctx);

      // force drawing of everything not yet drawn that is part of the target DI
      handleUnhandledProcesses(definitions.rootElements, ctx);
    } else {
      throw new Error('unsupported root element for bpmndi:Diagram <' + rootElement.$type + '>');
    }

    // handle all deferred elements
    handleDeferred(deferred);
  }

  function handleDeferred(deferred) {
    _.forEach(deferred, function(d) { d(); });
  }

  function handleProcess(process, context) {
    handleFlowElementsContainer(process, context);
    handleIoSpecification(process.ioSpecification, context);

    handleArtifacts(process.artifacts, context);

    // log process handled
    handledProcesses.push(process);
  }

  function handleUnhandledProcesses(rootElements) {

    // walk through all processes that have not yet been drawn and draw them
    // if they contain lanes with DI information.
    // we do this to pass the free-floating lane test cases in the MIWG test suite
    var processes = _.filter(rootElements, function(e) {
      return is(e, 'bpmn:Process') && e.laneSets && handledProcesses.indexOf(e) === -1;
    });

    processes.forEach(contextual(handleProcess));
  }

  function handleMessageFlow(messageFlow, context) {
    visitIfDi(messageFlow, context);
  }

  function handleMessageFlows(messageFlows, context) {
    if (messageFlows) {
      _.forEach(messageFlows, contextual(handleMessageFlow, context));
    }
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
  }

  function handleSequenceFlow(sequenceFlow, context) {
    visitIfDi(sequenceFlow, context);
  }

  function handleDataElement(dataObject, context) {
    visitIfDi(dataObject, context);
  }

  function handleBoundaryEvent(dataObject, context) {
    visitIfDi(dataObject, context);
  }

  function handleLane(lane, context) {
    var newContext = visitIfDi(lane, context);

    if (lane.childLaneSet) {
      handleLaneSet(lane.childLaneSet, newContext || context);
    } else {
      var filterList = _.filter(lane.flowNodeRef, function(e) {
        return e.$type !== 'bpmn:BoundaryEvent';
      });
      handleFlowElements(filterList, newContext || context);
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
    _.forEach(flowElements, function(e) {
      if (is(e, 'bpmn:SequenceFlow')) {
        deferred.push(function() {
          handleSequenceFlow(e, context);
        });
      } else if (is(e, 'bpmn:BoundaryEvent')) {
        deferred.unshift(function() {
          handleBoundaryEvent(e, context);
        });
      } else if (is(e, 'bpmn:DataObject')) {
        // SKIP (assume correct referencing via DataObjectReference)
      } else if (is(e, 'bpmn:DataStoreReference')) {
        handleDataElement(e, context);
      } else if (is(e, 'bpmn:DataObjectReference')) {
        handleDataElement(e, context);
      }
    });
  }

  function handleFlowElements(flowElements, context) {
    _.forEach(flowElements, function(e) {
      if (is(e, 'bpmn:SequenceFlow')) {
        deferred.push(function() {
          handleSequenceFlow(e, context);
        });
      } else if (is(e, 'bpmn:BoundaryEvent')) {
        deferred.unshift(function() {
          handleBoundaryEvent(e, context);
        });
      } else if (is(e, 'bpmn:FlowNode')) {
        handleFlowNode(e, context);

        if (is(e, 'bpmn:Activity')) {

          handleIoSpecification(e.ioSpecification, context);

          // defer handling of associations
          deferred.push(function() {
            _.forEach(e.dataInputAssociations, contextual(handleDataAssociation, context));
            _.forEach(e.dataOutputAssociations, contextual(handleDataAssociation, context));
          });
        }
      } else if (is(e, 'bpmn:DataObject')) {
        // SKIP (assume correct referencing via DataObjectReference)
      } else if (is(e, 'bpmn:DataStoreReference')) {
        handleDataElement(e, context);
      } else if (is(e, 'bpmn:DataObjectReference')) {
        handleDataElement(e, context);
      } else {
        logError(
          'unrecognized flowElement <' + e.$type + '> in context ' + (context ? context.id : null),
          { element: e, context: context });
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