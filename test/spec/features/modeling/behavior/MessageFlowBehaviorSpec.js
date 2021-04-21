import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import coreModule from 'lib/core';
import modelingModule from 'lib/features/modeling';


describe('features/modeling - message flow behavior', function() {

  var testModules = [ coreModule, modelingModule ];


  describe('when collapsing participant', function() {

    var processDiagramXML = require('./MessageFlowBehavior.bpmn');

    beforeEach(bootstrapModeler(processDiagramXML, { modules: testModules }));


    it('should reconnect message flows to collapsed participant (incoming)', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var participant = elementRegistry.get('Participant_1');

        // when
        participant = bpmnReplace.replaceElement(participant, {
          type: 'bpmn:Participant',
          isExpanded: false
        });

        // then
        expect(participant.incoming).to.have.length(2);

        expect(elementRegistry.get('Flow_1').waypoints).to.eql([
          {
            original: {
              x: 350,
              y: 520
            },
            x: 350,
            y: 480
          },
          {
            original: {
              x: 350,
              y: 110
            },
            x: 350,
            y: 140
          }
        ]);

        expect(elementRegistry.get('Flow_2').waypoints).to.eql([
          {
            original: {
              x: 790,
              y: 520
            },
            x: 790,
            y: 480
          },
          {
            x: 790,
            y: 360
          },
          {
            x: 370,
            y: 360
          },
          {
            original: {
              x: 370,
              y: 110
            },
            x: 370,
            y: 140
          }
        ]);
      }
    ));


    it('should reconnect message flows to collapsed participant (outgoing)', inject(
      function(bpmnReplace, elementRegistry) {

        // given
        var participant = elementRegistry.get('Participant_4');

        // when
        participant = bpmnReplace.replaceElement(participant, {
          type: 'bpmn:Participant',
          isExpanded: false
        });

        // then
        expect(participant.outgoing).to.have.length(2);

        expect(elementRegistry.get('Flow_3').waypoints).to.eql([
          {
            original: {
              x: 780,
              y: 750
            },
            x: 780,
            y: 720
          },
          {
            x: 780,
            y: 680
          },
          {
            x: 360,
            y: 680
          },
          {
            original: {
              x: 360,
              y: 520
            },
            x: 360,
            y: 560
          }
        ]);

        expect(elementRegistry.get('Flow_4').waypoints).to.eql([
          {
            original: {
              x: 800,
              y: 750
            },
            x: 800,
            y: 720
          },
          {
            original: {
              x: 800,
              y: 520
            },
            x: 800,
            y: 560
          }
        ]);
      }
    ));

  });

});