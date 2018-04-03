import {
  isTypedEvent,
  isThrowEvent,
  isCollection,
  getDi,
  getSemantic,
  getCirclePath,
  getRoundRectPath,
  getDiamondPath,
  getRectPath,
  getFillColor,
  getStrokeColor
} from 'lib/draw/BpmnRenderUtil';


describe('BpmnRenderUtil', function() {

  it('should expose isTypedEvent', function() {

    expect(isTypedEvent).to.be.a('function');

  });

  it('should expose isThrowEvent', function() {

    expect(isThrowEvent).to.be.a('function');

  });

  it('should expose isCollection', function() {

    expect(isCollection).to.be.a('function');

  });


  it('should expose getDi', function() {

    expect(getDi).to.be.a('function');

  });


  it('should expose getSemantic', function() {

    expect(getSemantic).to.be.a('function');

  });

  it('should expose getCirclePath', function() {

    expect(getCirclePath).to.be.a('function');

  });

  it('should expose getRoundRectPath', function() {

    expect(getRoundRectPath).to.be.a('function');

  });

  it('should expose getDiamondPath', function() {

    expect(getDiamondPath).to.be.a('function');

  });

  it('should expose getRectPath', function() {

    expect(getRectPath).to.be.a('function');

  });

  it('should expose getFillColor', function() {

    expect(getFillColor).to.be.a('function');

  });

  it('should expose getStrokeColor', function() {

    expect(getStrokeColor).to.be.a('function');

  });

});
