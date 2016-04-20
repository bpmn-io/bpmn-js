'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var clipboardModule = require('../../../../lib/features/clipboard');


describe('features/clipboard - ', function() {

  beforeEach(bootstrapDiagram({
    modules: [ clipboardModule ]
  }));

  it('should set element to clipboard', inject(function(clipboard) {
    // when
    clipboard.set('foo');

    var result = clipboard.get();

    // then
    expect(result).to.contain('foo');
  }));


  it('should clear the clipboard', inject(function(clipboard) {
    // when
    clipboard.set('foo');

    var oldClipboard = clipboard.clear();

    // then
    expect(clipboard.isEmpty()).to.be.true;
    expect(oldClipboard).to.contain('foo');
  }));


});
