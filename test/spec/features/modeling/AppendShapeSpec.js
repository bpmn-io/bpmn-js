'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var find = require('lodash/collection/find');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - append shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape;

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
      newShape = modeling.appendShape(childShape, { id: 'appended', width: 50, height: 50 }, { x: 200, y: 200 });
    }));


    it('should return shape', inject(function() {

      // when
      // shape added

      // then
      expect(newShape).to.be.defined;
    }));


    it('should position new shape at mid', inject(function() {

      // when
      // shape added

      // then
      expect(newShape).to.be.defined;

      expect(newShape.x + newShape.width / 2).to.equal(200);
      expect(newShape.y + newShape.height / 2).to.equal(200);
    }));


    it('should render shape', inject(function(elementRegistry) {

      // when
      // shape added

      // then
      expect(elementRegistry.getGraphics(newShape)).to.be.defined;
    }));


    it('should add connection', inject(function(elementRegistry) {

      // when
      // shape added

      var connection = find(newShape.incoming, function(c) {
        return c.source === childShape;
      });

      // then
      expect(connection).to.be.defined;
      expect(connection.parent).to.equal(newShape.parent);

      expect(elementRegistry.getGraphics(connection)).to.be.defined;
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newShape.parent).to.be.null;
      expect(elementRegistry.getGraphics(newShape)).to.not.be.defined;
    }));

  });


  describe('customization', function() {

    it('should pass custom attributes connection', inject(function(modeling) {

      // given
      var connectionProperties = {
        custom: true
      };

      // when
      var newShape = modeling.appendShape(childShape, { id: 'appended' }, { x: 200, y: 200 }, null, connectionProperties);
      var newConnection = newShape.incoming[0];

      // then
      expect(newConnection.custom).to.be.true;
    }));

  });

});
