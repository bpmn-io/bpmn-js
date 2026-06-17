import { expect } from 'chai';
import {
  bootstrapModeler,
  inject
} from 'bpmn-js/test/TestHelper.js';

import groupsXML from './Groups.bpmn';


describe('import - groups', function() {

  describe('should import groups', function() {

    it('with frame property set', function() {

      // given
      return bootstrapModeler(groupsXML)().then(function(result) {

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
