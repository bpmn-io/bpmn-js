'use strict';

var BpmnModdle = require('bpmn-moddle');


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
        expect(definitions.id).toBe('simple');
        expect(definitions.targetNamespace).toBe('http://bpmn.io/schema/bpmn');

        expect(definitions.rootElements.length).toBe(1);
        expect(definitions.rootElements[0].id).toBe('Process_1');

        done();
      });
    });


    it('should parse complex xml', function(done) {

      var fs = require('fs');

      var xml = fs.readFileSync('test/fixtures/bpmn/complex.bpmn', 'utf8');

      var start = new Date().getTime();

      // when
      parse(xml, function(err) {
        console.log('parsed in ' + (new Date().getTime() - start) + ' ms');
        done(err);
      });

      // then
      // everything should be a.o.k
    });

  });

});