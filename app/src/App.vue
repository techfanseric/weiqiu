<script setup lang="tsx">
import { isPreview, isDisplayLocation } from './runtime';
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { connectMqtt } from './mqtt';
import { onMounted, onUnmounted } from 'vue';
import { mqttMonitor, mqttUnMonitor } from './mqtt/monitor';
import { getUniqueId } from './utils';
import { handleNotification } from './hooks/errConfirm';
import { Modal } from '@arco-design/web-vue';
import { deviceStatus, handleGetVarData, samples, taskData } from './hooks/main';
import { MODULE_SOURCE_FLOW_ID } from './hooks/flow';
import { updateDashboard } from './hooks/dashboard';
import { addLogs } from './hooks/log';
import dayjs from 'dayjs';
document.body.removeAttribute('arco-theme');
const consoleTransport = !isPreview && !isDisplayLocation();
if (consoleTransport) connectMqtt();

const errtopic = '/hitbot/flowbridge/error/';
const errtopicId = getUniqueId();

const alerttopic = '/hitbot/flowbridge/alert/'
const alerttopicId = getUniqueId();


const platetopic = '/hitbot/lide/plate/status/'
const platetopicId = getUniqueId();


const changedtopic = '/data/notification/changed';

const changedtopicId = getUniqueId();


const logtopic = `/flow/running/log/${MODULE_SOURCE_FLOW_ID}`
const logtopicId = getUniqueId();
onMounted(()=>{
  if (!consoleTransport) return;
  mqttMonitor(errtopic, errtopicId, (data)=>{
    try {
      console.log('errorData', data)
      handleNotification(data)
    } catch (error) {

    }
  })
  mqttMonitor(alerttopic, alerttopicId, (data)=>{
    try {
      if(data.title&&data.content){
        Modal.info({
          title: data.title ,
          content: data.content,
        })
      }
    } catch (error) {
    }
  })
  mqttMonitor(platetopic, platetopicId, (data)=>{
    try {
      console.log('收到样本数据', platetopic, data)
      samples.value = data.samples || [];
      localStorage.setItem('samples', JSON.stringify(samples.value));
      taskData.value = {
        count: data.count || 0,
        finshed: data.finshed || 0,
      };
      localStorage.setItem('taskData', JSON.stringify(taskData.value));
    } catch (error) {

    }
  })

  mqttMonitor(changedtopic, changedtopicId, (data)=>{
    try {
      if(data.type=='dashboard'){
        // 首页看板整包：设备状态 + 运行任务 + 视觉颗粒数据 + 实验数据
        updateDashboard(data.data || {});
      }else if(['task', 'vision', 'experiment'].includes(data.type)){
        // 单块更新
        if(data.data){ updateDashboard({ [data.type]: data.data }); }
      }else if(data.type=='var'){
        handleGetVarData();
      }else if(data.type=='devcie-status'){
        console.log('收到设备状态数据', changedtopic, data)
        deviceStatus.value = data?.data || [];
        localStorage.setItem('deviceStatus', JSON.stringify(deviceStatus.value));
      }
    } catch (error) {
      
    }
  })

  mqttMonitor(logtopic, logtopicId, (data)=>{
    try {
      if(['IO状态', '设备状态'].includes(data.type)){
        return
      }
      addLogs({
        ...data,
        time: dayjs().format('HH:mm:ss.SSS'),
        data: JSON.stringify(data?.data)
      });
    } catch (error) {

    }
  })
})

onUnmounted(()=>{
  mqttUnMonitor(errtopic, errtopicId);
  mqttUnMonitor(alerttopic, alerttopicId);
  mqttUnMonitor(platetopic, platetopicId);
  mqttUnMonitor(changedtopic, changedtopicId);
  mqttUnMonitor(logtopic, logtopicId);
})
</script>

<template>
  <a-config-provider :locale="zhCN">
    <RouterView />
  </a-config-provider>
</template>

<style>

</style>
