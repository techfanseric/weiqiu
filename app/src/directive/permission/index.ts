import { isAdmin, permissions, userInfo } from '@/hooks/user';
import { DirectiveBinding, ref } from 'vue';


export const checkPermissionFn = (value)=>{
  return true;
  // if(isAdmin.value || permissions.value.includes(value) || permissions.value.includes('*')){
  //   return true;
  // }

  if(isAdmin.value || userInfo.value?.permission?.includes(value) || userInfo.value?.permission?.includes('*')){
    return true;
  }
  
  return false;
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding;
  if (value) {
    if(!checkPermissionFn(value)){
      if(el.parentNode){
        el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need permissions!`);
  }
}




export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
