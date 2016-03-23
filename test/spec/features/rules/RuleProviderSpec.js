'use strict';

/* global bootstrapDiagram, inject */

var testRulesModule = require('./rules'),
    sayNoRulesModule = require('./say-no-rules'),
    priorityRulesModule = require('./priority-rules'),
    rulesModule = require('../../../../lib/features/rules'),
    modelingModule = require('../../../../lib/features/modeling');

var RuleProvider = require('../../../../lib/features/rules/RuleProvider');

var inherits = require('inherits');


describe('features/rules - RuleProvider', function() {

  describe('basics', function() {

    beforeEach(bootstrapDiagram({ modules: [ rulesModule ] }));


    it('should work standalone', inject(function(injector, rules) {

      // assume
      expect(injector.get('commandStack', false)).not.to.exists;

      // when
      var allowed = rules.allowed('foo', {});

      // then
      expect(allowed).to.be.true;
    }));

  });


  describe('inheritance', function() {

    it('should allow sub-classing', function() {

      // given
      var CustomRules = function(eventBus) {
        RuleProvider.call(this, eventBus);
      };

      inherits(CustomRules, RuleProvider);

      // when
      var customRules = new CustomRules(null);

      // then
      expect(customRules).to.exist;
    });


    it('should initialize rule via RuleProvider#init', function() {

      // given
      var CustomRules = function(eventBus) {
        RuleProvider.call(this, eventBus);
      };

      inherits(CustomRules, RuleProvider);

      CustomRules.prototype.init = function() {
        this._initialized = true;
      };


      // when
      var customRules = new CustomRules(null);

      // then
      expect(customRules._initialized).to.be.true;
    });

  });


  describe('rule execution', function() {

    beforeEach(bootstrapDiagram({ modules: [ testRulesModule, modelingModule ] }));


    var resizableShape, nonResizableShape, ignoreResizeShape, unspecifiedShape, customResizableShape;

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

      customResizableShape = canvas.addShape(elementFactory.createShape({
        id: 's5',
        x: 400, y: 100, width: 100, height: 100,
        resizable: 'maybe'
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


    it('should correctly interpret custom object', inject(function(rules) {

      // when
      var result = rules.allowed('shape.resize', { shape: customResizableShape });

      // then
      expect(result).to.eql('maybe');
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


  describe('rule module overrides', function() {

    beforeEach(bootstrapDiagram({ modules: [ sayNoRulesModule, testRulesModule, modelingModule ] }));

    var shape;

    beforeEach(inject(function(canvas) {

      shape = canvas.addShape({
        id: 's1',
        x: 100, y: 100, width: 100, height: 100
      });

    }));


    it('should reject in first initialized module', inject(function(rules) {

      // when
      var result = rules.allowed('shape.resize', { shape: shape });

      // then
      expect(result).to.be.false;
    }));

  });


  describe('rule priorities', function() {

    beforeEach(bootstrapDiagram({ modules: [ priorityRulesModule, modelingModule ] }));


    var normalShape, alwaysResizableShape, neverResizableShape;

    beforeEach(inject(function(canvas) {

      normalShape = canvas.addShape({
        id: 'shape',
        x: 100, y: 100, width: 100, height: 100,
        resizable: true
      });

      alwaysResizableShape = canvas.addShape({
        id: 'always-resizable',
        x: 100, y: 100, width: 100, height: 100
      });

      neverResizableShape = canvas.addShape({
        id: 'never-resizable',
        x: 100, y: 100, width: 100, height: 100
      });

    }));


    it('should pass through priority rule', inject(function(rules) {

      // when
      var result = rules.allowed('shape.resize', { shape: normalShape });

      // then
      expect(result).to.be.true;
    }));


    it('should allow in priority rule', inject(function(rules) {

      // when
      var result = rules.allowed('shape.resize', { shape: alwaysResizableShape });

      // then
      expect(result).to.be.true;
    }));


    it('should reject in priority rule', inject(function(rules) {

      // when
      var result = rules.allowed('shape.resize', { shape: neverResizableShape });

      // then
      expect(result).to.be.false;
    }));

  });

});
