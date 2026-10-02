/** Synthetic, read-only fixtures for the explicit Vite development preview. */
type MaterialCell = { 有无: boolean; 名称: string; 备注: string };
const cell = (name = ''): MaterialCell => ({ 有无: !!name, 名称: name, 备注: name ? '本地模拟物料' : '' });
const namedSlots = (names: string[], count: number) => Object.fromEntries(
  Array.from({ length: count }, (_, i) => [String(i + 1), cell(names[i])]),
);
const occupiedSlots = (count: number, occupied: number[]) => Object.fromEntries(
  Array.from({ length: count }, (_, i) => [String(i + 1), { 有无: occupied.includes(i + 1) }]),
);

const materials = {
  粉桶: namedSlots(['分散剂 A', '稳定剂 B', '助剂 C', '', '备用粉料'], 6),
  试剂区: {
    '1': namedSlots(['分散液 A', '分散液 B', '清洗液 A'], 4),
    '2': namedSlots(['单体溶液 A', '单体溶液 B', '', '标准样品'], 4),
    '3': namedSlots(['去离子水', '清洗液 B', '清洗液 C'], 4),
    '4': namedSlots(['溶剂 A', '溶剂 B'], 4),
  },
  冷藏区: {
    '1': namedSlots(['待检样品 A', '待检样品 B'], 2),
    '2': namedSlots(['参考样品'], 2),
  },
  磁子: occupiedSlots(4, [1, 2, 3]),
  Tip头: occupiedSlots(18, [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16]),
  烧杯区: occupiedSlots(4, [1, 2, 4]),
  玻片: occupiedSlots(10, [1, 2, 3, 4, 6, 7, 8]),
  Tip头2: occupiedSlots(18, [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 13, 14]),
  试管架: occupiedSlots(3, [1, 3]),
};

const experiments = [
  { id: 1, name: 'PS-DVB 微球制备（演示）', description: '五样本错峰制备，含反应内取样、三次离心清洗与最终烘干。' },
  { id: 2, name: '十样本并行制备（演示）', description: '展示多样本调度与共享机台区域的并行进程。' },
  { id: 3, name: '颗粒检测与分布统计（演示）', description: '展示样本关联、平均粒径、变异系数及粒径分布。' },
  { id: 4, name: '离心清洗与收集（演示）', description: '展示后处理模块的工艺衔接和物料准备。' },
];

const definitions = [
  { id: 'mix', name: '配液与混合', source: '配液站', parameter: 'sample', label: '样本编号', value: 'S-01' },
  { id: 'reaction', name: '聚合反应', source: '反应站', parameter: 'vessel', label: '反应位', value: 'R-01' },
  { id: 'detect', name: '反应内取样检测', source: '检测站', parameter: 'sample', label: '检测样本', value: 'S-01' },
  { id: 'wash', name: '离心清洗', source: '清洗站', parameter: 'cycle', label: '循环序号', value: '1' },
  { id: 'dry', name: '最终烘干', source: '烘干站', parameter: 'tray', label: '托盘编号', value: 'D-01' },
  { id: 'collect', name: '样品收集', source: '收集站', parameter: 'rack', label: '试管架', value: 'T-01' },
];
const moduleFlow = {
  id: 85, name: '微球工艺模块（演示）', alias: '微球工艺模块（演示）', solution_id: 85, ip: '',
  flow_data: {
    flowData: [
      { id: 'demo-group', shape: 'system-group', data: { blockName: 'demo_debug_微球工艺模块' } },
      ...definitions.map(def => ({
        id: `demo-${def.id}`, shape: 'user-start', parent: 'demo-group',
        data: {
          blockName: def.name, source: def.source, expose: true,
          inParam: [{ name: def.parameter, label: def.label, field_type: 'string', description: '仅用于本地预览的示例字段' }],
        },
      })),
    ],
  },
};

function previewGraph(experimentId: number) {
  const positions = [
    [60, 150, 'mix'], [360, 150, 'reaction'], [660, 150, 'detect'],
    [660, 340, 'wash'], [360, 340, 'wash'], [60, 340, 'wash'],
    [60, 530, 'dry'], [360, 530, 'collect'],
  ] as const;
  const steps = experimentId === 3 ? ['detect', 'collect']
    : experimentId === 4 ? ['wash', 'wash', 'wash', 'dry', 'collect']
    : positions.map(([, , key]) => key);
  let cycle = 0;
  const nodes = steps.map((key, index) => {
    const [x, y] = positions[index];
    const def = definitions.find(item => item.id === key)!;
    if (key === 'wash') cycle += 1;
    return {
      id: `demo-node-${index}`, shape: 'rectangle', x, y, width: 210, height: 100,
      data: {
        blockName: key === 'wash' ? `第 ${cycle} 次离心清洗` : def.name,
        source: def.source, type: 'invoke', invokeId: `demo-${key}`,
        param: { [def.parameter]: key === 'wash' ? String(cycle) : def.value },
      },
    };
  });
  const start = {
    id: 'demo-start', shape: 'rectangleNoTopPort', x: 60, y: 50, width: 210, height: 36,
    data: { type: 'start', blockName: experiments.find(item => item.id === experimentId)?.name || experiments[0].name },
  };
  const ids = [start.id, ...nodes.map(node => node.id)];
  const allNodes = [start, ...nodes];
  const edges = ids.slice(1).map((id, index) => {
    const from = allNodes[index];
    const to = allNodes[index + 1];
    const sourceAnchor = to.x > from.x ? 'right' : to.x < from.x ? 'left' : 'bottom';
    const targetAnchor = to.x > from.x ? 'left' : to.x < from.x ? 'right' : 'top';
    return {
      id: `demo-edge-${index}`, shape: 'edge',
      source: { cell: ids[index], anchor: { name: sourceAnchor }, connectionPoint: { name: 'boundary' } },
      target: { cell: id, anchor: { name: targetAnchor }, connectionPoint: { name: 'boundary' } },
      router: { name: 'manhattan' }, connector: { name: 'rounded' },
      attrs: { line: { stroke: '#7E8798', strokeWidth: 2, strokeDasharray: 6, targetMarker: 'classic' } },
    };
  });
  return { cells: [start, ...nodes, ...edges] };
}

/** Return fresh objects so local edits never mutate the next preview load. */
export function getPreviewData(url: string, params?: { experiment_id?: number | string }) {
  const path = url.split('?')[0];
  switch (path) {
    case '/automation/experiment/list': return structuredClone(experiments);
    case '/automation/var/list': return structuredClone(materials);
    case '/backend/flow/85': return structuredClone(moduleFlow);
    case '/backend/flow/debug/modules': return [structuredClone(moduleFlow)];
    case '/automation/eflow/fetch': return { data: previewGraph(Number(params?.experiment_id) || 1) };
    default: return [];
  }
}
