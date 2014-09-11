'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    connectModule = require('../../../../lib/features/connect');

var MockEvent = require('../../../Event');


describe('features/connect', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, connectModule ] }));


  var rootShape, shape1, shape2, shape1child;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

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

    it('should connect if allowed', inject(function(connect) {

      // when
      connect.start(new MockEvent(), shape1);
      connect.finish(new MockEvent(), shape2);

      var newConnection = shape1.outgoing[0];

      // then
      expect(newConnection).toBeDefined();
      expect(newConnection.target).toBe(shape2);
    }));


    it('should not connect if rejected', inject(function(connect, modeling) {

      // assume
      expect(modeling.canConnect(shape1child, shape2)).toBeFalsy();

      // when
      connect.start(new MockEvent(), shape1child);
      connect.finish(new MockEvent(), shape2);

      // then
      expect(shape1child.outgoing.length).toBe(0);
      expect(shape2.incoming.length).toBe(0);
    }));


    it('should expose state', inject(function(connect) {

      // assume
      expect(connect.active()).toBeFalsy();

      // when
      connect.start(new MockEvent(), shape1);

      // then
      expect(connect.active()).toBeDefined();

      // when
      connect.cancel();

      // then
      expect(connect.active()).toBeFalsy();
    }));

  });

});