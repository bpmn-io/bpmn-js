import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import modelingModule from 'bpmn-js/lib/features/modeling';
import coreModule from 'bpmn-js/lib/core';
import autoResizeModule from 'bpmn-js/lib/features/auto-resize';

import diagramXML from './TextAnnotationBehaviorSpec.bpmn';


describe('features/modeling - TextAnnotationBehavior', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    modules: [
      coreModule,
      modelingModule,
      autoResizeModule
    ]
  }));

  var annotation,
      task,
      subprocess;

  beforeEach(inject(function(elementRegistry) {
    annotation = elementRegistry.get('TextAnnotation_1');
    task = elementRegistry.get('Task_1');
    subprocess = elementRegistry.get('Subprocess_1');
  }));


  it('should NOT resize Container on appending Text Annotation', inject(function(modeling) {

    // when
    modeling.appendShape(task, { type: 'bpmn:TextAnnotation' });

    // then
    expect(subprocess.width).to.equal(350);
    expect(subprocess.height).to.equal(200);
  }));


  it('should NOT resize Container on Text Annotation resize', inject(function(modeling) {

    // when
    modeling.resizeShape(annotation, { x: 0, y: 0, width: 1000, height: 1000 });

    // then
    expect(subprocess.width).to.equal(350);
    expect(subprocess.height).to.equal(200);
  }));


  it('should NOT resize Container on Text Annotation move', inject(function(modeling) {

    // when
    modeling.moveShape(annotation, { x: 250, y: 250 });

    // then
    expect(subprocess.width).to.equal(350);
    expect(subprocess.height).to.equal(200);
  }));

});
