var getAttachment = require('lib/features/modeling/behavior/util/LineAttachmentUtil').getAttachment;

var EPSILON = 0.1;


describe('modeling/behavior/util - LineAttachmentUtil#getAttachment', function() {

  // test line
  //
  // *--*
  //    |
  //    *
  //     \
  //      *
  //
  var line = [
    { x: 10, y: 10 },

    // -
    { x: 30, y: 10 },

    // |
    { x: 30, y: 30 },

    // \
    { x: 130, y: 130 }
  ];


  describe('should recognize segment', function() {

    it('horizontal', function() {

      // when
      var attachment = getAttachment({ x: 20, y: 5 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 20, y: 10 },
        segmentIndex: 0,
        relativeLocation: 0.5
      });
    });


    it('horizontal (on line)', function() {

      // when
      var attachment = getAttachment({ x: 20, y: 10 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 20, y: 10 },
        segmentIndex: 0,
        relativeLocation: 0.5
      });
    });


    it('vertical', function() {

      // when
      var attachment = getAttachment({ x: 40, y: 20 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 30, y: 20 },
        segmentIndex: 1,
        relativeLocation: 0.5
      });
    });


    it('diagonal', function() {

      // when
      var attachment = getAttachment({ x: 30, y: 40 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 35, y: 35 },
        segmentIndex: 2,
        relativeLocation: 0.05
      });
    });


    it('diagonal (on line)', function() {

      // when
      var attachment = getAttachment({ x: 50, y: 50 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 50, y: 50 },
        segmentIndex: 2,
        relativeLocation: 0.2
      });
    });


    it('horizontal (conflicting with vertical)', function() {

      // when
      var attachment = getAttachment({ x: 25, y: 15 }, line);

      // then
      expect(attachment).to.eql({
        type: 'segment',
        position: { x: 25, y: 10 },
        segmentIndex: 0,
        relativeLocation: 0.75
      });
    });

  });


  describe('should recognize bendpoint', function() {

    it('horizontal', function() {

      // when
      var attachment = getAttachment({ x: 35, y: 5 }, line);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 30, y: 10 },
        bendpointIndex: 1,
        segmentIndex: 0
      });
    });


    it('horizontal (segment start)', function() {

      // when
      var attachment = getAttachment({ x: 5, y: 5 }, line);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 10, y: 10 },
        bendpointIndex: 0,
        segmentIndex: 0
      });
    });


    it('vertical', function() {

      // when
      var attachment = getAttachment({ x: 35, y: 10 }, line);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 30, y: 10 },
        bendpointIndex: 1,
        segmentIndex: 0
      });
    });


    it('vertical (segment start)', function() {

      var otherLine = [
        { x: 10, y: 10 },
        { x: 10, y: 50 }
      ];

      // when
      var attachment = getAttachment({ x: 5, y: 5 }, otherLine);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 10, y: 10 },
        bendpointIndex: 0,
        segmentIndex: 0
      });
    });

  });


  describe('should handle float values', function() {

    // test line
    //
    // *--*
    //    |
    //    *
    //     \
    //      *
    //
    var floatingPointLine = [
      { x: 10.141592, y: 10.653589 },

      // -
      { x: 30.793238, y: 10.462643 },

      // |
      { x: 30.383279, y: 30.502884 },

      // \
      { x: 130.197169, y: 130.399375 }
    ];


    it('float value segment', function() {

      // when
      var attachment = getAttachment({ x: 20.197169, y: 5.399375 }, floatingPointLine);

      // then
      expect(attachment.type).to.equal('segment');
      expect(attachment.segmentIndex).to.equal(0);

      // expect values to be roughly equal
      expect(attachment.relativeLocation).to.be.within(0.5 - EPSILON, 0.5 + EPSILON);
      expect(attachment.position.x).to.be.within(20.25 - EPSILON, 20.25 + EPSILON);
      expect(attachment.position.y).to.be.within(10.5 - EPSILON, 10.5 + EPSILON);
    });


    it('float value bendboint', function() {

      // when
      var attachment = getAttachment({ x: 35.197169, y: 5.399375 }, floatingPointLine);

      // then
      expect(attachment.type).to.equal('bendpoint');
      expect(attachment.segmentIndex).to.equal(1);
      expect(attachment.bendpointIndex).to.equal(1);

      // expect values to be roughly equal
      expect(attachment.position.x).to.be.within(30.793 - EPSILON, 30.793 + EPSILON);
      expect(attachment.position.y).to.be.within(10.463 - EPSILON, 10.463 + EPSILON);
    });

  });


  describe('handle zero-length line', function() {

    var zeroLengthLine = [
      { x: 10, y: 10 },

      // -
      { x: 10, y: 10 }
    ];


    var zeroLengthFloatingPointLine = [
      { x: 10.1, y: 10.12313 },

      // -
      { x: 10, y: 10.112 }
    ];


    it('should treat zero-length as bendpoint attach', function() {

      // when
      var attachment = getAttachment({ x: 15.1, y: 15.123 }, zeroLengthLine);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 10, y: 10 },
        segmentIndex: 0,
        bendpointIndex: 0
      });
    });


    it('should treat approx zero-length as bendpoint attach', function() {

      // when
      var attachment = getAttachment({ x: 15.1, y: 15.123 }, zeroLengthFloatingPointLine);

      // then
      expect(attachment).to.eql({
        type: 'bendpoint',
        position: { x: 10.1, y: 10.12313 },
        segmentIndex: 0,
        bendpointIndex: 0
      });
    });

  });

});
