'use strict';

require('../../TestHelper');

/* global bootstrapDiagram, inject */


var drawModule = require('../../../lib/draw');


describe('draw - Renderer', function() {

  beforeEach(bootstrapDiagram({ modules: [ drawModule ] }));


  describe('#getShapePath', function() {

    it('should return rectangular shape path', inject(function(canvas, elementFactory, renderer) {

      // given
      var shape = canvas.addShape(elementFactory.createShape({
        id: 'shapeA',
        x: 100, y: 100, width: 100, height: 100
      }));


      // when
      var path = renderer.getShapePath(shape);

      // then
      expect(path).to.eql('M100,100l100,0l0,100l-100,0z');
    }));

  });


  describe('#getConnectionPath', function() {

    it('should return line segments connection path', inject(function(canvas, renderer) {

      // given
      var shapeA = canvas.addShape({
        id: 'shapeA',
        x: 100, y: 100, width: 100, height: 100
      });

      var shapeB = canvas.addShape({
        id: 'shapeB',
        x: 300, y: 250, width: 100, height: 100
      });

      var connection = canvas.addConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 200, y: 200 }, { x: 350, y: 300 }],
        source: shapeA,
        target: shapeB
      });


      // when
      var path = renderer.getConnectionPath(connection);

      // then
      expect(path).to.eql('M150,150L200,200L350,300');
    }));


    it('should take invisible dockings into account', inject(function(canvas, renderer) {

      // given
      var shapeA = canvas.addShape({
        id: 'shapeA',
        x: 100, y: 100, width: 100, height: 100
      });

      var shapeB = canvas.addShape({
        id: 'shapeB',
        x: 300, y: 250, width: 100, height: 100
      });

      var connection = canvas.addConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150, original: { x: 130, y: 130 } }, { x: 200, y: 200 }, { x: 350, y: 300 }],
        source: shapeA,
        target: shapeB
      });


      // when
      var path = renderer.getConnectionPath(connection);

      // then
      expect(path).to.eql('M130,130L200,200L350,300');
    }));

  });

});
