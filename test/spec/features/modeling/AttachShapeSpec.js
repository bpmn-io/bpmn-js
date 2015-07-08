'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');

describe('features/modeling - attach shape', function() {


  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

  var rootShape, parentShape, host, attacher, attacher2;

  beforeEach(inject(function(elementFactory, modeling, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

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
      x: 400, y: 400,
      width: 50, height: 50
    });

    canvas.addShape(attacher2, rootShape);
  }));

  describe('detach', function () {

    it('should detach shape from host', inject(function(modeling) {
      // when
      modeling.attachShape(attacher, rootShape, false);

      // then
      expect(attacher.host).to.be.null;
      expect(parentShape.attachers).to.not.include(attacher);
    }));


    it('should reattach shape to original host on undo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher, rootShape, false);

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(parentShape);
      expect(parentShape.attachers).to.include(attacher);
    }));


    it('should detach shape on undo -> redo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher, rootShape, false);

      commandStack.undo();

      commandStack.redo();

      // then
      expect(attacher.host).to.be.null;
      expect(parentShape.attachers).to.not.include(attacher);
    }));

  });

  describe('attach', function () {

    it('should attach shape', inject(function(modeling) {
      // when
      modeling.attachShape(attacher2, host, true);

      // then
      expect(attacher2.host).to.equal(host);
      expect(host.attachers).to.include(attacher2);
    }));


    it('should detach shape on undo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher2, host, true);

      commandStack.undo();

      // then
      expect(attacher2.host).to.be.null;
      expect(host.attachers).to.not.include(attacher2);
    }));

    it('should attach shape on undo -> redo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher2, host, true);

      commandStack.undo();

      commandStack.redo();

      // then
      expect(attacher2.host).to.equal(host);
      expect(host.attachers).to.include(attacher2);
    }));

  });

  describe('reattach', function () {
    it('should reattach shape to another host', inject(function(modeling) {
      // when
      modeling.attachShape(attacher, host, true);

      // then
      expect(attacher.host).to.equal(host);

      expect(host.attachers).to.include(attacher);
      expect(parentShape.attachers).to.not.include(attacher);
    }));


    it('should reattach shape to original host on undo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher, host, true);

      commandStack.undo();

      // then
      expect(attacher.host).to.equal(parentShape);

      expect(parentShape.attachers).to.include(attacher);
      expect(host.attachers).to.not.include(attacher);
    }));


    it('should reattach shape to another host on undo -> redo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher, host, true);

      commandStack.undo();

      commandStack.redo();

      // then
      expect(attacher.host).to.equal(host);

      expect(host.attachers).to.include(attacher);
      expect(parentShape.attachers).to.not.include(attacher);
    }));

  });

  describe('connections', function () {

    var child, connection;

    beforeEach(inject(function(canvas, elementFactory) {

      child = elementFactory.createShape({
        id: 'child',
        x: 700, y: 400,
        width: 100, height: 100
      });

      canvas.addShape(child, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 400, y: 110 },
          { x: 750, y: 450 },
        ],
        source: attacher,
        target: child
      });

      canvas.addConnection(connection, rootShape);
    }));

    it('should not remove connection when changing host', inject(function(modeling) {
      // when
      modeling.attachShape(attacher, host, true);

      expect(attacher.outgoing.length).to.eql(1);

      expect(child.incoming.length).to.eql(1);
    }));


    it('should remove connection when detaching', inject(function(modeling) {
      // when
      modeling.attachShape(attacher, rootShape, false);

      expect(attacher.outgoing.length).to.eql(0);

      expect(child.incoming.length).to.eql(0);
    }));


    it('should remove connection when attaching to the host where it is connected to',
      inject(function(modeling) {
      // when
      modeling.attachShape(attacher, child, true);

      expect(attacher.outgoing.length).to.eql(0);

      expect(child.incoming.length).to.eql(0);
    }));


    it('should add connection when detaching -> undo', inject(function(modeling, commandStack) {
      // when
      modeling.attachShape(attacher, rootShape, false);

      commandStack.undo();

      expect(attacher.outgoing.length).to.eql(1);

      expect(child.incoming.length).to.eql(1);
    }));

  });

});
