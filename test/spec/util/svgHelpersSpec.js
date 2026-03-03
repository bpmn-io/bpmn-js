import { expectSvgPath, compareSvgPaths, pathToNumbers } from '../../util/svgHelpers';


describe('test helpers - svgHelpers', function() {

  describe('expectSvgPath', function() {

    it('should return true for equal paths', function() {

      // given
      const pathA = 'M10,20L30,40';
      const pathB = 'M10,20L30,40';

      // then
      expectSvgPath(pathA, pathB);
    });


    it('should return true for approximately equal paths', function() {

      // given
      const pathA = 'M187,263m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-36z';
      const pathB = 'M186,262m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-34z';

      // then
      expectSvgPath(pathA, pathB, 3);
    });
  });


  describe('compareSvgPaths', function() {

    it('should return false for different paths', function() {

      // given
      const pathA = 'M187,263m0,-18a13,13,0,1,1,0,36a18,18,0,1,1,0,-36z';
      const pathB = 'M181,262m0,-18a13,13,0,1,1,0,36a18,18,0,1,1,0,-34z';

      // when
      const equal = compareSvgPaths(pathA, pathB, 3);

      // then
      expect(equal).to.be.false;
    });


    it('should return false for paths of different length', function() {

      // given
      const pathA = 'M10,20L30,40';
      const pathB = 'M10,20L30,40L50,60';

      // when
      const equal = compareSvgPaths(pathA, pathB, 3);

      // then
      expect(equal).to.be.false;
    });
  });

  describe('pathToNumbers', function() {

    it('should extract numbers from path', function() {

      // when
      const numbers = pathToNumbers('M10,20L30,40');

      // then
      expect(numbers).to.eql([ 10, 20, 30, 40 ]);
    });

  });

});