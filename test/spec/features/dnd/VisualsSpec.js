var Events = require('../../../../src/features/dnd/Visuals');

var TestHelper = require('../../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;


describe('features/dnd/Visuals', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ components: [ 'dragVisuals' ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

});