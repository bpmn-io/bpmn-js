describe('bpmn-modeler', function() {

  it('should expose globals', function() {

    var BpmnJS = window.BpmnJS;

    // then
    expect(BpmnJS).to.exist;
    expect(new BpmnJS()).to.exist;
  });


  it('should expose Viewer and NavigatedViewer', function() {

    var BpmnJS = window.BpmnJS;

    // then
    expect(BpmnJS.NavigatedViewer).to.exist;
    expect(new BpmnJS.NavigatedViewer()).to.exist;

    expect(BpmnJS.Viewer).to.exist;
    expect(new BpmnJS.Viewer()).to.exist;
  });


  it('should import initial diagram', function(done) {

    var BpmnJS = window.BpmnJS;

    // then
    /* global testImport */
    testImport(BpmnJS, done);
  });

});