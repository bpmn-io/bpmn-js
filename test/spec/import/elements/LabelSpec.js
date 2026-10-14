import { expect } from 'chai';
import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('import - labels', function() {

  describe('should import embedded labels', function() {

    it('on flow nodes', function() {
      var xml = require('../../../fixtures/bpmn/import/labels/embedded.bpmn');
      return bootstrapViewer(xml)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });


    it('on pools and lanes', function() {
      var xml = require('../../../fixtures/bpmn/import/labels/collaboration.bpmn');
      return bootstrapViewer(xml)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });


    it('on message flows', function() {
      var xml = require('../../../fixtures/bpmn/import/labels/collaboration-message-flows.bpmn');
      return bootstrapViewer(xml)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });

  });


  describe('should import external labels', function() {

    it('with di', function() {
      var xml = require('../../../fixtures/bpmn/import/labels/external.bpmn');

      // given
      return bootstrapViewer(xml)().then(function(result) {

        var err = result.error;

        expect(err).not.to.exist;

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
        })();

      });
    });


    it('without di', function() {
      var xml = require('../../../fixtures/bpmn/import/labels/external-no-di.bpmn');
      return bootstrapViewer(xml)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });


    describe('with custom label width', function() {

      var xml = require('../../../fixtures/bpmn/import/labels/external-resized.bpmn');

      beforeEach(bootstrapViewer(xml));


      it('should keep width narrower than default', inject(function(elementRegistry) {

        // when
        var label = elementRegistry.get('NarrowLabelEvent').label;

        // then
        expect(label.x).to.eql(93);
        expect(label.width).to.eql(50);
      }));


      it('should keep width wider than text', inject(function(elementRegistry) {

        // when
        var label = elementRegistry.get('WideLabelEvent').label;

        // then
        expect(label.x).to.eql(243);
        expect(label.width).to.eql(150);
      }));


      it('should fit zero width to text', inject(function(elementRegistry) {

        // when
        var label = elementRegistry.get('ZeroWidthLabelEvent').label;

        // then
        expect(label.width).to.be.above(0);
        expect(label.x + label.width / 2).to.be.closeTo(518, 1);
      }));

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
