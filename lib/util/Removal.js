'use strict';

module.exports.saveClear = function(collection, remove) {

  var e;

  while (!!(e = collection[0])) {
    remove(e);
  }
};
