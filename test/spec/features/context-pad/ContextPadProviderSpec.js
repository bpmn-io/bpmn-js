'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var domQuery = require('min-dom/lib/query');

var is = require('../../../../lib/util/ModelUtil').is;


/* global bootstrapModeler, inject */


var contextPadModule = require('../../../../lib/features/context-pad'),
    coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceMenuModule = require('../../../../lib/features/popup-menu'),
    customRulesModule = require('../../../util/custom-rules');


describe('features - context-pad', function() {

  var testModules = [
    coreModule,
    modelingModule,
    contextPadModule,
    replaceMenuModule,
    customRulesModule
  ];


  describe('remove action rules', function () {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


    var deleteAction;

    beforeEach(inject(function (contextPad) {

      deleteAction = function(element) {
        return padEntry(contextPad.getPad(element).html, 'delete');
      };
    }));


    it('should add delete action by default', inject(function (elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should include delete action when rule returns true',
      inject(function (elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', 1500, function() {
        return true;
      });

      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


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
      expect(deleteAction(element)).to.not.exist;
    }));


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
    }));


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
      expect(deleteAction(element)).to.not.exist;
    }));

  });


  describe('available entries', function() {

    var diagramXML = require('./ContextPad.activation.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    function expectContextPadEntries(elementOrId, expectedEntries) {

      TestHelper.getBpmnJS().invoke(function(elementRegistry, contextPad) {

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
        'append.condtion-intermediate-event',
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
        '!replace',
        '!append.end-event',
        '!append.text-annotation'
      ]);
    }));

  });


  describe('replace', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));

    var container;

    beforeEach(function() {
      container = TestContainer.get(this);
    });


    it('should show popup menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1'),
          padding = 5,
          replaceMenuRect,
          padMenuRect;

      contextPad.open(element);
      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();

      // mock event
      var event = {
        target: padEntry(container, 'replace'),
        preventDefault: function(){}
      };

      // when
      contextPad.trigger('click', event);
      replaceMenuRect = domQuery('.bpmn-replace', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));


    it('should not include control if replacement is disallowed',
      inject(function(elementRegistry, contextPad, customRules) {

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
    }));


    it('should include control if replacement is allowed',
      inject(function(elementRegistry, contextPad, customRules) {

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
    }));

  });

});


function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}