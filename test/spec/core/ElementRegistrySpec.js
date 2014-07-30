'use strict';


var EventBus = require('../../../lib/core/EventBus'),
    ElementRegistry = require('../../../lib/core/ElementRegistry');


describe('elementRegistry', function() {

  var eventBus, shapes;

  beforeEach(function() {
    eventBus = new EventBus();
    shapes = new ElementRegistry(eventBus);
  });


  it('should register shape on <shape.add>', function() {

    // given
    var shape = { id: 's0' },
        gfx = { id: 'g0' };

    // when
    eventBus.fire('shape.add', { element: shape, gfx: gfx });

    // then
    expect(shapes.getByGraphics(gfx)).toBe(shape);
    expect(shapes.getByGraphics(gfx.id)).toBe(shape);

    expect(shapes.getById(shape.id)).toBe(shape);

    expect(shapes.getGraphicsByElement(shape)).toBe(gfx);
    expect(shapes.getGraphicsByElement(shape.id)).toBe(gfx);
  });


  it('should unregister shape on <shape.removed>', function() {

    // given
    var shape = { id: 's0' },
        gfx = { id: 'g0' };

    // when
    eventBus.fire('shape.add', { element: shape, gfx: gfx });
    eventBus.fire('shape.removed', { element: shape, gfx: gfx });

    // then
    expect(shapes.getByGraphics(gfx)).not.toBeDefined();
    expect(shapes.getByGraphics(gfx.id)).not.toBeDefined();

    expect(shapes.getById(shape.id)).not.toBeDefined();

    expect(shapes.getGraphicsByElement(shape)).not.toBeDefined();
    expect(shapes.getGraphicsByElement(shape.id)).not.toBeDefined();
  });

});