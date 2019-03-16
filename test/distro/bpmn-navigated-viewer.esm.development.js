import BpmnJS from '/base/dist/bpmn-navigated-viewer.esm.development.js';

describe('bpmn-navigated-viewer', function() {

  it('should expose globals', function() {
    // then
    expect(BpmnJS).to.exist;
    expect(new BpmnJS()).to.exist;
  });


  it('should expose Viewer', function() {
    // then
    expect(BpmnJS.Viewer).not.to.exist;
  });


  it('should import initial diagram', function(done) {
    // then
    /* global testImport */
    testImport(BpmnJS, done);
  });

});