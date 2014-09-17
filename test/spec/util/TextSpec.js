'use strict';

var _ = require('lodash');

var Matchers = require('../../Matchers');

var Snap = require('../../../lib/draw/Snap'),
    TextUtil = require('../../../lib/util/Text');


describe('Text', function() {

  var container;

  var options = {
    size: { width: 100 },
    padding: 0,
    style: { fontSize: '11pt' }
  };

  var textUtil = new TextUtil(options);

  beforeEach(function() {

    var testContainer = jasmine.getEnv().getTestContainer();

    var parent = document.createElement('div');
    parent.style.width = '200px';
    parent.style.height = '200px';
    parent.style.display = 'inline-block';

    testContainer.appendChild(parent);

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


  beforeEach(Matchers.addBBoxMatchers);


  function createText(container, label, options) {
    var box = _.extend({}, { width: 150, height: 50 }, options.box || {});

    drawRect(box.width, box.height);

    return textUtil.createText(container, label, options);
  }


  describe('#createText', function() {


    it('should create simple label', function() {

      // given
      var label = 'I am a label';

      // when
      var text = createText(container, label, { box: { width: 150, height: 100 }});

      expect(text).toBeDefined();
      expect(text).toFitBBox({ x: 35, y: 0, width: 80, height: 30 });
    });


    it('should create text on hidden element', function() {

      // given
      var label = 'I am a label';

      // render on invisible element
      container.attr('display', 'none');

      // when
      var text = createText(container, label, { box: { width: 150, height: 100 }});

      // make visible (for bounds check)
      container.attr('display', '');

      expect(text).toBeDefined();
      expect(text).toFitBBox({ x: 35, y: 0, width: 80, height: 30 });
    });

    describe('should line break', function() {

      it('at word boundary', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 160, height: 70 });
      });


      it('forced', function() {

        // given
        var label = 'I_am_a_long_label_that_should_break_forcibly';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 150, height: 70 });
      });


      it('forced / break on hyphen', function() {

        // given
        var label = 'I_am_a_lo-ng_label_that_sho-uld_break_on_hyphens';

        // when
        var text = createText(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 150, height: 100 });
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

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -40, width: 100, height: 190 });
      });


      it('mass hyphenated', function() {

        // given
        var label = 'Some superdooooper-\nlong-\nword in the middle';

        // when
        var text = createText(container, label, {
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
        var text = createText(container, label, { box: { width: 150, height: 100 }});

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 5, y: 0, width: 140, height: 100 });
      });
    });


    describe('should align', function() {

      it('center-middle', function() {

        // given
        var label = 'I am a long label that should break on spaces';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
      });


      it('center-middle / preformated using line breaks', function() {

        // given
        var label = 'I am\na long label that\r\nshould break on line breaks';

        // when
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          align: 'center-middle',
          padding: 5
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: -10, width: 100, height: 130 });
      });


      it('center-middle / vertical float out', function() {

        // given
        var label = 'I am a long label that should break on spaces and float out of the container';

        // when
        var text = createText(container, label, {
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
        var text = createText(container, label, {
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
        var text = createText(container, label, {
          box: { width: 100, height: 100 },
          style: style,
          padding: 5,
          align: 'center-middle'
        });

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
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

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
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

        expect(text).toBeDefined();
        expect(text).toFitBBox({ x: 0, y: 0, width: 100, height: 100 });
      });

    });

  });

});