import BaseModeler from 'lib/BaseModeler';
import BaseViewer from 'lib/BaseViewer';


describe('BaseModeler', function() {

  it('should instantiate', function() {

    // when
    var instance = new BaseModeler();

    // then
    expect(instance.importXML).to.exist;
    expect(instance.saveXML).to.exist;

    expect(instance instanceof BaseModeler).to.be.true;
    expect(instance instanceof BaseViewer).to.be.true;
  });

});
