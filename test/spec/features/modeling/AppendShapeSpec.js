'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - append shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);
  }));


  describe('basic handling', function() {

    var newShape;

    beforeEach(inject(function(modeling) {

      // add new shape
      newShape = modeling.appendShape(childShape, { id: 'appended' }, { x: 200, y: 200 });
    }));


    it('should return shape', inject(function() {

      // when
      // shape added

      // then
      expect(newShape).toBeDefined();
    }));


    it('should position new shape at mid', inject(function() {

      // when
      // shape added

      // then
      expect(newShape).toBeDefined();

      expect(newShape.x + newShape.width / 2).toBe(200);
      expect(newShape.y + newShape.height / 2).toBe(200);
    }));


    it('should render shape', inject(function(elementRegistry) {

      // when
      // shape added

      // then
      expect(elementRegistry.getGraphicsByElement(newShape)).toBeDefined();
    }));


    it('should add connection', inject(function(elementRegistry) {

      // when
      // shape added

      var connection = _.find(newShape.incoming, function(c) {
        return c.source === childShape;
      });

      // then
      expect(connection).toBeDefined();
      expect(connection.parent).toBe(newShape.parent);

      expect(elementRegistry.getGraphicsByElement(connection)).toBeDefined();
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newShape.parent).toBe(null);
      expect(elementRegistry.getGraphicsByElement(newShape)).not.toBeDefined();
    }));

  });


  describe('customization', function() {

    it('should pass custom attributes connection', inject(function(modeling) {

      // given
      var connectionProperties = {
        attrs: { custom: true }
      };

      // when
      var newShape = modeling.appendShape(childShape, { id: 'appended' }, { x: 200, y: 200 }, null, connectionProperties);
      var newConnection = newShape.incoming[0];

      // then
      expect(newConnection.custom).toBe(true);
    }));

  });

});