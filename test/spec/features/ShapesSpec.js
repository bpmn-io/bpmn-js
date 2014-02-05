var Events = require('../../../src/core/Events');
var Shapes = require('../../../src/features/Shapes');

describe('Shapes', function() {
  var events, shapes;

  beforeEach(function() {
    events = new Events();
    shapes = new Shapes(events);
  });

  it('should register shape on add', function() {
    
    // given
    var shape = {},
        gfx = {};

    // when
    events.fire('shape.added', { element: shape, gfx: gfx });

    // then
    expect(shape.id).toBeDefined();
    expect(gfx.id).toBeDefined();
  });

  it('should register shape on add', function() {
    
    // given
    var shape = {},
        gfx = {};

    // when
    events.fire('shape.added', { element: shape, gfx: gfx });

    // then
    expect(shapes.getShapeByGraphics(gfx)).toBe(shape);
    expect(shapes.getShapeByGraphics(gfx.id)).toBe(shape);

    expect(shapes.getShapeById(shape.id)).toBe(shape);

    expect(shapes.getGraphicsByShape(shape)).toBe(gfx);
    expect(shapes.getGraphicsByShape(shape.id)).toBe(gfx);
  });

  it('should unregister shape on remove', function() {
    
    // given
    var shape = {},
        gfx = {};

    // when
    events.fire('shape.added', { element: shape, gfx: gfx });
    events.fire('shape.removed', { element: shape, gfx: gfx });

    // then
    expect(shapes.getShapeByGraphics(gfx)).not.toBeDefined();
    expect(shapes.getShapeByGraphics(gfx.id)).not.toBeDefined();

    expect(shapes.getShapeById(shape.id)).not.toBeDefined();

    expect(shapes.getGraphicsByShape(shape)).not.toBeDefined();
    expect(shapes.getGraphicsByShape(shape.id)).not.toBeDefined();
  });
});