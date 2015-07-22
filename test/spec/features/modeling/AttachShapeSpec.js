'use strict';

/* global bootstrapDiagram, inject */


var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - attach shape', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, oldHostShape, hostShape, attachedShape, detachedShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    oldHostShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(oldHostShape, rootShape);

    hostShape = elementFactory.createShape({
      id: 'hostShape',
      x: 700, y: 100,
      width: 100, height: 100
    });

    canvas.addShape(hostShape, rootShape);

    attachedShape = elementFactory.createShape({
      id: 'attachedShape',
      x: 400, y: 110,
      width: 50, height: 50,
      host: oldHostShape
    });

    canvas.addShape(attachedShape, rootShape);

    detachedShape = elementFactory.createShape({
      id: 'detachedShape',
      x: 400, y: 400,
      width: 50, height: 50
    });

    canvas.addShape(detachedShape, rootShape);
  }));


  describe('initial state', function() {

    it('should have wired host <-> attachers', inject(function() {

      // assume
      expect(oldHostShape.attachers).to.contain(attachedShape);
      expect(oldHostShape.attachers).not.to.contain(detachedShape);

      expect(attachedShape.host).to.eql(oldHostShape);
      expect(detachedShape.host).not.to.exist;
    }));

  });


  describe('detach attached shape', function() {

    it('should execute', inject(function(modeling) {

      // when
      modeling.updateAttachment(attachedShape, null);

      // then
      expect(attachedShape.host).not.to.exist;
      expect(oldHostShape.attachers).not.to.include(attachedShape);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(attachedShape, null);

      // when
      commandStack.undo();

      // then
      expect(attachedShape.host).to.equal(oldHostShape);
      expect(oldHostShape.attachers).to.include(attachedShape);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(attachedShape, null);

      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(attachedShape.host).not.to.exist;
      expect(oldHostShape.attachers).to.not.include(attachedShape);
    }));

  });


  describe('attach detached shape', function() {

    it('should execute', inject(function(modeling) {

      // when
      modeling.updateAttachment(detachedShape, hostShape);

      // then
      expect(detachedShape.host).to.equal(hostShape);
      expect(hostShape.attachers).to.include(detachedShape);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(detachedShape, hostShape);

      // when
      commandStack.undo();

      // then
      expect(detachedShape.host).not.to.exist;
      expect(hostShape.attachers).to.not.include(detachedShape);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(detachedShape, hostShape);

      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(detachedShape.host).to.equal(hostShape);
      expect(hostShape.attachers).to.include(detachedShape);
    }));

  });


  describe('reattach attached shape', function () {

    it('should execute', inject(function(modeling) {

      // when
      modeling.updateAttachment(attachedShape, hostShape);

      // then
      expect(attachedShape.host).to.equal(hostShape);

      expect(hostShape.attachers).to.include(attachedShape);
      expect(oldHostShape.attachers).to.not.include(attachedShape);
    }));


    it('should undo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(attachedShape, hostShape);

      // when
      commandStack.undo();

      // then
      expect(attachedShape.host).to.equal(oldHostShape);

      expect(oldHostShape.attachers).to.include(attachedShape);
      expect(hostShape.attachers).to.not.include(attachedShape);
    }));


    it('should redo', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(attachedShape, hostShape);

      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(attachedShape.host).to.equal(hostShape);

      expect(hostShape.attachers).to.include(attachedShape);
      expect(oldHostShape.attachers).to.not.include(attachedShape);
    }));

  });


  describe('connection handling', function () {

    var connectedShape, connectionToAttached, connectionToDetached;

    beforeEach(inject(function(canvas, elementFactory) {

      connectedShape = elementFactory.createShape({
        id: 'connectedShape',
        x: 700, y: 400,
        width: 100, height: 100
      });

      canvas.addShape(connectedShape, rootShape);

      connectionToAttached = elementFactory.createConnection({
        id: 'connectionToAttached',
        waypoints: [
          { x: 400, y: 110 },
          { x: 750, y: 450 },
        ],
        source: attachedShape,
        target: connectedShape
      });

      canvas.addConnection(connectionToAttached, rootShape);


      connectionToDetached = elementFactory.createConnection({
        id: 'connectionToDetached',
        waypoints: [
          { x: 425, y: 425 },
          { x: 750, y: 450 },
        ],
        source: detachedShape,
        target: connectedShape
      });

      canvas.addConnection(connectionToDetached, rootShape);
    }));


    it('should keep connection when reattaching', inject(function(modeling) {

      // when
      modeling.updateAttachment(attachedShape, hostShape);

      // then
      expect(attachedShape.outgoing).to.have.lengthOf(1);

      expect(connectedShape.incoming).to.have.lengthOf(2);
    }));


    it('should keep connection when detaching', inject(function(modeling) {

      // when
      modeling.updateAttachment(attachedShape, null);

      // then
      expect(attachedShape.outgoing).to.have.lengthOf(1);

      expect(connectedShape.incoming).to.have.lengthOf(2);
    }));


    it('should keep connection when attaching', inject(function(modeling) {

      // when
      modeling.updateAttachment(detachedShape, hostShape);

      // then
      expect(detachedShape.outgoing).to.have.lengthOf(1);

      expect(connectedShape.incoming).to.have.lengthOf(2);
    }));


    it('should keep connection when undoing detach', inject(function(modeling, commandStack) {

      // given
      modeling.updateAttachment(attachedShape, null);

      // when
      commandStack.undo();

      // then
      expect(attachedShape.outgoing).to.have.lengthOf(1);

      expect(connectedShape.incoming).to.have.lengthOf(2);
    }));

  });

});
