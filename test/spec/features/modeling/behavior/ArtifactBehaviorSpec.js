import { expect } from 'chai';
import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import createModule from 'diagram-js/lib/features/create';
import moveModule from 'diagram-js/lib/features/move';

import {
  createCanvasEvent as canvasEvent
} from '../../../../util/MockEvents';

import subProcessWithAnnotationsXML from './ArtifactBehavior.sub-process-basic.bpmn';
import subProcessWithGroupXML from './ArtifactBehavior.sub-process-group.bpmn';
import participantLanesXML from './ArtifactBehavior.participant.bpmn';


const MOVE_DELTA = { x: 100, y: 100 };


describe('modeling/behavior - ArtifactBehavior', function() {

  describe('text annotation inside sub-process', function() {

    beforeEach(bootstrapModeler(subProcessWithAnnotationsXML, {
      modules: [
        coreModule,
        createModule,
        modelingModule,
        moveModule
      ]
    }));


    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should move enclosed', inject(function() {

      // given
      var subProcess = elementById('SUB_PROCESS'),
          element_contained = elementById('TEXT_ANNOTATION_CONTAINED'),
          element_overflowTop = elementById('TEXT_ANNOTATION_OVERFLOW_TOP'),
          element_overflowLeft = elementById('TEXT_ANNOTATION_OVERFLOW_LEFT'),
          element_overflowBottom = elementById('TEXT_ANNOTATION_OVERFLOW_BOTTOM'),
          element_overflowRight = elementById('TEXT_ANNOTATION_OVERFLOW_RIGHT');

      var expectedPos_contained = movedBounds(element_contained, MOVE_DELTA),
          expectedPos_overflowTop = bounds(element_overflowTop),
          expectedPos_overflowLeft = bounds(element_overflowLeft),
          expectedPos_overflowBottom = bounds(element_overflowBottom),
          expectedPos_overflowRight = bounds(element_overflowRight);

      // when
      // #SUB_PROCESS moves
      moveElement(subProcess, MOVE_DELTA);

      // then
      // #TEXT_ANNOTATION_CONTAINED moves
      expect(element_contained).to.have.bounds(expectedPos_contained);

      // #TEXT_ANNOTATION_OVERFLOW_* do not move
      expect(element_overflowTop).to.have.bounds(expectedPos_overflowTop);
      expect(element_overflowLeft).to.have.bounds(expectedPos_overflowLeft);
      expect(element_overflowBottom).to.have.bounds(expectedPos_overflowBottom);
      expect(element_overflowRight).to.have.bounds(expectedPos_overflowRight);
    }));


    it('should NOT double move enclosed', inject(function() {

      // given
      var subProcess = elementById('SUB_PROCESS'),
          element_contained = elementById('TEXT_ANNOTATION_CONTAINED');

      var expectedPos_contained = movedBounds(element_contained, MOVE_DELTA);

      // when
      // #SUB_PROCESS and #TEXT_ANNOTATION_CONTAINED move
      select([ element_contained, subProcess ]);
      moveElement(element_contained, MOVE_DELTA);

      // then
      // #TEXT_ANNOTATION_CONTAINED moves
      expect(element_contained).to.have.bounds(expectedPos_contained);
    }));


    it('should delete enclosed', inject(function(modeling) {

      // given
      var subProcess = elementById('SUB_PROCESS');

      // when
      // #SUB_PROCESS deleted
      modeling.removeElements([ subProcess ]);

      // then
      // #TEXT_ANNOTATION_CONTAINED is deleted
      expect(elementById('TEXT_ANNOTATION_CONTAINED')).not.to.exist;

      // #TEXT_ANNOTATION_OVERFLOW_* are not deleted
      expect(elementById('TEXT_ANNOTATION_OVERFLOW_TOP')).to.exist;
      expect(elementById('TEXT_ANNOTATION_OVERFLOW_LEFT')).to.exist;
      expect(elementById('TEXT_ANNOTATION_OVERFLOW_BOTTOM')).to.exist;
      expect(elementById('TEXT_ANNOTATION_OVERFLOW_RIGHT')).to.exist;
    }));

  });


  describe('group inside sub-process', function() {

    beforeEach(bootstrapModeler(subProcessWithGroupXML, {
      modules: [
        coreModule,
        createModule,
        modelingModule,
        moveModule
      ]
    }));


    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should move enclosed', inject(function() {

      // given
      var subProcess = elementById('SUB_PROCESS'),
          element_contained = elementById('GROUP_CONTAINED'),
          element_overflow = elementById('GROUP_OVERFLOW');

      var expectedPos_contained = movedBounds(element_contained, MOVE_DELTA),
          expectedPos_overflow = bounds(element_overflow);

      // when
      // #SUB_PROCESS moves
      moveElement(subProcess, MOVE_DELTA);

      // then
      // #GROUP_CONTAINED moves
      expect(element_contained).to.have.bounds(expectedPos_contained);

      // #GROUP_OVERFLOW does not move
      expect(element_overflow).to.have.bounds(expectedPos_overflow);
    }));


    it('should delete enclosed', inject(function(modeling) {

      // given
      var subProcess = elementById('SUB_PROCESS');

      // when
      // #SUB_PROCESS is deleted
      modeling.removeElements([ subProcess ]);

      // then
      // #GROUP_CONTAINED is deleted
      expect(elementById('GROUP_CONTAINED')).not.to.exist;

      // #GROUP_OVERFLOW is not deleted
      expect(elementById('GROUP_OVERFLOW')).to.exist;
    }));

  });


  describe('artifact inside of participant/lane', function() {

    beforeEach(bootstrapModeler(participantLanesXML, {
      modules: [
        coreModule,
        createModule,
        modelingModule,
        moveModule
      ]
    }));


    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should move enclosed', inject(function() {

      // given
      var participant = elementById('PARTICIPANT_LANES'),
          element_contained = elementById('GROUP_CONTAINED_LANE'),
          element_overflow = elementById('GROUP_OVERFLOW');

      var expectedPos_contained = movedBounds(element_contained, MOVE_DELTA);
      var expectedPos_overflow = bounds(element_overflow);

      // when
      // #PARTICIPANT_LANES moves
      moveElement(participant, MOVE_DELTA);

      // then
      // #GROUP_CONTAINED_LANE is moved
      expect(element_contained).to.have.bounds(expectedPos_contained);

      // #GROUP_OVERFLOW is not moved
      expect(element_overflow).to.have.bounds(expectedPos_overflow);
    }));


    it('should move enclosed via selection', inject(function() {

      // given
      var participant = elementById('PARTICIPANT_LANES'),
          participantOther = elementById('PARTICIPANT_NO_LANES'),
          element_contained = elementById('GROUP_CONTAINED_LANE'),
          element_containedOther = elementById('GROUP_CONTAINED_PARTICIPANT');

      var expectedPos_contained = movedBounds(element_contained, MOVE_DELTA),
          expectedPos_containedOther = movedBounds(element_containedOther, MOVE_DELTA);

      // when
      // #PARTICIPANT_LANES and #PARTICIPANT_NO_LANES move
      select([ participant, participantOther ]);
      moveElement(participantOther, MOVE_DELTA);

      // then
      // #GROUP_CONTAINED_LANE is moved
      // #GROUP_CONTAINED_PARTICIPANT is moved
      expect(element_contained).to.have.bounds(expectedPos_contained);
      expect(element_containedOther).to.have.bounds(expectedPos_containedOther);
    }));


    it('should delete enclosed', inject(function(modeling) {

      // given
      var participant = elementById('PARTICIPANT_LANES');

      // when
      // #PARTICIPANT_LANES is deleted
      modeling.removeElements([ participant ]);

      // then
      // #GROUP_CONTAINED_LANE is deleted
      expect(elementById('GROUP_CONTAINED_LANE')).not.to.exist;

      // #GROUP_OVERFLOW is not deleted
      expect(elementById('GROUP_OVERFLOW')).to.exist;
    }));

  });

});


// helpers /////////////

function bounds(shape) {
  return {
    x: shape.x,
    y: shape.y,
    height: shape.height,
    width: shape.width
  };
}

function movedBounds(bounds, delta) {
  return {
    x: bounds.x + (delta.x || 0),
    y: bounds.y + (delta.y || 0),
    width: bounds.width,
    height: bounds.height
  };
}

function elementById(id) {
  expect(id).to.exist;

  return getBpmnJS().invoke(function(elementRegistry) {
    return elementRegistry.get(id);
  });
}

function select(elements) {

  return getBpmnJS().invoke(function(selection) {
    selection.select(elements, false);
  });
}

function moveElement(element, delta) {

  return getBpmnJS().invoke(function(move, canvas, dragging) {

    var position = bounds(element);

    move.start(canvasEvent(position), element);

    dragging.hover({
      element: element.parent,
      gfx: canvas.getGraphics(element.parent)
    });

    dragging.move(canvasEvent(movedBounds(element, delta)));
    dragging.end();
  });

}