import { getUsePorts } from "./defaultPort";
import VueNode from '@/components/node/index.vue';



export const defaultVueNodes = [
  {
    shape:'rectangle',
    width: 150,
    height: 70,
    component: VueNode,
    ports: getUsePorts(['topPort', 'bottomPort']),
  },
  {
    shape:'rectangleNoTopPort',
    width: 120,
    height: 36,
    component: VueNode,
    ports: getUsePorts(['bottomPort']),
  },
]
