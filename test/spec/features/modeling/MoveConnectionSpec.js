'use strict';


/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - move connection', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, sourceShape, targetShape, otherShape, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

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

    otherShape = elementFactory.createShape({
      id: 'other',
      x: 300, y: 100, width: 200, height: 200
    });

    canvas.addShape(otherShape, rootShape);

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
    modeling.moveConnection(connection, { x: 20, y: 10 }, otherShape);

    // then
    expect(connection.waypoints).to.eql([
      { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
    ]);

    expect(connection.parent).to.equal(otherShape);
  }));


  it('should undo', inject(function(modeling, commandStack) {

    // given
    modeling.moveConnection(connection, { x: 20, y: 10 }, otherShape);

    // when
    commandStack.undo();

    // then
    expect(connection.waypoints).to.eql([
      { x: 150, y: 150, original: { x: 0, y: 0 } }, { x: 150, y: 200 }, { x: 350, y: 150 }
    ]);

    expect(connection.parent).to.equal(rootShape);
  }));


  it('should redo', inject(function(modeling, commandStack) {

    // given
    modeling.moveConnection(connection, { x: 20, y: 10 }, otherShape);

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(connection.waypoints).to.eql([
      { x: 170, y: 160, original: { x: 20, y: 10 } }, { x: 170, y: 210 }, { x: 370, y: 160 }
    ]);

    expect(connection.parent).to.equal(otherShape);
  }));

});
