import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('import - groups', function() {

  describe('should import groups', function() {

    it('with frame property set', function() {
      var xml = require('./Groups.bpmn');

      // given
      return bootstrapModeler(xml)().then(function(result) {

        var err = result.error;

        expect(err).not.to.exist;

        // when
        inject(function(elementRegistry) {

          // then
          var groupElement = elementRegistry.get('Group_1');

          expect(groupElement).to.exist;
          expect(groupElement.isFrame).to.be.true;
        })();

      });
    });


  });

});
