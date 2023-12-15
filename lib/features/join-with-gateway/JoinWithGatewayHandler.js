import {
  getBBox
} from 'diagram-js/lib/util/Elements';

export class JoinWithGatewayHandler {

  /**
   *
   * @param {import('../modeling/Modeling').default} modeling
   */
  constructor(modeling, selection) {
    this._modeling = modeling;
    this._selection = selection;
  }

  preExecute(context) {
    const { shapes } = context;

    const position = this._getPosition(shapes);
    const gateway = this._appendGateway(shapes[0], position);
    this._connectShapes(shapes.slice(1), gateway);

    context.gateway = gateway;
  }

  postExecute(context) {
    this._selection.select(context.gateway);
  }

  /**
   * @param {import('diagram-js/lib/model/Types').Element[]} shapes
   */
  _getPosition(shapes) {
    const bbox = getBBox(shapes);
    const topMost = this._getTopMost(shapes);

    return {
      x: bbox.x + bbox.width + 80,
      y: bbox.y + topMost.height / 2
    };
  }

  /**
   * @param {import('diagram-js/lib/model/Types').Element[]} shapes
   */
  _getTopMost(shapes) {
    return shapes.reduce((topMost, shape) => {
      return shape.y < topMost.y ? shape : topMost;
    });
  }

  _appendGateway(source, position) {
    return this._modeling.appendShape(source, { type: 'bpmn:ExclusiveGateway' }, position);
  }

  _connectShapes(shapes, target) {
    shapes.forEach(shape => {
      this._modeling.connect(shape, target);
    });
  }
}

JoinWithGatewayHandler.$inject = [ 'modeling', 'selection' ];
