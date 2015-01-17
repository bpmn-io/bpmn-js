'use strict';

/* global bootstrapDiagram, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace');


describe('features/Replace', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule, replaceModule ] }));


  var rootShape, parentShape, originalShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    originalShape = elementFactory.createShape({
      id: 'originalShape',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(originalShape, parentShape);
  }));


  describe('#replaceElement', function() {

    it('should add new shape', inject(function(elementRegistry, replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape).toBeDefined();
    }));

    it('should delete old shape', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      expect(originalShape.parent).toBeNull();
    }));

    it('should return new shape', inject(function(elementRegistry, replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      var newShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(newShape).toBeDefined();
      expect(newShape.id).toBe('replacement');
    }));

    it('should add correct attributes to new shape', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape.x).toBe(110);
      expect(replacementShape.y).toBe(110);
      expect(replacementShape.width).toBe(200);
      expect(replacementShape.height).toBe(200);
    }));
  });


  describe('reconnect', function() {

    var sourceShape,
        targetShape,
        connection;

    beforeEach(inject(function(elementFactory, canvas, modeling) {

      sourceShape = originalShape;

      targetShape = elementFactory.createShape({
        id: 'targetShape',
        x: 290, y: 110, width: 100, height: 100
      });

      canvas.addShape(targetShape, parentShape);

      connection = modeling.createConnection(sourceShape, targetShape, {
        id: 'connection',
        waypoints: [ { x: 210, y: 160 }, { x: 290, y: 160 } ]
      }, parentShape);

      // canvas.addConnection(connection);
    }));

    it('should reconnect start', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 120,
        height: 120
      };

      // when
      var replacedShape = replace.replaceElement(sourceShape, replacement);

      // then
      expect(replacedShape.outgoing[0]).toBeDefined();
    }));


    it('should reconnect end', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 80,
        height: 80
      };

      // when
      var replacedShape = replace.replaceElement(targetShape, replacement);

      // then
      expect(replacedShape.incoming[0]).toBeDefined();
    }));
  });


  describe('undo/redo support', function() {

    it('should undo replace', inject(function(elementFactory, replace, elementRegistry, commandStack) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };
      replace.replaceElement(originalShape, replacement);

      // when
      commandStack.undo();

      // then
      var shape = elementRegistry.get('originalShape');
      expect(shape.width).toBe(100);

    }));


    it('should redo', inject(function(elementFactory, replace, elementRegistry, commandStack) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };
      replace.replaceElement(originalShape, replacement);

      var replacementShape = elementRegistry.get('replacement');
      var replacement2 = {
        id: 'replacement2',
        width: 280,
        height: 280
      };
      replace.replaceElement(replacementShape, replacement2);

      // when
      commandStack.undo();
      commandStack.undo();

      commandStack.redo();
      commandStack.redo();

      // then
      var redoShape = elementRegistry.get('replacement2');
      expect(redoShape.width).toBe(280);
    }));
  });

});
