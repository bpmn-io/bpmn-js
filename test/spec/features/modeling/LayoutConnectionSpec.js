'use strict';

/* global bootstrapDiagram, inject */

var customModelingModule = require('./custom');


describe('features/modeling - layout connection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      customModelingModule
    ]
  }));


  describe('layout waypoints', function() {

    var rootShape, sourceShape, targetShape, connection;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      sourceShape = elementFactory.createShape({
        id: 'source',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'target',
        x: 300, y: 300, width: 100, height: 100
      });

      canvas.addShape(targetShape);


      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 150, y: 150, original: { x: 125, y: 125 } },
          { x: 150, y: 200 },
          { x: 350, y: 150, original: { x: 325, y: 125 } }
        ],
        source: sourceShape,
        target: targetShape
      });

      canvas.addConnection(connection);
    }));


    it('should execute, adding new original waypoints', inject(function(modeling) {
      // when
      modeling.layoutConnection(connection);

      // then
      expect(connection.waypoints).to.eql([
        { x: 200, y: 200, original: { x: 150, y: 150 } },
        { x: 300, y: 300, original: { x: 350, y: 350 } }
      ]);
    }));


    it('should execute with custom connectionStart', inject(function(modeling) {
      // given
      var hints = {
        connectionStart: { x: 100, y: 100 }
      };

      // when
      modeling.layoutConnection(connection, hints);

      // then
      expect(connection.waypoints).to.eql([
        { x: 150, y: 150, original: { x: 100, y: 100 } },
        { x: 300, y: 300, original: { x: 350, y: 350 } }
      ]);
    }));


    it('should execute with custom connectionEnd', inject(function(modeling) {
      // given
      var hints = {
        connectionEnd: { x: 400, y: 400 }
      };

      // when
      modeling.layoutConnection(connection, hints);

      // then
      expect(connection.waypoints).to.eql([
        { x: 200, y: 200, original: { x: 150, y: 150 } },
        { x: 350, y: 350, original: { x: 400, y: 400 } }
      ]);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.layoutConnection(connection);

      // when
      commandStack.undo();

      // then
      expect(connection.waypoints).to.eql([
        { x: 150, y: 150, original: { x: 125, y: 125 } },
        { x: 150, y: 200 },
        { x: 350, y: 150, original: { x: 325, y: 125 } }
      ]);
    }));
  });


  describe('z-order handling', function() {

    var container1,
        container2,
        sourceShape,
        targetShape,
        connection;

    beforeEach(inject(function(elementFactory, canvas) {

      sourceShape = elementFactory.createShape({
        id: 'source',
        x: 10, y: 10, width: 50, height: 50
      });

      canvas.addShape(sourceShape);

      targetShape = elementFactory.createShape({
        id: 'target',
        x: 200, y: 10, width: 50, height: 50
      });

      canvas.addShape(targetShape);


      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [ { x: 35, y: 35 }, { x: 225, y: 35 } ],
        source: sourceShape,
        target: targetShape
      });

      canvas.addConnection(connection);

      container1 = elementFactory.createShape({
        id: 'container1',
        x: 100, y: 100, width: 300, height: 300
      });

      canvas.addShape(container1);

      container2 = elementFactory.createShape({
        id: 'container2',
        x: 120, y: 120, width: 200, height: 200
      });

      canvas.addShape(container2, container1);
    }));


    describe('keep z-index after moving target to nested child', function() {

      it('should execute', inject(function(modeling) {

        // when
        modeling.moveShape(targetShape, { x: 0, y: 200 }, container2);

        // then
        var connectionSiblings = connection.parent.children;

        expect(connectionSiblings).to.eql([
          sourceShape,
          connection,
          container1
        ]);
      }));


      it('should undo', inject(function(modeling, commandStack) {

        // given
        modeling.moveShape(targetShape, { x: 0, y: 200 }, container2);

        // when
        commandStack.undo();

        // then
        var connectionSiblings = connection.parent.children;

        expect(connectionSiblings).to.eql([
          sourceShape,
          targetShape,
          connection,
          container1
        ]);
      }));

    });

  });

});
