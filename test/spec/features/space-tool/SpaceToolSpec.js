'use strict';

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */

var spaceTool = require('../../../../lib/features/space-tool'),
    modelingModule = require('../../../../lib/features/modeling'),
    autoResizeModule = require('../../../../lib/features/auto-resize'),
    isMac = require('../../../../lib/util/Mouse').isMac,
    rulesModule = require('./rules');

var keyModifier = isMac() ? { metaKey: true } : { ctrlKey: true };


describe('features/space-tool', function() {

  describe('create/remove space', function() {

    beforeEach(bootstrapDiagram({
      modules: [ spaceTool, modelingModule, rulesModule ]
    }));

    var childShape, childShape2, connection;

    beforeEach(inject(function(elementFactory, canvas) {

      childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110,
        width: 100, height: 100
      });

      canvas.addShape(childShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 400, y: 250,
        width: 100, height: 100
      });

      canvas.addShape(childShape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 160, y: 160 },
          { x: 450, y: 300 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection);
    }));


    describe('basics', function() {

      it('should expose spaceTool', inject(function(spaceTool) {
        expect(spaceTool).to.exist;
      }));


      it('should reactivate after usage', inject(function(canvas, spaceTool, dragging) {
        var context;

        // when
        spaceTool.activateSelection(canvasEvent({ x: 100, y: 225 }));

        dragging.move(canvasEvent({ x: 100, y: 250 }, keyModifier));
        dragging.end();

        context = dragging.context();

        // then space tool should still be active
        expect(context.prefix).to.eql('spaceTool');
        expect(context.active).to.be.true;

        expect(spaceTool.isActive()).to.be.true;
      }));


      it('should not be active on cancel', inject(function(canvas, spaceTool, dragging) {
        var context;

        // when
        spaceTool.activateSelection(canvasEvent({ x: 100, y: 225 }));

        dragging.move(canvasEvent({ x: 100, y: 250 }, keyModifier));
        dragging.end();

        dragging.cancel();

        context = dragging.context();

        // then
        expect(context).to.not.exist;

        expect(spaceTool.isActive()).to.not.exist;
      }));

    });


    describe('create space behaviour', function() {

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should show crosshair once activated', inject(function(spaceTool, dragging, canvas, eventBus) {

        // given
        spaceTool.activateSelection(canvasEvent({ x: 30, y: 30 }));

        // when
        dragging.move(canvasEvent({ x: 50, y: 50 }));

        // then
        var spaceGroup = canvas.getLayer('space').select('.djs-crosshair-group');
        expect(spaceGroup).to.exist;
      }));


      it('should remove crosshair once deactivated', inject(function(spaceTool, dragging, canvas) {

        // given
        spaceTool.activateSelection(canvasEvent({ x: 30, y: 30 }));

        // when
        dragging.move(canvasEvent({ x: 50, y: 50 }));
        dragging.end();

        var spaceLayer = canvas.getLayer('space').select('.djs-crosshair-group');

        // then
        expect(spaceLayer).to.be.null;
      }));


      it('should move the *y axis* when doing a perfect diagonal', inject(function(spaceTool, dragging, canvas) {

        //given
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 225 }));

        // when
        dragging.move(canvasEvent({ x: 350, y: 275 }));
        dragging.end();

        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(300);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 450, y: 350 }
        ]);
      }));


      it('should make space to the right and resize parent', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350, y: 150 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(450);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 500, y: 300 }
        ]);
      }));


      it('should round made space to pixel values', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350.14, y: 149.8 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(450);
        expect(childShape2.y).to.equal(250);


        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 500, y: 300 }
        ]);
      }));


      it('should remove space from the left and resize parent', inject(function(spaceTool, dragging) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 200, y: 150 }));

        dragging.move(canvasEvent({ x: 150, y: 150 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(350);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 400, y: 300 }
        ]);
      }));


      it('should remove space from the top and resize parent', inject(function(spaceTool, dragging) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300,y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 120 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(220);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 450, y: 270 }
        ]);
      }));


      it('should make space at the bottom and resize parent', inject(function(spaceTool, dragging) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 200 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(300);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 450, y: 350 }
        ]);
      }));


      it('should remove space with objects to the right', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350, y: 150 }, keyModifier));
        dragging.end();

        // then
        expect(childShape.x).to.equal(160);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 210, y: 160 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should add space with objects to the left', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 150 }, keyModifier));
        dragging.end();

        // then
        expect(childShape.x).to.equal(60);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 110, y: 160 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should remove space with objects that are above', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 230 }));

        dragging.move(canvasEvent({ x: 350, y: 280 }, keyModifier));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(160);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 210 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should add space with objects that are below', inject(function(spaceTool, dragging) {
        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 230 }));

        dragging.move(canvasEvent({ x: 350, y: 180 }, keyModifier));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(60);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 110 },
          { x: 450, y: 300 }
        ]);
      }));

    });

  });


  describe('resize containers', function() {

    beforeEach(bootstrapDiagram({
      modules: [ spaceTool, modelingModule, rulesModule ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var greatGrandParent, grandParent, parentShape, childShape, childShape2, connection,
        parentShape2, childShape3, childShape4, connection2;

    beforeEach(inject(function(elementFactory, canvas) {

      greatGrandParent = elementFactory.createShape({
        id: 'greatGrandParent',
        x: 100, y: 50,
        width: 400, height: 400
      });

      canvas.addShape(greatGrandParent);

      grandParent = elementFactory.createShape({
        id: 'grandParent',
        x: 125, y: 75,
        width: 350, height: 350
      });

      canvas.addShape(grandParent, greatGrandParent);

      parentShape = elementFactory.createShape({
        id: 'parent1',
        x: 200, y: 150,
        width: 200, height: 200
      });

      canvas.addShape(parentShape, grandParent);

      childShape = elementFactory.createShape({
        id: 'child',
        x: 225, y: 175,
        width: 50, height: 50
      });

      canvas.addShape(childShape, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 325, y: 275,
        width: 50, height: 50
      });

      canvas.addShape(childShape2, parentShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 250, y: 200 },
          { x: 350, y: 300 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection);

      parentShape2 = elementFactory.createShape({
        id: 'parent2',
        x: 800, y: 200,
        width: 250, height: 150
      });

      canvas.addShape(parentShape2);

      childShape3 = elementFactory.createShape({
        id: 'child3',
        x: 990, y: 210,
        width: 50, height: 50
      });

      canvas.addShape(childShape3, parentShape2);

      childShape4 = elementFactory.createShape({
        id: 'child4',
        x: 810, y: 290,
        width: 50, height: 50
      });

      canvas.addShape(childShape4, parentShape2);

      connection2 = elementFactory.createConnection({
        id: 'connection2',
        waypoints: [
          { x: 1015, y: 235 },
          { x: 835, y: 315 }
        ],
        source: childShape3,
        target: childShape4
      });

      canvas.addConnection(connection2);
    }));


    it('should resize parents', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 275, y: 155 }));

      dragging.move(canvasEvent({ x: 400, y: 155 })); // x =/= 125
      dragging.end();

      // then
      expect(greatGrandParent.x).to.equal(100);
      expect(greatGrandParent.y).to.equal(50);
      expect(greatGrandParent.width).to.equal(525); // changes
      expect(greatGrandParent.height).to.equal(400);

      expect(grandParent.x).to.equal(125);
      expect(grandParent.y).to.equal(75);
      expect(grandParent.width).to.equal(475); // changes
      expect(grandParent.height).to.equal(350);

      expect(parentShape.x).to.equal(200);
      expect(parentShape.y).to.equal(150);
      expect(parentShape.width).to.equal(325); // changes
      expect(parentShape.height).to.equal(200);

      expect(childShape.x).to.equal(225);
      expect(childShape.y).to.equal(175);

      expect(childShape2.x).to.equal(450); // changes
      expect(childShape2.y).to.equal(275);

      expect(connection).to.have.waypoints([
        { x: 250, y: 200 },
        { x: 475, y: 300 }    // changes
      ]);

      expect(parentShape2.x).to.equal(925); // changes
      expect(parentShape2.y).to.equal(200);
      expect(parentShape2.width).to.equal(250);
      expect(parentShape2.height).to.equal(150);

      expect(childShape3.x).to.equal(1115); // changes
      expect(childShape3.y).to.equal(210);

      expect(childShape4.x).to.equal(935); // changes
      expect(childShape4.y).to.equal(290);

      expect(connection2).to.have.waypoints([
        { x: 1140, y: 235 },  // changes
        { x: 960, y: 315 }     // changes
      ]);
    }));


    it('should resize parents (inverted)', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 330, y: 155 }, keyModifier)); // x =/= 50
      dragging.end();

      // then
      expect(greatGrandParent.x).to.equal(150); // changes
      expect(greatGrandParent.y).to.equal(50);
      expect(greatGrandParent.width).to.equal(350);
      expect(greatGrandParent.height).to.equal(400);

      expect(grandParent.x).to.equal(175); // changes
      expect(grandParent.y).to.equal(75);
      expect(grandParent.width).to.equal(300);
      expect(grandParent.height).to.equal(350);

      expect(parentShape.x).to.equal(250); // changes
      expect(parentShape.y).to.equal(150);
      expect(parentShape.width).to.equal(150);
      expect(parentShape.height).to.equal(200);

      expect(childShape.x).to.equal(275); // changes
      expect(childShape.y).to.equal(175);
    }));


    it('should not remove space beyond max bounds (x axis)', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 550, y: 155 }, keyModifier));
      dragging.end();

      // then
      expect(greatGrandParent).to.have.bounds({ x: 100, y: 50, width: 400, height: 400 });
      expect(grandParent).to.have.bounds({ x: 125, y: 75, width: 350, height: 350 });
      expect(parentShape).to.have.bounds({ x: 200, y: 150, width: 200, height: 200 });
      expect(childShape).to.have.bounds({ x: 225, y: 175, width: 50, height: 50 });
    }));


    it('should not remove space beyond min bounds (x axis)', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 0, y: 155 }));
      dragging.end();

      // then
      expect(greatGrandParent).to.have.bounds({ x: 100, y: 50, width: 400, height: 400 });
      expect(grandParent).to.have.bounds({ x: 125, y: 75, width: 350, height: 350 });
      expect(parentShape).to.have.bounds({ x: 200, y: 150, width: 200, height: 200 });
      expect(childShape).to.have.bounds({ x: 225, y: 175, width: 50, height: 50 });
    }));


    it('should not remove space beyond max bounds (y axis)', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 280, y: 800 }, keyModifier));
      dragging.end();

      // then
      expect(greatGrandParent).to.have.bounds({ x: 100, y: 50, width: 400, height: 400 });
      expect(grandParent).to.have.bounds({ x: 125, y: 75, width: 350, height: 350 });
      expect(parentShape).to.have.bounds({ x: 200, y: 150, width: 200, height: 200 });
      expect(childShape).to.have.bounds({ x: 225, y: 175, width: 50, height: 50 });
    }));


    it('should not remove space beyond min bounds (y axis)', inject(function(spaceTool, dragging) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 280, y: 0 }));
      dragging.end();

      // then
      expect(greatGrandParent).to.have.bounds({ x: 100, y: 50, width: 400, height: 400 });
      expect(grandParent).to.have.bounds({ x: 125, y: 75, width: 350, height: 350 });
      expect(parentShape).to.have.bounds({ x: 200, y: 150, width: 200, height: 200 });
      expect(childShape).to.have.bounds({ x: 225, y: 175, width: 50, height: 50 });
    }));

  });


  describe('redo / undo integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [ spaceTool, modelingModule, rulesModule ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var shape1, shape2;

    beforeEach(inject(function(elementFactory, canvas) {

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shape1);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 50, y: 250,
        width: 100, height: 100
      });

      canvas.addShape(shape2);
    }));

    it('should undo', inject(function(spaceTool, dragging, commandStack) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 100, y: 225 }));

      dragging.move(canvasEvent({ x: 100, y: 250 }));
      dragging.end();

      // when
      commandStack.undo();

      // then
      expect(shape1.x).to.equal(50);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(50);
      expect(shape2.y).to.equal(250);
    }));


    it('should redo', inject(function(spaceTool, dragging, commandStack) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 100, y: 225 }));

      dragging.move(canvasEvent({ x: 100, y: 250 }));
      dragging.end();

      commandStack.undo();

      // when
      commandStack.redo();

      //then
      expect(shape1.x).to.equal(50);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(50);
      expect(shape2.y).to.equal(275);
    }));


  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        spaceTool,
        modelingModule,
        autoResizeModule,
        require('./auto-resize')
      ]
    }));


    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should not auto-resize', inject(function(elementFactory, canvas, spaceTool) {

      // given
      var parent = canvas.addShape(elementFactory.createShape({
        id: 'parent',
        x: 100, y: 50,
        width: 200, height: 200
      }));

      var outsideChild = canvas.addShape(elementFactory.createShape({
        id: 'child',
        x: 50, y: 50,
        width: 50, height: 50
      }), parent);


      // when
      spaceTool.makeSpace([ outsideChild ], [ ], { x: 20, y: 0 }, 'e');

      // then
      // expect parent with original bounds
      expect(parent).to.have.bounds({
        x: 100, y: 50,
        width: 200, height: 200
      });
    }));

  });

});
