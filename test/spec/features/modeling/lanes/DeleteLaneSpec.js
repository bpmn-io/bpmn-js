'use strict';

require('../../../../TestHelper');

/* global bootstrapModeler, inject */

var pick = require('min-dash').pick;

var modelingModule = require('lib/features/modeling'),
    coreModule = require('lib/core');

function getBounds(element) {
  return pick(element, [ 'x', 'y', 'width', 'height' ]);
}


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
