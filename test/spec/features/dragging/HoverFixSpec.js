'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var assign = require('lodash/object/assign'),
    omit = require('lodash/object/omit');

var dragModule = require('../../../../lib/features/dragging');


describe('features/dragging - HoverFix', function() {

  beforeEach(bootstrapDiagram({ modules: [ dragModule ] }));

  beforeEach(inject(function(canvas) {
    canvas.addShape({ id: 'shape', x: 10, y: 10, width: 50, height: 50 });
  }));


  describe('behavior', function() {

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should ensure hover', inject(function(dragging, hoverFix) {

      // given
      var fixed = false;

      hoverFix.ensureHover = function(event) {
        fixed = true;
      };

      // when
      dragging.init(canvasEvent({ x: 10, y: 10 }), 'foo');
      dragging.move(canvasEvent({ x: 30, y: 20 }));
      dragging.move(canvasEvent({ x: 5, y: 10 }));

      // then
      expect(fixed).to.be.true;
    }));

  });

});
