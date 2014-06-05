'use strict';


var EventBus = require('../../../lib/core/EventBus'),
    ElementRegistry = require('../../../lib/core/ElementRegistry');


describe('elementRegistry', function() {

  var eventBus, shapes;

  beforeEach(function() {
    eventBus = new EventBus();
    shapes = new ElementRegistry(eventBus);
  });


  it('should register shape on add', function() {

    // given
    var shape = { id: 's0' },
        gfx = { id: 'g0' };

    // when
    eventBus.fire('shape.added', { element: shape, gfx: gfx });

    // then
    expect(shapes.getShapeByGraphics(gfx)).toBe(shape);
    expect(shapes.getShapeByGraphics(gfx.id)).toBe(shape);

    expect(shapes.getShapeById(shape.id)).toBe(shape);

    expect(shapes.getGraphicsByShape(shape)).toBe(gfx);
    expect(shapes.getGraphicsByShape(shape.id)).toBe(gfx);
  });


  it('should unregister shape on remove', function() {

    // given
    var shape = { id: 's0' },
        gfx = { id: 'g0' };

    // when
    eventBus.fire('shape.added', { element: shape, gfx: gfx });
    eventBus.fire('shape.removed', { element: shape, gfx: gfx });

    // then
    expect(shapes.getShapeByGraphics(gfx)).not.toBeDefined();
    expect(shapes.getShapeByGraphics(gfx.id)).not.toBeDefined();

    expect(shapes.getShapeById(shape.id)).not.toBeDefined();

    expect(shapes.getGraphicsByShape(shape)).not.toBeDefined();
    expect(shapes.getGraphicsByShape(shape.id)).not.toBeDefined();
  });

});