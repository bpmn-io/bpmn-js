var Events = require('../../../../lib/features/move');

var TestHelper = require('../../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;


describe('features/move', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ components: [ 'move' ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

});