var Diagram = require('../../lib/Diagram');

describe('diagram', function() {

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    container.parentNode.removeChild(container);
  });

  describe('static', function() {
    
    it('should offer #plugin API', function() {
      expect(Diagram.plugin).toBeDefined();
    });

  });


  describe('runtime', function() {

    it('should bootstrap app', function() {

      var diagram = new Diagram({
        canvas: {
          container: container,
          width: 700,
          height: 500
        }
      });
    });


    it('should expose diagram services', function() {

      var diagram = new Diagram({
        canvas: {
          container: container,
          width: 700,
          height: 500
        }
      });

      diagram.invoke([ 'canvas', function(canvas) {
        canvas
          .addShape({ id: 's1', x: 10, y: 10, width: 30, height: 30 })
          .addShape({ id: 's2', x: 100, y: 100, width: 30, height: 30 });

        canvas.addConnection({ id: 'c1', waypoints: [ { x: 25, y: 25 }, {x: 115, y: 115} ]});
      }]);
    });

  });

});