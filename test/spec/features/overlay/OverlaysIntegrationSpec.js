'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var overlayModule = {}; // require('../../../../lib/features/overlays');


xdescribe('features/overlay', function() {

  beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


  describe('api', function() {

    describe('#addOverlay', function() {

      it('should add overlay to single element', inject(function(overlays, canvas) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when

        // add overlay to a single shape (or connection)
        var id = overlays.addOverlay(shape, {
          show: {
            minZoom: 0.5
          },
          html: '<div class="overlay"></div>'
        });

        // then
        // expect overlay to be attached to shape

        expect(id).toBeDefined();
      }));


      it('should add overlay to a number of elements', inject(function(overlays, canvas) {

        // given
        var shapeA = canvas.addShape({
          id: 'a',
          type: 'B',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // given
        var shapeB = canvas.addShape({
          id: 'b',
          type: 'A',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // when
        // add a overlay to all elements you would like to
        var id = overlays.addOverlay({
          show: {
            minZoom: 0.5
          },
          /**
           * Attach to an element
           *
           * @param {djs.model.Base} element
           *
           * @return {String|DOMElement} if the overlay should attach to the given shape
           */
          attach: function(element) {

            if (element.type === 'A') {
              // or return null if you do not attach to the element
              return 'SOME-styled-HTML';
            }
          }
        });

        // then
        // expect overlay to be attached to shapeA but not to shapeB
        expect(id).toBeDefined();
      }));

    });


    describe('#removeOverlay', function() {

      it('should remove an overlay', inject(function(overlays, canvas) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        var id = overlays.addOverlay(shape, {
          show: {
            minZoom: 0.5
          },
          html: '<div class="overlay"></div>'
        });


        // when
        overlays.removeOverlay(id);

        // then
        // expect overlay to be removed
      }));

    });


    xdescribe('technology integration', function() {

      it('should integrate with angular', inject(function(overlays, canvas) {

        // given
        var shape = canvas.addShape({
          id: 'test',
          x: 10,
          y: 10,
          width: 100,
          height: 100
        });

        // assume $scope, $compile are present
        var $compile, $scope;

        // link element
        var element = $compile('<div class="badge">{{numCount}}</div>')($scope);

        // add overlay to a single shape (or connection)
        overlays.addOverlay(shape, {
          show: {
            minZoom: 0.5
          },
          html: element
        });
      }));

      // then
      // expect overlay to change on $scope changes
    });

  });

});