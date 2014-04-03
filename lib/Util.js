var _  = require('lodash');

function failSafeAsync(fn) {

  return function() {

    var args = Array.prototype.slice.call(arguments);

    var done = args[args.length - 1];
    if (!done || !_.isFunction(done)) {
      done = function(e) {
        throw e;
      };
    }

    try {
      fn.apply(this, args);
    } catch (e) {
      done(e);
    }
  };
}

module.exports.failSafeAsync = failSafeAsync;