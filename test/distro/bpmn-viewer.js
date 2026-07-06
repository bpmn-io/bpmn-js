import { expect } from 'chai';

import { testImport } from './helper';


describe('bpmn-viewer', function() {

  it('should expose globals', function() {

    var BpmnJS = window.BpmnJS;

    // then
    expect(BpmnJS).to.exist;
    expect(new BpmnJS()).to.exist;
  });


  it('should import initial diagram', function() {

    var BpmnJS = window.BpmnJS;

    // then
    return testImport(BpmnJS);
  });

});
