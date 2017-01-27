'use strict';

var TestContainer = require('mocha-test-container-support');

var Diagram = require('diagram-js/lib/Diagram');

var Viewer = require('../../lib/Viewer');

var inherits = require('inherits');


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

        if (err) {
          return done(err);
        }

        // then
        expect(warnings.length).to.equal(0);

        done();
      });

    });
  });


  it('should be instance of Diagram', function() {

    // when
    var viewer = new Viewer({ container: container });

    // then
    expect(viewer).to.be.instanceof(Diagram);
  });


  describe('overlay support', function() {

    it('should allow to add overlays', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        // when
        var overlays = viewer.get('overlays'),
            elementRegistry = viewer.get('elementRegistry');

        // then
        expect(overlays).to.exist;
        expect(elementRegistry).to.exist;

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

      expect(e).to.exist;

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

        expect(err).to.exist;

        expectMessage(err, /Text data outside of root node./);

        done();
      });
    });


    it('should handle invalid BPMNPlane#bpmnElement', function(done) {

      var xml = require('../fixtures/bpmn/error/di-plane-no-bpmn-element.bpmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).not.to.exist;

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
        expect(err).not.to.exist;

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
        expect(err).to.exist;
        expect(err.message).to.eql('no process or collaboration to display');

        expectWarnings(warnings, [
          /unparsable content <collaboration> detected/,
          'unresolved reference <Participant_1>',
          'no bpmnElement referenced in <bpmndi:BPMNPlane id="BPMNPlane_1" />',
          'no bpmnElement referenced in <bpmndi:BPMNShape id="BPMNShape_Participant_1" />'
        ]);

        done();
      });
    });


    it('should handle duplicate ids', function(done) {

      var xml = require('../fixtures/bpmn/error/duplicate-ids.bpmn');

      // when
      createViewer(xml, function(err, warnings) {

        // then
        expect(err).not.to.exist;

        expectWarnings(warnings, [
          /duplicate ID <test>/
        ]);

        done();
      });
    });

  });


  describe('dependency injection', function() {

    it('should provide self as <bpmnjs>', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        expect(viewer.get('bpmnjs')).to.equal(viewer);

        done(err);
      });
    });


    it('should allow Diagram#get before import', function() {

      // when
      var viewer = new Viewer({ container: container });

      // then
      var eventBus = viewer.get('eventBus');

      expect(eventBus).to.exist;
    });


    it('should keep references to services across re-import', function(done) {

      // given
      var someXML = require('../fixtures/bpmn/simple.bpmn'),
          otherXML = require('../fixtures/bpmn/basic.bpmn');

      var viewer = new Viewer({ container: container });

      var eventBus = viewer.get('eventBus'),
          canvas = viewer.get('canvas');

      // when
      viewer.importXML(someXML, function() {

        // then
        expect(viewer.get('canvas')).to.equal(canvas);
        expect(viewer.get('eventBus')).to.equal(eventBus);

        viewer.importXML(otherXML, function() {

          // then
          expect(viewer.get('canvas')).to.equal(canvas);
          expect(viewer.get('eventBus')).to.equal(eventBus);

          done();
        });
      });

    });
  });


  describe('export', function() {

    function currentTime() {
      return new Date().getTime();
    }

    function validSVG(svg) {
      var expectedStart = '<?xml version="1.0" encoding="utf-8"?>';
      var expectedEnd = '</svg>';

      expect(svg.indexOf(expectedStart)).to.equal(0);
      expect(svg.indexOf(expectedEnd)).to.equal(svg.length - expectedEnd.length);

      // ensure correct rendering of SVG contents
      expect(svg.indexOf('undefined')).to.equal(-1);

      // expect header to be written only once
      expect(svg.indexOf('<svg width="100%" height="100%">')).to.equal(-1);
      expect(svg.indexOf('<g class="viewport"')).to.equal(-1);

      var parser = new DOMParser();
      var svgNode = parser.parseFromString(svg, 'image/svg+xml');

      // [comment, <!DOCTYPE svg>, svg]
      expect(svgNode.childNodes).to.have.length(3);

      // no error body
      expect(svgNode.body).not.to.exist;

      // FIXME(nre): make matcher
      return true;
    }


    it('should export XML', function(done) {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');

      createViewer(xml, function(err, warnings, viewer) {

        if (err) {
          return done(err);
        }

        // when
        viewer.saveXML({ format: true }, function(err, xml) {

          if (err) {
            return done(err);
          }

          // then
          expect(xml).to.contain('<?xml version="1.0" encoding="UTF-8"?>');
          expect(xml).to.contain('<bpmn2:definitions');
          expect(xml).to.contain('  ');

          done();
        });
      });

    });


    it('should export svg', function(done) {

      // given
      var xml = require('../fixtures/bpmn/simple.bpmn');

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
          expect(validSVG(svg)).to.be.true;

          done();
        });
      });
    });


    it('should export huge svg', function(done) {

      this.timeout(3000);

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
          expect(validSVG(svg)).to.be.true;

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

        expect(svgDoc.querySelectorAll('.outer-bound-marker')).to.exist;

        // when
        viewer.saveSVG(function(err, svg) {

          if (err) {
            return done(err);
          }

          var svgDoc = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDoc.innerHTML = svg;

          // then
          expect(validSVG(svg)).to.be.true;
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
    var xml = require('../fixtures/bpmn/simple.bpmn');

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
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;

        expect(extensionElements.values.length).to.equal(1);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;

        done(err);
      });

    });


    it('should allow to add default custom moddle extensions', function(done) {

      // given
      var xml = require('../fixtures/bpmn/extension/custom.bpmn'),
          additionalModdleDescriptors = {
            custom: require('../fixtures/json/model/custom')
          };

      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
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
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;
        expect(sendTask.$instanceOf('custom:ServiceTaskGroup')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;

        expect(extensionElements.values.length).to.equal(2);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;

        expect(extensionElements.values[1].$instanceOf('custom:CustomSendElement')).to.be.true;

        done(err);
      });

    });


    it('should allow user to override default custom moddle extensions', function(done) {

      // given
      var xml = require('../fixtures/bpmn/extension/custom-override.bpmn'),
          additionalModdleDescriptors = {
            custom: require('../fixtures/json/model/custom')
          },
          customOverride = require('../fixtures/json/model/custom-override');

      function CustomViewer(options) {
        Viewer.call(this, options);
      }

      inherits(CustomViewer, Viewer);

      CustomViewer.prototype._moddleExtensions = additionalModdleDescriptors;

      viewer = new CustomViewer({
        container: container,
        moddleExtensions: {
          camunda: camundaPackage,
          custom : customOverride
        }
      });

      // when
      viewer.importXML(xml, function(err, warnings) {

        var elementRegistry = viewer.get('elementRegistry');

        var taskShape = elementRegistry.get('send'),
            sendTask = taskShape.businessObject;

        // then
        expect(sendTask).to.exist;

        var extensionElements = sendTask.extensionElements;

        // receive task should be moddle extended
        expect(sendTask.$instanceOf('camunda:ServiceTaskLike')).to.be.true;
        expect(sendTask.$instanceOf('custom:ServiceTaskGroupOverride')).to.be.true;

        // extension elements should provide typed element
        expect(extensionElements).to.exist;

        expect(extensionElements.values.length).to.equal(2);
        expect(extensionElements.values[0].$instanceOf('camunda:InputOutput')).to.be.true;

        expect(extensionElements.values[1].$instanceOf('custom:CustomSendElementOverride')).to.be.true;

        done(err);
      });

    });


    it('should throw error due to missing diagram', function(done) {

      var xml = require('../fixtures/bpmn/empty-definitions.bpmn');

      // given
      viewer = new Viewer({ container: container, additionalModules: testModules });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(err.message).to.eql('no diagram to display');

        done();
      });

    });

  });


  describe('configuration', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should configure Canvas', function(done) {

      // given
      var viewer = new Viewer({
        container: container,
        canvas: {
          deferUpdate: true
        }
      });

      // when
      viewer.importXML(xml, function(err) {

        var canvasConfig = viewer.get('config.canvas');

        // then
        expect(canvasConfig.deferUpdate).to.be.true;

        done();
      });

    });

    it('should attach the viewer to the given parent', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer({ container: container });

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(container);

        done(err, warnings);
      });
    });

    it('should not attach the viewer automatically if no parent was given', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer();

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(null);

        done(err, warnings);
      });
    });
  });


  describe('#importXML', function() {

    it('should emit <import.*> events', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var events = [];

      viewer.on([
        'import.parse.start',
        'import.parse.complete',
        'import.render.start',
        'import.render.complete',
        'import.done'
      ], function(e) {
        // log event type + event arguments
        events.push([
          e.type,
          Object.keys(e).filter(function(key) {
            return key !== 'type';
          })
        ]);
      });

      // when
      viewer.importXML(xml, function(err) {

        // then
        expect(events).to.eql([
          [ 'import.parse.start', [ 'xml' ] ],
          [ 'import.parse.complete', ['error', 'definitions', 'context' ] ],
          [ 'import.render.start', [ 'definitions' ] ],
          [ 'import.render.complete', [ 'error', 'warnings' ] ],
          [ 'import.done', [ 'error', 'warnings' ] ]
        ]);

        done(err);
      });
    });


    it('should work without callback', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      // when
      viewer.importXML(xml);

      // then
      viewer.on('import.done', function(event) {
        done();
      });
    });

  });


  describe('#on', function() {

    it('should fire with given three', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var xml = require('../fixtures/bpmn/simple.bpmn');

      // when
      viewer.on('foo', 1000, function() {
        return 'bar';
      }, viewer);

      // then
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).to.equal('bar');

        done();
      });

    });

  });


  describe('#off', function() {

    var xml = require('../fixtures/bpmn/simple.bpmn');

    it('should remove listener permanently', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      viewer.off('foo');

      // then
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;

        done();
      });

    });


    it('should remove listener on existing diagram instance', function(done) {

      // given
      var viewer = new Viewer({ container: container });

      var handler = function() {
        return 'bar';
      };

      viewer.on('foo', 1000, handler);

      // when
      viewer.importXML(xml, function(err) {
        var eventBus = viewer.get('eventBus');

        // when
        viewer.off('foo', handler);

        var result = eventBus.fire('foo');

        expect(result).not.to.exist;

        done();
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
      expect(viewer.container.parentNode).not.to.exist;
    });

  });


  describe('#attachTo', function() {
    it('should attach the viewer', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer();

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(null);
        viewer.attachTo(container);
        expect(viewer.container.parentNode).to.equal(container);

        done(err, warnings);
      });
    });
  });


  describe('#detach', function() {
    it('should detach the viewer', function(done) {

      var xml = require('../fixtures/bpmn/simple.bpmn');

      var viewer = new Viewer({ container: container });

      viewer.importXML(xml, function(err, warnings) {

        expect(viewer.container.parentNode).to.equal(container);
        viewer.detach();
        expect(viewer.container.parentNode).to.equal(null);

        done(err, warnings);
      });
    });
  });
});
