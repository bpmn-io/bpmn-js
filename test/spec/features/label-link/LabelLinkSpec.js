import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import outlineModule from 'lib/features/outline';
import labelLinkModule from 'lib/features/label-link';

import { queryAll as domQueryAll } from 'min-dom';

import { expectSvgPath } from '../../../util/svgHelpers';


describe('features/label-link - label link', function() {

  var diagramXML = require('./LabelLink.bpmn');

  var testModules = [ coreModule, modelingModule, outlineModule, labelLinkModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should not show when nothing selected', inject(function() {
    var links = queryAllLinks();
    expect(links).to.have.length(0);
  }));


  it('should show for event', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('End_Event');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M450,265L450,313');
    })
  );


  it('should show for sequence flow', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Sequence_Curved');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M328.5,240L364,197');
    })
  );


  it('should show for gateway', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Gateway');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M318,115L345,77');
    })
  );


  it('should not show if close to element', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Start_Event');

      // when
      selection.select(element);

      // then
      const links = queryAllLinks();
      expect(links).to.have.length(0);
    })
  );


  it('should update if element moved', inject(
    function(selection, elementRegistry, modeling) {

      // given
      const element = elementRegistry.get('End_Event');

      // when
      selection.select(element);
      modeling.moveShape(element, { x: 100, y: 0 });

      // then
      const links = queryAllLinks();
      expect(links).to.have.length(1);

      expectLinkWithPath('M532,255L459,313');
    })
  );


  it('should update if label moved', inject(
    function(selection, elementRegistry, modeling) {

      // given
      const element = elementRegistry.get('End_Event');
      const label = element.labels[0];

      // when
      selection.select(label);
      modeling.moveShape(label, { x: 100, y: 0 });

      // then
      const links = queryAllLinks();
      expect(links).to.have.length(1);

      expectLinkWithPath('M464,251L533,306');
    })
  );


  it('should show when both label and target selected', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('End_Event');
      const label = element.labels[0];

      // when
      selection.select([ element, label ]);

      // then
      expectLinkWithPath('M450,265L450,306');
    })
  );
});

// helpers
function queryAllLinks() {
  return domQueryAll('.bjs-label-link');
}

function expectLinkWithPath(path) {
  const links = queryAllLinks();
  const linePath = links[0].getAttribute('d');

  expectSvgPath(linePath, path);
}