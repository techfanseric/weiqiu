import api from "@/api";
import { ref } from "vue";


export const currentExperiment = ref<any>();



export const samples = ref<any[]>([]);



try {
  const localSamples = JSON.parse(localStorage.getItem('samples'))
  if (localSamples) {
    samples.value = localSamples;
  }
} catch (error) {
  
}


export const taskData= ref<any>({
  count: 0,
  finshed: 0,
});

try {
  const localTaskData = JSON.parse(localStorage.getItem('taskData'))
  if (localTaskData) {
    taskData.value = {
      ...taskData.value,
      ...localTaskData
    };
  }
} catch (error) {
  
}


export const deviceStatus = ref<any[]>([]);



try {
  const localDeviceStatus = JSON.parse(localStorage.getItem('deviceStatus'))
  if (localDeviceStatus) {
    deviceStatus.value = localDeviceStatus;
  }
} catch (error) {
  
}




export const varData = ref<any>({})

export const handleGetVarData = async() => {
  try {
    let res = await api.paramsConfig.getVar();
    varData.value = {
      ...varData.value,
      ...(res.data || {}),
    };
  } catch (error) {
    console.log(error)
  }
}