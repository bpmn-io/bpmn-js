'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - create label', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, childShape, childShape2, connection;

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
      expect(newLabel).to.exist;
      expect(newLabel.parent).to.equal(parentShape);
    }));


    it('should render label', inject(function(elementRegistry) {

      // when
      // label added

      // then
      expect(elementRegistry.getGraphics(newLabel)).to.exist;
    }));


    it('should maintain shape relationship', inject(function() {

      // when
      // label added

      // then
      expect(newLabel.labelTarget).to.equal(childShape);
      expect(childShape.label).to.equal(newLabel);
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newLabel.parent).to.be.null;
      expect(newLabel.labelTarget).to.be.null;
      expect(childShape.label).to.not.exist;

      expect(elementRegistry.getGraphics(newLabel)).to.not.be.defined;
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
      expect(newLabel).to.exist;
    }));


    it('should render label', inject(function(elementRegistry) {

      // when
      // label added

      // then
      expect(elementRegistry.getGraphics(newLabel)).to.exist;
    }));


    it('should maintain shape relationship', inject(function() {

      // when
      // label added

      // then
      expect(newLabel.labelTarget).to.equal(connection);
      expect(connection.label).to.equal(newLabel);
    }));


    it('should undo', inject(function(commandStack, elementRegistry) {

      // given
      // shape added

      // when
      commandStack.undo();

      // then
      expect(newLabel.parent).to.be.null;
      expect(newLabel.labelTarget).to.be.null;
      expect(connection.label).to.not.exist;

      expect(elementRegistry.getGraphics(newLabel)).to.not.be.defined;
    }));

  });

});
