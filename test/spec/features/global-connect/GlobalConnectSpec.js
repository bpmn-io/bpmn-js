'use strict';

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */

var modelingModule = require('../../../../lib/features/modeling'),
    globalConnectModule = require('../../../../lib/features/global-connect');


function Provider(allow) {
  this.canStartConnect = function functionName() {
    return allow;
  };
}


describe('features/global-connect-tool', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule, globalConnectModule ] }));

  var rootShape, shape1, shape2;

  beforeEach(inject(function(elementFactory, canvas, globalConnect) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 's1',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 's2',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);
  }));


  it('should start connect if allowed', inject(function(eventBus, globalConnect, dragging) {
    // given
    globalConnect.registerProvider(new Provider(true));

    // then
    eventBus.once('connect.init', function(event) {
      expect(event.context.source).to.eql(shape1);
    });

    // when
    globalConnect.start(canvasEvent({ x: 0, y: 0 }));
    dragging.hover(canvasEvent({ x: 150, y: 150 }, { element: shape1 }));
    dragging.end(canvasEvent({ x: 0, y: 0 }));

    eventBus.fire('element.out', canvasEvent({ x: 99, y: 99 }, { element: shape1 }));
  }));


  it('should NOT start connect if rejected', inject(function(eventBus, globalConnect, dragging) {
    // given
    globalConnect.registerProvider(new Provider(false));

    // then
    eventBus.once('connect.init', function(event) {
      throw new Error('"connect.init" should not be called');
    });

    // when
    globalConnect.start(canvasEvent({ x: 0, y: 0 }));
    dragging.hover(canvasEvent({ x: 150, y: 150 }, { element: shape1 }));
    dragging.end(canvasEvent({ x: 0, y: 0 }));

    eventBus.fire('element.out', canvasEvent({ x: 99, y: 99 }, { element: shape1 }));
  }));

});
