'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var modelingModule = require('../../../../lib/features/modeling');

describe('features/modeling - replace shape', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

  var root, shape, child1, child2;

  beforeEach(inject(function(elementFactory, canvas, modeling) {

    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    parent = elementFactory.createShape({
      id: 'parent',
      x: 20, y: 20, width: 200, height: 200
    });

    child1 = elementFactory.createShape({
      id: 'child1',
      x: 30, y: 30, width: 50, height: 50
    });

    child2 = elementFactory.createShape({
      id: 'child2',
      x: 90, y: 90, width: 50, height: 50
    });

    canvas.addShape(parent, root);
    canvas.addShape(child1, parent);
    canvas.addShape(child2, parent);
  }));


  it('should move children per default', inject(function(elementFactory, modeling) {

    // when
    var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
    var newShape = modeling.replaceShape(parent, newShapeData);

    // then
    expect(newShape.children).to.have.length(2);
  }));


  it('should move children when moveChildren=true', inject(function(elementFactory, modeling) {

    // when
    var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
    var newShape = modeling.replaceShape(parent, newShapeData, { moveChildren: true });

    // then
    expect(newShape.children).to.have.length(2);
  }));


  it('should remove children when moveChildren=false', inject(function(elementFactory, modeling) {

    // when
    var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
    var newShape = modeling.replaceShape(parent, newShapeData, { moveChildren: false });

    // then
    expect(newShape.children).to.be.empty;

  }));

});
