'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var moveCanvasModule = require('../../../../lib/navigation/movecanvas'),
    interactionEventsModule = require('../../../../lib/features/interaction-events');


describe('navigation/movecanvas', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ moveCanvasModule ] }));


    it('should bootstrap', inject(function(moveCanvas, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(moveCanvas).not.to.be.null;
    }));

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({ modules: [ moveCanvasModule, interactionEventsModule ] }));


    it('should silence click', inject(function(eventBus, moveCanvas, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      // click should not be triggered on
      // canvas drag
      eventBus.on('element.click', function(e) {
        console.error('click', e);
      });
    }));

  });

});
