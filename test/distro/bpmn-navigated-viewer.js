describe('bpmn-navigated-viewer', function() {

  it('should expose globals', function() {

    var BpmnJS = window.BpmnJS;

    // then
    expect(BpmnJS).to.exist;
    expect(new BpmnJS()).to.exist;
  });


  it('should expose Viewer', function() {

    var BpmnJS = window.BpmnJS;

    // then
    expect(BpmnJS.Viewer).not.to.exist;
  });


  it('should import initial diagram', function(done) {

    var BpmnJS = window.BpmnJS;

    // then
    /* global testImport */
    testImport(BpmnJS, done);
  });

});