'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var _ = require('lodash');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - create label', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

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
      x: 100, y: 100, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 300, y: 100, width: 100, height: 100
    });

    canvas.addShape(childShape2, parentShape);


    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 150, y: 150 }, { x: 350, y: 150 } ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, parentShape);
  }));


  describe('on shapes', function() {

    var newLabel;

    beforeEach(inject(function(modeling) {

      // add new shape
      newLabel = modeling.createLabel(childShape, { x: 160, y: 250 });
    }));


    it('should return label', inject(function() {

      // when
      // label added

      // then
      expect(newLabel).toBeDefined();
      expect(newLabel.parent).toBe(parentShape);
    }));


    it('should render label', inject(function(elementRegistry) {

      // when
      // label added

      // then
      expect(elementRegistry.getGraphicsByElement(newLabel)).toBeDefined();
    }));


    it('should maintain shape relationship', inject(function() {

      // when
      // label added

      // then
      expect(newLabel.labelTarget).toBe(childShape);
      expect(childShape.label).toBe(newLabel);
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newLabel.parent).toBeFalsy();
      expect(newLabel.labelTarget).toBeFalsy();
      expect(childShape.label).toBeFalsy();

      expect(elementRegistry.getGraphicsByElement(newLabel)).not.toBeDefined();
    }));

  });


  describe('on connections', function() {

    var newLabel;

    beforeEach(inject(function(modeling) {

      // add new shape
      newLabel = modeling.createLabel(connection, { x: 160, y: 250 });
    }));


    it('should return label', inject(function() {

      // when
      // label added

      // then
      expect(newLabel).toBeDefined();
    }));


    it('should render label', inject(function(elementRegistry) {

      // when
      // label added

      // then
      expect(elementRegistry.getGraphicsByElement(newLabel)).toBeDefined();
    }));


    it('should maintain shape relationship', inject(function() {

      // when
      // label added

      // then
      expect(newLabel.labelTarget).toBe(connection);
      expect(connection.label).toBe(newLabel);
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newLabel.parent).toBeFalsy();
      expect(newLabel.labelTarget).toBeFalsy();
      expect(connection.label).toBeFalsy();

      expect(elementRegistry.getGraphicsByElement(newLabel)).not.toBeDefined();
    }));

  });

});