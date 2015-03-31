'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var contextPadModule = require('../../../../lib/features/context-pad'),
    bpmnModule = require('../../../../lib/core'),
    popupModule = require('diagram-js/lib/features/popup-menu'),
    replaceModule = require('diagram-js/lib/features/replace');


describe('features - context-pad', function() {

  var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

  var testModules = [ contextPadModule, bpmnModule, popupModule, replaceModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(contextPadProvider) {
      expect(contextPadProvider).toBeDefined();
    }));

  });
});
