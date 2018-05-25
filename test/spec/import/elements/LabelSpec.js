import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


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

        // when
        inject(function(elementRegistry) {

          var eventLabel = elementRegistry.get('EndEvent_1').label,
              sequenceFlowLabel = elementRegistry.get('SequenceFlow_1').label;

          var eventLabelCenter = getCenter(eventLabel),
              sequenceFlowCenter = getCenter(sequenceFlowLabel);

          // then
          expect(eventLabelCenter.x).to.be.within(270, 272);
          expect(eventLabelCenter.y).to.be.within(269, 271);
          expect(eventLabel.width).to.be.above(65);
          expect(eventLabel.height).to.be.above(20);

          expect(sequenceFlowCenter.x).to.be.within(481, 483);
          expect(sequenceFlowCenter.y).to.be.within(323, 335);
          expect(sequenceFlowLabel.width).to.be.above(64);
          expect(sequenceFlowLabel.height).to.be.above(11);

          done(err);
        })();

      });
    });


    it('without di', function(done) {
      var xml = require('../../../fixtures/bpmn/import/labels/external-no-di.bpmn');
      bootstrapViewer(xml)(done);
    });

  });

});


// helper ////////////////

function getCenter(element) {
  return {
    x: element.x + Math.ceil(element.width / 2),
    y: element.y + Math.ceil(element.height / 2)
  };
}