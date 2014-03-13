var _ = require('lodash');

function BpmnTraverser(visitor) {

  var elementDiMap = {};
  var elementGfxMap = {};

  ///// Helpers /////////////////////////////////

  function contextual(fn, ctx) {
    return function(e) {
      fn(e, ctx);
    };
  }
  
  function is(element, type) {
    return element.__isInstanceOf(type);
  }

  function visit(element, di, ctx) {

    // call visitor
    var gfx = visitor(element, di, ctx);

    // and log returned result
    elementGfxMap[element.id] = gfx;

    return gfx;
  }

  ////// DI handling ////////////////////////////

  function buildDiMap(definitions) {
    _.forEach(definitions.diagrams, handleDiagram);
  }

  function registerDi(element) {
    var bpmnElement = element.bpmnElement;
    elementDiMap[bpmnElement.id] = element;
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
    buildDiMap(definitions);
  
    // make sure we walk the correct bpmnElement
    
    var diagrams = definitions.diagrams;

    if (diagram && diagrams.indexOf(diagram) === -1) {
      throw new Error('diagram not part of bpmn:Definitions');
    }

    if (!diagram) {
      diagram = diagrams[0];
    }

    var rootElement = diagram.plane.bpmnElement;

    if (is(rootElement, 'bpmn:Process')) {
      handleProcess(rootElement);
    } else
    if (is(rootElement, 'bpmn:Collaboration')) {
      handleCollaboration(rootElement);
    } else {
      throw new Error('unsupported root element for bpmndi:Diagram: ' + type.name);
    }
  }

  function handleFlowNode(flowNode, context) {
    var di = getDi(flowNode);

    var childCtx = visit(flowNode, di, context);

    if (is(flowNode, 'bpmn:FlowElementsContainer')) {
      handleFlowElementsContainer(flowNode, childCtx);
    }
  }

  function handleSequenceFlow(sequenceFlow, context) {
    var di = getDi(sequenceFlow);

    visit(sequenceFlow, di, context);
  }

  function handleFlowElementsContainer(container, context) {

    var sequenceFlows = [];

    // handle FlowNode(s)
    _.forEach(container.flowElements, function(e) {
      if (is(e, 'bpmn:SequenceFlow')) {
        sequenceFlows.push(e);
      } else
      if (is(e, 'bpmn:FlowNode')) {
        handleFlowNode(e, context);
      } else {
        throw new Error('unrecognized element: ' + e);
      }
    });

    // handle SequenceFlows
    _.forEach(sequenceFlows, contextual(handleSequenceFlow, context));
  }

  function handleParticipant(participant, context) {
    var di = getDi(participant);

    var newCtx = visit(participant, di, context);

    var process = participant.processRef;
    if (process) {
      handleProcess(process, newCtx);
    }
  }

  function handleProcess(process, context) {
    handleFlowElementsContainer(process, context);
  }

  function handleCollaboration(collaboration) {

    _.forEach(collaboration.participants, contextual(handleParticipant));

    // TODO: handle message flows
  }


  ///// API ////////////////////////////////
  
  return {
    handleDefinitions: handleDefinitions
  };
}

module.exports = BpmnTraverser;