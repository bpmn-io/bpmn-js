'use strict';

var Model = require('../../../lib/model');


describe('model', function() {


  it('should instantiate connection', function() {

    // given
    var waypoints = [ { x: 0, y: 0 }, { x: 100, y: 100 } ];

    // when
    var connection = Model.create('connection', {
      waypoints: waypoints
    });

    // then
    expect(connection.waypoints).toBe(waypoints);

    expect(connection instanceof Model.Connection).toBe(true);
  });


  it('should instantiate shape', function() {

    // given
    var x = 10, y = 20, width = 100, height = 100;

    // when
    var shape = Model.create('shape', {
      x: x,
      y: y,
      width: width,
      height: height
    });

    // then
    expect(shape.x).toBe(x);
    expect(shape.y).toBe(y);
    expect(shape.width).toBe(width);
    expect(shape.height).toBe(height);

    expect(shape instanceof Model.Shape).toBe(true);
  });


  it('should wire relationships', function() {

    // when
    var parentShape = Model.create('shape');

    var shape1 = Model.create('shape', { parent: parentShape });
    var shape2 = Model.create('shape', { parent: parentShape });

    var shape1Label = Model.create('label', { parent: parentShape, labelTarget: shape1 });

    var connection = Model.create('connection', { parent: parentShape, source: shape1, target: shape2 });
    var connectionLabel = Model.create('label', { parent: parentShape, labelTarget: connection });

    // then

    // expect parent to be wired
    expect(parentShape.children).toContain(shape1);
    expect(parentShape.children).toContain(shape2);
    expect(parentShape.children).toContain(shape1Label);
    expect(parentShape.children).toContain(connection);
    expect(parentShape.children).toContain(connectionLabel);

    // expect labels to be wired
    expect(shape1.label).toBe(shape1Label);
    expect(connection.label).toBe(connectionLabel);

    // expect outgoing / incoming to be wired
    expect(shape1.outgoing).toContain(connection);
    expect(shape2.incoming).toContain(connection);
  });

});
