import BpmnTreeWalker from 'lib/import/BpmnTreeWalker';

import BpmnModdle from 'bpmn-moddle';

import { find } from 'min-dash';

import simpleXML from 'test/fixtures/bpmn/simple.bpmn';


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


  it('should walk bpmn:Definitions', function(done) {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    createModdle(simpleXML, function(err, definitions, context, moddle) {

      // when
      walker.handleDefinitions(definitions);

      // then
      expect(elementSpy.callCount).to.equal(8);
      expect(rootSpy.calledOnce).to.be.true;
      expect(errorSpy.notCalled).to.be.true;

      done();
    });
  });


  it('should walk bpmn:SubProcess', function(done) {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    createModdle(simpleXML, function(err, definitions, context, moddle) {
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
      expect(rootSpy.notCalled).to.be.true;
      expect(errorSpy.notCalled).to.be.true;

      done();
    });
  });


  it('should error', function(done) {

    // given
    var elementSpy = sinon.spy(),
        rootSpy = sinon.spy(),
        errorSpy = sinon.spy();

    var walker = createWalker({
      element: elementSpy,
      root: rootSpy,
      error: errorSpy
    });

    createModdle(simpleXML, function(err, definitions, context, moddle) {

      var element = findElementWithId(definitions, 'SubProcess_1');

      // will error
      element.di = 'DI';

      // when
      walker.handleDefinitions(definitions);

      // then
      expect(elementSpy.callCount).to.equal(8);
      expect(rootSpy.calledOnce).to.be.true;
      expect(errorSpy.calledOnce).to.be.true;

      done();
    });
  });

});


// helpers //////////

function createModdle(xml, done) {
  var moddle = new BpmnModdle();

  moddle.fromXML(xml, 'bpmn:Definitions', function(err, definitions, context) {
    done(err, definitions, context, moddle);
  });
}

function createWalker(listeners) {

  listeners = listeners || {};

  var visitor = {
    element: function(element, parent) {
      listeners.element && listeners.element(element, parent);
    },
    root: function(root) {
      listeners.root && listeners.root(root);
    },
    error: function(message, context) {
      listeners.error && listeners.error(message, context);
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