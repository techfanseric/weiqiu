import { isPreview, isDemoLocation } from '@/runtime';

import { getUniqueId } from '@/utils';
import { MqttClient } from 'mqtt';
import mqtt from 'mqtt';
import { ref } from 'vue';
import { topicDeviceCallback } from './device';
import { mqttMonitorCallback } from './monitor';

window.$mqttClientId = `mqttjs_${getUniqueId()}`;

const options = {
  keepalive: 60, 
  clean: true, 
  clientId: window.$mqttClientId,
  reconnectPeriod: 3000,
  connectTimeout: 10000,
}
export const connected = ref(false);

const getMqttUrl = ()=> {
  if(import.meta.env.PROD){
    let hostname = location.hostname
    let port = location.port
    let protocol = 'ws'
    if (location.protocol=='https:') {
      protocol = 'wss'
    }
    return `${protocol}://${hostname}${port ? ':' + port : ''}/mqtt`
  }
  return (import.meta.env.VITE_API_BASE_URL || location.origin).replace('http', 'ws') + '/mqtt'
}

var heartbeatoPollingTimer
const heartbeatTopic = '/topic/heartbeat'
const heartbeatPolling = ()=>{
  if(heartbeatoPollingTimer){
    clearTimeout(heartbeatoPollingTimer);
    heartbeatoPollingTimer = null;
  }
  sendMqttCmd(heartbeatTopic, {heartbeat:'heartbeat'});
  heartbeatoPollingTimer = setTimeout(heartbeatPolling, 5000);
}

let readOnlyTransport = false;
var client:MqttClient
export const connectMqtt =(config: {readOnly?: boolean; auth?: {username: string; password: string}} = {})=>{
  if (isPreview || isDemoLocation()) return;
  if(!client){
    readOnlyTransport = !!config.readOnly;
    client = mqtt.connect(getMqttUrl(), { ...options, ...config.auth })
    client.on('connect', (packet: any) => {
      console.log('mqtt connect:', packet) 
      connected.value = true;
      if (!config.readOnly) heartbeatPolling();
    })
    client.on('close', () => { connected.value = false; clearTimeout(heartbeatoPollingTimer); });
    client.on('offline', () => { connected.value = false; });
    client.on('error', () => { connected.value = false; });
    client.on('message', (topic:string, payload:Buffer) => {
      onMessage(topic, payload)
    })
  }
}


export const subscribeTopic = (topic: string[])=>{
  if (topic.length === 0) {
    console.log('topic length is 0')
    return
  }
  client?.subscribe(topic, { qos: 1 }, (err) => {
    if (!err) {
      console.log('subscribe success', topic)
    } else {
      console.log('subscribe error', err)
    }
  })
}
export const unSubscribe = (topic: string[])=> {
  if (topic.length === 0) {
    console.log('topic length is 0')
    return
  }
  client?.unsubscribe(topic, (err) => {
    if (!err) {
      console.log('unsubscribe success', topic)
    } else {
      console.log('unsubscribe error', err)
    }
  })
}

export const sendMqttCmd = (topic: string, qtt: any)=> {
  // console.log('sendMqttCmd', topic, qtt)
  if (readOnlyTransport || isPreview || isDemoLocation()) throw new Error('演示模式不发送设备指令');
  if (!client?.connected) throw new Error('设备连接不可用');
  client.publish(topic, JSON.stringify(qtt), { qos: 1, retain: false })
}



const onMessage = (topic: string, payload: Buffer)=>{
  let data = {} as any
  try {
    data = JSON.parse(payload.toString());
  } catch (error) {
    console.log(error.message);
  }
  //收到自己发送的消息-忽略
  if (data?.ClientId == window.$mqttClientId || data?.MesType == "Request") {
    // console.log('不需要处理的消息:' + topic, data)
    return
  }
  // 给所有监控订阅者反馈消息
  (mqttMonitorCallback[topic] || []).forEach(item=> {
    item.callback(data);
  });
  // 给所有设备订阅者反馈消息
  (topicDeviceCallback[topic] || []).forEach(item=> {
    item.callback(data);
  });
}


