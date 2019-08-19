var getLabelAdjustment = require('lib/features/modeling/behavior/util/LabelLayoutUtil').getLabelAdjustment;


describe('modeling/behavior/util - LabelLayoutUtil#getLabelAdjustment', function() {

  describe('should recognize on the line label', function() {

    var newLine = [
      { x: 10, y: 10 },

      // -
      { x: 15, y: 10 },

      // |
      { x: 15, y: 5 },

      // -
      { x: 30, y: 5 }
    ];


    it('horizontal', function() {

      // given
      var line = [
        { x: 10, y: 10 },

        // -
        { x: 20, y: 10 }
      ];

      // label with center { x: 5, y: 10 }

      var label = {
        x: 0,
        y: 5,
        width: 10,
        height: 10
      };

      // when
      var delta = getLabelAdjustment(label, newLine, line, { connectionStart: true });

      // then
      expect(delta).to.eql({ x: 0, y: 0 });
    });


    it('zero-length line', function() {

      // given
      var line = [
        { x: 10, y: 10 },

        // -
        { x: 10, y: 10 }
      ];

      // label with center { x: 5, y: 10 }

      var label = {
        x: 0,
        y: 5,
        width: 10,
        height: 10
      };

      // when
      var delta = getLabelAdjustment(label, newLine, line, { connectionStart: true });

      // then
      expect(delta).to.eql({ x: 0, y: 0 });
    });

  });


});
