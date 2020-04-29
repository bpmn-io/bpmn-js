import Modeler from 'lib/Modeler';

import TestContainer from 'mocha-test-container-support';

describe('scenario - simple modeling', function() {


  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should build process from start to end event', function() {

    // given
    var modeler = new Modeler({ container: container });

    // when
    return modeler.createDiagram();
  });

});
