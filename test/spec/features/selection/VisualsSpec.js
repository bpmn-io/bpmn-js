var Events = require('../../../../src/features/selection/Visuals');

var TestHelper = require('../../../TestHelper'),
    inject = TestHelper.inject,
    bootstrapDiagram = TestHelper.bootstrapDiagram;


describe('features/selection/Visuals', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ components: [ 'selectionVisuals' ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });

});