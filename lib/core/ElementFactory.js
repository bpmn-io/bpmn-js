'use strict';

var _ = require('lodash');


var LabelUtil = require('../util/Label');

var getExternalLabelBounds = LabelUtil.getExternalLabelBounds;


/**
 * A factory for diagram-js shapes
 *
 * @param {ElementFactory} canvas
 */
function ElementFactory(canvas) {
  this._canvas = canvas;
}

ElementFactory.$inject = [ 'canvas' ];

module.exports = ElementFactory;


ElementFactory.prototype.createRoot = function(semantic) {

  return this._canvas.create('root', _.extend({
    id: semantic.id,
    type: semantic.$type,
    businessObject: semantic
  }));
};


ElementFactory.prototype.createLabel = function(semantic, element) {
  var labelBounds = getExternalLabelBounds(semantic, element);

  var labelData = _.extend({
    id: semantic.id + '_label',
    labelTarget: element,
    type: 'label',
    hidden: element.hidden,
    businessObject: semantic
  }, labelBounds);

  return this._canvas.create('label', labelData);
};


ElementFactory.prototype.createShape = function(semantic, attrs) {
  var bounds = semantic.di.bounds;

  var shapeData = _.extend({
    id: semantic.id,
    type: semantic.$type,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    businessObject: semantic
  }, attrs);

  return this._canvas.create('shape', shapeData);
};


ElementFactory.prototype.createConnection = function(semantic) {
  var waypoints = _.collect(semantic.di.waypoint, function(p) {
    return { x: p.x, y: p.y };
  });

  return this._canvas.create('connection', {
    id: semantic.id,
    type: semantic.$type,
    waypoints: waypoints,
    businessObject: semantic
  });
};