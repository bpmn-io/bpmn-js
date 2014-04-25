var fs = require('fs');

var Viewer = require('../../../../lib/Viewer');

var Matchers = require('../../Matchers');


describe('import - labels', function() {

  beforeEach(Matchers.add);

  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(container);
  });


  it('should import embedded labels', function(done) {

    var xml = fs.readFileSync('test/fixtures/bpmn/labels/embedded.bpmn', 'utf8');

    var renderer = new Viewer(container);

    renderer.importXML(xml, function(err) {
      done(err);
    });
  });


  describe('should import external labels', function() {

    it('with di', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/labels/external.bpmn', 'utf8');

      var renderer = new Viewer(container);

      renderer.importXML(xml, function(err) {
        done(err);
      });
    });


    it('without di', function(done) {

      var xml = fs.readFileSync('test/fixtures/bpmn/labels/external-no-di.bpmn', 'utf8');

      var renderer = new Viewer(container);

      renderer.importXML(xml, function(err) {
        done(err);
      });
    });

  });

});