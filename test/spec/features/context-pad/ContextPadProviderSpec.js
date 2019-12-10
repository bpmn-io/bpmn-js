import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  is
} from 'lib/util/ModelUtil';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import contextPadModule from 'lib/features/context-pad';
import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import replaceMenuModule from 'lib/features/popup-menu';
import createModule from 'diagram-js/lib/features/create';
import customRulesModule from '../../../util/custom-rules';
import autoPlaceModule from 'lib/features/auto-place';


describe('features - context-pad', function() {

  var testModules = [
    coreModule,
    modelingModule,
    contextPadModule,
    replaceMenuModule,
    customRulesModule,
    createModule
  ];


  describe('remove action rules', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    var deleteAction;

    beforeEach(inject(function(contextPad) {

      deleteAction = function(element) {
        return padEntry(contextPad.getPad(element).html, 'delete');
      };
    }));


    it('should add delete action by default', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should include delete action when rule returns true',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return true;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when rule returns false',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return false;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).not.to.exist;
      })
    );


    it('should call rules with [ element ]', inject(function(elementRegistry, contextPad, customRules) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      customRules.addRule('elements.delete', 1500, function(context) {

        // element array is actually passed
        expect(context.elements).to.eql([ element ]);

        return true;
      });

      // then
      expect(function() {
        contextPad.open(element);
      }).not.to.throw;
    }));


    it('should include delete action when [ element ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function(context) {
          return context.elements;
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).to.exist;
      })
    );


    it('should NOT include delete action when [ ] is returned from rule',
      inject(function(elementRegistry, contextPad, customRules) {

        // given
        customRules.addRule('elements.delete', 1500, function() {
          return [];
        });

        var element = elementRegistry.get('StartEvent_1');

        // when
        contextPad.open(element);

        // then
        expect(deleteAction(element)).not.to.exist;
      })
    );

  });


  describe('available entries', function() {

    var diagramXML = require('./ContextPad.activation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    function expectContextPadEntries(elementOrId, expectedEntries) {

      getBpmnJS().invoke(function(elementRegistry, contextPad) {

        var element = typeof elementOrId === 'string' ? elementRegistry.get(elementOrId) : elementOrId;

        contextPad.open(element, true);

        var entries = contextPad._current.entries;

        expectedEntries.forEach(function(name) {

          if (name.charAt(0) === '!') {
            name = name.substring(1);

            expect(entries).not.to.have.property(name);
          } else {
            expect(entries).to.have.property(name);
          }
        });
      });
    }


    it('should provide Task entries', inject(function() {

      expectContextPadEntries('Task_1', [
        'connect',
        'replace',
        'append.end-event',
        'append.gateway',
        'append.append-task',
        'append.intermediate-event',
        'append.text-annotation'
      ]);
    }));


    it('should provide EventBasedGateway entries', inject(function() {

      expectContextPadEntries('EventBasedGateway_1', [
        'connect',
        'replace',
        'append.receive-task',
        'append.message-intermediate-event',
        'append.timer-intermediate-event',
        'append.condition-intermediate-event',
        'append.signal-intermediate-event',
        'append.text-annotation',
        '!append.task'
      ]);
    }));


    it('should provide EndEvent entries', inject(function() {

      expectContextPadEntries('EndEvent_1', [
        'connect',
        'replace',
        '!append.task'
      ]);
    }));


    it('should provide Compensation Activity entries', inject(function() {

      expectContextPadEntries('Task_2', [
        'connect',
        'replace',
        '!append.end-event',
        'append.text-annotation'
      ]);
    }));


    it('should provide Compensate Boundary entries', inject(function() {

      expectContextPadEntries('BoundaryEvent_1', [
        'connect',
        'replace',
        'append.compensation-activity',
        '!append.end-event'
      ]);
    }));


    it('should provide DataStoreReference entries', inject(function() {

      expectContextPadEntries('DataStoreReference', [
        'connect',
        'append.text-annotation',
        '!replace',
        '!append.end-event'
      ]);
    }));


    it('should provide DataObjectReference entries', inject(function() {

      expectContextPadEntries('DataObjectReference', [
        'connect',
        'append.text-annotation',
        '!replace',
        '!append.end-event'
      ]);
    }));

  });


  describe('create', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should attach boundary event', inject(function(dragging, contextPad, elementRegistry) {

      // given
      var task = elementRegistry.get('Task_1');

      // when
      contextPad.open(task);

      contextPad.trigger('dragstart', padEvent('append.intermediate-event'));

      dragging.move(canvasEvent({ x: task.x, y: task.y }));
      dragging.hover({ element: task });
      dragging.move(canvasEvent({ x: task.x + 80, y: task.y + 70 }));
      dragging.end();

      // then
      expect(task.attachers).to.have.length(1);
    }));


    it('should attach boundary event to other target', inject(
      function(dragging, contextPad, elementRegistry) {

        // given
        var task = elementRegistry.get('Task_1');

        var subProcess = elementRegistry.get('SubProcess_1');

        // when
        contextPad.open(task);

        contextPad.trigger('dragstart', padEvent('append.intermediate-event'));

        dragging.move(canvasEvent({ x: subProcess.x, y: subProcess.y }));
        dragging.hover({ element: subProcess });
        dragging.move(canvasEvent({ x: subProcess.x + 80, y: subProcess.y + 5 }));
        dragging.end();

        // then
        expect(subProcess.attachers).to.have.length(1);
      })
    );

  });


  describe('replace', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should show popup menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1'),
          padding = 5,
          padMenuRect,
          replaceMenuRect;

      contextPad.open(element);

      // when
      contextPad.trigger('click', padEvent('replace'));

      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();
      replaceMenuRect = domQuery('.bpmn-replace', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));


    it('should hide wrench if replacement is disallowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('StartEvent_1');

        // disallow replacement
        customRules.addRule('shape.replace', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'replace')).not.to.exist;
      }
    ));


    it('should show wrench if replacement is allowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('EndEvent_1');

        // disallow replacement
        customRules.addRule('shape.replace', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'replace')).to.exist;
      }
    ));


    describe('create + <CTRL>', function() {

      it('should open replace', inject(
        function(create, dragging, canvas, elementFactory) {

          // given
          var rootShape = canvas.getRootElement(),
              startEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' }),
              replaceMenu;

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), startEvent);

          dragging.move(canvasEvent({ x: 50, y: 50 }));
          dragging.hover({ element: rootShape });
          dragging.move(canvasEvent({ x: 75, y: 75 }));

          dragging.end(canvasEvent({ x: 75, y: 75 }, { ctrlKey: true, metaKey: true }));

          replaceMenu = domQuery('.bpmn-replace', container);

          // then
          expect(replaceMenu).to.exist;
        }
      ));


      it('should open boundary event replace menu', inject(
        function(create, dragging, canvas, elementFactory, modeling, popupMenu) {

          // given
          var rootShape = canvas.getRootElement();
          var task = elementFactory.createShape({ type: 'bpmn:Task' });
          var intermediateEvent = elementFactory.createShape({ type: 'bpmn:IntermediateThrowEvent' });

          modeling.createShape(task, { x: 100, y: 100 }, rootShape);

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), intermediateEvent);

          dragging.move(canvasEvent({ x: 50, y: 50 }));
          dragging.hover({ element: task });
          dragging.move(canvasEvent({ x: 50, y: 65 }));

          dragging.end(canvasEvent({ x: 50, y: 65 }, { ctrlKey: true, metaKey: true }));

          // then
          var replaceMenu = domQueryAll('[data-id$="-boundary"]', popupMenu._current.container);
          expect(replaceMenu).to.exist;
          expect(replaceMenu.length).to.eql(13);
        }
      ));


      it('should not open non-existing replace menu', inject(
        function(create, dragging, canvas, elementFactory) {

          // given
          var rootShape = canvas.getRootElement(),
              dataObject = elementFactory.createShape({ type: 'bpmn:DataObjectReference' }),
              replaceMenu;

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), dataObject);

          dragging.move(canvasEvent({ x: 50, y: 50 }));
          dragging.hover({ element: rootShape });
          dragging.move(canvasEvent({ x: 75, y: 75 }));

          dragging.end(canvasEvent({ x: 75, y: 75 }, { ctrlKey: true, metaKey: true }));

          replaceMenu = domQuery('.bpmn-replace', container);

          // then
          expect(replaceMenu).not.to.exist;
        }
      ));


      it('should NOT open replace menu if context pad NOT open', inject(
        function(canvas, create, dragging, elementFactory) {

          // given
          var rootShape = canvas.getRootElement(),
              startEvent = elementFactory.createShape({ type: 'bpmn:StartEvent' }),
              task = elementFactory.createShape({ type: 'bpmn:Task' });

          // when
          create.start(canvasEvent({ x: 0, y: 0 }), [ startEvent, task ]);

          dragging.move(canvasEvent({ x: 50, y: 50 }));
          dragging.hover({ element: rootShape });
          dragging.move(canvasEvent({ x: 75, y: 75 }));

          dragging.end(canvasEvent({ x: 75, y: 75 }, { ctrlKey: true, metaKey: true }));

          // then
          var replaceMenu = domQuery('.bpmn-replace', container);

          expect(replaceMenu).not.to.exist;
        }
      ));

    });

  });


  describe('auto place', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat(autoPlaceModule)
    }));


    it('should trigger', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('Task_1');

      contextPad.open(element);

      // mock event
      var event = padEvent('append.gateway');

      // when
      contextPad.trigger('click', event);

      // then
      expect(element.outgoing).to.have.length(1);
    }));

  });


  describe('disabled auto-place', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules.concat(autoPlaceModule),
      contextPad: {
        autoPlace: false
      }
    }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should default to drag start', inject(function(elementRegistry, contextPad, dragging) {

      // given
      var element = elementRegistry.get('Task_1');

      contextPad.open(element);

      // mock event
      var event = {
        clientX: 100,
        clientY: 100,
        target: padEntry(container, 'append.gateway'),
        preventDefault: function() {}
      };

      // when
      contextPad.trigger('click', event);

      // then
      expect(dragging.context()).to.exist;
    }));

  });

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}


function padEvent(entry) {

  return getBpmnJS().invoke(function(overlays) {

    var target = padEntry(overlays._overlayRoot, entry);

    return {
      target: target,
      preventDefault: function() {},
      clientX: 100,
      clientY: 100
    };
  });
}