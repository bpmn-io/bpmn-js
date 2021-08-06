import BpmnTreeWalker from 'lib/import/BpmnTreeWalker';

import BpmnModdle from 'bpmn-moddle';

import { find } from 'min-dash';

import simpleXML from 'test/fixtures/bpmn/simple.bpmn';
import collaboration from 'test/fixtures/bpmn/collaboration.bpmn';


describe('import - BpmnTreeWalker', function() {

  it('should expose functions', function() {

    // when
    var walker = createWalker();

    // then
    expect(walker.handleDeferred).to.exist;
    expect(walker.handleDefinitions).to.exist;
    expect(walker.handleSubProcess).to.exist;
    expect(walker.registerDi).to.exist;
  });


  it('should walk bpmn:Definitions', function() {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    return createModdle(simpleXML).then(function(result) {

      var definitions = result.rootElement;

      // when
      walker.handleDefinitions(definitions);

      // then
      expect(elementSpy.callCount).to.equal(8);
      expect(rootSpy).to.be.calledOnce;
      expect(errorSpy).not.to.be.called;
    });
  });


  it('should always call element visitor with parent', function() {

    // given
    var elementSpy = sinon.spy(),
        errorSpy = sinon.spy();


    var walker = createWalker({
      element: elementSpy,
      root: function() {
        return 'root';
      },
      error: errorSpy
    });

    return createModdle(collaboration).then(function(result) {

      var definitions = result.rootElement;

      // when
      walker.handleDefinitions(definitions);

      // then
      expect(elementSpy).to.not.be.calledWith(sinon.match.any, sinon.match.typeOf('undefined'));
      expect(errorSpy).to.not.be.called;
    });
  });


  it('should walk bpmn:SubProcess', function() {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    return createModdle(simpleXML).then(function(result) {

      var definitions = result.rootElement;

      var subProcess = findElementWithId(definitions, 'SubProcess_1');

      var plane = definitions.diagrams[0].plane,
          planeElements = plane.planeElement;

      // register DI
      planeElements.forEach(walker.registerDi);

      // when
      walker.handleSubProcess(subProcess);

      walker.handleDeferred();

      // then
      expect(elementSpy.callCount).to.equal(3);
      expect(rootSpy).to.not.be.called;
      expect(errorSpy).to.not.be.called;

    });
  });


  it('should error', function() {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    return createModdle(simpleXML).then(function(result) {

      var definitions = result.rootElement;

      var element = findElementWithId(definitions, 'SubProcess_1');

      // will error
      definitions.diagrams[0].plane.planeElement.push({ bpmnElement: element });

      // when
      walker.handleDefinitions(definitions);

      // then
      expect(elementSpy.callCount).to.equal(8);
      expect(rootSpy.calledOnce).to.be.true;
      expect(errorSpy.calledOnce).to.be.true;
    });
  });

});


// helpers //////////

function createModdle(xml) {
  var moddle = new BpmnModdle();

  return moddle.fromXML(xml, 'bpmn:Definitions');
}

function createWalker(listeners) {

  listeners = listeners || {};

  var visitor = {
    element: function(element, parent) {
      return listeners.element && listeners.element(element, parent);
    },
    root: function(root) {
      return listeners.root && listeners.root(root);
    },
    error: function(message, context) {
      return listeners.error && listeners.error(message, context);
    }
  };

  return new BpmnTreeWalker(visitor, function() {});
}

function findElementWithId(definitions, id) {

  function findElement(element) {
    if (element.id === id) {
      return element;
    }

    if (element.flowElements) {
      return find(element.flowElements, function(flowElement) {
        var foundElement = findElement(flowElement);

        return foundElement && foundElement.id === id;
      });
    }
  }

  return definitions.rootElements.reduce(function(foundElement, rootElement) {
    if (rootElement.id === id) {
      return rootElement;
    } else {
      return findElement(rootElement) || foundElement;
    }
  }, null);
}
