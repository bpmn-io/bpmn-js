'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var $ = require('jquery');

var overlayModule = require('../../../../lib/features/overlays'),
    modelingModule = require('../../../../lib/features/modeling');


describe('features/overlay', function() {

  beforeEach(bootstrapDiagram({ modules: [ overlayModule, modelingModule ] }));


  describe('modeling integration', function() {

    it('should update on shape.move', inject(function(modeling, canvas, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });

      // then
      expect(html.parent().parent().position()).toEqual({
        top: 70,
        left: 30
      });

    }));


    it('should update on shape.move undo', inject(function(modeling, canvas, commandStack, overlays) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      var html = $('<div style="width: 40px; height: 40px">TEST<br/>TEST</div>');

      // add overlay to a single shape (or connection)
      overlays.add(shape, {
        html: html,
        position: {
          top: 0,
          left: 0
        }
      });

      // when
      modeling.moveShape(shape, { x: -20, y: +20 });
      commandStack.undo();

      // then
      expect(html.parent().parent().position()).toEqual({
        top: 50,
        left: 50
      });

    }));
  });

});