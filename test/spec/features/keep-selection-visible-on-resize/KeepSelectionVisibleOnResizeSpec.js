import { expect } from 'chai';

import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import keepSelectionVisibleOnResizeModule from 'diagram-js/lib/features/keep-selection-visible-on-resize';

import { getBBox } from 'diagram-js/lib/util/Elements';
import { asTRBL } from 'diagram-js/lib/layout/LayoutUtil';


describe('features/keep-selection-visible-on-resize', function() {

  var diagramXML = require('./keep-selection-visible-on-resize.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    keepSelectionVisibleOnResizeModule
  ];

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules,
    canvas: {
      width: 800,
      height: 600
    }
  }));


  it('should scroll right when canvas shrinks and selection is near right edge', inject(
    function(canvas, elementRegistry, selection) {

      // given
      var task = elementRegistry.get('Task_Right');
      selection.select(task);

      // when
      canvas.getContainer().style.width = '600px';
      canvas.resized();

      // then
      expectSelectionInView(canvas, selection);
    }
  ));


  it('should scroll down when canvas shrinks and selection is near bottom edge', inject(
    function(canvas, elementRegistry, selection) {

      // given
      var task = elementRegistry.get('Task_Bottom');
      selection.select(task);

      // when
      canvas.getContainer().style.height = '400px';
      canvas.resized();

      // then
      expectSelectionInView(canvas, selection);
    }
  ));


  it('should NOT scroll when selection is still visible after resize', inject(
    function(canvas, elementRegistry, selection) {

      // given
      var task = elementRegistry.get('Task_TopLeft');
      selection.select(task);

      var viewboxBefore = canvas.viewbox();

      // when
      canvas.getContainer().style.width = '600px';
      canvas.resized();

      // then
      var viewboxAfter = canvas.viewbox();
      expect(viewboxAfter.x).to.equal(viewboxBefore.x);
      expect(viewboxAfter.y).to.equal(viewboxBefore.y);
    }
  ));


  it('should NOT scroll when selection was not visible before resize', inject(
    function(canvas, elementRegistry, selection) {

      // given
      var task = elementRegistry.get('Task_Right');
      selection.select(task);

      canvas.scroll({ dx: -2000, dy: 0 });

      var viewboxBefore = canvas.viewbox();

      // when
      canvas.getContainer().style.width = '600px';
      canvas.resized();

      // then
      var viewboxAfter = canvas.viewbox();
      expect(viewboxAfter.x).to.equal(viewboxBefore.x);
      expect(viewboxAfter.y).to.equal(viewboxBefore.y);
    }
  ));

});


function expectSelectionInView(canvas, selection) {
  var SCROLL_PADDING = 10;
  var viewbox = canvas.viewbox();
  var viewboxTrbl = asTRBL(viewbox);
  var selectionBBox = getBBox(selection.get());
  var selectionTrbl = asTRBL(selectionBBox);

  expect(selectionTrbl.left).to.be.at.least(viewboxTrbl.left + SCROLL_PADDING);
  expect(selectionTrbl.right).to.be.at.most(viewboxTrbl.right - SCROLL_PADDING);
  expect(selectionTrbl.top).to.be.at.least(viewboxTrbl.top + SCROLL_PADDING);
  expect(selectionTrbl.bottom).to.be.at.most(viewboxTrbl.bottom - SCROLL_PADDING);
}
