'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

function SetColorHandler(commandStack) {
  this._commandStack = commandStack;
}

SetColorHandler.$inject = [ 'commandStack' ];

module.exports = SetColorHandler;

SetColorHandler.prototype.postExecute = function(context) {
  var elements = context.elements,
      colors = context.colors || { fill: undefined, stroke: undefined };

  var that = this;

  var di = {};

  if ('fill' in colors) {
    assign(di, { fill: colors.fill });
  }

  if ('stroke' in colors) {
    assign(di, { stroke: colors.stroke });
  }

  forEach(elements, function(element) {
    that._commandStack.execute('element.updateProperties', {
      element: element,
      properties: {
        di: di
      }
    });
  });

};

SetColorHandler.prototype.execute = function(context) {};

SetColorHandler.prototype.revert = function(context) {};
