'use strict';

var inherits = require('inherits');

var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer');

var componentsToPath = require('diagram-js/lib/util/RenderUtil').componentsToPath;


function CustomRenderer(eventBus, styles) {

  BaseRenderer.call(this, eventBus, 2000);

  this._styles = styles;

  var self = this;

  var computeStyle = styles.computeStyle;

  this.handlers = {
    'custom:triangle': function(p, element) {
      return self.drawTriangle(p, element.width);
    },
    'custom:circle': function(p, element, attrs) {
      return self.drawCircle(p, element.width, element.height,  attrs);
    }
  };

  this.drawTriangle = function(p, side, attrs) {
    var halfSide = side / 2,
        points;

    points = [ halfSide, 0, side, side, 0, side ];

    attrs = computeStyle(attrs, {
      stroke: '#3CAA82',
      strokeWidth: 2,
      fill: '#3CAA82'
    });

    return p.polygon(points).attr(attrs);
  };

  this.getTrianglePath = function(element) {
    var x = element.x,
        y = element.y,
        width = element.width,
        height = element.height;

    var trianglePath = [
      ['M', x + width / 2, y],
      ['l', width / 2, height],
      ['l', -width, 0 ],
      ['z']
    ];

    return componentsToPath(trianglePath);
  };

  this.drawCircle = function(p, width, height, attrs) {
    var cx = width / 2,
        cy = height / 2;

    attrs = computeStyle(attrs, {
      stroke: '#4488aa',
      strokeWidth: 4,
      fill: 'white'
    });

    return p.circle(cx, cy, Math.round((width + height) / 4)).attr(attrs);
  };

  this.getCirclePath = function(shape) {
    var cx = shape.x + shape.width / 2,
        cy = shape.y + shape.height / 2,
        radius = shape.width / 2;

    var circlePath = [
      ['M', cx, cy],
      ['m', 0, -radius],
      ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
      ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
      ['z']
    ];

    return componentsToPath(circlePath);
  };

}

inherits(CustomRenderer, BaseRenderer);

module.exports = CustomRenderer;

CustomRenderer.$inject = [ 'eventBus', 'styles' ];


CustomRenderer.prototype.canRender = function(element) {
  return /^custom\:/.test(element.type);
};

CustomRenderer.prototype.drawShape = function(visuals, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(visuals, element);
};

CustomRenderer.prototype.drawConnection = function(visuals, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(visuals, element);
};

CustomRenderer.prototype.getShapePath = function(element) {
  var type = element.type.replace(/^custom\:/, '');

  var shapes = {
    triangle: this.getTrianglePath,
    circle: this.getCirclePath
  };

  return shapes[type](element);
};
