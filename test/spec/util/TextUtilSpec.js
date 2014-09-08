var _ = require('lodash');

var Matchers = require('../../Matchers');

var Snap = require('../../../lib/draw/Snap'),
    TextUtil = require('../../../lib/util/TextUtil');


describe('TextUtil', function() {

  var container;

  var options = {
    size: { width: 100 },
    padding: 0,
    style: { fontSize: '11pt' }
  };

  var labelUtil = new TextUtil(options);

  beforeEach(Matchers.addBBoxMatchers);

  beforeEach(function() {

    var parent = document.createElement('div');
    parent.style.width = '200px';
    parent.style.height = '200px';
    parent.style.display = 'inline-block';

    document.body.appendChild(parent);

    var svg = Snap.createSnapAt('100%', '100%', parent);

    container = svg.group();
  });

  function drawRect(width, height) {
    container.rect(0, 0, width, height).attr({
      fill: 'none',
      strokeWidth: 1,
      stroke: 'black'
    });
  }

  function createLabel(container, label, options) {
    var box = _.extend({}, { width: 150, height: 50 }, options.box || {});

    drawRect(box.width, box.height);

    return labelUtil.createLabel(container, label, options);
  }


  describe('#createLabel', function() {


    it('should create simple label', function() {

      // given
      var label = 'I am a label';

      // when
      var text = createLabel(container, label, { box: { width: 150, height: 100 }});

      expect(text).toBeDefined();
      expect(text).toFitBBox({ x: 35, y: 0, width: 80, height: 30 });
    });


    describe('should line break', function() {

      it('at word boundary', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createLabel(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 150, height: 50 });
      });


      it('forced', function() {

        // given
        var label = 'I_am_a_long_label_that_should_break_forcibly';

        // when
        var text = createLabel(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 150, height: 70 });
      });


      it('forced / break on hyphen', function() {

        // given
        var label = 'I_am_a_lo-ng_label_that_sho-uld_break_on_hyphens';

        // when
        var text = createLabel(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 150, height: 70 });
      });


      it('preformated / spaced / hyphenated', function() {

        // given
        var label = 'I am\n\nnatural language\nwith some superdooooper-longwordinthe-middle';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -40, width: 100, height: 190 });
      });


      it('mass hyphenated', function() {

        // given
        var label = 'Some superdooooper-\nlong-\nword in the middle';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
      });


      it('preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = createLabel(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 0, width: 140, height: 100 });
      });
    });


    describe('should align', function() {

      it('center-middle', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 5, width: 100, height: 90 });
      });


      it('center-middle / preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -5, width: 100, height: 120 });
      });


      it('center-middle / vertical float out', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -30, width: 100, height: 180 });
      });


      it('left-middle', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          align: 'left-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -30, width: 100, height: 180 });
      });
    });


    describe('should style', function() {

      it('with custom size / weight / color / center-middle', function() {

        // given
        var label = 'I am a\nstyled\nlabel that will float';
        var style = {
          fill: 'fuchsia',
          fontWeight: 'bold',
          fontFamily: 'Arial',
          fontSize: '13pt'
        };

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          padding: 5,
          align: 'center-middle'
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 5, width: 90, height: 90 });
      });


      it('with custom size / weight / color / center-top', function() {

        // given
        var label = 'I am a\nstyled\nlabel that will float';
        var style = {
          fill: 'fuchsia',
          fontWeight: 'bold',
          fontFamily: 'Arial',
          fontSize: '13pt'
        };

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          align: 'center-top'
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 0, width: 90, height: 100 });
      });


      it('big / center-top', function() {

        // given
        var label = 'I am a style';
        var style = {
          fill: 'fuchsia',
          fontWeight: 'bold',
          fontFamily: 'Arial',
          fontSize: '20pt'
        };

        // when
        var text = createLabel(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          align: 'center-top'
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 5, width: 90, height: 90 });
      });
    });
  });

});