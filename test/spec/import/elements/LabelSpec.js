'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapViewer, inject */


var _ = require('lodash');

var fs = require('fs');


function bounds(element) {
  return _.pick(element, [ 'x', 'y', 'width', 'height' ]);
}


describe('import - labels', function() {


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

      // given
      bootstrapViewer(xml)(function(err) {

        if (err) {
          return done(err);
        }

        // when
        inject(function(elementRegistry) {

          var endEvent = elementRegistry.get('EndEvent_1'),
              sequenceFlow = elementRegistry.get('SequenceFlow_1');

          // then
          expect(bounds(endEvent.label)).toEqual({ x: 211, y: 256, width: 119, height: 44 });
          expect(bounds(sequenceFlow.label)).toEqual({ x: 432, y: 317, width: 99, height: 22 });

          done();
        })();

      });
    });


    it('without di', function(done) {
      var xml = fs.readFileSync('test/fixtures/bpmn/import/labels/external-no-di.bpmn', 'utf8');
      bootstrapViewer(xml)(done);
    });

  });

});