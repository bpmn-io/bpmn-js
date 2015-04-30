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
});
