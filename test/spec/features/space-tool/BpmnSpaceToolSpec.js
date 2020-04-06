import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';
import rulesModule from 'lib/features/rules';
import snappingModule from 'lib/features/snapping';
import spaceToolModule from 'lib/features/space-tool';

import { createCanvasEvent as canvasEvent } from '../../../util/MockEvents';

import { getMid } from 'diagram-js/lib/layout/LayoutUtil';


describe('features/space-tool - BpmnSpaceTool', function() {

  var testModules = [
    coreModule,
    modelingModule,
    rulesModule,
    snappingModule,
    spaceToolModule
  ];

  var diagramXML = require('./BpmnSpaceTool.bpmn');

  beforeEach(bootstrapModeler(diagramXML, {
    modules: testModules
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  it('should not resize text annotations', inject(function(dragging, elementRegistry, spaceTool) {

    // given
    var textAnnotation = elementRegistry.get('TextAnnotation_1'),
        textAnnotationMid = getMid(textAnnotation),
        textAnnotationWidth = textAnnotation.width;

    // when
    spaceTool.activateMakeSpace(canvasEvent({ x: textAnnotationMid.x, y: 0 }));

    dragging.move(canvasEvent({ x: textAnnotationMid.x + 100, y: 0 }));

    dragging.end();

    // then
    expect(textAnnotation.width).to.equal(textAnnotationWidth);
  }));

});