import { expect } from 'chai';

import {
  asEdges,
  asLines,
  getReferencePoint
} from 'lib/util/LineUtil';


describe('util/LineUtil', function() {

  describe('#getReferencePoint', function() {

    it('should return undefined without lines', function() {

      // when
      const point = getReferencePoint({ x: 0, y: 0 }, []);

      // then
      expect(point).not.to.exist;
    });


    it('should dock to the perpendicular foot inside a segment', function() {

      // given
      const lines = asLines([
        { x: 0, y: 0 },
        { x: 100, y: 0 }
      ]);

      // when
      const point = getReferencePoint({ x: 40, y: 30 }, lines);

      // then
      expect(point).to.eql({ x: 40, y: 0 });
    });


    it('should clamp to the segment end (dock to bendpoint)', function() {

      // given
      // an L-shaped connection with a bendpoint at (670, 310)
      const lines = asLines([
        { x: 590, y: 190 },
        { x: 670, y: 190 },
        { x: 670, y: 310 },
        { x: 468, y: 310 }
      ]);

      // when
      // the label is to the right of, and below, the bendpoint
      const point = getReferencePoint({ x: 711, y: 330 }, lines);

      // then
      // the reference point is the bendpoint, NOT (711, 310) on the
      // infinite extension of the horizontal segment
      expect(point).to.eql({ x: 670, y: 310 });
    });


    it('should clamp to the nearest segment across a corner', function() {

      // given
      const lines = asLines([
        { x: 300, y: 235 },
        { x: 300, y: 310 },
        { x: 432, y: 310 }
      ]);

      // when
      // label below the horizontal segment's start
      const point = getReferencePoint({ x: 350, y: 370 }, lines);

      // then
      expect(point).to.eql({ x: 350, y: 310 });
    });

  });


  describe('#asEdges', function() {

    it('should return the four edges of the given bounds', function() {

      // when
      const edges = asEdges({ x: 10, y: 20, width: 100, height: 50 });

      // then
      expect(edges).to.eql([
        [ { x: 10, y: 20 }, { x: 110, y: 20 } ], // top
        [ { x: 110, y: 20 }, { x: 110, y: 70 } ], // right
        [ { x: 10, y: 70 }, { x: 110, y: 70 } ], // bottom
        [ { x: 10, y: 20 }, { x: 10, y: 70 } ] // left
      ]);
    });

  });


  describe('#asLines', function() {

    it('should convert waypoints to segments', function() {

      // when
      const lines = asLines([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 }
      ]);

      // then
      expect(lines).to.eql([
        [ { x: 0, y: 0 }, { x: 100, y: 0 } ],
        [ { x: 100, y: 0 }, { x: 100, y: 50 } ]
      ]);
    });

  });

});

