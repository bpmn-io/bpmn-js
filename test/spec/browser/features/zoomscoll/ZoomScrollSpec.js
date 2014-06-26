'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var $ = require('jquery');


var zoomscrollModule = require('../../../../../lib/features/zoomscroll'),
    bpmnModule = require('../../../../../lib/core');


describe('features - zoomscroll', function() {

  beforeEach(Matchers.add);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/complex.bpmn', 'utf-8');

  var testModules = [ zoomscrollModule, bpmnModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    iit('should bootstrap', inject(function(zoomScroll) {
      expect(zoomScroll).not.toBe(null);
    }));

  });

});