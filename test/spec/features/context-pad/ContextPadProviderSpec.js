'use strict';

var TestHelper = require('../../../TestHelper');

var domQuery = require('min-dom/lib/query');

/* global bootstrapViewer, inject */


var contextPadModule = require('../../../../lib/features/context-pad'),
    coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    popupModule = require('diagram-js/lib/features/popup-menu'),
    replaceModule = require('diagram-js/lib/features/replace');


describe('features - context-pad', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ contextPadModule, coreModule, modelingModule, popupModule, replaceModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(contextPadProvider) {
      expect(contextPadProvider).toBeDefined();
    }));

  });


  describe('should show replace popup menu in the correct position ', function() {

    var container;
    beforeEach(function() {
      container = jasmine.getEnv().getTestContainer();
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
      expect(replaceMenuRect.left).not.toBeGreaterThan(padMenuRect.left);
      expect(replaceMenuRect.top).not.toBeGreaterThan(padMenuRect.bottom + padding);
    }));
  });
});
