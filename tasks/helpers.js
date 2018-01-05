'use strict';

module.exports.asyncSeries = function(fns, done) {

  var idx = 0;

  function next(err) {

    if (err) {
      return done(err);
    }

    var fn = fns[idx++];

    if (!fn) {
      return done();
    } else {
      fn(next);
    }
  }

  next();
};