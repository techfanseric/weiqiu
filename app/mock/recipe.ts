
import Mock from 'mockjs'
import { getSuccessPageData, getSuccessData } from './index'
import { channel } from 'diagnostics_channel'


const arr:any = []
// 循环 10 次，push 10 个对象;
for (let i = 0; i < 100; i++) {
  arr.push({
    id: Mock.mock('@increment'),
    name:`A-${i+1}`
  })
}
// 下面是导出一个数组；
export default [
  {
    url:'/api/recipe/list',
    method: 'get', 
    response: ({ query }) => {
      return getSuccessData(arr)
    }
  },
  {
    url:'/api/recipe/:id',
    method: 'patch',
    response: ({query, body}) => {
      const id = query.id ;
      arr.find((item)=>item.id==id).status = body.status
      return getSuccessData({})
    }
  },
  {
    url:'/api/recipe',
    method: 'post',
    response: ({query, body}) => {
      arr.push({
        ...body,
        id: Mock.mock('@increment')
      })
      return getSuccessData({})
    }
  },
  {
    url:'/api/recipe/:id',
    method: 'delete',
    response: ({query}) => {
      const id = query.id ;
      return getSuccessData({})
    }
  },
]
