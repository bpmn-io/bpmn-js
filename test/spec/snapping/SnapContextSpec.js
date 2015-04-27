'use strict';

var SnapContext = require('../../../lib/features/snapping/SnapContext');


describe('snapping - SnapContext', function() {

  it('should add snap origins', function() {

    // given
    var context = new SnapContext();

    var topLeftOrigin = { x: 0, y: 50 },
        bottomRightOrigin = { x: 50, y: 100 };

    // when
    context.setSnapOrigin('top-left', topLeftOrigin);
    context.setSnapOrigin('bottom-right', bottomRightOrigin);

    // then
    expect(context.getSnapOrigin('top-left')).to.eql(topLeftOrigin);
    expect(context.getSnapOrigin('bottom-right')).to.eql(bottomRightOrigin);

    // snap locations are determined by origin add order
    expect(context.getSnapLocations()).to.eql([ 'top-left', 'bottom-right' ]);
  });


  it('should override snap locations', function() {

    // given
    var context = new SnapContext();

    context.setSnapOrigin('top-left', { x: 0, y: 50 });
    context.setSnapOrigin('bottom-right', { x: 50, y: 100 });

    // when
    context.setSnapLocations([ 'bottom-right', 'top-left' ]);

    // then
    // snap are overridden by custom order
    expect(context.getSnapLocations()).to.eql([ 'bottom-right', 'top-left' ]);
  });


  describe('snap points', function() {

    it('should provide per target snap points', function() {

      // given
      var context = new SnapContext();

      context.setSnapOrigin('mid', { x: 0, y: 50 });

      // when
      var snapPointsFoo = context.pointsForTarget('Foo'),
          snapPointsBar = context.pointsForTarget({ id: 'Bar' });

      // then
      expect(snapPointsFoo).to.exist;
      expect(snapPointsBar).to.exist;
    });


    it('should not snap', function() {

      // given
      var context = new SnapContext();
      context.setSnapOrigin('mid', { x: 0, y: 50 });

      // when
      var snapPoints = context.pointsForTarget('Foo');

      // then
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'x')).not.to.exist;
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'y')).not.to.exist;
    });


    it('should snap', function() {

      // given
      var context = new SnapContext();
      context.setSnapOrigin('mid', { x: 0, y: 50 });

      var snapPoints = context.pointsForTarget('Foo');

      // when
      snapPoints.add('mid', { x: 15, y: 50 });

      // then
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'x')).to.eql(15);
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'y')).not.to.exist;
    });


    it('should snap default point', function() {

      // given
      var context = new SnapContext();
      context.setSnapOrigin('mid', { x: 0, y: 50 });
      context.addDefaultSnap('mid', { x: 15, y: 50 });

      // when
      var snapPoints = context.pointsForTarget('Foo');

      // then
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'x')).to.eql(15);
      expect(snapPoints.snap({ x: 10, y: 10 }, 'mid', 'y')).not.to.exist;
    });

  });

});