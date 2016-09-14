'use strict';

var inherits = require('inherits');

var BaseRenderer = require('diagram-js/lib/draw/BaseRenderer');

var componentsToPath = require('diagram-js/lib/util/RenderUtil').componentsToPath;

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');


function CustomRenderer(eventBus, styles) {

  BaseRenderer.call(this, eventBus, 2000);

  this._styles = styles;

  var self = this;

  var computeStyle = styles.computeStyle;

  this.handlers = {
    'custom:triangle': function(parentGfx, element) {
      return self.drawTriangle(parentGfx, element.width);
    },
    'custom:circle': function(parentGfx, element, attrs) {
      return self.drawCircle(parentGfx, element.width, element.height,  attrs);
    }
  };

  this.drawTriangle = function(parentGfx, side, attrs) {
    var halfSide = side / 2,
        points;

    points = [{ x: halfSide, y: 0 }, { x: side, y: side }, { x: 0, y: side }];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = computeStyle(attrs, {
      stroke: '#3CAA82',
      strokeWidth: 2,
      fill: '#3CAA82'
    });

    var polygon = svgCreate('polygon');
    svgAttr(polygon, { points: pointsString });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
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

  this.drawCircle = function(parentGfx, width, height, attrs) {
    var cx = width / 2,
        cy = height / 2;

    attrs = computeStyle(attrs, {
      stroke: '#4488aa',
      strokeWidth: 4,
      fill: 'white'
    });

    var circle = svgCreate('circle');
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4)
    });
    svgAttr(circle, attrs);

    svgAppend(parentGfx, circle);

    return circle;
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
