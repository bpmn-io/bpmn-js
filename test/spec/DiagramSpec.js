var Diagram = require('../../src/Diagram');

describe('diagram', function() {

  it('should bootstrap app', function() {

    var diagram = new Diagram();
  });

  it('should expose diagram services', function() {

    var diagram = new Diagram();

    diagram.inject([ 'canvas', function(canvas) {
      canvas.addShape({x: 10, y: 10, width: 30, height: 30 });
      canvas.addShape({x: 100, y: 100, width: 30, height: 30 });

      canvas.addConnection({ waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});
    }]);
  });
});