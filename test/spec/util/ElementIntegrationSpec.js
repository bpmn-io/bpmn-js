'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */

var keys = require('lodash/object/keys');

var Elements = require('../../../lib/util/Elements');

var modelingModule = require('../../../lib/features/modeling');


describe('util/Elements', function() {

  describe('#getEnclosedElements', function() {

    beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

    var shape1, shape2, shape3, shape3a, shape3b, shape4;
    var connection1, connection2, connection2a, connection2b, connection3;
    var elements;

    beforeEach(inject(function(elementFactory, canvas, elementRegistry) {

      shape1 = elementFactory.createRoot({
        id: 'shape1',
        x: 10,
        y: 10,
        height: 50,
        width:  50
      });
      canvas.addShape(shape1);

      shape2 = elementFactory.createRoot({
        id: 'shape2',
        x: 100,
        y: 10,
        height: 50,
        width:  50
      });
      canvas.addShape(shape2);

      shape3 = elementFactory.createRoot({
        id: 'shape3',
        x: 190,
        y: 10,
        height: 50,
        width:  50
      });
      canvas.addShape(shape3);

      shape4 = elementFactory.createRoot({
        id: 'shape4',
        x: 280,
        y: 10,
        height: 50,
        width:  150
      });
      canvas.addShape(shape4);

      shape3a = elementFactory.createRoot({
        id: 'shape3a',
        x: 190,
        y: 100,
        height: 50,
        width:  50
      });
      canvas.addShape(shape3a);

      shape3b = elementFactory.createRoot({
        id: 'shape3b',
        x: 190,
        y: 190,
        height: 100,
        width:  50
      });
      canvas.addShape(shape3b);

      connection1 = elementFactory.createRoot({
        id: 'connection1',
        waypoints: [ { x: 60, y: 35 }, {x: 100, y: 35} ]
      });
      canvas.addConnection(connection1);

      connection2 = elementFactory.createRoot({
        id: 'connection2',
        waypoints: [ { x: 150, y: 35 }, {x: 190, y: 35} ]
      });
      canvas.addConnection(connection2);

      connection3 = elementFactory.createRoot({
        id: 'connection3',
        waypoints: [ { x: 240, y: 35 }, {x: 280, y: 35} ]
      });
      canvas.addConnection(connection3);

      connection2a = elementFactory.createRoot({
        id: 'connection2a',
        waypoints: [ { x: 215, y: 60 }, {x: 215, y: 100} ]
      });
      canvas.addConnection(connection2a);

      connection2b = elementFactory.createRoot({
        id: 'connection2b',
        waypoints: [ { x: 215, y: 150 }, {x: 215, y: 190} ]
      });
      canvas.addConnection(connection2b);

      elements = elementRegistry.filter(function(element) {
        return element;
      });
    }));



    it('should return elements east of x', inject(function() {

      // given
      var bbox = {
        x: 200
      };

      // when
      var filteredElements = Elements.getEnclosedElements(elements, bbox);

      // then
      var ids = keys(filteredElements);
      expect(ids).to.eql([ 'shape4', 'connection3', 'connection2a', 'connection2b' ]);
    }));

    it('should return elements south of y', inject(function() {

      // given
      var bbox = {
        y: 40
      };

      // when
      var filteredElements = Elements.getEnclosedElements(elements, bbox);

      // then
      var ids = keys(filteredElements);
      expect(ids).to.eql([ 'shape3a', 'shape3b', 'connection2a', 'connection2b' ]);
    }));

    it('should return elements east of x and south of y', inject(function() {

      // given
      var bbox = {
        x: 0,
        y: 100
      };

      // when
      var filteredElements = Elements.getEnclosedElements(elements, bbox);

      // then
      var ids = keys(filteredElements);
      expect(ids).to.eql([ 'shape3b', 'connection2b' ]);
    }));

    it('should return elements within the bbox', inject(function() {

      // given
      var bbox = {
        x: 0,
        y: 0,
        width:  250,
        height: 200,
      };

      // when
      var filteredElements = Elements.getEnclosedElements(elements, bbox);

      // then
      var ids = keys(filteredElements);
      expect(ids).to.eql([
        'shape1',
        'shape2',
        'shape3',
        'shape3a',
        'connection1',
        'connection2',
        'connection2a',
        'connection2b'
      ]);
    }));


    describe('edge cases', function() {

      it('should return elements within the bbox with negative source', inject(function() {

        // given
        var bbox = {
          x: -300,
          y: -300,
          width:  550,
          height: 500,
        };

        // when
        var filteredElements = Elements.getEnclosedElements(elements, bbox);

        // then
        var ids = keys(filteredElements);
        expect(ids).to.eql([
          'shape1',
          'shape2',
          'shape3',
          'shape3a',
          'connection1',
          'connection2',
          'connection2a',
          'connection2b'
        ]);
      }));

      it('should return elements at negative positions', inject(function(elementRegistry, elementFactory, canvas) {

        // given
        var shape0 = elementFactory.createRoot({
          id: 'shape0',
          x: -100,
          y: -10,
          height: 50,
          width:  50
        });
        canvas.addShape(shape0);


        var bbox = {
          x: -110,
          y: -20,
          width:  180,
          height: 90,
        };
        elements = elementRegistry.filter(function(element) {
          return element;
        });

        // when
        var filteredElements = Elements.getEnclosedElements(elements, bbox);

        // then
        var ids = keys(filteredElements);
        expect(ids).to.eql([
          'shape1',
          'shape0'
        ]);
      }));

      it('should not return elements that cross bbox boundaries', inject(function() {

        // given
        var bbox = {
          x: 190,
          y: 0,
          width:  200,
          height: 100,
        };

        // when
        var filteredElements = Elements.getEnclosedElements(elements, bbox);

        // then
        var ids = keys(filteredElements);
        expect(ids).to.eql([ 'connection3' ]);
      }));
    });
  });

});
