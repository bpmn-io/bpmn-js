import BpmnModdle from 'bpmn-moddle';


describe('bpmn-moddle', function() {

  function parse(xml, done) {
    var moddle = new BpmnModdle();
    moddle.fromXML(xml, 'bpmn:Definitions', done);
  }


  describe('browser support', function() {

    it('should parse simple xml', function(done) {

      var xml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                           'id="simple" ' +
                           'targetNamespace="http://bpmn.io/schema/bpmn">' +
          '<bpmn2:process id="Process_1"></bpmn2:process>' +
        '</bpmn2:definitions>';

      // when
      parse(xml, function(err, definitions) {

        if (err) {
          return done(err);
        }

        // then
        expect(definitions.id).to.equal('simple');
        expect(definitions.targetNamespace).to.equal('http://bpmn.io/schema/bpmn');

        expect(definitions.rootElements.length).to.equal(1);
        expect(definitions.rootElements[0].id).to.equal('Process_1');

        done();
      });
    });


    it('should parse complex xml', function(done) {

      var xml = require('../../fixtures/bpmn/complex.bpmn');

      var start = new Date().getTime();

      // when
      parse(xml, function(err) {

        // parsing a XML document should not take too long
        expect((new Date().getTime() - start)).to.be.below(1000);

        done(err);
      });

      // then
      // everything should be a.o.k
    });

  });

});