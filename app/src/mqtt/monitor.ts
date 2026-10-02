import { topicDeviceCallback } from './device';
import { subscribeTopic, unSubscribe } from "./index";

//监控主题相关
export const mqttMonitorCallback:{
  [propName:string]: {
    id: string;
    callback: Function;
  }[]
} = {};
export const mqttMonitor = (topic: string, id: string, callback: Function)=>{
  if(!mqttMonitorCallback[topic]){
    mqttMonitorCallback[topic] = [{ id, callback }]
    subscribeTopic([topic])
  }else{
    let findItem = mqttMonitorCallback[topic].find((item)=>item.id==id)
    if(findItem){
      findItem.callback = callback
    }else{
      mqttMonitorCallback[topic].push({ id, callback })
    }
  }
}

export const mqttUnMonitor = (topic: string, id: string)=>{
  let findIndex = (mqttMonitorCallback[topic] || []).findIndex((item)=>item.id==id)
  if(findIndex!=-1){
    mqttMonitorCallback[topic].splice(findIndex, 1);
    if (!mqttMonitorCallback[topic].length) { delete mqttMonitorCallback[topic];
      // Device requests share this client; preserve their existing subscription.
      if (!Object.prototype.hasOwnProperty.call(topicDeviceCallback, topic)) unSubscribe([topic]); }
  }
}
 