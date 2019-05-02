import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';


describe('import - groups', function() {

  describe('should import groups', function() {

    it('with frame property set', function(done) {
      var xml = require('./Groups.bpmn');

      // given
      bootstrapModeler(xml)(function(err) {

        // when
        inject(function(elementRegistry) {

          // then
          var groupElement = elementRegistry.get('Group_1');

          expect(groupElement).to.exist;
          expect(groupElement.isFrame).to.be.true;

          done(err);
        })();

      });
    });


  });

});