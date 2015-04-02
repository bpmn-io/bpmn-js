'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var touchModule = require('../../../../lib/navigation/touch'),
    contextPadModule = require('../../../../lib/features/context-pad'),
    paletteModule = require('../../../../lib/features/palette');


describe('navigation/touch', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ touchModule ] }));

    it('should bootstrap', inject(function(canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

    }));

  });


  describe('integration', function() {

    describe('contextPad', function() {

      beforeEach(bootstrapDiagram({ modules: [ contextPadModule, touchModule ] }));

      it('should integrate with contextPad.create', inject(function(canvas, contextPad) {

        canvas.addShape({
          id: 'test',
          width: 100,
          height: 100,
          x: 100,
          y: 100
        });
      }));

    });

    describe('palette', function() {

      beforeEach(bootstrapDiagram({ modules: [ paletteModule, touchModule ] }));

      it('should integrate with palette.create', inject(function(canvas, palette) {

        canvas.addShape({
          id: 'test',
          width: 100,
          height: 100,
          x: 100,
          y: 100
        });

      }));

    });

  });

});
