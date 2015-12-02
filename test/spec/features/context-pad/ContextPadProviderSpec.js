'use strict';

var TestHelper = require('../../../TestHelper');

var TestContainer = require('mocha-test-container-support');

var domQuery = require('min-dom/lib/query');

/* global bootstrapViewer, inject */


var contextPadModule = require('../../../../lib/features/context-pad'),
    coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    popupModule = require('diagram-js/lib/features/popup-menu'),
    replaceModule = require('diagram-js/lib/features/replace'),
    rulesModule = require('../../../util/custom-rules');


describe('features - context-pad', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ contextPadModule, coreModule, modelingModule, popupModule, replaceModule, rulesModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(contextPadProvider) {
      expect(contextPadProvider).to.exist;
    }));

  });


  describe('remove action rules', function () {

    var deleteAction;

    beforeEach(inject(function (contextPad) {

      deleteAction = function(element) {
        return domQuery('[data-action="delete"]', contextPad.getPad(element).html);
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


    it('should include delete action when rule returns true', inject(function (elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
        return true;
      });

      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should NOT include delete action when rule returns false', inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
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

      customRules.addRule('elements.delete', function(context) {

        // element array is actually passed
        expect(context.elements).to.eql([ element ]);

        return true;
      });

      // then
      expect(function() {
        contextPad.open(element);
      }).not.to.throw;
    }));


    it('should include delete action when [ element ] is returned from rule', inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function(context) {
        return context.elements;
      });

      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.exist;
    }));


    it('should NOT include delete action when [ ] is returned from rule', inject(function(elementRegistry, contextPad, customRules) {

      // given
      customRules.addRule('elements.delete', function() {
        return [];
      });

      var element = elementRegistry.get('StartEvent_1');

      // when
      contextPad.open(element);

      // then
      expect(deleteAction(element)).to.not.exist;
    }));

  });


  describe('should show replace popup menu in the correct position ', function() {

    var container;
    beforeEach(function() {
      container = TestContainer.get(this);
    });

    it('for a diagram element', inject(function(elementRegistry, contextPad, popupMenu) {

      // given
      var element = elementRegistry.get('StartEvent_1'),
          padding = 5,
          replaceMenuRect,
          padMenuRect;

      contextPad.open(element);
      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();

      // mock event
      var event = {
        target: domQuery('[data-action="replace"]', container),
        preventDefault: function(){}
      };

      // when
      contextPad.trigger('click', event);
      replaceMenuRect = domQuery('.replace-menu', container).getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.left);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.bottom + padding);
    }));

  });

});
