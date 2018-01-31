'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var DEFAULT_COLORS = {
  fill: undefined,
  stroke: undefined
};


function SetColorHandler(commandStack) {
  this._commandStack = commandStack;
}

SetColorHandler.$inject = [
  'commandStack'
];

module.exports = SetColorHandler;

SetColorHandler.prototype.postExecute = function(context) {
  var elements = context.elements,
      colors = context.colors || DEFAULT_COLORS;

  var self = this;

  var di = {};

  if ('fill' in colors) {
    assign(di, { fill: colors.fill });
  }

  if ('stroke' in colors) {
    assign(di, { stroke: colors.stroke });
  }

  forEach(elements, function(element) {

    self._commandStack.execute('element.updateProperties', {
      element: element,
      properties: {
        di: di
      }
    });
  });

};