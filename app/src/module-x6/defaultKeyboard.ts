import { flowIsChange, lineColor, openSettingModal } from '@/hooks/flow';
import contextmenu from '@/plugins/contextmenu';
import { Graph } from '@antv/x6';
export const bindKeyboard = (graph: Graph) => {
  // #region 快捷键与事件
  graph.bindKey(['meta+c', 'ctrl+c'], () => {
    const cells = graph.getSelectedCells().filter((item)=>item.shape!='system-start')
    if (cells.length) {
      graph.copy(cells)
    }
    return false
  })
  graph.bindKey(['meta+x', 'ctrl+x'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.cut(cells)
    }
    return false
  })
  graph.bindKey(['meta+v', 'ctrl+v'], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 100 })
      graph.cleanSelection()
      graph.select(cells)
    }
    return false
  })

  // undo redo
  graph.bindKey(['meta+z', 'ctrl+z'], () => {
    if (graph.canUndo()) {
      graph.undo()
    }
    return false
  })
  graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
    if (graph.canRedo()) {
      graph.redo()
    }
    return false
  })

  // select all
  graph.bindKey(['meta+a', 'ctrl+a'], () => {
    const nodes = graph.getNodes()
    if (nodes) {
      graph.select(nodes)
    }
  })

  // delete
  graph.bindKey(['backspace', 'delete'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.removeCells(cells)
    }
  })

  // 控制连接桩显示/隐藏
  const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  }
  graph.on('node:mouseenter', (e) => {
    const container = document.getElementById('graph-container')!
    const ports = container.querySelectorAll(
      '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, true);
  })
  graph.on('node:move', (e)=>{
  })
  graph.on('edge:changed', (e)=>{
  })
  graph.on('node:mouseleave', (e) => {
    const container = document.getElementById('graph-container')!
    const ports = container.querySelectorAll(
      '.x6-port-body',
    ) as NodeListOf<SVGElement>
    showPorts(ports, false);
  })

  var selectEdgeId = undefined

  graph.on('edge:mouseenter', (e) => {
    const edge = e.cell
    if(selectEdgeId===edge.id){
      return
    }
    edge.setZIndex(1)
    edge.attr('line/stroke', 'green')
    edge.attr('rect/fill', 'green')
    edge.attr('text/fill', 'white')
  })
  graph.on('edge:mouseleave', (e) => {
    const edge = e.cell
    if(selectEdgeId===edge.id){
      return
    }
    edge.setZIndex(0)
    edge.attr('line/stroke', lineColor.value)
    edge.attr('rect/fill', lineColor.value)
    edge.attr('text/fill', 'black')
  })
  
  graph.on('edge:selected', (e) => {
    const edge = e.edge
    selectEdgeId = edge.id
    edge.setZIndex(1)
    edge.attr('line/stroke', 'blue')
    edge.attr('rect/fill', 'blue')
    edge.attr('text/fill', 'white')
  })
  
  graph.on('edge:unselected', (e) => {
    selectEdgeId = undefined
    const edge = e.edge
    edge.setZIndex(0)
    edge.attr('line/stroke', lineColor.value)
    edge.attr('rect/fill', lineColor.value)
    edge.attr('text/fill', 'black')
  });

  // 监听链接完成的事件
  graph.on('edge:connected', ({ isNew, edge }) => {
    if (isNew) {
    }
  });

  graph.on('blank:contextmenu',(e)=>{
    
  })

  // 监听流程块的右键事件
  graph.on('node:dblclick', (e) => {
    const node = e.node;
    const data = node.getData()
    if(data.type == 'start'){
      return   
    }
    openSettingModal.value(node);
  });
  // 监听流程块的右键事件
  graph.on('edge:contextmenu', (e)=>{
    const edge = e.edge;
    let menus = [
      { id: 'remove', label: '删除' },
    ];
    // 开启右键
    contextmenu({
      position: {
        x:e.e.clientX,
        y:e.e.clientY
      },
      menus
    }).then(async(res)=> {
      if(res.id == 'remove') {
        graph.removeCell(edge);
      }
    })
  })
  // 监听流程块的右键事件
  graph.on('node:contextmenu', (e) => {
    const node = e.node;
    const data = node.getData()
    
    let menus = [
      { id: 'remove', label: '删除' },
    ];
    if(data.type == 'start'){
      menus = menus.filter((item)=>item.id!='config')      
    }
    // 开启右键
    contextmenu({
      position: {
        x:e.e.clientX,
        y:e.e.clientY
      },
      menus
    }).then(async(res)=> {
      if(res.id == 'remove') {
        graph.removeCell(node);
      }
    }).catch(()=>{});
  });


  const generateUniqueName = (prefix='')=> {
    const blockName = `${prefix}#${parseInt(`${Math.random()*10000}`)}`
    for(let item of graph.getNodes()){
      if(item?.getData()?.blockName==blockName){
        return generateUniqueName(prefix='')
      }
    }
    return blockName
  }

  //监听添加
  graph.on('node:added',(e)=>{
    const node = e.node;
    flowIsChange.value = true
  })


  graph.on('node:moved',(e)=>{
    const node = e.node;
    flowIsChange.value = true
  })
}



