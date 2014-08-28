'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move connection', function() {

  beforeEach(Matchers.addDeepEquals);


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, sourceShape, targetShape, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    sourceShape = elementFactory.createShape({
      id: 'source',
      x: 100, y: 100, width: 100, height: 100
    });

    canvas.addShape(sourceShape, rootShape);

    targetShape = elementFactory.createShape({
      id: 'target',
      x: 300, y: 300, width: 100, height: 100
    });

    canvas.addShape(targetShape, rootShape);


    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150, original: { x: 0, y: 0 }}, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: sourceShape,
      target: targetShape
    });

    canvas.addConnection(connection, rootShape);
  }));


  it('should move', inject(function(modeling) {

    // when
    modeling.moveConnection(connection, { x: 20, y: 10 });

    // then
    expect(connection.waypoints).toDeepEqual([
      { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
    ]);
  }));


  it('should undo', inject(function(modeling, commandStack) {

    // given
    modeling.moveConnection(connection, { x: 20, y: 10 });

    // when
    commandStack.undo();

    // then
    expect(connection.waypoints).toDeepEqual([
      { x: 150, y: 150, original: { x: 0, y: 0 } }, { x: 150, y: 200 }, { x: 350, y: 150 }
    ]);
  }));


  it('should redo', inject(function(modeling, commandStack) {

    // given
    modeling.moveConnection(connection, { x: 20, y: 10 });

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(connection.waypoints).toDeepEqual([
      { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
    ]);
  }));

});