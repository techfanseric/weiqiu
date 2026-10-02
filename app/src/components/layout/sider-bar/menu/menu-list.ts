import { checkPermissionFn } from "@/directive/permission";
import { menuRouter } from "@/router/index";
import { cloneDeep } from "lodash";
import { computed, ref } from "vue";




export const menuList = computed(()=>{
  return abc(cloneDeep(menuRouter.children))
})


function abc (children:any[]){
  return children.filter((item)=>{
    if(item?.meta?.permission&&!checkPermissionFn(item?.meta?.permission)){
      return false
    }
    if(item.children){
      item.children = abc(item.children)
      if(item.children.length==0){
        return false
      }
    }
    return true
  })
}


export const selectedKey = ref<string>('');