
import { getSuccessData } from './index'

var getUniqueIdPrevTime = 0;
var getUniqueIdNowCount = 1;
	// 获取唯一Id
const	getUniqueId = ()=> {
	let now = Date.now();
	let now32 = now.toString(32);
	if (now == getUniqueIdPrevTime) {
		getUniqueIdNowCount++;
	} else {
		getUniqueIdNowCount = 1;
	}
	getUniqueIdPrevTime = now;
	return `N_${now32}_${getUniqueIdNowCount}`;
}
var configData:any = [
  {
    "id": getUniqueId(),
    "name": "点位",
    "field": "point",
    "type": "group",
    "children": [
      {
        "id": getUniqueId(),
        "name": "四轴点位",
        "field": "scara",
        "type": "group",
        "children": [
          {
            "id": getUniqueId(),
            "name": "点位1",
            "field": "point1",
            "type": "value",
            "value": "1,2,3,4,5"
          },
          {
            "id": getUniqueId(),
            "name": "点位2",
            "field": "point2",
            "type": "value",
            "value": "1,2,3,4,5"
          }
        ]
      },
      {
        "id": getUniqueId(),
        "name": "地轨点位",
        "field": "scaraPoint",
        "type": "group",
        "children": [
          {
            "id": getUniqueId(),
            "name": "点位1",
            "field": "point1",
            "type": "value",
            "value": "1,2,3,4,5"
          },
          {
            "id": getUniqueId(),
            "name": "点位2",
            "field": "point2",
            "type": "value",
            "value": "1,2,3,4,5"
          }
        ]
      }
    ]
  },
  {
    "id": getUniqueId(),
    "name": "测试",
    "field": "test",
    "type": "group",
    "children": [
      {
        "id": getUniqueId(),
        "name": "测试1",
        "field": "test1",
        "type": "value",
        "value": "1,2,3,4,5"
      },
      {
        "id": getUniqueId(),
        "name": "测试2",
        "field": "test2",
        "type": "value",
        "value": "1,2,3,4,5"
      }
    ]
  }
]

// 下面是导出一个数组；
export default [
  {
    url:'/api/params-config',
    method: 'get',
    response: ({query, body}) => {
      return getSuccessData(configData)
    } 
  },
  {
    url:'/api/params-config',
    method: 'post',
    response: ({query, body}) => {
      configData = body
      return getSuccessData({})
    }
  },
]
