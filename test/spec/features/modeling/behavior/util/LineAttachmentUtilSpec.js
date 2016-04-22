'use strict';

var getAttachment = require('lib/features/modeling/behavior/util/LineAttachmentUtil').getAttachment;


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

});
