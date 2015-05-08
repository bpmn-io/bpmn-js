'use strict';

/* global bootstrapDiagram, inject */

var rulesModule = require('./rules'),
    modelingModule = require('../../../../lib/features/modeling');


describe('features/rules - RuleProvider', function() {

  beforeEach(bootstrapDiagram({ modules: [ rulesModule, modelingModule ] }));


  var resizableShape, nonResizableShape, ignoreResizeShape, unspecifiedShape;

  beforeEach(inject(function(canvas, elementFactory, elementRegistry) {

    resizableShape = canvas.addShape(elementFactory.createShape({
      id: 's1',
      resizable: true, // checked by our rules
      x: 100, y: 100, width: 100, height: 100
    }));

    nonResizableShape = canvas.addShape(elementFactory.createShape({
      id: 's2',
      resizable: false, // checked by our rules
      x: 200, y: 100, width: 100, height: 100
    }));

    ignoreResizeShape = canvas.addShape(elementFactory.createShape({
      id: 's3',
      ignoreResize: true, // checked by our rules
      x: 300, y: 100, width: 100, height: 100
    }));

    unspecifiedShape = canvas.addShape(elementFactory.createShape({
      id: 's4',
      x: 400, y: 100, width: 100, height: 100
    }));

  }));


  it('should correctly interpret allow', inject(function(rules) {

    // when
    var result = rules.allowed('shape.resize', { shape: resizableShape });

    // then
    expect(result).to.be.true;
  }));


  it('should correctly interpret reject', inject(function(rules) {

    // when
    var result = rules.allowed('shape.resize', { shape: nonResizableShape });

    // then
    expect(result).to.be.false;
  }));


  it('should correctly interpret ignore', inject(function(rules) {

    // when
    var result = rules.allowed('shape.resize', { shape: ignoreResizeShape });

    // then
    expect(result).to.be.null;
  }));


  it('should correctly interpret undefined', inject(function(rules) {

    // when
    var result = rules.allowed('shape.resize', { shape: unspecifiedShape });

    // then
    expect(result).to.be.true;
  }));


  describe('unspecified handler', function() {

    it('should return false', inject(function(rules) {

      // when
      var result = rules.allowed('unregistered.action', { shape: resizableShape });

      // then
      expect(result).to.be.false;
    }));

  });

});
