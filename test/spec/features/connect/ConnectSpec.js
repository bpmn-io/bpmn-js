'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject, sinon */


var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

var modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('./rules'),
    connectModule = require('../../../../lib/features/connect');


describe('features/connect', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, connectModule, rulesModule ] }));

  beforeEach(inject(function(canvas, dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, shape1, shape2, shape1child;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 's1',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 's2',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);


    shape1child = elementFactory.createShape({
      id: 's3',
      x: 150, y: 150, width: 50, height: 50
    });

    canvas.addShape(shape1child, shape1);
  }));


  describe('behavior', function() {

    it('should connect if allowed', inject(function(connect, dragging) {

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1);

      dragging.move(canvasEvent({ x: 40, y: 30 }));

      dragging.hover(canvasEvent({ x: 10, y: 10 }, { element: shape2 }));
      dragging.end();

      var newConnection = shape1.outgoing[0];

      // then
      expect(newConnection).to.exist;
      expect(newConnection.target).to.equal(shape2);
    }));


    it('should not connect if rejected', inject(function(connect, rules, dragging) {

      // assume
      var context = {
        source: shape1child,
        target: shape2
      };

      expect(rules.allowed('connection.create', context)).to.be.false;

      // when
      connect.start(canvasEvent({ x: 0, y: 0 }), shape1child);

      dragging.move(canvasEvent({ x: 40, y: 30 }));
      dragging.hover(canvasEvent({ x: 10, y: 10 }, { element: shape2 }));
      dragging.end();

      // then
      expect(shape1child.outgoing.length).to.equal(0);
      expect(shape2.incoming.length).to.equal(0);
    }));


    it('should connect with start position', inject(function(connect, dragging, modeling) {

      // given
      var connectSpy = sinon.spy(modeling, 'connect');

      // when
      connect.start(canvasEvent({ x: 200, y: 0 }), shape1, { x: 200, y: 0 });

      dragging.move(canvasEvent({ x: 555, y: 153 }));

      dragging.hover(canvasEvent({ x: 555, y: 153 }, { element: shape2 }));
      dragging.end();

      // then
      var expectedHints = {
        connectionStart: { x: 200, y: 0 },
        connectionEnd: { x: 555, y: 153 }
      };

      expect(connectSpy).to.have.been.calledWith(
        shape1, shape2,
        { type: 'test:Connection' },
        expectedHints
      );
    }));


    it('should pass meta-data and hints to modeling', inject(function(connect, dragging, modeling) {

      // given
      var connectSpy = sinon.spy(modeling, 'connect');

      // assume
      // connect rule returns { type: 'test:Connection' }

      // when
      connect.start(canvasEvent({ x: 250, y: 250 }), shape1);

      dragging.move(canvasEvent({ x: 550, y: 150 }));

      dragging.hover(canvasEvent({ x: 550, y: 150 }, { element: shape2 }));
      dragging.end();

      // then
      var expectedHints = {
        connectionStart: { x: 250, y: 250 },
        connectionEnd: { x: 550, y: 150 }
      };

      expect(connectSpy).to.have.been.calledWith(
        shape1, shape2,
        { type: 'test:Connection' },
        expectedHints
      );
    }));

  });

});
