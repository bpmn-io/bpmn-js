'use strict';

var fs = require('fs');


function ContextPadProvider(contextPad) {
  contextPad.registerProvider(this);
}

ContextPadProvider.$inject = [ 'contextPad' ];

ContextPadProvider.prototype.getContextPadEntries = function(element) {

  if (element.type === 'A') {
    return {
      'action.a': {
        imageUrl: 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/a.png', 'base64'),
        action: function(e) {
          console.log('action.a', e);
        }
      },
      'action.b': {
        imageUrl: 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/b.png', 'base64'),
        action: function(e) {
          console.log('action.b', e);
        }
      }
    };
  } else {
    return {
      'action.c': {
        imageUrl: 'data:image/png;base64,' + fs.readFileSync(__dirname + '/resources/c.png', 'base64'),
        action: function(e) {
          console.log('action.c', e);
        }
      },
      'action.no-image': {
        action: function(e) {
          console.log('action.no-image', e);
        }
      }
    };
  }
};

module.exports = ContextPadProvider;