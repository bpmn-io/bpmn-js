import { expect } from 'chai';
import {
  getParticipantResizeConstraints
} from 'bpmn-js/lib/features/modeling/behavior/util/ResizeUtil.js';


describe('modeling/behavior/util - Resize', function() {

  describe('#getParticipantResizeConstraints', function() {

    it('should expose', function() {
      expect(getParticipantResizeConstraints).to.exist;
    });

  });

});