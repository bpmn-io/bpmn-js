var jsondiffpatch = require('jsondiffpatch'),
    _ = require('lodash');


var compare = jsondiffpatch.create({
  objectHash: function (obj) {
    return JSON.stringify(obj);
  }
});


function deepEquals(actual, expected) {
  var actualClone = _.cloneDeep(actual);
  var expectedClone = _.cloneDeep(expected);

  var result = {
    pass: _.isEqual(actualClone, expectedClone)
  };

  if (!result.pass) {
    console.error('[to-deep-equal] elements do not equal. diff: ', compare.diff(actualClone, expectedClone), false, 4);
  }

  return result;
}

function wrap(isOld, callback) {
  if (isOld) {
    return function(expected) {
      return callback(expected, this.actual).pass;
    };
  } else {
    return callback;
  }
}

function addMatchers() {

  // DIRTY HACK DDDSZZZ
  // Remove when we got jasmin 2.x in browser AND node env

  var old = !jasmine.addMatchers;

  (old ? this : jasmine).addMatchers({

    toDeepEqual: wrap(old, function(actual, expected) {
      return deepEquals(actual, expected);
    })
  });
}

module.exports.add = addMatchers;