import { Button, Message, Notification, Space, Tooltip, Modal } from '@arco-design/web-vue';
import api from '@/api';
import { ref } from 'vue';
import { getUniqueId } from '@/utils';
import { sendMqttCmd } from '@/mqtt';

const openIds = ref<any>({})

let isFirst = true;





export const handleNotification = (data:any) => {
  if(isFirst) {
    let input = document.createElement('input');
    input.style.display = 'none';
    document.body.appendChild(input);
    setTimeout(()=>{
      input.focus();
      input.value = '123';
    }, 100)
    isFirst = false;
  }

  const id = getUniqueId();

  const actionHandle = async(state, modal)=>{
    Notification.remove(id);
    delete openIds.value[id];
    const reqData = {
      "action" : "handle_error",
      "section" : data?.flow_name,
      "state" : state,
      "web_id" : id,
    }
    try {
      const res  = await api.flow.program(reqData);
      Message.success('操作成功')
    } catch (error) {
      Message.error(error.message||'操作失败')
      console.log(error)
    }

    sendMqttCmd('/flow_work_action', reqData)
    modal.close();
  }
  openIds.value[id] = true;
  let modal = Modal.error({
    title:'异常提示',
    maskClosable: false,
    content:<div>
      <div>流程名称：{data?.flow_name}</div>
      <div>步骤名称：{data?.node_name}</div>
      <div>出错信息：{JSON.stringify(data?.output || {})}</div>
      <div>请选择你接下来的操作</div>
    </div>,
    footer: <Space>
      <Tooltip content="终止流程" background-color="#3491FA" style="z-index:5002;" >
        <Button onClick={() =>actionHandle(1, modal)} type="primary"  >
          终止
        </Button>
      </Tooltip>
      <Tooltip content="重试异常步骤并继续执行" background-color="#3491FA" style="z-index:5002;">
        <Button onClick={() =>actionHandle(2, modal)} type="primary">
          重试
        </Button>
      </Tooltip>
      <Tooltip content="跳过异常步骤从下一步开始继续执行" background-color="#3491FA" style="z-index:5002;">
        <Button onClick={() =>actionHandle(3, modal)} type="primary" >
          跳过
        </Button>
      </Tooltip>
    </Space>
  })
}



// export const handleNotification = (data:any) => {
//   if(isFirst) {
//     let input = document.createElement('input');
//     input.style.display = 'none';
//     document.body.appendChild(input);
//     setTimeout(()=>{
//       input.focus();
//       input.value = '123';
//     }, 100)
//     isFirst = false;
//   }

//   const id = getUniqueId();

//   const actionHandle = async(state)=>{
//     Notification.remove(id);
//     delete openIds.value[id];
//     const reqData = {
//       "action" : "handle_error",
//       "section" : data?.flow_name,
//       "state" : state,
//       "web_id" : id,
//     }
//     try {
//       const res  = await api.flow.program(reqData);
//       Message.success('操作成功')
//     } catch (error) {
//       Message.error(error.message||'操作失败')
//       console.log(error)
//     }

//     sendMqttCmd('/flow_work_action', reqData)
    
//   }
//   openIds.value[id] = true;
  
//   Notification.error({
//     id,
//     title:'异常提示',
//     style:{
//       marginTop: '35px',
//     },
//     content:<div>
//       <div>流程名称：{data?.flow_name}</div>
//       <div>步骤名称：{data?.node_name}</div>
//       <div>出错信息：{JSON.stringify(data?.output || {})}</div>
//       <div>请选择你接下来的操作</div>
//     </div>,
//     duration: 0,
//     footer: <Space>
//       <Tooltip content="终止流程" background-color="#3491FA" style="z-index:5002;" >
//         <Button onClick={() =>actionHandle(1)} type="primary" size="mini" >
//           终止
//         </Button>
//       </Tooltip>
//       <Tooltip content="重试异常步骤并继续执行" background-color="#3491FA" style="z-index:5002;">
//         <Button onClick={() =>actionHandle(2)} type="primary" size="mini" >
//           重试
//         </Button>
//       </Tooltip>
//       <Tooltip content="跳过异常步骤从下一步开始继续执行" background-color="#3491FA" style="z-index:5002;">
//         <Button onClick={() =>actionHandle(3)} type="primary" size="mini" >
//           跳过
//         </Button>
//       </Tooltip>
//     </Space>
//   })
// }


window.addEventListener('beforeunload', (e)=>{
  console.log('beforeunload');
  if(Object.keys(openIds.value).length > 0){
    e.preventDefault();
  }
});