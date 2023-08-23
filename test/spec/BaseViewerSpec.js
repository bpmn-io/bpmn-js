import BaseViewer from 'lib/BaseViewer';

import inherits from 'inherits-browser';


const spy = sinon.spy;


describe('BaseViewer', function() {

  it('should instantiate', function() {

    // when
    var instance = new BaseViewer();

    // then
    expect(instance.importXML).to.exist;
    expect(instance.saveXML).to.exist;

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

      function SpecialViewer(options) {
        this.getModules = spy(function(localOptions) {
          expect(localOptions, 'options are passed').to.exist;

          expect(localOptions).to.include(options);

          return BaseViewer.prototype.getModules.call(this, localOptions);
        });

        BaseViewer.call(this, options);
      }

      inherits(SpecialViewer, BaseViewer);

      // when
      var instance = new SpecialViewer(options);

      // then
      expect(instance.getModules).to.have.been.calledOnce;

      expect(instance instanceof SpecialViewer).to.be.true;
      expect(instance instanceof BaseViewer).to.be.true;
    });

  });

});
