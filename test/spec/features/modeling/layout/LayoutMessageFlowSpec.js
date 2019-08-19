import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';


describe('features/modeling - layout message flows', function() {

  var diagramXML = require('./LayoutMessageFlowSpec.bpmn');

  var testModules = [ coreModule, modelingModule ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  it('should layout manhattan after Task move', inject(function(elementRegistry, modeling) {

    // given
    var taskShape = elementRegistry.get('Task_A'),
        messageFlowConnection = elementRegistry.get('MessageFlow_4');

    // when
    modeling.moveElements([ taskShape ], { x: 30, y: 20 });

    // then
    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection).to.have.waypoints([
      { original: { x: 420, y: 234 }, x: 420, y: 234 },
      { x: 420, y: 387 },
      { x: 318, y: 387 },
      { original: { x: 318, y: 448 }, x: 318, y: 448 }
    ]);
  }));


  it('should layout Task -> Participant straight after Task move',
    inject(function(elementRegistry, modeling) {

      // given
      var taskShape = elementRegistry.get('Task_B'),
          messageFlowConnection = elementRegistry.get('MessageFlow_1');

      // when
      modeling.moveElements([ taskShape ], { x: 20, y: -20 });

      // then

      // expect cropped, repaired manhattan connection
      expect(messageFlowConnection).to.have.waypoints([
        { original: { x: 610, y: 194 }, x: 610, y: 194 },
        { original: { x: 610, y: 415 }, x: 610, y: 415 }
      ]);
    })
  );


  it('should layout straight after Participant move', inject(function(elementRegistry, modeling) {

    // given
    var participantShape = elementRegistry.get('Participant_B'),
        messageFlowConnection = elementRegistry.get('MessageFlow_5');

    // when
    modeling.moveElements([ participantShape ], { x: 100, y: 50 });

    // then

    // expect cropped, repaired manhattan connection
    expect(messageFlowConnection).to.have.waypoints([
      { original: { x: 671, y: 214 }, x: 671, y: 214 },
      { original: { x: 671, y: 465 }, x: 671, y: 465 }
    ]);
  }));


  it('should layout EndEvent -> Participant manhattan',
    inject(function(elementRegistry, modeling) {

      // given
      var participantShape = elementRegistry.get('Participant_B'),
          messageFlowConnection = elementRegistry.get('MessageFlow_5');

      // when
      modeling.moveElements([ participantShape ], { x: -200, y: 0 });

      // then
      // expect cropped, repaired manhattan connection
      expect(messageFlowConnection).to.have.waypoints([
        { original: { x: 671, y: 214 }, x: 671, y: 214 },
        { x: 671, y: 315 },
        { x: 471, y: 315 },
        { original: { x: 471, y: 415 }, x: 471, y: 415 }
      ]);
    })
  );


  it('should layout SubProcess -> SubProcess (straight) on SubProcess move',
    inject(function(elementRegistry, modeling) {

      // given
      var subProcessShape = elementRegistry.get('SubProcess_G'),
          messageFlowConnection = elementRegistry.get('MessageFlow_3');

      // when
      modeling.moveElements([ subProcessShape ], { x: 300, y: 0 });

      // then
      expect(messageFlowConnection).to.have.waypoints([
        { x: 902, y: 266 }, { x: 902, y: 458 }
      ]);
    })
  );


  describe('should keep task docking', function() {

    describe('on SubProcess resize', function() {

      it('SubProcess -> Task (straight)',
        inject(function(elementRegistry, modeling) {

          // given
          var subProcessShape = elementRegistry.get('SubProcess_G'),
              messageFlowConnection = elementRegistry.get('MessageFlow_7');

          // when
          modeling.resizeShape(subProcessShape, {
            x: 586,
            y: 458,
            width: 212,
            height: 122
          });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 752, y: 458 },
            { x: 752, y: 214 }
          ]);
        })
      );
    });


    describe('on SubProcess move', function() {

      it('SubProcess -> Task (straight)',
        inject(function(elementRegistry, modeling) {

          // given
          var subProcessShape = elementRegistry.get('SubProcess_G'),
              messageFlowConnection = elementRegistry.get('MessageFlow_7');

          // when
          modeling.moveElements([ subProcessShape ], { x: 50, y: 0 });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 752, y: 458 },
            { x: 752, y: 214 }
          ]);
        })
      );
    });


    describe('on Participant move', function() {

      it('Task -> Participant (straight)',
        inject(function(elementRegistry, modeling) {

          // given
          var participantShape = elementRegistry.get('Participant_B'),
              messageFlowConnection_1 = elementRegistry.get('MessageFlow_1'),
              messageFlowConnection_6 = elementRegistry.get('MessageFlow_6');

          // when
          modeling.moveElements([ participantShape ], { x: 300, y: 50 });

          // then

          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection_1).to.have.waypoints([
            { original: { x: 590, y: 214 }, x: 590, y: 214 },
            { original: { x: 590, y: 465 }, x: 590, y: 465 }
          ]);

          expect(messageFlowConnection_6).to.have.waypoints([
            { original: { x: 773, y: 465 }, x: 773, y: 465 },
            { original: { x: 773, y: 214 }, x: 773, y: 214 }
          ]);
        })
      );

    });


    describe('on Participant resize', function() {

      it('Task -> Participant (straight)',
        inject(function(elementRegistry, modeling) {

          // given
          var participantShape = elementRegistry.get('Participant_B'),
              messageFlowConnection = elementRegistry.get('MessageFlow_1');

          // when
          modeling.resizeShape(participantShape, {
            x: 222,
            y: 415,
            width: 580,
            height: 185
          });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 590, y: 214 },
            { x: 590, y: 415 }
          ]);
        })
      );


      it('Participant -> Task (straight)',
        inject(function(elementRegistry, modeling) {

          // given
          var participantShape = elementRegistry.get('Participant_B'),
              messageFlowConnection = elementRegistry.get('MessageFlow_6');

          // when
          modeling.resizeShape(participantShape, {
            x: 222,
            y: 415,
            width: 580,
            height: 185
          });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 773, y: 415 },
            { x: 773, y: 214 }
          ]);
        })
      );


      it('Task -> Participant (manhattan)',
        inject(function(elementRegistry, modeling) {

          // given
          var participantShape = elementRegistry.get('Participant_B'),
              messageFlowConnection = elementRegistry.get('MessageFlow_1');

          // when
          modeling.resizeShape(participantShape, {
            x: 622,
            y: 415,
            width: 600,
            height: 185
          });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 590, y: 214 },
            { x: 590, y: 315 },
            { x: 990, y: 315 },
            { x: 990, y: 415 }
          ]);
        })
      );


      it('Participant -> Task (manhattan)',
        inject(function(elementRegistry, modeling) {

          // given
          var participantShape = elementRegistry.get('Participant_B'),
              messageFlowConnection = elementRegistry.get('MessageFlow_6');

          // when
          modeling.resizeShape(participantShape, {
            x: 222,
            y: 415,
            width: 500,
            height: 185
          });

          // then
          // expect cropped, repaired manhattan connection
          expect(messageFlowConnection).to.have.waypoints([
            { x: 681, y: 415 },
            { x: 681, y: 315 },
            { x: 773, y: 315 },
            { x: 773, y: 214 }
          ]);
        })
      );

    });

  });

});
