'use strict';

var TestHelper = require('../../../TestHelper'),
    Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */

var spaceTool = require('../../../../lib/features/space-tool'),
    rulesModule = require('./rules');

describe('SpaceTool create/remove space', function() {

  beforeEach(bootstrapDiagram({
    modules: [spaceTool, rulesModule]
  }));

  var rootShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110,
      width: 100, height: 100
    });

    canvas.addShape(childShape, rootShape);

    childShape2 = elementFactory.createShape({
      id: 'child2',
      x: 400, y: 250,
      width: 100, height: 100
    });

    canvas.addShape(childShape2, rootShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [
        { x: 160, y: 160 },
        { x: 450, y: 300 }
      ],
      source: childShape,
      target: childShape2
    });

    canvas.addConnection(connection, rootShape);
  }));


  describe('create space behaviour', function() {
    var Event;

    beforeEach(inject(function(canvas, dragging) {
      Event = Events.target(canvas._svg);

      dragging.setOptions({
        manual: false
      });
    }));

    var createEvent;

    beforeEach(inject(function(canvas) {
      createEvent = Events.scopedCreate(canvas);
    }));


    it('should expose spaceTool', inject(function(spaceTool) {
      expect(spaceTool).toBeDefined();
    }));


    it('should manually test', inject(function (spaceTool, dragging, canvas, eventBus) {
      // given
      eventBus.on('element.click', function(e) {
        spaceTool.activate(e.originalEvent);
      });
    }));

    it('should show crosshair once activated', inject(function (spaceTool, dragging, canvas, eventBus) {

      // given
      spaceTool.activate(createEvent({x: 30, y: 30}));

      // when
      dragging.move(createEvent({x: 50, y: 50}));

      // then
      var spaceGroup = canvas.getLayer('space').select('.djs-crosshair-group');
      expect(spaceGroup).toBeDefined();
    }));


    it('should remove crosshair once deactivated', inject(function (spaceTool, dragging, canvas) {

      // given
      spaceTool.activate(createEvent({x: 30, y: 30}));

      // when
      dragging.move(createEvent({x: 50, y: 50}));
      dragging.end();
      var spaceLayer = canvas.getLayer('space').select('.djs-crosshair-group');

      // then
      expect(spaceLayer).toBeNull();
    }));


    it('should move the *y axis* when doing a perfect diagonal', inject(function(spaceTool, dragging, canvas) {
      
      //given
      spaceTool.start(createEvent({x: 300, y: 225}));

      // when
      dragging.move(createEvent({x: 350, y: 275}));
      dragging.end();

      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(300);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 160 });
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 350 });
    }));


    it('should make space to the right and resize parent', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({x: 300, y: 150}));

      dragging.move(createEvent({x: 350, y: 150}));
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(450);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 500, y: 300});
    }));


    it('should make space to the left and resize parent', inject(function(spaceTool, dragging) {

      // when
      spaceTool.start(createEvent({ x: 300, y: 150 }));

      dragging.move(createEvent({ x: 250, y: 150 }));
      dragging.end();

      // then
      expect(childShape.x).toBe(60);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 110, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 300});
    }));


    it('should make space at the top and resize parent', inject(function(spaceTool, dragging) {

      // when
      spaceTool.start(createEvent({ x: 300,y: 300 }));

      dragging.move(createEvent({ x: 300, y: 250 }));
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(60);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 110});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 300});
    }));


    it('should make space at the bottom and resize parent', inject(function(spaceTool, dragging) {

      // when
      spaceTool.start(createEvent({ x: 300, y: 150 }));

      dragging.move(createEvent({ x: 300, y: 200 }));
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(300);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 350});
    }));


    it('should remove space with objects to the right', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({x: 300, y: 150}));

      dragging.move(createEvent({x: 350, y: 150}, {altKey: true}));
      // var context = dragging.active().context
      dragging.end();

      // then
      expect(childShape.x).toBe(160);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 210, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 300});
    }));


    it('should remove space with objects to the left', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({x: 350, y: 150}));

      dragging.move(createEvent({x: 300, y: 150}, {altKey: true}));
      // var context = dragging.active().context
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(350);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 400, y: 300});
    }));


    it('should remove space with objects that are above', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({x: 350, y: 230}));

      dragging.move(createEvent({x: 350, y: 280}, {altKey: true}));
      // var context = dragging.active().context
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(160);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(250);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 210});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 300});
    }));


    it('should remove space with objects that are below', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({x: 350, y: 230}));

      dragging.move(createEvent({x: 350, y: 180}, {altKey: true}));
      // var context = dragging.active().context
      dragging.end();

      // then
      expect(childShape.x).toBe(110);
      expect(childShape.y).toBe(110);

      expect(childShape2.x).toBe(400);
      expect(childShape2.y).toBe(200);

      expect(connection.waypoints[0]).toEqual({ x: 160, y: 160});
      expect(connection.waypoints[1]).toEqual({ x: 450, y: 250});
    }));
  });
});

describe('SpaceTool resize containers', function() {

  beforeEach(bootstrapDiagram({
    modules: [spaceTool, rulesModule]
  }));

  var rootShape, greatGrandParent, grandParent, parentShape, childShape, childShape2, connection,
       parentShape2, childShape3, childShape4, connection2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    greatGrandParent = elementFactory.createShape({
      id: 'greatGrandParent',
      x: 100, y: 50,
      width: 400, height: 400
      });

    canvas.addShape(greatGrandParent, rootShape);

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

    canvas.addConnection(connection, rootShape);

    parentShape2 = elementFactory.createShape({
      id: 'parent2',
      x: 800, y: 200,
      width: 250, height: 150
    });

    canvas.addShape(parentShape2, rootShape);

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

    canvas.addConnection(connection2, rootShape);
  }));


  describe('create space behaviour', function() {
    var Event;

    beforeEach(inject(function(canvas, dragging) {
      Event = Events.target(canvas._svg);

      dragging.setOptions({
        manual: false
      });
    }));

    var createEvent;

    beforeEach(inject(function(canvas) {
      createEvent = Events.scopedCreate(canvas);
    }));


    it('should expose spaceTool', inject(function(spaceTool) {
      expect(spaceTool).toBeDefined();
    }));


    it('should manually test', inject(function (spaceTool, dragging, canvas, eventBus) {
      // given
      eventBus.on('element.click', function(e) {
        spaceTool.activate(e.originalEvent);
      });
    }));


    it('should move childShape2, childShape3, childShape4 and resize parentShape, grandParent and greatGrandParent', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({ x: 275, y: 155 }));

      dragging.move(createEvent({ x: 400, y: 155 })); // x =/= 125
      dragging.end();

      // then
      expect(greatGrandParent.x).toBe(100);
      expect(greatGrandParent.y).toBe(50);
      expect(greatGrandParent.width).toBe(525); // changes
      expect(greatGrandParent.height).toBe(400);

      expect(grandParent.x).toBe(125);
      expect(grandParent.y).toBe(75);
      expect(grandParent.width).toBe(475); // changes
      expect(grandParent.height).toBe(350);

      expect(parentShape.x).toBe(200);
      expect(parentShape.y).toBe(150);
      expect(parentShape.width).toBe(325); // changes
      expect(parentShape.height).toBe(200);

      expect(childShape.x).toBe(225);
      expect(childShape.y).toBe(175);

      expect(childShape2.x).toBe(450); // changes
      expect(childShape2.y).toBe(275);

      expect(connection.waypoints[0]).toEqual({ x: 250, y: 200}); 
      expect(connection.waypoints[1]).toEqual({ x: 475, y: 300}); // changes

      expect(parentShape2.x).toBe(925); // changes
      expect(parentShape2.y).toBe(200);
      expect(parentShape2.width).toBe(250);
      expect(parentShape2.height).toBe(150);

      expect(childShape3.x).toBe(1115); // changes
      expect(childShape3.y).toBe(210);

      expect(childShape4.x).toBe(935); // changes
      expect(childShape4.y).toBe(290);

      expect(connection2.waypoints[0]).toEqual({ x: 1140, y: 235}); // changes
      expect(connection2.waypoints[1]).toEqual({ x: 960, y: 315}); // changes
    }));

    it('should move childShape1, parentShape and grandParent', inject(function(spaceTool, dragging) {
      // when
      spaceTool.start(createEvent({ x: 280, y: 155 }));

      dragging.move(createEvent({ x: 330, y: 155 }, {altKey: true})); // x =/= 50
      dragging.end();

      // then
      expect(greatGrandParent.x).toBe(150); // changes
      expect(greatGrandParent.y).toBe(50);
      expect(greatGrandParent.width).toBe(350); 
      expect(greatGrandParent.height).toBe(400);

      expect(grandParent.x).toBe(175); // changes
      expect(grandParent.y).toBe(75);
      expect(grandParent.width).toBe(300); 
      expect(grandParent.height).toBe(350);

      expect(parentShape.x).toBe(250); // changes
      expect(parentShape.y).toBe(150);
      expect(parentShape.width).toBe(150); 
      expect(parentShape.height).toBe(200);

      expect(childShape.x).toBe(275); // changes
      expect(childShape.y).toBe(175);
    }));
  });
});

describe('basics', function() {

  beforeEach(bootstrapDiagram({
    modules: [spaceTool, rulesModule]
  }));


  var rootShape, shape1, shape2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 50, y: 100, 
      width: 100, height: 100
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 50, y: 250, 
      width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);
  }));

  var Event;


  beforeEach(inject(function(canvas, dragging) {
    Event = Events.target(canvas._svg);

    dragging.setOptions({
      manual: false
    });
  }));

  var createEvent;

  beforeEach(inject(function(canvas) {
    createEvent = Events.scopedCreate(canvas);
  }));

  it('should undo & redo', inject(function(spaceTool, dragging, commandStack) {

    // when
    spaceTool.start(createEvent({x: 100, y: 225}));

    dragging.move(createEvent({x: 100, y: 250}));
    dragging.end();

    //then
    expect(shape1.x).toBe(50);
    expect(shape1.y).toBe(100);

    expect(shape2.x).toBe(50);
    expect(shape2.y).toBe(275);

    // when
    commandStack.undo();

    // then
    expect(shape1.x).toBe(50);
    expect(shape1.y).toBe(100);

    expect(shape2.x).toBe(50);
    expect(shape2.y).toBe(250);

    commandStack.redo();

    //then
    expect(shape1.x).toBe(50);
    expect(shape1.y).toBe(100);

    expect(shape2.x).toBe(50);
    expect(shape2.y).toBe(275);
  }));
});
