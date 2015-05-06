'use strict';

require('../../../TestHelper');

var Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */

var bendpointsModule = require('../../../../lib/features/bendpoints'),
    rulesModule = require('./rules'),
    modelingModule = require('../../../../lib/features/modeling'),
    selectModule = require('../../../../lib/features/selection');


describe('features/bendpoints - move', function() {

  beforeEach(bootstrapDiagram({ modules: [ bendpointsModule, rulesModule, modelingModule, selectModule ] }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  var createEvent;

  beforeEach(inject(function(canvas) {
    createEvent = Events.scopedCreate(canvas);
  }));

  var rootShape, shape1, shape2, shape3, connection, connection2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      type: 'A',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      type: 'A',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      type: 'B',
      x: 500, y: 400, width: 100, height: 100
    });

    canvas.addShape(shape3, rootShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 250 }, { x: 550, y: 150 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection, rootShape);

    connection2 = elementFactory.createConnection({
      id: 'connection2',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 450 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection2, rootShape);
  }));


  describe('dragger', function() {

    it('should show on activate', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(createEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(createEvent({ x: 400, y: 200 }));

      // then
      var bendpoint = layer.node.querySelector('.djs-bendpoint.djs-dragging');
      expect(bendpoint).to.be.defined;
    }));


    it('should update during move', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(createEvent({ x: 0, y: 0 }), connection, 1);
      dragging.move(createEvent({ x: 100, y: 100 }));

      // then
      var bendpoint = layer.node.querySelector('.djs-bendpoint.djs-dragging');
      expect(bendpoint).to.be.defined;
    }));


    it('should hide after resize', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(createEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(createEvent({ x: 100, y: 100 }));

      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.cancel();

      // then
      var bendpoint = layer.node.querySelector('.djs-bendpoint.djs-dragging');
      expect(bendpoint).to.be.null;
    }));


    it('should connect-hover and out', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 2);
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(createEvent({ x: 550, y: 150 }));
      dragging.out();
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(createEvent({ x: 530, y: 120 }));
      dragging.out();
      dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
      dragging.move(createEvent({ x: 530, y: 420 }));
      dragging.out();
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(createEvent({ x: 610, y: 310 }));

      // then
      var hoverNodes = canvas._svg.node.querySelectorAll('.connect-hover, .connect-ok, .connect-not-ok');

      // connect-hover indicator
      expect(hoverNodes.length).to.equal(1);
    }));

  });


  describe('rule integration', function() {

    it('should live-check hover (allowed)', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 2);
      dragging.move(createEvent({ x: 550, y: 150 }));
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(createEvent({ x: 530, y: 120 }));

      // then
      var hoverNode = canvas._svg.node.querySelector('.connect-hover.connect-ok');

      expect(hoverNode).to.be.defined;
      expect(hoverNode.getAttribute('data-element-id')).to.equal(shape2.id);
    }));


    it('should live-check hover (rejected)', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 2);
      dragging.move(createEvent({ x: 550, y: 450 }));
      dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
      dragging.move(createEvent({ x: 530, y: 420 }));

      // then
      var hoverNode = canvas._svg.node.querySelector('.connect-hover.connect-not-ok');

      expect(hoverNode).to.be.defined;
      expect(hoverNode.getAttribute('data-element-id')).to.equal(shape3.id);
    }));

  });


  describe('modeling', function() {

    it('should update bendpoint', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 1);
      dragging.move(createEvent({ x: 450, y: 430 }));
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(createEvent({ x: 530, y: 420 }));
      dragging.end();

      // then
      expect(connection.waypoints[1]).to.eql({ x: 530, y: 420 });
    }));


    it('should round to pixel values', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 1);
      dragging.move(createEvent({ x: 450, y: 430 }));
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(createEvent({ x: 530.3, y: 419.8 }));
      dragging.end();

      // then
      expect(connection.waypoints[1]).to.eql({ x: 530, y: 420 });
    }));


    it('should reattach target', inject(function(canvas, bendpointMove, dragging) {

      // given
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 2);
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(createEvent({ x: 530, y: 120 }));

      // when
      dragging.end();

      // then
      expect(connection.waypoints[2]).to.eql({ x: 530, y: 120 });
    }));


    it('should reattach source', inject(function(canvas, bendpointMove, dragging) {

      // given
      bendpointMove.start(createEvent({ x: 500, y: 500 }), connection, 0);
      dragging.hover({ element: shape1, gfx: canvas.getGraphics(shape1) });
      dragging.move(createEvent({ x: 230, y: 120 }));

      // when
      dragging.end();

      // then
      expect(connection.waypoints[0]).to.eql({ x: 230, y: 120 });
    }));

  });

});
