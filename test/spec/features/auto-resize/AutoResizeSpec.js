'use strict';

/* global bootstrapDiagram, inject, sinon */

var modelingModule = require('../../../../lib/features/modeling'),
    autoResizeModule = require('../../../../lib/features/auto-resize');

var AutoResizeProvider = require('../../../../lib/features/auto-resize/AutoResizeProvider'),
    AutoResize = require('../../../../lib/features/auto-resize/AutoResize');

var inherits = require('inherits');


/**
 * Custom auto-resize provider.
 *
 * @param {EventBus} eventBus
 */
function CustomAutoResizeProvider(eventBus) {
  AutoResizeProvider.call(this, eventBus);

  this.canResize = function(elements, target) {
    return target.id !== 'root';
  };
}

inherits(CustomAutoResizeProvider, AutoResizeProvider);


function CustomAutoResize(injector) {
  injector.invoke(AutoResize, this);

  this.getOffset = function(element) {
    return { top: 10, bottom: 10, left: 10, right: 10 };
  };
}

inherits(CustomAutoResize, AutoResize);


var customAutoResizeModule = {
  __init__: [ 'customAutoResizeProvider' ],
  autoResize: [ 'type', CustomAutoResize ],
  customAutoResizeProvider: [ 'type', CustomAutoResizeProvider ]
};


describe('features/auto-resize', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      autoResizeModule,
      customAutoResizeModule
    ]
  }));


  var rootShape,
      parentShape,
      childShape,
      topLevelShape;

  beforeEach(inject(function(elementFactory, canvas, modeling) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    topLevelShape = elementFactory.createShape({
      id: 'topLevel',
      x: 410, y: 110, width: 100, height: 100
    });

    canvas.addShape(topLevelShape, rootShape);

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


  it('should expand after moving non-child into parent', inject(function(modeling) {

    // when
    modeling.moveElements([ topLevelShape ], { x: -50, y: 0 }, parentShape);

    // then
    expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 370, height: 300 });
  }));


  describe('expand after moving child', function() {

    it('should expand to the left', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape ], { x: -20, y: 0 }, parentShape);

      // then
      expect(parentShape).to.have.bounds({ x: 80, y: 100, width: 320, height: 300 });
    }));


    it('should expand to the right', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape ], { x: 300, y: 0 }, parentShape);

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 420, height: 300 });
    }));


    it('should expand to the top', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape ], { x: 0, y: -50 }, parentShape);

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 50, width: 300, height: 350 });
    }));


    it('should expand to the bottom', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape ], { x: 0, y: 300 }, parentShape);

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 420 });
    }));


    it('should not expand if moved to root element', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape ], { x: 0, y: 300 }, rootShape);

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
    }));

  });


  describe('expand after moving multiple elements', function() {

    it('should not expand, if elements keep their parents (different original parents)',
      inject(function(modeling) {

        // when
        modeling.moveElements([ childShape, topLevelShape ],
          { x: 0, y: 100 }, rootShape, { primaryShape: topLevelShape });

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
      })
    );


    it('should expand non-primary parents', inject(function(modeling) {

      // when
      modeling.moveElements([ childShape, topLevelShape ],
        { x: 0, y: -80 }, rootShape, { primaryShape: topLevelShape });

      // then
      expect(parentShape).to.have.bounds({ x: 100, y: 20, width: 300, height: 380 });
    }));


    it('should expand, if elements keep their parents (same original parent)',
      inject(function(modeling) {

        // given
        modeling.moveElements([ topLevelShape ], { x: -50, y: 0 }, parentShape);

        // when
        modeling.moveElements([ childShape, topLevelShape ],
          { x: 100, y: 0 }, parentShape, { primaryShape: childShape });

        // then
        expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 470, height: 300 });
      })
    );

  });


  describe('hints', function() {

    it('should not resize on autoResize=false hint', inject(function(modeling) {

      // when
      modeling.moveElements(
        [ childShape ],
        { x: -20, y: 0 },
        parentShape,
        { autoResize: false });

      // then
      // parent has original bounds
      expect(parentShape).to.have.bounds({ x: 100, y: 100, width: 300, height: 300 });
    }));

  });


  it('should provide extension points', inject(function(autoResize, modeling) {

    // given
    var getPaddingSpy = sinon.spy(autoResize, 'getPadding'),
        getOffsetSpy = sinon.spy(autoResize, 'getOffset');

    // when
    modeling.moveElements([ childShape ], { x: -50, y: 0 });

    // then
    expect(getPaddingSpy).to.have.been.calledWith(parentShape);
    expect(getOffsetSpy).to.have.been.calledWith(parentShape);
  }));

});