
import { isNumericString } from "@/utils";


export const getRules = (formRows:any[])=>{
  (formRows || []).forEach((item)=>{
    item.FieldRule = [{
      required: true,
      message: `${item.name}是必填项目`
    }]
    if(item.max&&isNumericString(item.max)){
      item.FieldRule.push({
        validator: (value:string, cb) => {
          try {
            if(!isNumericString(value)){
              cb('请输入数字')
            }else if(parseFloat(value)>parseFloat(item.max)){
              cb(`不能超过${item.max}`)
            }else{
              cb()
            }
          } catch (error) {
            cb()
          }
        }
      })
    }
    if(item.min&&isNumericString(item.min)){
      item.FieldRule.push({
        validator: (value:string, cb) => {
          try {
            if(!isNumericString(value)){
              cb('请输入数字')
            }else if(parseFloat(value)<parseFloat(item.min)){
              cb(`不能小于${item.min}`)
            }else{
              cb()
            }
          } catch (error) {
            cb()
          }
        }
      })
    }
  })
}