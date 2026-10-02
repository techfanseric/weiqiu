import { sendMqttCmd, subscribeTopic } from ".";
import { getUniqueId } from "@/utils";

// mqtt设备指令请求
export const topicDeviceCallback:{
  [propName:string]: {
    requestID: string;
    callback: Function;
  }[]
} = {}
export const mqttDeviceRequest = (topic: string, payload:{[propName:string]:any}={}, timeout = 10, edgeACK = null)=> {
  return new Promise((resolve, reject)=> {
    if(!topic){
      reject(new Error('没有发送主题！'));
      return
    }
    let timer:NodeJS.Timeout
    if(!payload.RequestID){
      payload.RequestID = `req_${getUniqueId()}`
    }
    if(!payload.ClientId){
      payload.ClientId = window.$mqttClientId
    }
    const callback = (data:{[propName:string]:any})=>{
      if(data?.RequestID != payload.RequestID){
        return
      }
      if(data.MesType == 'Response' ) {
        if(data['Status']['Work'] == 'EdgeACK'){
          edgeACK?.(data)
        }
        if(data['Status']['Work'] == 'Done') {
          cancelMqttDeviceRequest(topic, payload.RequestID);
          clearTimeout(timer)
          resolve(data);
        }else if(data['Status']['Work'] == 'Error') {
          console.log('deviceCmdError', data);
          cancelMqttDeviceRequest(topic, payload.RequestID);
          clearTimeout(timer);
          let error = new Error(`${data?.['Status']?.['ErrorCode']?data['Status']['ErrorCode']+'-':''}${data?.['Status']?.['Alarms']}`)
          reject(error);
        }
      }
    }
    if(!topicDeviceCallback[topic]){
      topicDeviceCallback[topic] = [
        {
          requestID: payload.RequestID,
          callback: callback
        }
      ]
      subscribeTopic([topic])
    }else{
      topicDeviceCallback[topic].push({
        requestID: payload.RequestID,
        callback: callback
      })
    }
    timer = setTimeout(()=> {
      cancelMqttDeviceRequest(topic, payload.RequestID);
      reject(new Error('请求超时！'));
    }, timeout*1000); 
    sendMqttCmd(topic, payload);
  });
}
const cancelMqttDeviceRequest = (topic:string, RequestID:string)=>{
  try {
    for (let i = 0; i < (topicDeviceCallback[topic]?.length || 0); i++) {
      if(topicDeviceCallback[topic][i].requestID==RequestID){
        topicDeviceCallback[topic].splice(i, 1);
        return
      }
    }
  } catch (error) {
    console.log(error)
  }
}

