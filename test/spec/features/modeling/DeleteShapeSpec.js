'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - #removeShape', function() {

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


  it('should remove shape', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeShape(childShape);

    // then
    expect(elementRegistry.getById(childShape.id)).not.toBeDefined();

    expect(childShape.parent).toBeNull();
    expect(parentShape.children).not.toContain(childShape);
  }));


  it('should remove incoming connection', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeShape(childShape2);

    // then
    expect(connection.parent).toBeNull();
  }));


  it('should remove outgoing connection', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeShape(childShape);

    // then
    expect(connection.parent).toBeNull();
  }));


  it('should remove children', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeShape(parentShape);

    // then
    expect(parentShape.parent).toBeNull();
    expect(childShape.parent).toBeNull();
    expect(childShape2.parent).toBeNull();
    expect(connection.parent).toBeNull();
  }));


  it('ensure revert works'), inject(function(modeling, elementRegistry, commandStack) {

    // when
    modeling.removeShape(childShape);

    // when
    commandStack.undo();

    // then
    expect(childShape.parent).toBe(parentShape);
    expect(connection.parent).toBe(parentShape);
  });

  it('should remove label', inject(function(modeling) {

    var label = modeling.createLabel(childShape, { x: 160, y: 145 });

    // when
    modeling.removeShape(childShape);

    // then
    expect(label.parent).toBeNull();
    expect(childShape.label).toBeNull();
  }));


  it('should undo remove label', inject(function(modeling, commandStack) {

    var label = modeling.createLabel(childShape, { x: 160, y: 145 });

    // when
    modeling.removeShape(childShape);
    commandStack.undo();

    // then
    expect(label.parent).toBe(parentShape);
    expect(childShape.label).toBe(label);
  }));


  it('should redo remove label', inject(function(modeling, commandStack) {

    var label = modeling.createLabel(childShape, { x: 160, y: 145 });

    // when
    modeling.removeShape(childShape);
    commandStack.undo();
    commandStack.redo();

    // then
    expect(label.parent).toBeNull();
    expect(childShape.label).toBeNull();
  }));

});
