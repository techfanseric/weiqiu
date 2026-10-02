
import Mock from 'mockjs'
import { getSuccessPageData, getSuccessData } from './index'


const handleLog:any = []
// 循环 10 次，push 10 个对象;
for (let i = 0; i < 100; i++) {
  handleLog.push({
    id: Mock.mock('@increment'),
    name: Mock.mock('@ctitle(3, 5)'),
    user: Mock.mock('@cname()'),
    time: Mock.mock('@datetime()'),
  })
}



const runlog:any = []
// 循环 10 次，push 10 个对象;
for (let i = 0; i < 100; i++) {
  runlog.push({
    id: Mock.mock('@increment'),
    type: Mock.mock('@ctitle(3, 5)'),
    data: Mock.mock('@ctitle(3, 15)'),
    time: Mock.mock('@datetime()'),
  })
}
// 下面是导出一个数组；
export default [
  {
    url:'/api/handlelog/list',
    method: 'get', 
    response: ({ query }) => {
      return getSuccessData(handleLog)
    }
  },
  {
    url:'/api/handlelog/listByPage',
    method: 'get', 
    response: ({ query }) => {
      const page = query.page || 1
      const size = query.size || 10
      const total = handleLog.length
      const list = handleLog.slice((page - 1) * size, page * size)
      return getSuccessPageData(list, total)
    }
  },
  {
    url:'/api/handlelog/:id',
    method: 'patch',
    response: ({query, body}) => {
      const id = query.id ;
      let item = handleLog.find((item)=>item.id==id)
      item.name = body.name
      item.data = body.data
      return getSuccessData({})
    }
  },
  {
    url:'/api/handlelog',
    method: 'post',
    response: ({query, body}) => {
      handleLog.push({
        ...body,
        id: Mock.mock('@increment')
      })
      return getSuccessData({})
    }
  },
  {
    url:'/api/handlelog/:id',
    method: 'delete',
    response: ({query}) => {
      const id = query.id ;
      return getSuccessData({})
    }
  },
  {
    url:'/api/runlog/listByPage',
    method: 'get', 
    response: ({ query }) => {
      const page = query.page || 1
      const size = query.size || 10
      const total = runlog.length
      const list = runlog.slice((page - 1) * size, page * size)
      return getSuccessPageData(list, total)
    }
  },
]
