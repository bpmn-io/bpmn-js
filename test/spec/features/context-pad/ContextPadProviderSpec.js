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

    it('for a diagram element', inject(function(elementRegistry, eventBus, contextPad, popupMenu) {

      // given
      var text = document.createElement("SPAN");
      text.innerText = "Pushing the canvas a bit to the right";
      document.body.insertBefore(text, document.body.firstChild);
      TestHelper.insertCSS('diagram.css', 'div[class=test-container]{display: inline-block;}');

      var element = elementRegistry.get('StartEvent_1');
      var replaceMenuRect;
      var padMenuRect;

      // when
      eventBus.on('contextPad.open', function(event) {
        event.current.entries.replace.action.click(null, element);
        replaceMenuRect = popupMenu._instances['replace-menu']._container.getBoundingClientRect();
        padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();
      });
      eventBus.fire('element.click', { element: element });


      // then
      expect(replaceMenuRect.left).not.
          toBeGreaterThan(padMenuRect.left);
    }));
  });

});
