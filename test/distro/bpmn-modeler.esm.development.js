import BpmnJS from '/base/dist/bpmn-modeler.esm.development.js';

describe('bpmn-modeler.esm', function() {

  it('should expose globals', function() {
    // then
    expect(BpmnJS).to.exist;
    expect(new BpmnJS()).to.exist;
  });


  it('should expose Viewer and NavigatedViewer', function() {
    // then
    expect(BpmnJS.NavigatedViewer).to.exist;
    expect(new BpmnJS.NavigatedViewer()).to.exist;

    expect(BpmnJS.Viewer).to.exist;
    expect(new BpmnJS.Viewer()).to.exist;
  });


  it('should import initial diagram', function(done) {
    // then
    /* global testImport */
    testImport(BpmnJS, done);
  });

});
