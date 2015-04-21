'use strict';

/* global bootstrapDiagram, inject */


var resizeBounds = require('../../../../lib/features/resize/ResizeUtil').resizeBounds;

var modelingModule = require('../../../../lib/features/modeling');

var layoutModule = {
  connectionDocking: [ 'type', require('../../../../lib/layout/CroppingConnectionDocking') ]
};


describe('features/modeling - resize shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule, layoutModule ] }));


  describe('basics', function() {

    var rootShape, connection, shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100, 
        width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 200, y: 100, 
        width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);
    }));


    it('should change size of shape', inject(function(modeling) {

      // when
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 999, height: 999 });

      // when
      commandStack.undo();

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);

      // when
      commandStack.undo();

      // then
      expect(shape2.width).to.equal(100);
      expect(shape2.height).to.equal(100);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 124, height: 202 });
      modeling.resizeShape(shape2, { x: 200, y: 100, width: 999, height: 999 });

      commandStack.undo();
      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(shape2.width).to.equal(124);
      expect(shape2.height).to.equal(202);

      // when
      commandStack.redo();

      // then
      expect(shape2.width).to.equal(999);
      expect(shape2.height).to.equal(999);
    }));


    it('should crop connections', inject(function(modeling, connectionDocking, canvas, elementFactory, eventBus) {

      // given
      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 100, y: 150 },
          { x: 250, y: 150 }
        ],
        source: shape1,
        target: shape2
      });

      canvas.addConnection(connection);

      eventBus.on('commandStack.connection.layout.executed', function(e) {
          var context = e.context,
              connection;

          if (!context.cropped) {
            connection = context.connection;
            connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
            context.cropped = true;
          }
      });

      // when 
      modeling.resizeShape(shape1, { x: 50, y: 100, width: 50, height: 100 });

      //then
      expect(connection.waypoints).to.deep.eql([
          { x: 100, y: 150, original: { x: 75, y: 150 } },
          { x: 200, y: 150, original: { x: 250, y: 150 } }
        ]);
    }));

  });


  describe('resize directions', function() {

    it('should shrink sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: 5, y: -15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(105); // move right
      expect(shape.y).to.equal(100); // stay the same
    }));


    it('should expand sw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'sw', { x: -5, y: 15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(95);  // move left
      expect(shape.y).to.equal(100); // stay the same
    }));


    it('should shrink nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: 5, y: 15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(105); // move right
      expect(shape.y).to.equal(115); // move down
    }));


    it('should expand nw', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'nw', { x: -5, y: -15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(95); // move left
      expect(shape.y).to.equal(85); // move up
    }));


    it('should shrink ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: -5, y: 15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(115);
    }));


    it('should expand ne', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'ne', { x: 5, y: -15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(85);
    }));


    it('should shrink se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when shrink
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: -5, y: -15 }));

      // then
      expect(shape.height).to.equal(85);
      expect(shape.width).to.equal(95);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(100);
    }));


    it('should expand se', inject(function(modeling, elementFactory, canvas) {

      // given
      var shape = elementFactory.createShape({
        id: 'c1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      // when expand
      modeling.resizeShape(shape, resizeBounds(shape, 'se', { x: 5, y: 15 }));

      // then
      expect(shape.height).to.equal(115);
      expect(shape.width).to.equal(105);

      expect(shape.x).to.equal(100);
      expect(shape.y).to.equal(100);
    }));

  });

  
  describe('error handling', function () {

    var rootShape, shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100, 
        width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 50, y: 250, 
        width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);
    }));

    
    it('should throw error when there are missing properties', inject(function(modeling) {
      
      // when
      function resize() {
        return modeling.resizeShape(shape2, { width: 150, height: 150 });
      }

      // then
      expect(resize).to.throw('newBounds must have {x, y, width, height} properties');
    }));

  });

});
