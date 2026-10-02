
import Mock from 'mockjs'
import { getSuccessPageData, getSuccessData } from './index'


var flowData:any = {}

// 下面是导出一个数组；
export default [
  {
    url:'/api/flow',
    method: 'get',
    response: ({query, body}) => {
      return getSuccessData(flowData)
    } 
  },
  {
    url:'/api/flow',
    method: 'post',
    response: ({query, body}) => {
      flowData = body
      return getSuccessData({})
    }
  },
  {
    url:'/api/flow/action',
    method: 'post',
    response: ({query, body}) => {
      return getSuccessData({})
    }
  },
]
