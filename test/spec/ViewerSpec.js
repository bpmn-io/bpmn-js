'use strict';

var TestContainer = require('mocha-test-container-support');

var Viewer = require('../../lib/Viewer');


describe('Viewer', function() {

  var container;

  beforeEach(function() {
      container = TestContainer.get(this);
  });


  function createViewer(xml, done) {
    var viewer = new Viewer({ container: container });

    viewer.importXML(xml, function(err, warnings) {
      done(err, warnings, viewer);
    });
  }


  it('should import simple process', function(done) {
    var xml = require('../fixtures/bpmn/simple.bpmn');
    createViewer(xml, done);
  });


  it('should import empty definitions', function(done) {
    var xml = require('../fixtures/bpmn/empty-definitions.bpmn');
    createViewer(xml, done);
  });


  it('should re-import simple process', function(done) {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    // given
    createViewer(xml, function(err, warnings, viewer) {

      if (err) {
        return done(err);
      }

      // when
      // mimic re-import of same diagram
      viewer.importXML(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;
        expect(warnings.length).to.equal(0);

        done();
      });

    });
  });


  describe('defaults', function() {

    it('should use <body> as default parent', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer();

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(document.body);

        done(err, warnings);
      });
    });

  });


  describe('import events', function() {

    it('should fire <import.*> events', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

      var events = [];

      viewer.on('import.start', function() {
        events.push('import.start');
      });

      viewer.on('import.success', function() {
        events.push('import.success');
      });

      viewer.on('import.error', function() {
        events.push('import.error');
      });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(events).to.eql([
          'import.start',
          'import.success'
        ]);

        done(err);
      });
    });

  });


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        // when
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // then
        expect(overlays).to.be.defined;
        expect(elementRegistry).to.be.defined;

        // when
        overlays.add('SubProcess_1', {
          position: {
            bottom: 0,
            right: 0
          },
          html: '<div style="max-width: 50px">YUP GREAT STUFF!</div>'
        });

        // then
        expect(overlays.get({ element: 'SubProcess_1' }).length).to.equal(1);

        done(err);
      });

    });

  });


  describe('error handling', function() {


    function expectMessage(e, expectedMessage) {

      expect(e).to.be.defined;

      if (expectedMessage instanceof RegExp) {
        expect(e.message).to.match(expectedMessage);
      } else {
        expect(e.message).to.equal(expectedMessage);
      }
    }

    function expectWarnings(warnings, expected) {

      expect(warnings.length).to.equal(expected.length);

      warnings.forEach(function(w, idx) {
        expectMessage(w, expected[idx]);
      });
    }


    it('should handle non-bpmn input', function(done) {

      var xml = 'invalid stuff';

      createViewer(xml, function(err) {

        expect(err).to.be.ok;

        expectMessage(err, /Text data outside of root node./);

        done();
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function(done) {

      var xml = require('../fixtures/bpmn/error/di-plane-no-bpmn-element.bpmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;

        expectWarnings(warnings, [
          'unresolved reference <Collaboration_2>',
          'no bpmnElement referenced in <bpmndi:BPMNPlane id="BPMNPlane_1" />',
          'correcting missing bpmnElement ' +
            'on <bpmndi:BPMNPlane id="BPMNPlane_1" /> ' +
            'to <bpmn:Process id="Process_1" />'
        ]);

        done();
      });
    });


    it('should handle invalid namespaced element', function(done) {

      var xml = require('../fixtures/bpmn/error/categoryValue.bpmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;

        expectWarnings(warnings, [
          /unparsable content <categoryValue> detected/,
          'unresolved reference <sid-afd7e63e-916e-4bd0-a9f0-98cbff749193>'
        ]);

        done();
      });
    });


    it('should handle missing namespace', function(done) {

      var xml = require('../fixtures/bpmn/error/missing-namespace.bpmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).to.not.be.ok;

        expectWarnings(warnings, [
          /unparsable content <collaboration> detected/,
          'unresolved reference <Participant_1>',
          'no bpmnElement referenced in <bpmndi:BPMNPlane id="BPMNPlane_1" />',
          'no bpmnElement referenced in <bpmndi:BPMNShape id="BPMNShape_Participant_1" />',
          'no process or collaboration present to display'
        ]);

        done();
      });
    });

  });


  describe('dependency injection', function() {

    it('should be available via di as <bpmnjs>', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        expect(viewer.get('bpmnjs')).to.equal(viewer);

        done(err);
      });
    });

  });


  describe('export', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function isValid(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).to.equal(0);
      expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).to.equal(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
      expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

      // FIXME(nre): make matcher
      return true;
    }


    it('should export svg', function(done) {

      // given
      var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).to.be.true;

          done();
        });
      });
    });


    it('should export complex svg', function(done) {

      // given
      var xml = require('../fixtures/bpmn/complex.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var time = currentTime();

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          // then
          expect(isValid(svg)).to.be.true;

          // no svg export should not take too long
          expect(currentTime() - time).to.be.below(1000);

          done();
        });
      });
    });


    it('should remove outer-makers on export', function(done) {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');
      function appendTestRect(svgDoc) {
        var rect = document.createElementNS(svgDoc.namespaceURI, 'rect');
        rect.setAttribute('class', 'outer-bound-marker');
        rect.setAttribute('width', 500);
        rect.setAttribute('height', 500);
        rect.setAttribute('x', 10000);
        rect.setAttribute('y', 10000);
        svgDoc.appendChild(rect);
      }

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        var svgDoc = viewer.container.childNodes[1].childNodes[1];



        appendTestRect(svgDoc);
        appendTestRect(svgDoc);

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.be.defined;

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDoc.innerHTML = svg;

          // then
          expect(isValid(svg)).to.be.true;
          expect(svgDoc.querySelector('.outer-bound-marker')).to.be.null;

          done();
        });
      });
    });

  });


  describe('creation', function() {

    var testModules = [
      { logger: [ 'type', function() { this.called = true; } ] }
    ];

    // given
    var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

    var viewer;

    afterEach(function() {
      viewer.destroy();
    });


    it('should override default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, modules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(err.message).to.equal('No provider for "bpmnImporter"! (Resolving: bpmnImporter)');
        done();
      });

    });


    it('should add module to default modules', function(done) {

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        var logger = viewer.get('logger');
        expect(logger.called).to.be.true;

        done(err);
      });

    });


    it('should use custom size and position', function() {

      // when
      viewer = new Viewer({
        container: container,
        width: 200,
        height: 100,
        position: 'fixed'
      });

      // then
      expect(viewer.container.style.position).to.equal('fixed');
      expect(viewer.container.style.width).to.equal('200px');
      expect(viewer.container.style.height).to.equal('100px');
    });


    var camundaPackage = require('../fixtures/json/model/camunda');

    it('should provide custom moddle extensions', function(done) {

      var xml = require('../fixtures/bpmn/extension/camunda.bpmn');

      // given
      viewer = new Viewer({
        container: container,
        moddleExtensions: {
          camunda: camundaPackage
        }
      });

      // when
      viewer.importXML(xml, function(err, warnings) {

        var elementRegistry = viewer.get('elementRegistry');

        var taskShape = elementRegistry.get('send'),
            sendTask = taskShape.businessObject;

        // then
        expect(sendTask).to.be.defined;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.ok;

        // extension elements should provide typed element
        expect(extensionElements).to.be.ok;

        expect(extensionElements.values.length).to.equal(1);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.ok;

        done(err);
      });

    });

  });


  describe('#destroy', function() {

    it('should remove traces in document tree', function() {

      // given
      var viewer = new Viewer({
        container: container
      });

      // when
      viewer.destroy();

      // then
      expect(viewer.container.parentNode).to.not.be.ok;
    });

  });

});
