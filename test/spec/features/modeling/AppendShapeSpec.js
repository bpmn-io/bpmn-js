'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var find = require('lodash/collection/find');

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - append shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var diagramRoot, childShape;

  beforeEach(inject(function(elementFactory, canvas) {

    diagramRoot = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(diagramRoot);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, diagramRoot);
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
      expect(newShape).to.exist;
    }));


    it('should position new shape at mid', inject(function() {

      // when
      // shape added

      // then
      expect(newShape).to.exist;

      expect(newShape.x + newShape.width / 2).to.equal(200);
      expect(newShape.y + newShape.height / 2).to.equal(200);
    }));


    it('should render shape', inject(function(elementRegistry) {

      // when
      // shape added

      // then
      expect(elementRegistry.getGraphics(newShape)).to.exist;
    }));


    it('should add connection', inject(function(elementRegistry) {

      // when
      // shape added

      var connection = find(newShape.incoming, function(c) {
        return c.source === childShape;
      });

      // then
      expect(connection).to.exist;
      expect(connection.parent).to.equal(newShape.parent);

      expect(elementRegistry.getGraphics(connection)).to.exist;
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
      var newShape = modeling.appendShape(childShape, { id: 'appended', width: 100, height: 100 }, { x: 200, y: 200 }, null, connectionProperties);
      var newConnection = newShape.incoming[0];

      // then
      expect(newConnection.custom).to.be.true;
    }));

  });


  describe('connection create behavior', function() {


    it('should only create if not connected already', inject(function(modeling, eventBus) {

      // given
      eventBus.on('commandStack.shape.create.postExecute', function connectListener(event) {
        var context = event.context;

        // connect childShape -> shape
        modeling.connect(childShape, context.shape);
      });

      // when
      var newShape = modeling.appendShape(childShape, { id: 'appended', width: 100, height: 100 }, { x: 500, y: 200 });

      var incomingConnections = newShape.incoming;

      // then
      expect(incomingConnections.length).to.eql(1);
    }));

  });

});
