import { defaultVueNodes } from "./defaultNodes";
import { register } from '@antv/x6-vue-shape';


defaultVueNodes.forEach(node => {
  register(node)
});
