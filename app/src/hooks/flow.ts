import api from "@/api";
import { Dnd, Graph, Stencil } from "@antv/x6";
import { Message } from "@arco-design/web-vue";
import { computed, ref, shallowRef } from "vue";
import { sendMqttCmd } from "@/mqtt";
import { getUniqueId } from "@/utils";

export const graph = shallowRef<Graph>(null);
export const stencil = shallowRef<Stencil>(null);
export const dnd = shallowRef<Dnd>(null);
export const openSettingModal = ref(null);

export const currentNode = ref(null);

// 连线默认颜色：暗色画布下需浅色才可见（原 #333 深灰在暗底几乎看不清），
// 但也别太亮 —— 一张图几十条边，太亮会织成"亮网"抢掉节点的主视觉。
export const lineColor = shallowRef<string>('#7E8798');

// 连线粗细 / 虚线节奏。原来 4px 宽 + 5px 间隔，在深色画布上密得像网格布，改成 2px / 6px。
export const LINE_WIDTH = 2;
export const LINE_DASH = 6;


export const flowIsChange = ref(false);


export const exposeTriggers = ref<any[]>([]);

// 按「站号(source)」分配颜色的调色板（同名/同站模块同色，用于模块库左侧色条与画布节点左侧色条）
// 低饱和、暗底可读；只作为「细色条」使用、不整块铺底 ——
// 原值（#5470c6/#91cc75/…）是 ECharts 默认色板，饱和度过高，整块铺到节点头上会与整体克制配色打架
const predefinedColors = ['#4E9FD1', '#3FB98A', '#D8A33C', '#D96C7A', '#9B7BD4', '#5EA8A0', '#C98A5E', '#7C8FA6', '#7EA36B'];

// 起始节点专用色（不参与 source 调色板分配，取强调色同族，语义上呼应"流程入口"）
export const START_NODE_COLOR = '#6E7AE4';

export const triggerColorMap = computed(() => {
  const map: Record<string, string> = {};
  let index = 0;
  exposeTriggers.value?.forEach?.((item) => {
    if (!map[item.source]) {
      map[item.source] = predefinedColors[index % predefinedColors.length];
      index++;
      if (index >= predefinedColors.length) {
        index = 0;
      }
    }
  });
  return map;
});

// 模块库来源的 flow id（GET /backend/flow/{id}，取其 expose 的 user-start 节点作为可拖拽模块）
export const MODULE_SOURCE_FLOW_ID = 85;

// 系统初始化所在的 flow id（POST /backend/flow/section { flow_id, name: '系统初始化' }）
export const INIT_FLOW_ID = 85;

// 读取模块库：GET /backend/flow/{id}
// 取 flow_data.flowData 中 shape=user-start 且 data.expose=true 的节点作为模块，
// 映射为内部结构：{ ...data, block_id }（data 内含 blockName / inParam 等）
export const hanldeGetTriggers = async()=>{
  try {
    const res = await api.flow.get(MODULE_SOURCE_FLOW_ID);
    const list = (res?.data?.flow_data?.flowData || [])
      .filter((item) => item?.shape == 'user-start' && item?.data?.expose)
      .map((item) => {
        return {
          ...item?.data,
          block_id: item.id,
        };
      });
    exposeTriggers.value = list;
  } catch (error) {
    Message.error(error.message || '请求失败！');
    console.log(error);
  }
}


export const eflowAction = async(action, data)=>{
  try {
    let apiFn = async function() {
      api.flow.runFlow(data)
    }
    switch (action) {
      case 'run':
        apiFn = async function() {
          api.flow.runFlow(data)
        }
        break;
      case 'pause':
        apiFn = async function() {
          handleMqttCmd('系统暂停')  
        }
        break;
      case 'resume':
        apiFn = async function() {
          handleMqttCmd('系统恢复')                      
        }
        break;
      case 'stop':
        apiFn = async function() {
          api.flow.stopFlow(data)
        }
        break;
    }
    await apiFn();
    Message.success('操作成功！');
  } catch (error) {
    Message.error(error.message || '操作失败！');
    console.log(error);
  }
}


const handleMqttCmd = (cmd)=>{
  sendMqttCmd('/hitbot/cyys/action/send/', {
    "message_type": "request",
    "message_id": getUniqueId(),
    "instruct": cmd,
    "set": {
    },
    "status": {
      "work": 1,
      "alarm_mes": ""
    },
    "flag" : 1
  });
}