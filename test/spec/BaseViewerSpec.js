import BaseViewer from 'lib/BaseViewer';


describe('BaseViewer', function() {

  it('should instantiate', function() {

    // when
    var instance = new BaseViewer();

    // then
    expect(instance.importXML).to.exist;
    expect(instance.saveXML).to.exist;

    expect(instance instanceof BaseViewer).to.be.true;
  });

});
