var Events = require('../../../lib/features/Bendpoints');

var TestHelper = require('../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;


describe('features/Bendpoints', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ components: [ 'bendpoints' ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

});