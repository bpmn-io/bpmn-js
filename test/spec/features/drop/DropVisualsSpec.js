'use strict';

var _ = require('lodash');

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    moveModule     = require('../../../../lib/features/move'),
    dropModule     = require('../../../../lib/features/drop'),
    testRules       = require('./');

var MockEvent = require('../../../Event');


describe('features/drop - DropVisuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, dropModule, moveModule, testRules ] }));


  var rootShape, parentShape, shape1, shape2, shape3, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 10, y: 10, width: 10, height: 10
    });

    canvas.addShape(shape1);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 20, y: 20, width: 10, height: 10
    });

    canvas.addShape(shape2);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      x: 10, y: 10, width: 10, height: 10
    });

    canvas.addShape(shape3);
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function() {}));

  });


  describe('hovering shape', function() {

    it('should indicate drop allowed', inject(function(dragSupport, eventBus, elementRegistry) {

      // given
      var draggable   = dragSupport.get(shape1);
      var dropAllowed = true;

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(7, 7, 7, 7, new MockEvent());
      eventBus.fire('shape.hover', {
        element:shape2,
        dragContext: dragSupport.getDragContext(),
        canDrop: dropAllowed
      });

      // then
      expect(elementRegistry.getGraphics(shape2).hasClass('drop-ok')).toBe(true);
    }));

    it('should indicate drop not allowed', inject(function(dragSupport, eventBus, elementRegistry) {

      // given
      var draggable   = dragSupport.get(shape3);
      var dropAllowed = true;

      // when
      draggable.dragStart(10, 10, new MockEvent());
      draggable.dragMove(7, 7, 7, 7, new MockEvent());
      eventBus.fire('shape.hover', {
        element:shape2,
        dragContext: dragSupport.getDragContext(),
        canDrop: dropAllowed
      });

      // then
      expect(elementRegistry.getGraphics(shape2).hasClass('drop-not-ok')).toBe(true);
    }));
  });

});
