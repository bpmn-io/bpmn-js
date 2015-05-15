'use strict';

var TestHelper = require('../../../TestHelper');

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


  describe('should show chooser/replace menu in the correct position ', function() {

    var container;

    beforeEach(function() {
      container = jasmine.getEnv().getTestContainer();
    });


    it('for a diagram element', inject(function(elementRegistry, eventBus, contextPad, popupMenu) {
      // given
      var bpmnContainer = container.firstChild,
          element = elementRegistry.get('StartEvent_1'),
          padding = 5,
          replaceMenuRect,
          padMenuRect;

      bpmnContainer.style.marginLeft = '200px';
      bpmnContainer.style.marginTop = '200px';

      // when
      eventBus.on('contextPad.open', function(event) {
        event.current.entries.replace.action.click(null, element);
        replaceMenuRect = popupMenu._instances['replace-menu']._container.getBoundingClientRect();
        padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();
      });

      eventBus.fire('element.click', { element: element });

      // then
      expect(replaceMenuRect.left).not.toBeGreaterThan(padMenuRect.left);
      expect(replaceMenuRect.top).not.toBeGreaterThan(padMenuRect.bottom + padding);
    }));

  });

});
