'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */


var clipboardModule = require('../../../../lib/features/clipboard');


describe('features/clipboard', function() {

  var contents = { foo: 'bar' };

  beforeEach(bootstrapDiagram({
    modules: [ clipboardModule ]
  }));


  it('should set element to clipboard', inject(function(clipboard) {
    // when
    clipboard.set(contents);

    var result = clipboard.get();

    // then
    expect(result).to.eql(contents);
    expect(clipboard.isEmpty()).to.be.false;
  }));


  it('should clear the clipboard', inject(function(clipboard) {
    // when
    clipboard.set(contents);

    var oldClipboard = clipboard.clear();

    // then
    expect(clipboard.isEmpty()).to.be.true;
    expect(oldClipboard).to.contain(contents);
  }));

});
