'use strict';

require('../../TestHelper');

var BpmnRenderUtil = require('../../../lib/draw/BpmnRenderUtil');


describe('BpmnRenderUtil', function() {

  it('should expose isTypedEvent', function() {

    expect(BpmnRenderUtil.isTypedEvent).to.be.a('function');

  });

  it('should expose isThrowEvent', function() {

    expect(BpmnRenderUtil.isThrowEvent).to.be.a('function');

  });

  it('should expose isCollection', function() {

    expect(BpmnRenderUtil.isCollection).to.be.a('function');

  });


  it('should expose getDi', function() {

    expect(BpmnRenderUtil.getDi).to.be.a('function');

  });


  it('should expose getSemantic', function() {

    expect(BpmnRenderUtil.getSemantic).to.be.a('function');

  });

  it('should expose getCirclePath', function() {

    expect(BpmnRenderUtil.getCirclePath).to.be.a('function');

  });

  it('should expose getRoundRectPath', function() {

    expect(BpmnRenderUtil.getRoundRectPath).to.be.a('function');

  });

  it('should expose getDiamondPath', function() {

    expect(BpmnRenderUtil.getDiamondPath).to.be.a('function');

  });

  it('should expose getRectPath', function() {

    expect(BpmnRenderUtil.getRectPath).to.be.a('function');

  });

  it('should expose getFillColor', function() {

    expect(BpmnRenderUtil.getFillColor).to.be.a('function');

  });

  it('should expose getStrokeColor', function() {

    expect(BpmnRenderUtil.getStrokeColor).to.be.a('function');

  });

});
