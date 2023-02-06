import BaseModeler from 'lib/BaseModeler';
import BaseViewer from 'lib/BaseViewer';

import inherits from 'inherits-browser';


const spy = sinon.spy;


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


  describe('#getModule', function() {

    it('should allow override with context', function() {

      // given
      const options = {
        __foo: 1,
        some: {
          other: {
            thing: 'yes'
          }
        }
      };

      function SpecialModeler(options) {
        this.getModules = spy(function(localOptions) {
          expect(localOptions, 'options are passed').to.exist;

          expect(localOptions).to.include(options);

          return BaseModeler.prototype.getModules.call(this, localOptions);
        });

        BaseModeler.call(this, options);
      }

      inherits(SpecialModeler, BaseModeler);

      // when
      var instance = new SpecialModeler(options);

      // then
      expect(instance.getModules).to.have.been.calledOnce;

      expect(instance instanceof SpecialModeler).to.be.true;
      expect(instance instanceof BaseModeler).to.be.true;
      expect(instance instanceof BaseViewer).to.be.true;
    });

  });

});
