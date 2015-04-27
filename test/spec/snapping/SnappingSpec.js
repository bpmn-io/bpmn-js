'use strict';

/* global bootstrapDiagram, inject */

var assign = require('lodash/object/assign');

var snappingModule = require('../../../lib/features/snapping');

var SnapContext = require('../../../lib/features/snapping/SnapContext');

var Event = require('../../../lib/core/EventBus').Event;


describe('features/snapping - Snapping', function() {

  beforeEach(bootstrapDiagram({ modules: [ snappingModule ] }));


  var root, shapeA, shapeB;

  beforeEach(inject(function(canvas, elementFactory) {

    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    shapeA = canvas.addShape(elementFactory.createShape({
      id: 'A',
      x: 100, y: 100, width: 100, height: 100
    }));

    shapeB = canvas.addShape(elementFactory.createShape({
      id: 'B',
      x: 400, y: 150, width: 50, height: 50
    }));

  }));


  describe('#initSnap', function() {

    it('should init snapContext', inject(function(snapping) {

      // given
      var event = {
        x: 100,
        y: 100,
        context: {
          shape: shapeA
        }
      };

      // when
      var snapContext = snapping.initSnap(event);

      // then
      expect(snapContext).to.exist;
      expect(event.context.snapContext).to.equal(snapContext);
    }));


    it('should reuse existing snapContext', inject(function(snapping) {

      // given
      var originalSnapContext = new SnapContext();

      var event = {
        x: 100,
        y: 100,
        context: {
          shape: shapeA,
          snapContext: originalSnapContext
        }
      };

      // when
      var snapContext = snapping.initSnap(event);

      // then
      expect(snapContext).to.equal(originalSnapContext);
    }));

  });


  describe('eventBus integration', function() {

    var startEvent;

    beforeEach(function() {
      startEvent = assign(new Event(), {
        x: 150,
        y: 150,
        context: {
          shape: shapeA,
          target: root
        }
      });
    });


    function moveTo(startEvent, newPosition) {

      return assign(new Event(), startEvent, {
        x: newPosition.x,
        y: newPosition.y,
        dx: newPosition.x - startEvent.x,
        dy: newPosition.y - startEvent.y
      });
    }

    it('should init on shape.move.start', inject(function(eventBus) {

      // when
      eventBus.fire('shape.move.start', startEvent);

      // then
      expect(startEvent.context.snapContext).to.exist;
    }));


    it('should init on create.start', inject(function(eventBus) {

      // when
      eventBus.fire('create.start', startEvent);

      // then
      expect(startEvent.context.snapContext).to.exist;
    }));


    it('should snap on shape.move.move / horizontally', inject(function(eventBus) {

      // given
      eventBus.fire('shape.move.start', startEvent);

      // when
      var moveEvent = moveTo(startEvent, { x: 180, y: 170 });

      eventBus.fire('shape.move.move', moveEvent);

      // then
      expect(moveEvent.x).to.eql(180);
      expect(moveEvent.y).to.eql(175); // snap at (180,175)
    }));


    it('should snap on shape.move.move / vertically', inject(function(eventBus) {

      // given
      eventBus.fire('shape.move.start', startEvent);

      // when
      var moveEvent = moveTo(startEvent, { x: 420, y: 200 });

      eventBus.fire('shape.move.move', moveEvent);

      // then
      expect(moveEvent.x).to.eql(425);
      expect(moveEvent.y).to.eql(200); // snap at (425,200)
    }));


    it('should snap on shape.move.end', inject(function(eventBus) {

      // given
      eventBus.fire('shape.move.start', startEvent);

      // when
      var endEvent = moveTo(startEvent, { x: 180, y: 170 });

      eventBus.fire('shape.move.end', endEvent);

      // then
      expect(endEvent.x).to.eql(180);
      expect(endEvent.y).to.eql(175); // snap at (180,175)
    }));

  });

});