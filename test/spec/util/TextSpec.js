'use strict';

var assign = require('lodash/object/assign');

var pick = require('lodash/object/pick');

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgCreate = require('tiny-svg/lib/create');


function toFitBBox(actual, expected) {

  var actualBBox = actual.getBBox ? actual.getBBox() : actual;

  var pass = actualBBox.width <= expected.width &&
             (expected.height ? actualBBox.height <= expected.height : true);


  if (actualBBox.x) {
    pass = actualBBox.x >= expected.x &&
           actualBBox.y >= expected.y &&
           actualBBox.x + actualBBox.width <= expected.x + expected.width &&
           (expected.height ? actualBBox.y + actualBBox.height <= expected.y + expected.height : true);
  }

  if (!pass) {
    var bbox = pick(actualBBox, ['x', 'y', 'width', 'height']);

    var message =
      'Expected Element#' + actual.id + ' with bbox ' +
       JSON.stringify(bbox) + ' to fit ' +
       JSON.stringify(expected);

    console.error(message);
  }

  return !!pass;
}

var TextUtil = require('../../../lib/util/Text');

var TestContainer = require('mocha-test-container-support');


describe('Text', function() {

  var container;

  var options = {
    size: { width: 100 },
    padding: 0,
    style: { fontSize: '14px' }
  };

  var textUtil = new TextUtil(options);

  beforeEach(function() {

    var testContainer = TestContainer.get(this);

    var parent = document.createElement('div');
    parent.style.width = '200px';
    parent.style.height = '400px';
    parent.style.display = 'inline-block';

    testContainer.appendChild(parent);

    var svg = svgCreate('svg');
    svgAttr(svg, { width: '100%', height: '100%' });

    svgAppend(parent, svg);

    container = svgCreate('g');

    svgAppend(svg, container);
  });

  function drawRect(bounds, style) {

    var x = bounds.x || 0,
        y = bounds.y || 0,
        width = bounds.width,
        height = bounds.height;

    var attrs = assign({
      fill: 'none',
      strokeWidth: 1,
      stroke: 'black'
    }, style, {
      x: x,
      y: y,
      width: width,
      height: height
    });

    var rect = svgCreate('rect');
    svgAttr(rect, attrs);

    svgAppend(container, rect);
  }


  function createText(container, label, options) {
    var box = assign({}, { width: 150, height: 50 }, options.box || {});

    drawRect(box, { strokeWidth: '3px', stroke: '#CCC' });

    var textAndBoundingBox = textUtil.layoutText(label, options);

    var element = textAndBoundingBox.element,
        dimensions = textAndBoundingBox.dimensions;

    drawRect(dimensions, { strokeWidth: '1px', stroke: 'fuchsia' });

    svgAppend(container, element);

    return element;
  }


  describe('#createText', function() {


    it('should create simple label', function() {

      // given
      var label = 'I am a label';

      // when
      var text = createText(container, label, { box: { width: 150, height: 100 } });

      expect(text).to.exist;
      expect(toFitBBox(text, { x: 33, y: 0, width: 84, height: 30 })).to.be.true;
    });


    it('should create a label with dimensions equal to 0', function() {

      // given
      var label = 'I am ww mm WM WMW WMWM';

      // when
      var text = createText(container, label, { box: { width: 0, height: 0 } });

      expect(text).to.exist;
      expect(toFitBBox(text, { x: -1, y: 3, width: 40, height: 320 })).to.be.true;
    });


    it('should create a label with 2 letters', function() {

      // given
      var label = 'I am ww mm WM WMW WMW';

      // when
      var text = createText(container, label, { box: { width: 25, height: 25 } });

      expect(text).to.exist;
      expect(toFitBBox(text, { x: -1, y: 3, width: 40, height: 230 })).to.be.true;
    });


    it('should create text on hidden element', function() {

      // given
      var label = 'I am a label';

      // render on invisible element
      svgAttr(container, 'display', 'none');

      // when
      var text = createText(container, label, { box: { width: 150, height: 100 } });

      // make visible (for bounds check)
      svgAttr(container, 'display', '');

      expect(text).to.exist;
      expect(toFitBBox(text, { x: 33, y: 0, width: 84, height: 30 })).to.be.true;
    });


    it('should show text ending with a hyphen correctly', function() {

      // given
      var label = 'VeryVeryVeryVeryVeryVeryVeryVeryVeryLongString-';

      // when
      var text = createText(container, label, { box: { width: 150, height: 100 } });

      // then
      expect(text).to.exist;
      expect(text.textContent.substr(-1)).equals('-');
    });


    describe('should line break', function() {

      it('at word boundary', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 } });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 160, height: 70 })).to.be.true;
      });


      it('forced', function() {

        // given
        var label = 'I_am_a_long_label_that_should_break_forcibly';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 } });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 160, height: 70 })).to.be.true;
      });


      it('forced / break on hyphen', function() {

        // given
        var label = 'I_am_a_lo-ng_label_that_sho-uld_break_on_hyphens';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 } });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 150, height: 100 })).to.be.true;
      });


      it('preformated / spaced / hyphenated', function() {

        // given
        var label = 'I am\n\nnatural language\nwith some superdooooper-longwordinthe-middle';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -40, width: 100, height: 190 })).to.be.true;
      });


      it('mass hyphenated', function() {

        // given
        var label = 'Some superdooooper-long-word in the middle';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 100, height: 100 })).to.be.true;
      });


      it('preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 } });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 2, y: 0, width: 150, height: 105 })).to.be.true;
      });


      it('multiple line breaks', function() {

        // given
        var label = 'Line breaks line breaks line\n\n\nBreaks';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 } });

        expect(text.getBBox().height).to.be.above(50);
      });
    });


    describe('should align', function() {

      it('center-middle (fixed box)', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 100, height: 100 })).to.be.true;
      });


      it('center-middle / preformated using line breaks (fixed box)', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -10, width: 100, height: 130 })).to.be.true;
      });


      it('center-middle / vertical float out (fixed box)', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -30, width: 100, height: 180 })).to.be.true;
      });


      it('left-middle (fixed box)', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'left-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -30, width: 100, height: 180 })).to.be.true;
      });


      it('center-middle (fit box)', function() {

        // given
        var label = 'I am tiny';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          fitBox: true,
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 150, height: 100 })).to.be.true;
      });


      it('center-middle / vertical float out (fit box)', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          fitBox: true,
          align: 'center-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -25, width: 100, height: 150 })).to.be.true;
      });


      it('left-middle (fit box)', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'left-middle',
          padding: 5
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -25, width: 100, height: 150 })).to.be.true;
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
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          padding: 5,
          align: 'center-middle'
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: -3, width: 100, height: 106 })).to.be.true;
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
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          align: 'center-top'
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 102, height: 100 })).to.be.true;
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
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          align: 'center-top'
        });

        expect(text).to.exist;
        expect(toFitBBox(text, { x: 0, y: 0, width: 100, height: 100 })).to.be.true;
      });

    });

  });


  describe('#getDimensions', function() {

    it('should get bounding box of simple label', function() {

      // given
      var label = 'I am a label';
      var box = {
        width: 100,
        height: 100
      };

      // when
      var dimensions = textUtil.getDimensions(label, { box: box });

      // then
      expect(dimensions).to.exist;
      expect(toFitBBox(dimensions, { width: 100, height: 20 })).to.be.true;
    });


    it('should get bounding box of multi line label', function() {

      // given
      var label = 'I am a\nlabel';
      var box = {
        width: 100,
        height: 100
      };

      // when
      var dimensions = textUtil.getDimensions(label, { box: box });

      // then
      expect(dimensions).to.exist;
      expect(toFitBBox(dimensions, { width: 100, height: 40 })).to.be.true;
    });
  });

});
