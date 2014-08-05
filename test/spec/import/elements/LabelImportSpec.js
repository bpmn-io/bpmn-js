'use strict';

var Matchers = require('../../../Matchers'),
    TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var fs = require('fs');


describe('import - labels', function() {

  beforeEach(Matchers.addDeepEquals);


  describe('should import embedded labels', function() {

    it('on flow nodes', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/embedded.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });


    it('on pools and lanes', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/collaboration.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });


    it('on message flows', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/collaboration-message-flows.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });

  });


  describe('should import external labels', function() {

    it('with di', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/external.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });


    it('without di', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/external-no-di.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });

  });

});