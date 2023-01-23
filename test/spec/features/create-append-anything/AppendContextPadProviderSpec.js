import {
  bootstrapModeler,
  getBpmnJS,
  inject
} from 'test/TestHelper';

import {
  query as domQuery
} from 'min-dom';

import createAppendAything from 'lib/features/create-append-anything';
import modelingModule from 'lib/features/modeling';
import coreModule from 'lib/core';
import customRules from '../../../util/custom-rules';

import {
  is
} from 'lib/util/ModelUtil';


describe('features/create-append-anything - append menu provider', function() {

  var testModules = [
    modelingModule,
    coreModule,
    customRules,
    createAppendAything
  ];


  describe('append', function() {

    var diagramXML = require('../../../fixtures/bpmn/simple.bpmn');

    beforeEach(bootstrapModeler(diagramXML, {
      modules: testModules
    }));


    it('should show append menu in the correct position', inject(function(elementRegistry, contextPad) {

      // given
      var element = elementRegistry.get('StartEvent_1'),
          padding = { y: 1, x: 5 },
          padMenuRect,
          replaceMenuRect;

      contextPad.open(element);

      // when
      contextPad.trigger('click', padEvent('append'));

      padMenuRect = contextPad.getPad(element).html.getBoundingClientRect();
      replaceMenuRect = getPopupMenu().getBoundingClientRect();

      // then
      expect(replaceMenuRect.left).to.be.at.most(padMenuRect.right + padding.x);
      expect(replaceMenuRect.top).to.be.at.most(padMenuRect.top + padding.y);
    }));


    it('should hide icon if append is disallowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('StartEvent_1');

        // disallow append
        customRules.addRule('shape.append', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'append')).not.to.exist;
      }
    ));


    it('should show icon if append is allowed', inject(
      function(elementRegistry, contextPad, customRules) {

        // given
        var element = elementRegistry.get('Task_1');

        // disallow append
        customRules.addRule('shape.append', function(context) {
          return !is(context.element, 'bpmn:StartEvent');
        });

        // when
        contextPad.open(element);

        var padNode = contextPad.getPad(element).html;

        // then
        expect(padEntry(padNode, 'append')).to.exist;
      }
    ));

  });
});


// helper //////////////////////////////////////////////////////////////////////
function padEntry(element, name) {
  return domQuery('[data-action="' + name + '"]', element);
}

function padEvent(entry) {

  return getBpmnJS().invoke(function(overlays) {

    var target = padEntry(overlays._overlayRoot, entry);

    return {
      target: target,
      preventDefault: function() {},
      clientX: 100,
      clientY: 100
    };
  });
}

function getPopupMenu() {
  const popup = getBpmnJS().get('popupMenu');

  return popup._current && domQuery('.djs-popup', popup._current.container);
}