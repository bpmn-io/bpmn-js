'use strict';

module.exports = function (chai, utils) {
  var Assertion = chai.Assertion;

  utils.addProperty(Assertion.prototype, 'defined', function () {
    var negate = utils.flag(this, 'negate'),
      theAssert = new Assertion(this._obj);

    if (negate) {
      theAssert.to.be.undefined;
    } else {
      theAssert.to.not.be.undefined;
    }
  });
};
