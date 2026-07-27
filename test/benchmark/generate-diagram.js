/**
 * Generate a large, realistic BPMN process for benchmarking.
 *
 * The process models a long end-to-end flow, decomposed into a number of
 * expanded sub-processes ("phases"). Each phase contains a grid of tasks
 * wired into a linear chain via sequence flows, framed by a start and end
 * event. The phases themselves are chained on the top level.
 *
 * This yields realistic nesting (plane -> sub-process -> task), a high edge
 * density and thousands of elements - exactly the shape that stresses the
 * diagram-js code paths optimized in bpmn-io/diagram-js#1064:
 *
 *  - import / rendering (GraphicsFactory ordering, deferred outline)
 *  - copy (createTree, getParents, hasRelations)
 *  - move preview (edge resolution, dragger layout)
 *
 * @param {Object} [options]
 * @param {number} [options.tasksPerPhase=100]
 * @param {number} [options.phases=20]
 * @param {number} [options.columns=10] tasks per row inside a phase
 *
 * @return {{ xml: string, stats: Object }}
 */
export function generateDiagram(options = {}) {

  const tasksPerPhase = options.tasksPerPhase || 100;
  const phases = options.phases || 20;
  const columns = options.columns || 10;

  const TASK_W = 100;
  const TASK_H = 80;
  const COL_GAP = 60;
  const ROW_GAP = 40;
  const EVENT_SIZE = 36;

  const cellW = TASK_W + COL_GAP;
  const cellH = TASK_H + ROW_GAP;

  const rowsPerPhase = Math.ceil(tasksPerPhase / columns);

  // inner padding of a sub-process frame
  const PAD_LEFT = 120; // room for phase start event
  const PAD_RIGHT = 120; // room for phase end event
  const PAD_TOP = 60;
  const PAD_BOTTOM = 60;

  const phaseW = PAD_LEFT + columns * cellW + PAD_RIGHT;
  const phaseH = PAD_TOP + rowsPerPhase * cellH + PAD_BOTTOM;

  const PHASE_GAP = 120;

  const process = [];
  const shapesDi = [];
  const edgesDi = [];

  let flowSeq = 0;
  let shapeCount = 0;
  let connectionCount = 0;

  function shape(di) {
    shapesDi.push(di);
    shapeCount++;
  }

  function edge(id, source, target, waypoints) {
    process.push(
      `<bpmn:sequenceFlow id="${id}" sourceRef="${source}" targetRef="${target}" />`
    );
    const wp = waypoints
      .map((p) => `<di:waypoint x="${p.x}" y="${p.y}" />`)
      .join('');
    edgesDi.push(
      `<bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">${wp}</bpmndi:BPMNEdge>`
    );
    connectionCount++;
  }

  const phaseIds = [];

  for (let p = 0; p < phases; p++) {

    const phaseX = 100 + p * (phaseW + PHASE_GAP);
    const phaseY = 100;

    const spId = `Phase_${p}`;
    phaseIds.push(spId);

    // collect children markup for this sub-process
    const children = [];

    const startId = `${spId}_start`;
    const endId = `${spId}_end`;

    const startX = phaseX + 40;
    const startY = phaseY + phaseH / 2 - EVENT_SIZE / 2;

    const endX = phaseX + phaseW - 40 - EVENT_SIZE;
    const endY = startY;

    children.push(`<bpmn:startEvent id="${startId}" />`);
    shape(
      `<bpmndi:BPMNShape id="${startId}_di" bpmnElement="${startId}"><dc:Bounds x="${startX}" y="${startY}" width="${EVENT_SIZE}" height="${EVENT_SIZE}" /></bpmndi:BPMNShape>`
    );

    const taskPos = [];

    for (let t = 0; t < tasksPerPhase; t++) {
      const id = `${spId}_task_${t}`;
      const col = t % columns;
      const row = Math.floor(t / columns);

      const x = phaseX + PAD_LEFT + col * cellW;
      const y = phaseY + PAD_TOP + row * cellH;

      taskPos.push({ id, x, y });

      children.push(
        `<bpmn:task id="${id}" name="Task ${p}.${t}" />`
      );
      shape(
        `<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}"><dc:Bounds x="${x}" y="${y}" width="${TASK_W}" height="${TASK_H}" /></bpmndi:BPMNShape>`
      );
    }

    // wire: start -> task0 -> task1 -> ... -> end
    // (flows live in the sub-process, so push them into children)
    function innerEdge(id, source, target, waypoints) {
      children.push(
        `<bpmn:sequenceFlow id="${id}" sourceRef="${source}" targetRef="${target}" />`
      );
      const wp = waypoints
        .map((p) => `<di:waypoint x="${p.x}" y="${p.y}" />`)
        .join('');
      edgesDi.push(
        `<bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}">${wp}</bpmndi:BPMNEdge>`
      );
      connectionCount++;
    }

    let prevId = startId;
    let prevOut = { x: startX + EVENT_SIZE, y: startY + EVENT_SIZE / 2 };

    for (let t = 0; t < tasksPerPhase; t++) {
      const task = taskPos[t];
      const inPt = { x: task.x, y: task.y + TASK_H / 2 };
      innerEdge(`flow_${flowSeq++}`, prevId, task.id, [ prevOut, inPt ]);
      prevId = task.id;
      prevOut = { x: task.x + TASK_W, y: task.y + TASK_H / 2 };
    }

    children.push(`<bpmn:endEvent id="${endId}" />`);
    shape(
      `<bpmndi:BPMNShape id="${endId}_di" bpmnElement="${endId}"><dc:Bounds x="${endX}" y="${endY}" width="${EVENT_SIZE}" height="${EVENT_SIZE}" /></bpmndi:BPMNShape>`
    );
    innerEdge(`flow_${flowSeq++}`, prevId, endId, [
      prevOut,
      { x: endX, y: endY + EVENT_SIZE / 2 }
    ]);

    // the expanded sub-process itself
    process.push(
      `<bpmn:subProcess id="${spId}" name="Phase ${p}">${children.join('')}</bpmn:subProcess>`
    );
    shape(
      `<bpmndi:BPMNShape id="${spId}_di" bpmnElement="${spId}" isExpanded="true"><dc:Bounds x="${phaseX}" y="${phaseY}" width="${phaseW}" height="${phaseH}" /></bpmndi:BPMNShape>`
    );
  }

  // chain the phases on the top level
  for (let p = 0; p < phases - 1; p++) {
    const sourceX = 100 + p * (phaseW + PHASE_GAP) + phaseW;
    const targetX = 100 + (p + 1) * (phaseW + PHASE_GAP);
    const midY = 100 + phaseH / 2;
    edge(`top_flow_${p}`, phaseIds[p], phaseIds[p + 1], [
      { x: sourceX, y: midY },
      { x: targetX, y: midY }
    ]);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_huge" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_huge" isExecutable="false">
    ${process.join('\n    ')}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_huge">
      ${shapesDi.join('\n      ')}
      ${edgesDi.join('\n      ')}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  return {
    xml,
    stats: {
      phases,
      tasksPerPhase,
      shapes: shapeCount,
      connections: connectionCount,
      total: shapeCount + connectionCount
    }
  };
}
