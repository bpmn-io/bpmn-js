import inherits from 'inherits';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import { is } from '../../../util/ModelUtil';
import { isExpanded } from '../../../util/DiUtil';
import { isLabel } from '../../../util/LabelUtil';


/**
 * Unclaims model IDs on element deletion.
 *
 * @param {Canvas} canvas
 * @param {Injector} injector
 * @param {Moddle} moddle
 * @param {Modeling} modeling
 */
export default function UnclaimIdBehavior(canvas, injector, moddle, modeling) {
  injector.invoke(CommandInterceptor, this);

  this.preExecute('shape.delete', function(event) {
    var context = event.context,
        shape = context.shape,
        shapeBo = shape.businessObject;

    if (isLabel(shape)) {
      return;
    }

    if (is(shape, 'bpmn:Participant') && isExpanded(shape)) {
      moddle.ids.unclaim(shapeBo.processRef.id);
    }

    modeling.unclaimId(shapeBo.id, shapeBo);
  });


  this.preExecute('connection.delete', function(event) {
    var context = event.context,
        connection = context.connection,
        connectionBo = connection.businessObject;

    modeling.unclaimId(connectionBo.id, connectionBo);
  });

  this.preExecute('canvas.updateRoot', function() {
    var rootElement = canvas.getRootElement(),
        rootElementBo = rootElement.businessObject;

    moddle.ids.unclaim(rootElementBo.id);
  });
}

inherits(UnclaimIdBehavior, CommandInterceptor);

UnclaimIdBehavior.$inject = [ 'canvas', 'injector', 'moddle', 'modeling' ];