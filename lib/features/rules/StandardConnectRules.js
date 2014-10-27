'use strict';

function canConnect(context) {

  return context.source && context.target && context.source.parent === context.target.parent;
}


module.exports.canConnect = canConnect;
