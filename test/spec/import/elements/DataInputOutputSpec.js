import {
  bootstrapViewer,
  inject
} from 'test/TestHelper';


describe('import - data input/output', function() {

  describe('should import external labels', function() {

    it('with di', function(done) {

      var xml = require('./DataInputOutput.bpmn');

      // given
      bootstrapViewer(xml).call(this, function(err) {

        // when
        inject(function(elementRegistry) {

          var inputLabel = elementRegistry.get('DataInput').label,
              outputLabel = elementRegistry.get('DataOutput').label;

          var inputLabelCenter = getCenter(inputLabel),
              outputCenter = getCenter(outputLabel);

          // then
          expect(inputLabelCenter.x).to.be.within(110, 130);
          expect(inputLabelCenter.y).to.be.within(150, 170);
          expect(inputLabel.width).to.be.above(20);
          expect(inputLabel.height).to.be.above(10);

          expect(outputCenter.x).to.be.within(290, 310);
          expect(outputCenter.y).to.be.within(190, 210);
          expect(outputLabel.width).to.be.above(20);
          expect(outputLabel.height).to.be.above(10);

          done(err);
        })();

      });
    });

  });

});


// helper ////////////////

function getCenter(element) {
  return {
    x: element.x + Math.ceil(element.width / 2),
    y: element.y + Math.ceil(element.height / 2)
  };
}