var Diagram = require('../../src/Diagram');

describe('diagram', function() {

  it('should offer #plugin API', function() {
    expect(Diagram.plugin).toBeDefined();
  });

  it('should bootstrap app', function() {

    var diagram = new Diagram({
      canvas: {
        container: undefined,
        width: 700,
        height: 500
      }
    });
  });

  it('should expose diagram services', function() {

    var diagram = new Diagram({
      canvas: {
        container: undefined,
        width: 700,
        height: 500
      }
    });

    diagram.invoke([ 'canvas', function(canvas) {
      canvas.addShape({x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({x: 100, y: 100, width: 30, height: 30 });

      canvas.addConnection({ waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});
    }]);
  });
});