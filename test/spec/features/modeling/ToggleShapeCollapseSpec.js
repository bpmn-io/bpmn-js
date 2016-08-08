'use strict';

require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var modelingModule = require('../../../../lib/features/modeling');


describe('features/modeling - toggle collapsed', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));

  var rootShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);
  }));


  describe('expand', function() {

    var shapeToExpand,
        hiddenContainedChild;

    beforeEach(inject(function(elementFactory, canvas) {

      shapeToExpand = elementFactory.createShape({
        id: 'shapeToExpand',
        x: 100, y: 100, width: 300, height: 300,
        collapsed: true
      });

      canvas.addShape(shapeToExpand, rootShape);

      hiddenContainedChild = elementFactory.createShape({
        id: 'hiddenContainedChild',
        x: 150, y: 110, width: 100, height: 100,
        hidden: true
      });

      canvas.addShape(hiddenContainedChild, shapeToExpand);
    }));


    it('expand and should show children', inject(function(modeling) {

      // given
      var originalChildren = shapeToExpand.children.slice();

      // when
      modeling.toggleCollapse(shapeToExpand);

      // then
      expect(shapeToExpand.children).to.eql(originalChildren);
      expect(shapeToExpand.children).to.satisfy(allShown());
    }));


    describe('undo', function() {


      it('collapse and hide all children', inject(function(modeling, commandStack) {

        // given
        var originalChildren = shapeToExpand.children.slice();
        modeling.toggleCollapse(shapeToExpand);

        // when
        commandStack.undo();

        // then
        expect(shapeToExpand.collapsed).to.eql(true);
        expect(shapeToExpand.children).to.eql(originalChildren);
        expect(shapeToExpand.children).to.satisfy(allHidden());
      }));

    });

  });


  describe('collapse', function() {

    var shapeToCollapse,
        shownChildShape,
        hiddenChildShape;

    beforeEach(inject(function(elementFactory, canvas) {

      shapeToCollapse = elementFactory.createShape({
        id: 'shapeToCollapse',
        x: 100, y: 100, width: 300, height: 300,
        collapsed: false
      });

      canvas.addShape(shapeToCollapse, rootShape);

      shownChildShape = elementFactory.createShape({
        id: 'shownChildShape',
        x: 110, y: 110,
        width: 100, height: 100
      });

      canvas.addShape(shownChildShape, shapeToCollapse);

      hiddenChildShape = elementFactory.createShape({
        id: 'hiddenChildShape',
        x: 220, y: 110,
        width: 100, height: 100,
        hidden: true
      });

      canvas.addShape(hiddenChildShape, shapeToCollapse);
    }));


    it('collapse and hide children', inject(function(modeling) {

      // given
      var originalChildren = shapeToCollapse.children.slice();

      // when
      modeling.toggleCollapse(shapeToCollapse);

      // then
      expect(shapeToCollapse.collapsed).to.eql(true);
      expect(shapeToCollapse.children).to.eql(originalChildren);
      expect(shapeToCollapse.children).to.satisfy(allHidden());
    }));


    describe('undo', function() {

      it('expand and show children that were visible',
        inject(function(modeling, commandStack) {

          // given
          var originalChildren = shapeToCollapse.children.slice();
          modeling.toggleCollapse(shapeToCollapse);

          // when
          commandStack.undo();

          // then
          expect(shapeToCollapse.collapsed).to.eql(false);
          expect(shapeToCollapse.children).to.eql(originalChildren);
          expect(shownChildShape.hidden).to.not.eql(true);
          expect(hiddenChildShape.hidden).to.eql(true);
        })
      );

    });

  });

});


/////////// helpers /////////////////////////////


function allHidden() {
  return childrenHidden(true);
}

function allShown() {
  return childrenHidden(false);
}

function childrenHidden(hidden) {
  return function(children) {
    return children.every(function(c) {
      return c.hidden == hidden;
    });
  };
}
