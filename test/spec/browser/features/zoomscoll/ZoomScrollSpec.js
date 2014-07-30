'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapBpmnJS, inject */


var fs = require('fs');

var $ = require('jquery');


var zoomscrollModule = require('../../../../../lib/features/zoomscroll'),
    bpmnModule = require('../../../../../lib/draw');


describe('features - zoomscroll', function() {

  beforeEach(Matchers.addDeepEquals);


  var diagramXML = fs.readFileSync('test/fixtures/bpmn/complex.bpmn', 'utf-8');

  var testModules = [ zoomscrollModule, bpmnModule ];

  beforeEach(bootstrapBpmnJS(diagramXML, { modules: testModules }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(zoomScroll) {
      expect(zoomScroll).not.toBe(null);
    }));

  });

});