'use strict';

/* global bootstrapDiagram, inject */

var forEach = require('lodash/collection/forEach');


var touchInteractionModule = require('../../../../lib/features/touch');


describe('features/touch', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ touchInteractionModule ] }));

    it('should bootstrap diagram with component', inject(function(eventBus, canvas) {

      // given
      var touchEvents = [
        'shape.tap',
        'shape.dbltap',
        'shape.click',
        'shape.dblclick',
        'connection.tap',
        'connection.dbltap',
        'connection.click',
        'connection.dblclick',
        'canvas.click',
        'canvas.tap'
      ];

      forEach(touchEvents, function(eventName) {
        eventBus.on(eventName, function(e) {
          console.log(eventName, e);
        });
      });

      canvas.addShape({ id: 's1', x: 100, y: 200, width: 50, height: 50 });
      canvas.addShape({ id: 's2', x: 300, y: 200, width: 50, height: 50 });

      canvas.addConnection({ id: 'c1', waypoints: [ { x: 150, y: 225 }, { x: 300, y: 225 } ] });

    }));

  });

});
