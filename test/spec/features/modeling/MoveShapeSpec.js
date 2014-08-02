'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move shape', function() {

  beforeEach(Matchers.addDeepEquals);


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

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


  it('should move according to delta', inject(function(modeling) {

    // when
    modeling.moveShape(childShape, { x: -20, y: +20 });

    // then
    expect(childShape.x).toBe(90);
    expect(childShape.y).toBe(130);

    // keep old parent
    expect(childShape.parent).toBe(parentShape);
  }));


  it('should update parent', inject(function(modeling) {

    // when
    modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape);

    // then
    // update parent
    expect(childShape.parent).toBe(rootShape);
  }));


  it('should layout connections after move', inject(function(modeling) {

    // when
    modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape);

    // then
    // update parent
    expect(connection.waypoints).toDeepEqual([
      { x : 140, y : 180 }, { x : 250, y : 160 }
    ]);
  }));


  it('should undo', inject(function(modeling, commandStack) {

    // given
    modeling.moveShape(childShape, { x: -20, y: +20 }, rootShape);
    modeling.moveShape(childShape, { x: -20, y: +20 });

    // when
    commandStack.undo();

    // then
    expect(childShape.x).toBe(90);
    expect(childShape.y).toBe(130);

    expect(childShape.parent).toBe(rootShape);

    // when
    commandStack.undo();

    // then

    expect(childShape.x).toBe(110);
    expect(childShape.y).toBe(110);

    expect(childShape.parent).toBe(parentShape);
  }));

});