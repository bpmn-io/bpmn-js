var _ = require('lodash');


module.exports.addDeepEquals = function() {
  var jsondiffpatch = require('jsondiffpatch');

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

    var message;

    if (!result.pass) {
      message =
        'Expected elements to equal but got diff\n' +
        JSON.stringify(compare.diff(actualClone, expectedClone), null, '  ');
    } else {
      message = 'Expected elements not to equal';
    }

    result.message = message;

    return result;
  }

  jasmine.addMatchers({
    toDeepEqual: function(util) {
      return {
        compare: deepEquals
      };
    }
  });
};

module.exports.addBBoxMatchers = function() {

  jasmine.addMatchers({

    toFitBBox: function(util) {

      return {
        compare: function(actual, expected) {

          var actualBBox = actual.getBBox();

          var pass = actualBBox.x >= expected.x &&
                     actualBBox.y >= expected.y &&
                     actualBBox.width <= expected.width &&
                     actualBBox.x + actualBBox.width <= expected.x + expected.width &&
                     (expected.height ? actualBBox.height <= expected.height : true) &&
                     (expected.height ? actualBBox.y + actualBBox.height <= expected.y + expected.height : true);

          var message = '';

          if (!pass) {
            message = 'Expected element#' + actual.id + ' with bbox ' +
                                    jasmine.pp(_.pick(actualBBox, ['x', 'y', 'width', 'height'])) + ' to fit ' +
                                    jasmine.pp(expected);
          }

          return {
            pass: pass,
            message: message
          };
        }
      };
    }
  });
};