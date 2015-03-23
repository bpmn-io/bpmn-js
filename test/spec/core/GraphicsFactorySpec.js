'use strict';

/* global bootstrapDiagram, inject */

var merge = require('lodash/object/merge');

describe('GraphicsFactory', function() {

  var container;

  function createDiagram(options) {

    return bootstrapDiagram(function() {
      container = jasmine.getEnv().getTestContainer();
      return merge({ canvas: { container: container } }, options);
    }, {});
  }

  beforeEach(createDiagram());

  it('should not fail on update root shape', inject(function(canvas, graphicsFactory, elementRegistry) {

    // given
    var root = canvas.getRootElement();
    var gfx = elementRegistry.getGraphics(root);

    // when
    graphicsFactory.update('shape', root, gfx);

    // then
    // expect not to throw an exception
  }));
});
