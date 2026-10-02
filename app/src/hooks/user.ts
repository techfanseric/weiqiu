import api from "@/api";
import { Role} from "@/api/type";
import router from "@/router";
import { clearToken, setToken } from "@/utils/auth";
import { Message } from "@arco-design/web-vue";
import { ref } from "vue";

export const userInfo = ref<any>({});
export const isAdmin = ref(false);

try {
  let userInfoStr = localStorage.getItem('userInfo');
  if(userInfoStr){
    userInfo.value = JSON.parse(userInfoStr);
    if(userInfo.value.username=='admin'){
      isAdmin.value = true;
    }
    if(!userInfo.value.time || Date.now()-userInfo.value.time>1000*60*60*12){
      loginOut()
    }
  }
} catch (error) {
  
}


export const role = ref<Role>({});


export const permissions = ref([]);



export function loginOut(){
  userInfo.value = {};
  role.value = {};
  permissions.value = [];
  clearToken();
  localStorage.removeItem('userInfo');
  router.push({name:'login'})
}

export const changePassword = async(oldPassword: string, newPassword: string)=>{
  try {
    await api.auth.changePassword({
      // old_password: oldPassword,
      password: newPassword
    });
    Message.success('密码修改成功！');
    return true;
  } catch (error) {
    Message.error(error.message || '密码修改失败！');
    return false;
  }
}





export const autoTestConfig = (config:{
  token?: string;
  userInfo?: any;
  role?: Role;
})=>{
  if(config?.token){
    setToken(config.token)
  }
  if(config?.userInfo){
    userInfo.value = config.userInfo
  }
  if(config?.role){
    role.value = config.role
  }
}