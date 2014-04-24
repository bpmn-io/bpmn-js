var Matchers = require('../../Matchers');

var Snap = require('../../../lib/draw/Snap'),
    LabelUtil = require('../../../lib/util/LabelUtil');

describe('LabelUtil', function() {

  var container;

  var options = {
    defaultSize: { width: 100 },
    maxSize: { width: 150 },
    boxPadding: 5
  };

  var labelUtil = new LabelUtil(options);

  beforeEach(Matchers.addBBoxMatchers);

  beforeEach(function() {

    var parent = document.createElement('div');
    parent.style.width = '200px';
    parent.style.height = '200px';
    parent.style.display = 'inline-block';

    document.body.appendChild(parent);

    var svg = Snap.createSnapAt('100%', '100%', parent);

    svg.rect(0, 0, 100, 100).attr({
      fill: 'none',
      strokeWidth: 1,
      stroke: 'black'
    });

    container = svg.group();
  });

  describe('#createLabel', function() {


    it('should create simple label', function() {

      // given
      var label = 'I am a label';

      // when
      var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }});

      expect(text).toBeDefined();
      expect(text).toFitBBox({ x: 10, y: 0, width: 80, height: 30 });
    });


    describe('should line break', function() {

      it('at word boundary', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: -25, y: 0, width: 150, height: 50 });
      });


      it('forced', function() {

        // given
        var label = 'I_am_a_long_label_that_should_break_forcibly';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: -25, y: 0, width: 150, height: 70 });
      });


      it('forced / break on hyphen', function() {

        // given
        var label = 'I_am_a_lo-ng_label_that_sho-uld_break_on_hyphens';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: -25, y: 0, width: 150, height: 70 });
      });


      it('preformated / spaced / hyphenated', function() {

        // given
        var label = 'I am\n\nnatural language\nwith some superdooooper-longwordinthe-middle';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }, fit: 'center-box' });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -40, width: 100, height: 190 });
      });


      it('mass hyphenated', function() {

        // given
        var label = 'Some superdooooper-\nlong-\nword in the middle';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }, fit: 'center-box' });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
      });


      it('preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: -20, y: 0, width: 140, height: 90 });
      });
    });


    describe('should box in bounds', function() {

      it('centered', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }, fit: 'center-box' });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 5, width: 100, height: 90 });
      });


      it('preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }, fit: 'center-box' });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: -5, width: 100, height: 120 });
      });


      it('vertical float out', function() {

        // given
        var label = 'I am a long label that should break on spaces and that floats out of the container';

        // when
        var text = labelUtil.createLabel(container, label, { box: { width: 100, height: 100 }, fit: 'center-box' });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -30, width: 100, height: 180 });
      });

    });


    describe('should style', function() {

      it('with custom font-size / weight / color', function() {

        // given
        var label = 'I am a\nstyled\nlabel that will float';
        var style = {
          fill: 'fuchsia',
          fontWeight: 'bold',
          fontFamily: 'Arial'
        };

        // when
        var text = labelUtil.createLabel(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          fit: 'center-box'
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 10, y: 5, width: 80, height: 90 });
      });
    });
  });

});