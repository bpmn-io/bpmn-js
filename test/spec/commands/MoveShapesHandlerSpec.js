require('../../../src/core/EventBus');
require('../../../src/features/dnd/Events');

var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;


describe('MoveShapesHandler', function() {

  
  beforeEach(bootstrapDiagram({ components: [ 'dragEvents' ] }));

  describe('should execute move', function() {


    it('on diagram', inject(function(canvas, commandStack) {

      // given
      var s1 = { id: 's1', x: 10, y: 20 };

      canvas.addShape(s1);

      // when
      commandStack.execute('shape.move', { dx: 30, dy: 30, shapes: [ s1 ]});

      // then
      expect(s1.x).toEqual(40);
      expect(s1.y).toEqual(50);
    }));


    it('with children', inject(function(canvas, elementRegistry, commandStack) {

      // given
      var parent = { id: 's1', x: 10, y: 10, width: 100, height: 100 };
      var child = { id: 's2', x: 30, y: 30, width: 20, height: 20, parent: parent };

      canvas.addShape(parent).addShape(child);


      // when
      commandStack.execute('shape.move', { dx: 30, dy: 30, shapes: [ parent ]});

      // then
      expect(child.x).toEqual(60);
      expect(child.y).toEqual(60);

      var gfx = elementRegistry.getGraphicsByShape(child);
      var bbox = gfx.getBBox();

      expect(bbox.x).toEqual(60);
      expect(bbox.y).toEqual(60);
    }));


    it('with children selected', inject(function(canvas, elementRegistry, commandStack) {

      // given
      var parent = { id: 's1', x: 10, y: 10, width: 100, height: 100 };
      var child = { id: 's2', x: 30, y: 30, width: 20, height: 20, parent: parent };

      canvas.addShape(parent).addShape(child);


      // when
      commandStack.execute('shape.move', { dx: 30, dy: 30, shapes: [ parent, child ]});

      // then
      expect(child.x).toEqual(60);
      expect(child.y).toEqual(60);

      var gfx = elementRegistry.getGraphicsByShape(child);
      var bbox = gfx.getBBox();

      expect(bbox.x).toEqual(60);
      expect(bbox.y).toEqual(60);
    }));
  });


  it('should undo add of shape', inject(function(canvas, elementRegistry, commandStack) {

    // given
    var s1 = { id: 's1', x: 10, y: 20 };

    canvas.addShape(s1);
    commandStack.execute('shape.move', { dx: 30, dy: 30, shapes: [ s1 ]});

    // when
    commandStack.undo();

    // then
    expect(s1.x).toEqual(10);
    expect(s1.y).toEqual(20);
  }));


  it('should redo shape movement', inject(function(canvas, elementRegistry, commandStack) {

    // given
    var s1 = { id: 's1', x: 10, y: 20 };

    canvas.addShape(s1);
    commandStack.execute('shape.move', { dx: 30, dy: 30, shapes: [ s1 ]});

    // when
    commandStack.undo();
    commandStack.redo();

    // then
    expect(s1.x).toEqual(40);
    expect(s1.y).toEqual(50);
  }));


  xit('should undo with parent');

  xit('should redo with parent');

});