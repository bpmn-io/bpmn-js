import { expect } from 'chai';
import {
  bootstrapViewer,
  inject
} from 'bpmn-js/test/TestHelper.js';

import embeddedXML from '../../../fixtures/bpmn/import/labels/embedded.bpmn';
import collaborationXML from '../../../fixtures/bpmn/import/labels/collaboration.bpmn';
import collaborationMessageFlowsXML from '../../../fixtures/bpmn/import/labels/collaboration-message-flows.bpmn';
import externalXML from '../../../fixtures/bpmn/import/labels/external.bpmn';
import externalNoDiXML from '../../../fixtures/bpmn/import/labels/external-no-di.bpmn';


describe('import - labels', function() {

  describe('should import embedded labels', function() {

    it('on flow nodes', function() {
      return bootstrapViewer(embeddedXML)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });


    it('on pools and lanes', function() {
      return bootstrapViewer(collaborationXML)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });


    it('on message flows', function() {
      return bootstrapViewer(collaborationMessageFlowsXML)().then(function(result) {
        expect(result.error).not.to.exist;
      });
    });

  });


  describe('should import external labels', function() {

    it('with di', function() {

      // given
      return bootstrapViewer(externalXML)().then(function(result) {

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
      return bootstrapViewer(externalNoDiXML)().then(function(result) {
        expect(result.error).not.to.exist;
      });
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
