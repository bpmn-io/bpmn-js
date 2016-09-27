'use strict';

require('../../../TestHelper');

/* global bootstrapViewer, inject */


describe('import - labels', function() {

  describe('should import embedded labels', function() {

    it('on flow nodes', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/embedded.bpmn');
      bootstrapViewer(xml)(done);
    });


    it('on pools and lanes', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/collaboration.bpmn');
      bootstrapViewer(xml)(done);
    });


    it('on message flows', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/collaboration-message-flows.bpmn');
      bootstrapViewer(xml)(done);
    });

  });


  describe('should import external labels', function() {

    it('with di', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/external.bpmn');

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
          expect(endEvent.label.x).to.be.within(236, 237);
          expect(endEvent.label.y).to.be.within(256, 256);
          expect(endEvent.label.width).to.be.within(68, 69);
          expect(endEvent.label.height).to.be.within(23, 30);

          expect(sequenceFlow.label.x).to.be.within(441, 442);
          expect(sequenceFlow.label.y).to.be.within(316, 317);
          expect(sequenceFlow.label.width).to.be.within(79, 82);
          expect(sequenceFlow.label.height).to.be.within(11, 15);

          done();
        })();

      });
    });


    it('without di', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/external-no-di.bpmn');
      bootstrapViewer(xml)(done);
    });

  });

});