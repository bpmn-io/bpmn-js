'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - remove connection', function() {

  beforeEach(Matchers.addDeepEquals);


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas, elementRegistry) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 200, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  it('should remove connection', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeConnection(connection);

    // then
    expect(connection.parent).toBeNull();
  }));


  it('should remove label', inject(function(modeling) {

    var label = modeling.createLabel(connection, { x: 160, y: 145 });

    // when
    modeling.removeConnection(connection);

    // then
    expect(label.parent).toBeNull();
    expect(connection.label).toBeNull();
  }));


  it('should undo remove label', inject(function(modeling, commandStack) {

    var label = modeling.createLabel(connection, { x: 160, y: 145 });

    // when
    modeling.removeConnection(connection);
    commandStack.undo();

    // then
    expect(label.parent).toBe(parentShape);
    expect(connection.label).toBe(label);
  }));


  it('should redo remove label', inject(function(modeling, commandStack) {

    var label = modeling.createLabel(connection, { x: 160, y: 145 });

    // when
    modeling.removeConnection(connection);
    commandStack.undo();
    commandStack.redo();

    // then
    expect(label.parent).toBeNull();
    expect(connection.label).toBeNull();
  }));


  it('should clean up incoming/outgoing on connected shapes ', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeConnection(connection);

    // then
    expect(childShape.outgoing).not.toContain(connection);
    expect(connection.source).toBeNull();

    expect(childShape2.incoming).not.toContain(connection);
    expect(connection.target).toBeNull();
  }));


  describe('undo support', function() {

    it('should revert', inject(function (modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);

      // when
      commandStack.undo();

      // then
      expect(connection.parent).toBe(parentShape);
    }));


    it('should restore correct source/target', inject(function (modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);

      // when
      commandStack.undo();

      // then
      expect(childShape.outgoing).toContain(connection);
      expect(connection.source).toBe(childShape);

      expect(childShape2.incoming).toContain(connection);
      expect(connection.target).toBe(childShape2);
    }));


    it('should restore reference after multiple undo', inject(function (modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);
      modeling.removeShape(childShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(childShape.outgoing).toContain(connection);
      expect(childShape2.incoming).toContain(connection);
    }));
  });
});
