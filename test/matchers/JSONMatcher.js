export default function(chai, utils) {

  utils.addMethod(chai.Assertion.prototype, 'jsonEqual', function(comparison, filter) {

    var actual = JSON.stringify(this._obj, filter, '  ');
    var expected = JSON.stringify(comparison, filter, '  ');

    this.assert(
      actual == expected,
      'expected #{this} to json equal #{exp} but got #{act}',
      'expected #{this} not to json equal #{exp}',
      expected, // expected
      actual, // actual
      true // show diff
    );
  });
}
