'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../../Matchers');


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - resize shape', function() {

  beforeEach(Matchers.addDeepEquals);


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, shape1, shape2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 50, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 50, y: 250, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);
  }));


  it('should change size of shape', inject(function(modeling) {

    // when
    modeling.resizeShape(shape2, { width: 124, height: 202 });

    // then
    expect(shape2.width).toBe(124);
    expect(shape2.height).toBe(202);
  }));


  it('should undo', inject(function(modeling, commandStack) {

    // given
    modeling.resizeShape(shape2, { width: 124, height: 202 });
    modeling.resizeShape(shape2, { width: 999, height: 999 });

    // when
    commandStack.undo();

    // then
    expect(shape2.width).toBe(124);
    expect(shape2.height).toBe(202);

    // when
    commandStack.undo();

    // then
    expect(shape2.width).toBe(100);
    expect(shape2.height).toBe(100);
  }));

  it('should redo', inject(function(modeling, commandStack) {

    // given
    modeling.resizeShape(shape2, { width: 124, height: 202 });
    modeling.resizeShape(shape2, { width: 999, height: 999 });

    commandStack.undo();
    commandStack.undo();

    // when
    commandStack.redo();

    // then
    expect(shape2.width).toBe(124);
    expect(shape2.height).toBe(202);

    // when
    commandStack.redo();

    // then
    expect(shape2.width).toBe(999);
    expect(shape2.height).toBe(999);
  }));

});
