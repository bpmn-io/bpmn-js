'use strict';


/* global bootstrapDiagram, inject */

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    every = require('lodash/collection/every'),
    domify = require('min-dom/lib/domify');

var tooltipsModule = require('../../../../lib/features/tooltips');


function asMatrix(transformStr) {
  if (transformStr && transformStr !== 'none') {
    var m = transformStr.match(/[+-]?\d*[.]?\d+(?=,|\))/g);

    return {
      a: parseFloat(m[0]),
      b: parseFloat(m[1]),
      c: parseFloat(m[2]),
      d: parseFloat(m[3]),
      e: parseFloat(m[4]),
      f: parseFloat(m[5])
    };
  }
}

function isVisible(element) {
  return window.getComputedStyle(element).display !== 'none';
}

function highlight(element) {
  assign(element.style, { background: 'fuchsia', minWidth: '10px', minHeight: '10px' });
  return element;
}


function createOverlay() {
  var element = highlight(domify('<div>TEST<br/>TEST</div>'));
  assign(element.style, { width: 40, height: 40 });
  return element;
}

function queryTooltip(id) {
  return document.querySelector('[data-tooltip-id=' + id + ']');
}


describe('features/tooltips', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ tooltipsModule ] }));


    it('should expose api', inject(function(tooltips) {
      expect(tooltips).to.exist;
      expect(tooltips.get).to.exist;
      expect(tooltips.add).to.exist;
      expect(tooltips.remove).to.exist;
    }));

  });


  describe('#add', function() {

    beforeEach(bootstrapDiagram({ modules: [ tooltipsModule ] }));


    it('should add <div>', inject(function(tooltips, canvas) {

      // when
      var id = tooltips.add({
        position: {
          x: 100,
          y: 200
        },
        html: '<div class="tooltip"></div>'
      });

      // then
      expect(id).to.exist;
      expect(tooltips.get(id)).to.exist;
      expect(queryTooltip(id)).to.exist;
    }));


    it('should add Element', inject(function(tooltips, canvas) {

      // when
      var id = tooltips.add({
        position: {
          x: 100,
          y: 200
        },
        html: highlight(domify('<div class="tooltip" />'))
      });

      // then
      var tooltip = tooltips.get(id);

      expect(tooltip).to.exist;
      expect(isVisible(tooltips._tooltipRoot)).to.be.true;
      expect(isVisible(tooltip.html)).to.be.true;

      expect(queryTooltip(id)).to.exist;
    }));


    it('should add with timeout', function(done) {

      inject(function(tooltips, canvas) {

        // when
        var id = tooltips.add({
          position: {
            x: 100,
            y: 200
          },
          timeout: 200,
          html: '<div class="tooltip" id="html-ov"></div>'
        });

        // then
        expect(id).to.exist;
        expect(tooltips.get(id)).to.exist;

        // but when
        setTimeout(function() {
          expect(tooltips.get(id)).not.to.exist;

          done();
        }, 300);
      })();

    });

  });

  describe('#remove', function() {

    beforeEach(bootstrapDiagram({ modules: [ tooltipsModule ] }));


    it('should remove tooltip', inject(function(tooltips, canvas) {

      // given
      var id = tooltips.add({
        position: {
          x: 100,
          y: 200
        },
        html: highlight(domify('<div class="tooltip" id="html-ov2"></div>'))
      });

      // when
      tooltips.remove(id);

      // then
      expect(tooltips.get(id)).not.to.exist;
      expect(queryTooltip(id)).not.to.exist;
    }));


    it('should remove non-existing', inject(function(tooltips) {

      expect(function() {
        tooltips.remove('non-existing');
      }).not.to.throw;

    }));

  });


  describe('positioning', function() {

    beforeEach(bootstrapDiagram({ modules: [ tooltipsModule ] }));


    function position(tooltipHtml) {
      var parent = tooltipHtml.parentNode;

      var result = {};

      forEach([ 'left', 'right', 'top', 'bottom' ], function(pos) {
        var p = parseInt(parent.style[pos]);

        if (!isNaN(p)) {
          result[pos] = p;
        }
      });

      return result;
    }


    it('should position absolute', inject(function(tooltips) {

      var html = createOverlay();

      // when
      tooltips.add({
        position: {
          x: 100,
          y: 50
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        left: 100,
        top: 50
      });

    }));

  });


  describe('zoom behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ tooltipsModule ],
      canvas: { deferUpdate: false }
    }));


    function isVisible(element) {
      return element.parentNode.style.display !== 'none';
    }


    it('should respect default min/max show rules', inject(function(tooltips, canvas) {

      // given
      var html = createOverlay();

      tooltips.add({
        position: { x: 20, y: 50 },
        html: html
      });

      // when zoom in visibility range
      canvas.zoom(0.7);

      // then
      expect(isVisible(html)).to.be.true;


      // when zoom below visibility range
      canvas.zoom(0.6);

      // then
      expect(isVisible(html)).to.be.false;


      // when zoom in visibility range
      canvas.zoom(3.0);

      // then
      expect(isVisible(html)).to.be.true;


      // when zoom above visibility range
      canvas.zoom(6.0);

      // then
      expect(isVisible(html)).to.be.false;
    }));


    it('should respect tooltip specific min/max rules', inject(function(tooltips, canvas) {

      // given
      var html = createOverlay();

      tooltips.add({
        position: { x: 20, y: 50 },
        html: html,
        show: {
          minZoom: 0.3,
          maxZoom: 4
        }
      });


      // when zoom in visibility range
      canvas.zoom(0.6);

      // then
      expect(isVisible(html)).to.be.true;


      // when zoom on visibility range border
      canvas.zoom(0.3);

      // then
      expect(isVisible(html)).to.be.true;


      // when zoom below visibility range
      canvas.zoom(0.2);

      // then
      expect(isVisible(html)).to.be.false;


      // when zoom in visibility range
      canvas.zoom(3);

      // then
      expect(isVisible(html)).to.be.true;


      // when zoom on visibility range border
      canvas.zoom(4.0);

      // then
      expect(isVisible(html)).to.be.true;

      // when zoom above visibility range
      canvas.zoom(4.1);

      // then
      expect(isVisible(html)).to.be.false;
    }));

  });


  describe('scroll/zoom behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ tooltipsModule ],
      canvas: { deferUpdate: false }
    }));


    function transformMatrix(element) {
      return asMatrix(element.style.transform);
    }

    function isMatrixEql(original, test) {
      return every(original, function(val, key) {
        if (key === 'e') {
          return val <= -500 || val > -520;
        }
        return val === test[key];
      });
    }


    it('should not be transformed initially', inject(function(tooltips, canvas) {
      // given
      // diagram got newly created

      // then
      expect(transformMatrix(tooltips._tooltipRoot)).to.not.exist;
    }));


    it('should transform tooltip container on scroll', inject(function(tooltips, canvas) {

      // when
      canvas.scroll({
        dx: 100,
        dy: 50
      });

      // then
      expect(transformMatrix(tooltips._tooltipRoot)).to.eql({ a : 1, b : 0, c : 0, d : 1, e : 100, f : 50 });
    }));


    it('should transform tooltip container on zoom', inject(function(tooltips, canvas) {

      // when
      canvas.zoom(2);

      var containerTransform = asMatrix(tooltips._tooltipRoot.style.transform);

      var result = { a : 2, b : 0, c : 0, d : 2, e : -501, f : -300 };

      // then
      expect(isMatrixEql(containerTransform, result)).to.be.true;
    }));


    it('should transform tooltip container on zoom (with position)', inject(function(tooltips, canvas) {

      // when
      canvas.zoom(2, { x: 300, y: 300 });

      // then
      expect(transformMatrix(tooltips._tooltipRoot)).to.eql({ a : 2, b : 0, c : 0, d : 2, e : -300, f : -300 });
    }));

  });

});
