import {
  bootstrapModeler,
  inject
} from 'test/TestHelper';

import multiDiagramModule from 'lib/features/multi-diagram';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';

describe('features - multi-diagram', function() {

  describe('Add new diagram', function() {
    describe('add diagram to current file', function() {

      var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          multiDiagramModule
        ]
      }));

      it('should exist only one diagram', inject(function(diagramSwitch) {
        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);
      }));

      it('should add a new diagram', inject(function(diagramSwitch) {
        diagramSwitch.addDiagram();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);
        expect(diagramSwitch._diagramUtil.definitions().rootElements.length).to.equal(2);
      }));

      it('should revert added diagram', inject(function(diagramSwitch, commandStack) {
        var diagramId = diagramSwitch._diagramUtil.currentDiagram().id;

        diagramSwitch.addDiagram();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);
        expect(diagramSwitch._diagramUtil.definitions().rootElements.length).to.equal(2);

        commandStack.undo();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);
        expect(diagramSwitch._diagramUtil.definitions().rootElements.length).to.equal(1);
        expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal(diagramId);
      }));
    });
  });

  describe('Delete diagram', function() {
    describe('correctly delete diagram from current file', function() {

      var diagramXML = require('./simple_multi.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          multiDiagramModule
        ]
      }));

      it('should exist more than one diagram', inject(function(diagramSwitch) {
        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);
      }));

      it('should delete diagram from current file', inject(function(diagramSwitch) {
        diagramSwitch.deleteDiagram();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);
        expect(diagramSwitch._diagramUtil.definitions().rootElements.length).to.equal(1);
      }));

      it('should throw error', inject(function(diagramSwitch) {
        expect(function() { return diagramSwitch._diagramUtil.removeDiagramById('NotValidId'); }).to.throw();
      }));

      it('should revert deleted diagram', inject(function(diagramSwitch, commandStack) {
        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);

        diagramSwitch.deleteDiagram();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);

        commandStack.undo();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);
      }));
    });

    describe('CANNOT delete diagram from current file', function() {

      var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

      beforeEach(bootstrapModeler(diagramXML, {
        modules: [
          coreModule,
          modelingModule,
          multiDiagramModule
        ]
      }));

      it('should exist only one diagram', inject(function(diagramSwitch) {
        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);
      }));

      it('should NOT delete the diagram', inject(function(diagramSwitch) {
        diagramSwitch.deleteDiagram();

        expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(1);
      }));
    });
  });

  describe('Rename diagram', function() {

    var diagramXML = require('./simple_multi.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        multiDiagramModule
      ]
    }));

    it('should rename diagram successfully', inject(function(diagramSwitch) {
      diagramSwitch.renameDiagram('testRename');

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('testRename');
    }));

    it ('should NOT rename diagram to empty string', inject(function(diagramSwitch) {
      diagramSwitch.renameDiagram('');

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.not.equal('');
    }));

    it('should revert renaming diagram', inject(function(diagramSwitch, commandStack) {

      var oldId = diagramSwitch._diagramUtil.currentDiagram().id;
      diagramSwitch.renameDiagram('testRename');

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('testRename');

      commandStack.undo();

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal(oldId);
    }));
  });

  describe('Switch diagram', function() {

    var diagramXML = require('./simple_multi.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: [
        coreModule,
        modelingModule,
        multiDiagramModule
      ]
    }));

    it('should exist more than one diagram', inject(function(diagramSwitch) {
      expect(diagramSwitch._diagramUtil.diagrams().length).to.equal(2);
    }));

    it('should switch to the second diagram', inject(function(diagramSwitch) {
      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('BPMNDiagram_1');

      diagramSwitch.switchDiagram('BPMNDiagram_1r8odxk');

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('BPMNDiagram_1r8odxk');
    }));

    it('should revert switch to first diagram', inject(function(diagramSwitch, commandStack) {
      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('BPMNDiagram_1');

      diagramSwitch.switchDiagram('BPMNDiagram_1r8odxk');

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('BPMNDiagram_1r8odxk');

      commandStack.undo();

      expect(diagramSwitch._diagramUtil.currentDiagram().id).to.equal('BPMNDiagram_1');
    }));
  });



});
