import { Graph, Shape, Selection, Snapline, Keyboard, Clipboard, History, Export, Transform, Dnd } from '@antv/x6';
import { lineColor, LINE_WIDTH, LINE_DASH } from '@/hooks/flow';
import { Message } from '@arco-design/web-vue';
import './registNodes';

// 读全局设计 token（--lx-*）。X6 的配置项只接受具体颜色字符串、吃不了 var()，
// 所以在建图时把 token 解析成实际值，保证画布配色跟着主题走（改 token 即可，不必改这里）。
const cssVar = (name: string, fallback: string) => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) {
    return fallback;
  }
};

// 构建流程图实例
export const createFlow = () => {
  const graph = new Graph({
    container: document.getElementById('graph-container')!,
    background: {
      // 用页面底 token（比节点面板更深），画布才像一块"画板"，节点在上面浮起来
      color: cssVar('--lx-ground', '#131519'),
    },
    grid: {
      visible: true,
      size: 20,
      type: 'dot',
      args: {
        color: cssVar('--lx-grid-dot', 'rgba(255, 255, 255, 0.09)'),
        thickness: 1,
      },
    },
    autoResize : true,
    panning: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: [],
      minScale: 0.1,
      maxScale: 3,
    },
    connecting: {
      router: 'metro',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {  // 连接过程箭头样式
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: lineColor.value, 
              strokeWidth: LINE_WIDTH,
              targetMarker: {
                name: 'classic',
                width: 6,
                height: 8,
              },
              strokeDasharray: LINE_DASH,
              style: {
                animation: 'running-line 30s infinite linear',
              },
            },
            text: {
              fontSize: 10,
              // 原来是 'black'：深色画布上边标签直接看不见
              fill: cssVar('--lx-text-2', '#C0C7D2'),
            },
          },
        })
      },
      validateConnection(data) {
        return !!data.targetMagnet
      },
      validateEdge(data) {  // 验证链接是否允许
        const edge = data.edge;
        const sourcePortId = edge.getSourcePortId();
        const source = edge.getSourceCell();
        const edges = graph.getConnectedEdges(source);
        let targetEdgeCount = 0;
        for (let i = 0; i < edges.length; i++) {
          if(edges[i].getSourcePortId() === sourcePortId && source.id == edges[i].getSourceCell().id) {
            targetEdgeCount += 1;
          }
          if(targetEdgeCount >= 2) {
            return false;
          }
        }

        const sourcePortIds = source.getProp('ports').items;
        const findSourcePort = sourcePortIds.find(item => item.id === sourcePortId);
        const targetPortId  = edge.getTargetPortId();
        const target = edge.getTargetCell();
        const targetPortIds = target.getProp('ports').items;
        const findTargetPort = targetPortIds.find(item => item.id === targetPortId);
        const canStartList = ['bottomPort'];

        if(!canStartList.includes(findSourcePort.group)) {
          Message.warning('错误的起始点！');
          return false;
        }
        const canEndList = ['topPort'];
        if(!canEndList.includes(findTargetPort.group)) {
          Message.warning('错误的结束点！');
          return false;
        }
        return true;
      },
    },
    highlighting: {  // 高亮样式配置：吸附到连接点时用强调色描边（原为固定绿 #00B42A）
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: cssVar('--lx-accent-2', '#8F99F2'),
            stroke: cssVar('--lx-accent-2', '#8F99F2'),
          },
        },
      },
    },
  });

  // 以下挂载所需插件
  graph.use(new Export());
  graph.use(new Selection({
      rubberband: true,
      showNodeSelectionBox: true,
      multiple:true,
      modifiers: 'ctrl'
    }),
  );
  graph.use(new Snapline());
  graph.use(new Keyboard());
  graph.use(new Clipboard());
  graph.use(new History());
  
  graph.use(new Transform({
    resizing: false,
  }))

  // 统一连线颜色：新建的边与「从后端恢复」的旧边都套用当前线色
  // （旧数据里保存的 #333 深灰在暗色画布 #17171a 下几乎不可见）
  graph.on('cell:added', ({ cell }) => {
    if (cell.isEdge()) {
      cell.attr('line/stroke', lineColor.value);
      cell.attr('rect/fill', lineColor.value);
    }
  });

  return graph;
}

export  const createDnd = (graph: Graph) => {
  const dnd = new Dnd({
    target: graph,
  })
  return dnd
}

