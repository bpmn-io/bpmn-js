import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import outlineModule from 'lib/features/outline';
import drilldownModule from 'lib/features/drilldown';
import labelLinkModule from 'lib/features/label-link';

import { queryAll as domQueryAll } from 'min-dom';

import { expectSvgPath } from '../../../util/svgHelpers';


describe('features/label-link - label link', function() {

  var diagramXML = require('./LabelLink.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    outlineModule,
    drilldownModule,
    labelLinkModule
  ];

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
      expectLinkWithPath('M450,335L450,383');
    })
  );


  it('should show for sequence flow', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Sequence_Curved');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M328,310L364,267');
    })
  );


  it('should show for gateway', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Gateway');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M318,185L345,147');
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

      expectLinkWithPath('M532,325L459,383');
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

      expectLinkWithPath('M464,321L533,376');
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
      expectLinkWithPath('M450,335L450,376');
    })
  );


  it('should show label for event in expanded subprocess', inject(
    function(selection, elementRegistry) {

      // given
      const element = elementRegistry.get('Subprocess_Event');

      // when
      selection.select(element);

      // then
      expectLinkWithPath('M498,169L527,97');
    })
  );


  it('should show label for event in collapsed subprocess plane', inject(
    function(selection, elementRegistry, bpmnReplace, canvas) {

      // given
      const subprocess = elementRegistry.get('Subprocess');

      // when
      selection.select(subprocess);
      bpmnReplace.replaceElement(subprocess, {
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      var subprocessRoot = canvas.findRoot('Subprocess_plane');
      canvas.setRootElement(subprocessRoot);

      selection.select(elementRegistry.get('Subprocess_Event'));

      // then
      expectLinkWithPath('M206,246L235,174');
    })
  );


  it('should not show label after collapsing a subprocess', inject(
    function(selection, elementRegistry, bpmnReplace) {

      // given
      const subprocess = elementRegistry.get('Subprocess');

      // when
      selection.select(subprocess);
      bpmnReplace.replaceElement(subprocess, {
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      // then
      const links = queryAllLinks();
      expect(links).to.have.length(0);
    })
  );


  it('should not show label after expanding a subprocess', inject(
    function(selection, elementRegistry, bpmnReplace) {

      // given
      const subprocess = elementRegistry.get('Subprocess');

      // when
      selection.select(subprocess);

      bpmnReplace.replaceElement(subprocess, {
        type: 'bpmn:SubProcess',
        isExpanded: false
      });

      bpmnReplace.replaceElement(subprocess, {
        type: 'bpmn:SubProcess',
        isExpanded: true
      });

      // then
      const links = queryAllLinks();
      expect(links).to.have.length(0);
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