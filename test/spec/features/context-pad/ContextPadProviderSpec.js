'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var fs = require('fs');

var contextPadModule = require('../../../../lib/features/context-pad'),
    bpmnModule = require('../../../../lib/core'),
    popupModule = require('diagram-js/lib/features/popup-menu'),
    replaceModule = require('diagram-js/lib/features/replace');


describe('features - context-pad', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/simple.bpmn', 'utf8');

  var testModules = [ contextPadModule, bpmnModule, popupModule, replaceModule ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(contextPadProvider) {
      expect(contextPadProvider).toBeDefined();
    }));

  });
});
