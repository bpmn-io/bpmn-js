'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    lassoToolModule = require('../../../../lib/features/lasso-tool'),
    draggingModule = require('../../../../lib/features/dragging');


describe('features/lasso-tool', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule, lassoToolModule, draggingModule ] }));


  var rootShape, childShape, childShape2, childShape3, childShape4;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape, rootShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 180, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape2, rootShape);

    childShape3 = elementFactory.createShape({
      id: 'child3',
      x: 240, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape3, rootShape);

    childShape4 = elementFactory.createShape({
      id: 'child4',
      x: 300, y: 110, width: 50, height: 100
    });

    canvas.addShape(childShape4, rootShape);
  }));


  describe('#select', function() {

    it('should select elements in bbox', inject(function(lassoTool, selection) {

      // given
      var elements = [childShape, childShape2, childShape3, childShape4];
      var bbox = {
        x: 175,
        y: 0,
        width: 120,
        height: 220
      };


      // when
      lassoTool.select(elements, bbox);

      // then
      var selectedElements = selection.get();

      expect(selectedElements.length).to.equal(2);
      expect(selectedElements[0]).to.equal(childShape2);
      expect(selectedElements[1]).to.equal(childShape3);
    }));
  });


  describe('visuals', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should show lasso box', inject(function(lassoTool, canvas, dragging) {

      // when
      lassoTool.activateLasso(canvasEvent({ x: 100, y: 100 }));
      dragging.move(canvasEvent({ x: 200, y: 300 }));

      // then
      expect(canvas._svg.node.querySelector('.djs-lasso-overlay')).to.exist;
    }));


    it('should select after lasso', inject(function(lassoTool, dragging, selection, elementRegistry) {

      // when
      lassoTool.activateLasso(canvasEvent({ x: 100, y: 100 }));
      dragging.move(canvasEvent({ x: 200, y: 300 }));
      dragging.end();

      // then
      expect(selection.get()).to.eql([ elementRegistry.get('child') ]);
    }));

  });

});
