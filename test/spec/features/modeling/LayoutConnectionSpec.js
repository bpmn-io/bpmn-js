'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - layout connection', function() {

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
      waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
      source: sourceShape,
      target: targetShape
    });

    canvas.addConnection(connection, rootShape);
  }));


  it('should layout', inject(function(modeling) {

    // when
    modeling.layoutConnection(connection);

    // then
    expect(connection.waypoints).toDeepEqual([
      { x: 150, y: 150 }, { x: 350, y: 350 }
    ]);
  }));


  it('should undo', inject(function(modeling, commandStack) {

    // given
    modeling.layoutConnection(connection);

    // when
    commandStack.undo();

    // then
    expect(connection.waypoints).toDeepEqual([
      { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 }
    ]);
  }));

});