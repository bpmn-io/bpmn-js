import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import {
  pick
} from 'min-dash';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - delete lane', function() {

  var diagramXML = require('./lanes.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should remove first Lane', inject(function(elementRegistry, modeling) {

    // given
    var laneShape = elementRegistry.get('Lane_A'),
        belowLaneShape = elementRegistry.get('Lane_B'),
        belowLaneBounds = getBounds(belowLaneShape);

    // when
    modeling.removeShape(laneShape);

    // then
    expect(belowLaneShape).to.have.bounds({
      x: belowLaneBounds.x,
      y: belowLaneBounds.y - laneShape.height,
      width: belowLaneBounds.width,
      height: belowLaneBounds.height + laneShape.height
    });

  }));


  it('should remove last Lane', inject(function(elementRegistry, modeling) {

    // given
    var laneShape = elementRegistry.get('Lane_B'),
        aboveLaneShape = elementRegistry.get('Lane_A'),
        aboveLaneBounds = getBounds(aboveLaneShape);

    // when
    modeling.removeShape(laneShape);

    // then
    expect(aboveLaneShape).to.have.bounds({
      x: aboveLaneBounds.x,
      y: aboveLaneBounds.y,
      width: aboveLaneShape.width,
      height: aboveLaneBounds.height + laneShape.height
    });

  }));


  describe('three lanes', function() {

    it('should remove middle Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Lane_B'),
          aboveLaneShape = elementRegistry.get('Nested_Lane_A'),
          aboveLaneBounds = getBounds(aboveLaneShape),
          belowLaneShape = elementRegistry.get('Nested_Lane_C'),
          belowLaneBounds = getBounds(belowLaneShape);

      // when
      modeling.removeShape(laneShape);

      // then
      expect(aboveLaneShape).to.have.bounds({
        x: aboveLaneBounds.x,
        y: aboveLaneBounds.y,
        width: aboveLaneShape.width,
        height: aboveLaneBounds.height + laneShape.height / 2
      });

      expect(belowLaneShape).to.have.bounds({
        x: belowLaneBounds.x,
        y: belowLaneBounds.y - laneShape.height / 2,
        width: belowLaneBounds.width,
        height: belowLaneBounds.height + laneShape.height / 2
      });

    }));


    it('should remove first Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Lane_A'),
          belowLaneShape = elementRegistry.get('Nested_Lane_B'),
          belowLaneBounds = getBounds(belowLaneShape),
          lastLaneShape = elementRegistry.get('Nested_Lane_C'),
          lastLaneBounds = getBounds(lastLaneShape);

      // when
      modeling.removeShape(laneShape);

      // then
      expect(belowLaneShape).to.have.bounds({
        x: belowLaneBounds.x,
        y: belowLaneBounds.y - laneShape.height,
        width: belowLaneBounds.width,
        height: belowLaneBounds.height + laneShape.height
      });

      expect(lastLaneShape).to.have.bounds(lastLaneBounds);

    }));

  });

});


describe('features/modeling - delete vertical lane', function() {

  var diagramXML = require('./lanes.vertical.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should remove first Lane', inject(function(elementRegistry, modeling) {

    // given
    var laneShape = elementRegistry.get('Vertical_Lane_A'),
        rightSideLaneShape = elementRegistry.get('Vertical_Lane_B'),
        rightSideLaneBounds = getBounds(rightSideLaneShape);

    // when
    modeling.removeShape(laneShape);

    // then
    expect(rightSideLaneShape).to.have.bounds({
      x: rightSideLaneBounds.x - laneShape.width,
      y: rightSideLaneBounds.y,
      width: rightSideLaneBounds.width + laneShape.width,
      height: rightSideLaneBounds.height
    });

  }));


  it('should remove last Lane', inject(function(elementRegistry, modeling) {

    // given
    var laneShape = elementRegistry.get('Vertical_Lane_B'),
        leftSideLaneShape = elementRegistry.get('Vertical_Lane_A'),
        leftSideLaneBounds = getBounds(leftSideLaneShape);

    // when
    modeling.removeShape(laneShape);

    // then
    expect(leftSideLaneShape).to.have.bounds({
      x: leftSideLaneBounds.x,
      y: leftSideLaneBounds.y,
      width: leftSideLaneBounds.width + laneShape.width,
      height: leftSideLaneBounds.height
    });

  }));


  describe('three lanes', function() {

    it('should remove middle Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Vertical_Lane_B'),
          leftSideLaneShape = elementRegistry.get('Nested_Vertical_Lane_A'),
          leftSideLaneBounds = getBounds(leftSideLaneShape),
          rightSideLaneShape = elementRegistry.get('Nested_Vertical_Lane_C'),
          rightSideLaneBounds = getBounds(rightSideLaneShape);

      // when
      modeling.removeShape(laneShape);

      // then
      expect(leftSideLaneShape).to.have.bounds({
        x: leftSideLaneBounds.x,
        y: leftSideLaneBounds.y,
        width: leftSideLaneBounds.width + laneShape.width / 2,
        height: leftSideLaneBounds.height
      });

      expect(rightSideLaneShape).to.have.bounds({
        x: rightSideLaneBounds.x - laneShape.width / 2,
        y: rightSideLaneBounds.y,
        width: rightSideLaneBounds.width + laneShape.width / 2,
        height: rightSideLaneBounds.height
      });

    }));


    it('should remove first Lane', inject(function(elementRegistry, modeling) {

      // given
      var laneShape = elementRegistry.get('Nested_Vertical_Lane_A'),
          rightSideLaneShape = elementRegistry.get('Nested_Vertical_Lane_B'),
          rightSideLaneBounds = getBounds(rightSideLaneShape),
          lastLaneShape = elementRegistry.get('Nested_Vertical_Lane_C'),
          lastLaneBounds = getBounds(lastLaneShape);

      // when
      modeling.removeShape(laneShape);

      // then
      expect(rightSideLaneShape).to.have.bounds({
        x: rightSideLaneBounds.x - laneShape.width,
        y: rightSideLaneBounds.y,
        width: rightSideLaneBounds.width + laneShape.width,
        height: rightSideLaneBounds.height
      });

      expect(lastLaneShape).to.have.bounds(lastLaneBounds);

    }));

  });

});


// helpers ///////////////

function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}