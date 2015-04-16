'use strict';

var forEach = require('lodash/collection/forEach');

var Snap = require('snapsvg');

var TestContainer = require('mocha-test-container-support');

describe('intersection', function() {

  var paper;

  beforeEach(function() {
    var testContainer = TestContainer.get(this);

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    testContainer.appendChild(svg);

    paper = new Snap(svg);
  });


  function expectPathIntersection(aPath, bPath, point) {
    var intersections = Snap.path.intersection(aPath, bPath);

    forEach(intersections, function(i) {
      paper.circle(i.x, i.y, 4);
    });

    expect(intersections.length).to.equal(1);
    expect(Math.abs(intersections[0].x - point.x) < 0.5).to.equal(true);
    expect(Math.abs(intersections[0].y - point.y) < 0.5).to.equal(true);
  }

  function expectIntersection(a, b, point) {

    var aPath = Snap.path.get[a.type](a);
    var bPath = Snap.path.get[b.type](b);

    expectPathIntersection(aPath, bPath, point);
  }


  it('should intersect line -> circle', function() {

    // given
    var circle = paper.circle(100, 100, 20).attr({ fill: '#CCC' });
    var line = paper.line(100, 100, 200, 100).attr({ stroke: 'fuchsia', strokeWidth: 2 });

    // expect
    expectIntersection(circle, line, { x: 120, y: 100 });
  });


  it('should intersect path -> circle', function() {
    // given
    var circle = paper.circle(352 + 18, 292 + 18, 18).attr({ fill: '#CCC' });
    var path = paper.path('m 370,310L420,285').attr({ stroke: 'fuchsia', strokeWidth: 2 });

    // expect
    expectIntersection(circle, path, { x: 386, y: 302 });
  });

});
