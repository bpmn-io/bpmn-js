'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');


var touchModule = require('../../../../../lib/features/touch'),
    bpmnModule = require('../../../../../lib/draw');


describe('features - touch', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/complex.bpmn', 'utf-8');

  var testModules = [ touchModule, bpmnModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(touchInteraction) {
      expect(touchInteraction).not.toBe(null);
    }));

  });
});