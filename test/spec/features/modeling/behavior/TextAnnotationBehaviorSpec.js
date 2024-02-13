import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import autoResizeModule from 'lib/features/auto-resize';


describe('features/modeling - TextAnnotationBehavior', function() {

  var testModules = [ coreModule, modelingModule, autoResizeModule ];

  var processDiagramXML = require('./TextAnnotationBehaviorSpec.bpmn');

  beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));

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


  it('should NOT resize Container on Text Annotation resize', inject(function(modeling) {

    // when
    modeling.moveShape(annotation, { x: 250, y: 250 });

    // then
    expect(subprocess.width).to.equal(350);
    expect(subprocess.height).to.equal(200);
  }));

});
