'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var zoomScrollModule = require('../../../../lib/navigation/zoomscroll');


describe('navigation/zoomscroll', function() {

  beforeEach(bootstrapDiagram({ modules: [ zoomScrollModule ] }));


  describe('bootstrap', function() {

    it('should bootstrap', inject(function(zoomScroll, canvas) {

      canvas.addShape({
        id: 'test',
        width: 100,
        height: 100,
        x: 100,
        y: 100
      });

      expect(zoomScroll).not.toBe(null);
    }));

  });

});