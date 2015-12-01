'use strict';


/* global bootstrapDiagram, inject */

var forEach = require('lodash/collection/forEach'),
    assign = require('lodash/object/assign'),
    every = require('lodash/collection/every'),
    domify = require('min-dom/lib/domify');

var overlayModule = require('../../../../lib/features/overlays');


function asMatrix(transformStr) {
  if (transformStr && transformStr !== 'none') {
    var m = transformStr.match(/[+-]?\d*[.]?\d+(?=,|\))/g);

    return {
      a: parseFloat(m[0], 10),
      b: parseFloat(m[1], 10),
      c: parseFloat(m[2], 10),
      d: parseFloat(m[3], 10),
      e: parseFloat(m[4], 10),
      f: parseFloat(m[5], 10)
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

function queryOverlay(id) {
  return document.querySelector('[data-overlay-id=' + id + ']');
}

function createOverlay() {
  var element = highlight(domify('<div>TEST<br/>TEST</div>'));
  assign(element.style, { width: 40, height: 40 });
  return element;
}


describe('features/overlays', function() {

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should expose api', inject(function(overlays) {
      expect(overlays).to.exist;
      expect(overlays.get).to.exist;
      expect(overlays.add).to.exist;
      expect(overlays.remove).to.exist;
    }));

  });


  describe('#add', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should add <div>', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // then
      expect(id).to.exist;
      expect(overlays.get(id)).to.exist;
      expect(queryOverlay(id)).to.exist;
    }));


    it('should add element overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay" />'))
      });

      // then
      var overlay = overlays.get(id);

      expect(overlay).to.exist;
      expect(isVisible(overlays._overlayRoot)).to.be.true;
      expect(isVisible(overlay.html)).to.be.true;

      expect(queryOverlay(id)).to.exist;
    }));


    it('should add overlay on shape (by id)', inject(function(overlays, canvas) {

      // given
      canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      var id = overlays.add('test', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay" />'))
      });

      // then
      expect(overlays.get(id)).to.exist;
      expect(queryOverlay(id)).to.exist;
    }));

  });


  describe('#remove', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    it('should remove overlay', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="overlay"></div>'))
      });

      // when
      overlays.remove(id);

      // then
      expect(overlays.get(id)).not.to.exist;
      expect(overlays.get({ element: shape }).length).to.be.empty;

      expect(queryOverlay(id)).not.to.exist;
    }));


    it('should remove multiple by filter', inject(function(overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      overlays.add(shape, 'badge', {
        position: {
          left: 0,
          top: 0
        },
        html: highlight(domify('<div class="badge">1</div>'))
      });

      overlays.add(shape, 'badge', {
        position: {
          right: 0,
          top: 0
        },
        html: highlight(domify('<div class="badge">2</div>'))
      });

      // when
      overlays.remove({ element: shape, type: 'badge' });

      // then
      expect(overlays.get({ element: shape, type: 'badge' })).to.be.empty;
      expect(overlays.get({ element: shape })).to.be.empty;

      expect(overlays._getOverlayContainer(shape, true).html.textContent).to.equal('');
    }));


    it('should remove automatically on <*.remove>', inject(function(eventBus, overlays, canvas) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      var id = overlays.add(shape, {
        position: {
          left: 0,
          top: 0
        },
        html: '<div class="overlay"></div>'
      });

      // when
      eventBus.fire('shape.remove', { element: shape });

      // then
      expect(overlays.get(id)).not.to.exist;
      expect(queryOverlay(id)).not.to.exist;
    }));

  });


  describe('#get', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape1, shape2, overlay1, overlay2, overlay3;

    beforeEach(inject(function(canvas, overlays) {

      shape1 = canvas.addShape({
        id: 'shape1',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      shape2 = canvas.addShape({
        id: 'shape2',
        x: 300,
        y: 100,
        width: 50,
        height: 50
      });


      overlay1 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay1.id = overlays.add(shape1, 'badge', overlay1);


      overlay2 = {
        position: {
          bottom: 50,
          right: 0
        },
        html: createOverlay()
      };

      overlay2.id = overlays.add(shape1, overlay2);

      overlay3 = {
        position: {
          top: 10,
          left: 20
        },
        html: createOverlay()
      };

      overlay3.id = overlays.add(shape2, 'badge', overlay3);
    }));


    it('should return overlays by element', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape1 });

      // then
      expect(filteredOverlays.length).to.equal(2);
    }));


    it('should return overlays by element + type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ element: shape2, type: 'badge' });

      // then
      expect(filteredOverlays.length).to.equal(1);
    }));


    it('should return overlays by type', inject(function(overlays) {

      // when
      var filteredOverlays = overlays.get({ type: 'badge' });

      // then
      expect(filteredOverlays.length).to.equal(2);
    }));

  });


  describe('positioning', function() {

    beforeEach(bootstrapDiagram({ modules: [ overlayModule ] }));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function position(overlayHtml) {
      var parent = overlayHtml.parentNode;

      var result = {};

      forEach([ 'left', 'right', 'top', 'bottom' ], function(pos) {
        var p = parseInt(parent.style[pos]);

        if (!isNaN(p)) {
          result[pos] = p;
        }
      });

      return result;
    }


    it('should position top left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          left: 40,
          top: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 40,
        left: 40
      });

    }));


    it('should position bottom left of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          left: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 60,
        left: 40
      });

    }));

    it('should position top left of shape', inject(function(overlays, canvas) {

      var html = createOverlay();

      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 10, y: 10 }, {x: 110, y: 10} ]});

      // when
      overlays.add(connection, {
        position: {
          left: 100,
          top: 0
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 0,
        left: 100
      });

    }));


    it('should position bottom right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          bottom: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 60,
        left: 60
      });
    }));


    it('should position top right of shape', inject(function(overlays) {

      var html = createOverlay();

      // when
      overlays.add(shape, {
        position: {
          top: 40,
          right: 40
        },
        html: html
      });

      // then
      expect(position(html)).to.eql({
        top: 40,
        left: 60
      });
    }));

  });


  describe('zoom behavior', function() {

    beforeEach(bootstrapDiagram({
      modules: [ overlayModule ],
      canvas: { deferUpdate: false }
    }));


    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    function isVisible(element) {
      return element.parentNode.style.display !== 'none';
    }


    it('should respect default min/max show rules', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
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


    it('should respect min show rules when overlay is added', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      // when zoom below visibility range
      canvas.zoom(0.6);

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
      });

      // then
      expect(isVisible(html)).to.be.false;

      // when zoom in visibility range
      canvas.zoom(0.7);

      // then
      expect(isVisible(html)).to.be.true;
    }));


    it('should respect max show rules when overlay is added', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      // when zoom above visibility range
      canvas.zoom(6.0);

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 }
      });

      // then
      expect(isVisible(html)).to.be.false;

      // when zoom in visibility range
      canvas.zoom(3.0);

      // then
      expect(isVisible(html)).to.be.true;
    }));


    it('should respect overlay specific min/max rules', inject(function(overlays, canvas) {

      // given
      var html = createOverlay();

      overlays.add(shape, {
        html: html,
        position: { left: 20, bottom: 0 },
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
      modules: [ overlayModule ],
      canvas: { deferUpdate: false }
    }));


    var shape, overlay;

    beforeEach(inject(function(canvas, overlays) {

      shape = canvas.addShape({
        id: 'shape',
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });

      overlay = {
        html: createOverlay(),
        position: {
          left: 20,
          top: 20
        }
      };

      overlay.id = overlays.add(shape, overlay);
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

    it('should not be transformed initially', inject(function(overlays, canvas) {
      // given
      // diagram got newly created

      // then
      expect(transformMatrix(overlays._overlayRoot)).to.not.exist;
    }));


    it('should transform overlay container on scroll', inject(function(overlays, canvas) {

      // when
      canvas.scroll({
        dx: 100,
        dy: 50
      });

      // then
      expect(transformMatrix(overlays._overlayRoot)).to.eql({ a : 1, b : 0, c : 0, d : 1, e : 100, f : 50 });
    }));


    it('should transform overlay container on zoom', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2);

      var containerTransform = asMatrix(overlays._overlayRoot.style.transform);

      var result = { a : 2, b : 0, c : 0, d : 2, e: -501, f: -300 };

      // then
      expect(isMatrixEql(containerTransform, result)).to.be.true;
    }));


    it('should add css prefixes to the overlay container on zoom', inject(function(overlays, canvas) {
      // given
      var containerStyle = overlays._overlayRoot.style;

      // when
      canvas.zoom(2);

      // then
      expect(containerStyle['-webkit-transform']).to.match(/matrix/);
      expect(containerStyle['-ms-transform']).to.match(/matrix/);
    }));


    it('should transform overlay container on zoom (with position)', inject(function(overlays, canvas) {

      // when
      canvas.zoom(2, { x: 300, y: 300 });

      // then
      expect(transformMatrix(overlays._overlayRoot)).to.eql({ a : 2, b : 0, c : 0, d : 2, e : -300, f : -300 });
    }));

  });

});
