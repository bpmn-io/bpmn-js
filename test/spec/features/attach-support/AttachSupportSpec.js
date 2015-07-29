'use strict';

var Events = require('../../../util/Events');

/* global bootstrapDiagram, inject */


var attachSupportModule = require('../../../../lib/features/attach-support'),
    modelingModule = require('../../../../lib/features/modeling'),
    replaceModule = require('../../../../lib/features/replace'),
    rulesModule = require('./rules');

function items(collection) {
  return collection.map(function(e) {
    return e;
  });
}

describe('features/attach-support - Attach', function() {

  beforeEach(bootstrapDiagram({ modules: [ attachSupportModule, modelingModule, rulesModule, replaceModule ] }));

  var Event;

  beforeEach(inject(function(canvas, dragging) {
    Event = Events.target(canvas._svg);

    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));


  var rootShape, parentShape;

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
  }));

  describe('modeling', function () {

    var host, attacher, attacher2;

    beforeEach(inject(function(canvas, elementFactory, modeling) {

      host = elementFactory.createShape({
        id:'host',
        x: 700, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        x: 400, y: 110,
        width: 50, height: 50
      });

      modeling.createShape(attacher, { x: 400, y: 110 }, parentShape, 'attach');


      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        x: 425, y: 375,
        width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);
    }));


    it('should attach', inject(function(modeling) {

      // when
      modeling.moveShapes([ attacher2 ], { x: -50, y: 0 }, parentShape, true);

      // then
      expect(attacher2.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher2);
    }));


    it('should detach from host', inject(function(modeling) {

      // when
      modeling.moveShapes([ attacher ], { x: 50, y: 50 }, rootShape, false);

      // then
      expect(attacher.host).not.to.exist;
      expect(parentShape.attachers).not.to.include(attacher);
    }));


    it('should reattach to original host on undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveShapes([ attacher ], { x: 50, y: 50 }, rootShape, false);

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher);
    }));


    it('should detach on undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveShapes([ attacher2 ], { x: -50, y: 0 }, parentShape, true);

      commandStack.undo();

      // then
      expect(attacher2.host).not.to.exist;
      expect(parentShape.attachers).not.to.include(attacher2);
    }));


    it('should reattach to initial host when detached', inject(function(modeling) {

      // when
      modeling.moveShapes([ attacher ], { x: 50, y: 50 }, rootShape, false);

      modeling.moveShapes([ attacher ], { x: -50, y: -50 }, parentShape, true);

      // then
      expect(attacher.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher);
    }));


    it('should reattach to another host', inject(function(modeling) {

      // when
      modeling.moveShapes([ attacher ], { x: 300, y: 0 }, host, true);

      // then
      expect(attacher.host).to.equal(host);
      expect(host.attachers).to.include(attacher);
    }));


    it('should detach on reattachment undo', inject(function(modeling, commandStack) {

      // when
      modeling.moveShapes([ attacher ], { x: 50, y: 50 }, rootShape, false);

      modeling.moveShapes([ attacher ], { x: -50, y: -50 }, parentShape, true);

      commandStack.undo();

      // then
      expect(attacher.host).to.not.exist;
      expect(parentShape.attachers).not.to.include(attacher);
    }));

  });

  describe('moving', function () {

    var host, host2, attacher, attacher2;

    beforeEach(inject(function(canvas, modeling, elementFactory, elementRegistry) {
      host = elementFactory.createShape({
        id: 'host',
        x: 500, y: 100, width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      host2 = elementFactory.createShape({
        id: 'host2',
        x: 200, y: 250, width: 100, height: 100
      });

      canvas.addShape(host2, parentShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 575, y: 75, width: 50, height: 50
      });

      canvas.addShape(attacher, rootShape);

      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        host: host,
        x: 575, y: 175, width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);
    }));


    it('should move attachers along with host', inject(function(move, dragging, elementRegistry) {

      // given
      var rootGfx = elementRegistry.getGraphics(rootShape);

      // when
      move.start(Event.create({ x: 550, y: 150 }), host);

      dragging.hover({
        element: rootShape,
        gfx: rootGfx
      });

      dragging.move(Event.create({ x: 700, y: 300 }));
      dragging.end();

      // then
      expect(attacher.x).to.equal(725);
      expect(attacher.y).to.equal(225);

      expect(attacher.host).to.eql(host);
      expect(host.attachers).to.include(attacher);

      expect(attacher2.x).to.equal(725);
      expect(attacher2.y).to.equal(325);

      expect(attacher2.host).to.equal(host);
      expect(host.attachers).to.include(attacher2);
    }));


    it('should move attachers along with NEW host', inject(function(move, dragging, elementRegistry) {

      // given
      var host2Gfx = elementRegistry.getGraphics(host2),
          parentGfx = elementRegistry.getGraphics(parentShape);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      move.start(Event.create({ x: 250, y: 300 }), host2);

      dragging.hover({
        element: parentShape,
        gfx: parentGfx
      });

      dragging.move(Event.create({ x: 300, y: 300 }));
      dragging.end();

      // then
      expect(attacher.x).to.equal(225);
      expect(attacher.y).to.equal(225);

      expect(attacher.host).to.eql(host2);
      expect(host2.attachers).to.include(attacher);
    }));


    it('should move attachers along with host to new parent',
      inject(function(move, dragging, elementRegistry, modeling) {

      // given
      var host2Gfx = elementRegistry.getGraphics(host2);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      modeling.moveShapes([ host2 ], { x: 300, y: 50 }, rootShape);

      // then
      expect(host2.parent).to.equal(rootShape);
      expect(attacher.parent).to.equal(rootShape);

      expect(rootShape.children).to.include(host2);
      expect(rootShape.children).to.include(attacher);

      expect(rootShape.children.indexOf(attacher)).to.be.above(rootShape.children.indexOf(host2));
    }));


    it('should move attachers along with host selection',
      inject(function(move, dragging, elementRegistry, selection) {

      // given
      var rootGfx = elementRegistry.getGraphics(rootShape);

      selection.select([ host, attacher, attacher2 ]);

      // when
      move.start(Event.create({ x: 550, y: 150 }), host);

      dragging.hover({
        element: rootShape,
        gfx: rootGfx
      });

      dragging.move(Event.create({ x: 700, y: 300 }));
      dragging.end();

      // then
      expect(attacher.x).to.equal(725);
      expect(attacher.y).to.equal(225);

      expect(attacher.host).to.eql(host);
      expect(host.attachers).to.include(attacher);

      expect(attacher2.x).to.equal(725);
      expect(attacher2.y).to.equal(325);

      expect(attacher2.host).to.equal(host);
      expect(host.attachers).to.include(attacher2);
    }));


    it('should move attachers along with parent',
      inject(function(move, dragging, elementRegistry, selection) {

      // given
      var rootGfx = elementRegistry.getGraphics(rootShape);
      var host2Gfx = elementRegistry.getGraphics(host2);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      // when
      move.start(Event.create({ x: 550, y: 150 }), parentShape);

      dragging.hover({
        element: rootShape,
        gfx: rootGfx
      });

      dragging.move(Event.create({ x: 700, y: 300 }));
      dragging.end();

      // then
      expect(attacher.x).to.eql(325);
      expect(attacher.y).to.eql(375);

      expect(attacher.host).to.eql(host2);
      expect(host2.attachers).to.include(attacher);
    }));


    it('should not move disallowed attacher', inject(function(move, dragging, elementRegistry) {
      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(Event.create({ x: 600, y: 200 }), attacher2);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(Event.create({ x: 100, y: 100 }));

      // then
      expect(attacher2.x).to.equal(575);
      expect(attacher2.y).to.equal(175);
    }));


    it('should detach attacher from host', inject(function(move, dragging, elementRegistry, eventBus) {

      // given
      var parentGfx = elementRegistry.getGraphics(parentShape);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: parentShape,
        gfx: parentGfx
      });

      dragging.move(Event.create({ x: 425, y: 125 }));

      dragging.end();

      // then
      expect(attacher.host).to.not.exist;
      expect(attacher.parent).to.equal(parentShape);

      expect(parentShape.attachers).not.to.contain(attacher);

      expect(host.attachers).to.include(attacher2);
      expect(host.attachers).to.not.include(attacher);
    }));


    it('should reattach to host -> detachment (undo)',
      inject(function(move, dragging, elementRegistry, eventBus, commandStack) {
      // given
      var parentGfx = elementRegistry.getGraphics(parentShape);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: parentShape,
        gfx: parentGfx
      });

      dragging.move(Event.create({ x: 425, y: 125 }));
      dragging.end();

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(host);
      expect(attacher.parent).to.equal(rootShape);

      expect(host.attachers).to.include(attacher);
    }));


    it('should detach and reattach', inject(function(elementRegistry, move, dragging) {

      // given
      var parentGfx = elementRegistry.getGraphics(parentShape),
          hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: parentShape,
        gfx: parentGfx
      });

      dragging.move(Event.create({ x: 425, y: 125 }));
      dragging.end();

      // then
      expect(attacher.host).not.to.exist;


      // but when ...
      move.start(Event.create({ x: 700, y: 275 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(Event.create({ x: 625, y: 125 }));
      dragging.end();

      // then
      expect(attacher.host).to.exist;
      expect(attacher.parent).to.equal(rootShape);

      expect(host.attachers).to.include(attacher);
    }));


    it('should attach to another host', inject(function(elementRegistry, move, dragging) {
      // given
      var host2Gfx = elementRegistry.getGraphics(host2);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      // then
      expect(attacher.host).to.equal(host2);
      expect(attacher.parent).to.equal(parentShape);
      expect(host2.attachers).to.include(attacher);
    }));


    it('should reattach to original host on undo', inject(function(elementRegistry, move, dragging, commandStack) {
      // given
      var host2Gfx = elementRegistry.getGraphics(host2);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(host);

      expect(attacher.parent).to.equal(rootShape);

      expect(host.attachers).to.include(attacher);
      expect(host2.attachers).to.not.include(attacher);
    }));


    it('should attach to another host when moving with a label',
      inject(function(elementFactory, elementRegistry, modeling, move, dragging, selection) {
      // given
      var host2Gfx = elementRegistry.getGraphics(host2),
          label = elementFactory.createLabel({ width: 80, height: 40 });

      modeling.createLabel(attacher, { x: 600, y: 100 }, label, parentShape);

      selection.select([ attacher, label ]);

      // when
      move.start(Event.create({ x: 625, y: 125 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 225, y: 275 }));
      dragging.end();

      // then
      expect(attacher.host).to.equal(host2);
      expect(attacher.parent).to.equal(parentShape);
      expect(host2.attachers).to.include(attacher);
    }));

  });


  describe('replace', function() {

    var host, attacher;

    beforeEach(inject(function(canvas, modeling, elementFactory, elementRegistry) {

      host = elementFactory.createShape({
        id: 'host',
        x: 200, y: 200, width: 100, height: 100
      });

      canvas.addShape(host, parentShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 175, y: 175, width: 50, height: 50
      });

      canvas.addShape(attacher, parentShape);

    }));


    it('should adopt children with attachments',
      inject(function(elementFactory, replace, elementRegistry, canvas) {

      // given
      var replacement = {
        id: 'replacement',
        width: 300,
        height: 300
      };

      // when
      var newShape = replace.replaceElement(parentShape, replacement);

      // then
      expect(newShape.children).to.include(attacher);
      expect(attacher.parent).to.equal(newShape);

      expect(host.attachers).to.include(attacher);
      expect(attacher.host).to.eql(host);
    }));


    it('should update host after replacing attachment', inject(function(replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 50,
        height: 50
      };

      // when
      var newShape = replace.replaceElement(attacher, replacement);

      // then
      expect(newShape.host).to.be.defined;
      expect(host.attachers).to.include(newShape);
      expect(newShape.host).to.eql(host);
    }));


    it('should remove attachments after replacing host',
      inject(function(rules, replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: host.width,
        height: host.height
      };

      // when
      var newShape = replace.replaceElement(host, replacement);

      // then
      expect(newShape.attachers).not.to.include(attacher);
      expect(attacher.host).not.to.eql(newShape);
    }));


    it('should retain attachments after replacing host if a rule exist', inject(function(replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: host.width,
        height: host.height,
        retainAttachmentIds: ['attacher']
      };

      // when
      var newShape = replace.replaceElement(host, replacement);

      // then
      expect(attacher).to.be.defined;
      expect(newShape.attachers).to.include(attacher);
      expect(attacher.host).to.eql(newShape);
    }));


    it('should retain a subset of attachments after replacing host if a rule exist',
      inject(function(replace, elementFactory, canvas) {

      // given
      var attacher2 = elementFactory.createShape({
        id: 'attacher2',
        x: 225, y: 175, width: 50, height: 50,
        host: host
      });

      canvas.addShape(attacher2, parentShape);

      var replacement = {
        id: 'replacement',
        width: host.width,
        height: host.height,
        retainAttachmentIds: ['attacher']
      };

      // when
      var newShape = replace.replaceElement(host, replacement);

      // then
      expect(attacher.host).to.eql(newShape);
      expect(newShape.attachers).to.include(attacher);

      expect(attacher2.host).not.to.eql(newShape);
      expect(newShape.attachers).not.to.include(attacher2);
    }));

  });


  describe('visuals', function () {

    var host, host2, attacher, attacher2, label;

    beforeEach(inject(function(canvas, modeling, elementFactory, elementRegistry) {
      host = elementFactory.createShape({
        id: 'host',
        x: 500, y: 100, width: 100, height: 100
      });

      canvas.addShape(host, rootShape);

      attacher = elementFactory.createShape({
        id: 'attacher',
        host: host,
        x: 575, y: 75, width: 50, height: 50
      });

      canvas.addShape(attacher, rootShape);

      attacher2 = elementFactory.createShape({
        id: 'attacher2',
        host: host,
        x: 600, y: 200, width: 50, height: 50
      });

      canvas.addShape(attacher2, rootShape);

      label = elementFactory.createLabel({ width: 80, height: 40 });

      modeling.createLabel(attacher, { x: 600, y: 100 }, label, parentShape);

      host2 = elementFactory.createShape({
        id: 'host2',
        x: 500, y: 300, width: 100, height: 100
      });

      canvas.addShape(host2, rootShape);
    }));


    it('should be on top of host with label',
      inject(function(elementRegistry, move, dragging, selection) {
      // given
      var host2Gfx = elementRegistry.getGraphics(host2);

      selection.select([ attacher, label ]);

      // when
      move.start(Event.create({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 800, y: 400 }));
      dragging.end();

      var rootChildren = rootShape.children;

      var labelIdx = rootChildren.indexOf(label);

      // then
      expect(rootChildren.indexOf(attacher)).to.be.above(rootChildren.indexOf(host2));

      expect(labelIdx).to.be.above(rootChildren.indexOf(host2));
      expect(labelIdx).to.be.above(rootChildren.indexOf(attacher));
    }));


    it('should be on top of host with label -> undo',
      inject(function(elementRegistry, move, dragging, selection, commandStack) {
      // given
      var host2Gfx = elementRegistry.getGraphics(host2),
          rootChildren = rootShape.children;

      selection.select([ attacher, label ]);

      var attacherIdx = rootChildren.indexOf(attacher),
          labelIdx = rootChildren.indexOf(label),
          hostIdx = rootChildren.indexOf(host);

      // when
      move.start(Event.create({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host2,
        gfx: host2Gfx
      });

      dragging.move(Event.create({ x: 800, y: 400 }));
      dragging.end();


      commandStack.undo();

      // then
      expect(attacherIdx).to.equal(rootChildren.indexOf(attacher));

      expect(labelIdx).to.equal(rootChildren.indexOf(label));

      expect(hostIdx).to.equal(rootChildren.indexOf(host));
    }));


    it('should add attachment marker', inject(function(move, dragging, elementRegistry) {
      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(Event.create({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(Event.create({ x: 575, y: 75 }));

      var ctx = dragging.active();

      // then
      expect(ctx.data.context.canExecute).to.equal('attach');
      expect(elementRegistry.getGraphics(host).hasClass('attach-ok')).to.be.true;
    }));


    it('should remove attachment marker', inject(function(move, dragging, elementRegistry) {
      // given
      var hostGfx = elementRegistry.getGraphics(host);

      // when
      move.start(Event.create({ x: 800, y: 100 }), attacher);

      dragging.hover({
        element: host,
        gfx: hostGfx
      });

      dragging.move(Event.create({ x: 575, y: 75 }));
      dragging.end();

      // then
      expect(elementRegistry.getGraphics(host).hasClass('attach-ok')).to.be.false;
    }));

  });

  describe('remove', function () {

    var child, connection, attachedShape, attachedShape2, attachedShape3, attachedShape4;

    beforeEach(inject(function(modeling, elementFactory, canvas) {

      child = elementFactory.createShape({
        id: 'child',
        x: 600, y: 75,
        width: 50, height: 50
      });

      canvas.addShape(child, rootShape);

      attachedShape = elementFactory.createShape({
        id: 'attachedShape',
        x: 75, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape, rootShape);

      attachedShape2 = elementFactory.createShape({
        id: 'attachedShape2',
        x: 375, y: 75, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape2, rootShape);

      attachedShape3 = elementFactory.createShape({
        id: 'attachedShape3',
        x: 75, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape3, rootShape);

      attachedShape4 = elementFactory.createShape({
        id: 'attachedShape4',
        x: 375, y: 375, width: 50, height: 50,
        host: parentShape
      });

      canvas.addShape(attachedShape4, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: attachedShape2,
        target: child,
        waypoints: [
          { x: 400, y: 100 },
          { x: 625, y: 100 }
        ]
      });

      canvas.addConnection(connection, rootShape);
    }));


    it('should remove attacher from host', inject(function(modeling) {

      // when
      modeling.removeShape(attachedShape);

      // then
      expect(parentShape.attachers).to.have.length(3);
    }));


    it('should add attacher to host on undo', inject(function(modeling, commandStack) {

      // when
      modeling.removeShape(attachedShape);

      commandStack.undo();

      // then
      expect(parentShape.attachers).to.include(attachedShape);
    }));


    describe('remove multiple', function() {

      it('should execute', inject(function(modeling) {

        // when
        modeling.removeShape(attachedShape2);

        modeling.removeShape(attachedShape3);

        // then
        expect(items(parentShape.attachers)).to.eql([ attachedShape, attachedShape4 ]);
      }));


      it('should undo', inject(function(commandStack, modeling) {

        // given
        var originalAttachers = items(parentShape.attachers);

        modeling.removeShape(attachedShape2);

        modeling.removeShape(attachedShape4);

        // when
        commandStack.undo();

        commandStack.undo();

        // then
        expect(items(parentShape.attachers)).to.eql(originalAttachers);
      }));

    });


    it('should remove connection when deleting shape', inject(function(modeling) {
      // when
      modeling.removeShape(attachedShape2);

      // then
      expect(child.incoming).to.have.length(0);
    }));


    it('should add connection when deleting shape -> undo', inject(function(commandStack, modeling) {
      // given
      modeling.removeShape(attachedShape2);

      // when
      commandStack.undo();

      // then
      expect(child.incoming).to.have.length(1);
    }));


    it('should remove connection when deleting host of connected shape', inject(function(modeling) {
      // when
      modeling.removeShape(parentShape);

      // then
      expect(child.incoming).to.have.length(0);
    }));


    it('should add connection when deleting host of connected shape -> undo', inject(function(commandStack, modeling) {
      // given
      modeling.removeShape(parentShape);

      // when
      commandStack.undo();

      // then
      expect(child.incoming).to.have.length(1);
    }));


    describe('remove attachers shapes with host', function() {

      it('should execute', inject(function(modeling, elementRegistry) {

        // when
        modeling.removeShape(parentShape);

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');


        expect(parent).to.not.exist;

        expect(attacher).to.not.exist;
        expect(attacher2).to.not.exist;
        expect(attacher3).to.not.exist;
        expect(attacher4).to.not.exist;
      }));


      it('should undo', inject(function(commandStack, modeling, elementRegistry) {

        // given
        modeling.removeShape(parentShape);

        // when
        commandStack.undo();

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');

        expect(parent).to.exist;
        expect(items(parent.attachers)).to.eql([attacher, attacher2, attacher3, attacher4 ]);

        expect(attacher).to.exist;
        expect(attacher2).to.exist;
        expect(attacher3).to.exist;
        expect(attacher4).to.exist;
      }));


      it('should redo', inject(function(commandStack, modeling, elementRegistry) {

        // given
        modeling.removeShape(parentShape);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        var parent = elementRegistry.get('parent');

        var attacher = elementRegistry.get('attachedShape');

        var attacher2 = elementRegistry.get('attachedShape2');

        var attacher3 = elementRegistry.get('attachedShape3');

        var attacher4 = elementRegistry.get('attachedShape4');

        expect(parent).to.not.exist;

        expect(attacher).to.not.exist;
        expect(attacher2).to.not.exist;
        expect(attacher3).to.not.exist;
        expect(attacher4).to.not.exist;
      }));

    });

  });

});
