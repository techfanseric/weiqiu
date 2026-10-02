// 连接点：默认隐藏（连线/吸附时由 highlighting 显示）。
// 配色从原来的 Arco 蓝 + 实心白改成靛紫色系的空心圆，和画布节点保持同一套语言。
const defaultPortAttrs = {
  circle: {
    r: 4,
    magnet: true,
    stroke: '#8F99F2',
    strokeWidth: 1,
    fill: '#1F2229',
    style: {
      visibility: 'hidden',
    },
  },
}

const groups =  {
  leftPort: {
    position: 'left',
    attrs: defaultPortAttrs
  },
  rightPort: {
    position: 'right',
    attrs: defaultPortAttrs
  },
  topPort: {
    position: 'top',
    attrs: defaultPortAttrs
  },
  bottomPort: {
    position: 'bottom',
    attrs: defaultPortAttrs
  },
}

export const getUsePorts = (list: string[]) => {
  const ports = {
    groups:{},
    items: [],
  }
  list.forEach(item => {
    ports.groups[item] = groups[item]
    ports.items.push({
      group: item,
    })
  })
  return ports
}



