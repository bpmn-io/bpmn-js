'use strict';

/* global bootstrapDiagram, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    moveModule = require('../../../../lib/features/move');


describe('features/move - MoveVisuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ moveModule, modelingModule ] }));

  var rootShape, shape;

  beforeEach(inject(function(elementFactory, canvas) {
    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape = elementFactory.createShape({
      id: 'shape',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape, rootShape);
  }));

  describe('addDragger', function(){

    it('should be exposed and return the added dragger', inject(function(moveVisuals) {

      // when
      var dragger = moveVisuals.addDragger({}, shape);

      // then
      expect(dragger).to.exist;
      expect(dragger.node).to.exist;
    }));

  });

});
