import request from "./request";



export interface LoginParams {
  username: string;
  password: string;
}


export interface ChangePasswordParams {
  old_password: string;
  new_password: string;
}

export default {
  // 登录
  auth: {
    login: (data: LoginParams) => {
      return request.post(`/automation/user/login`, data);
    },
    changePassword: (data: any) => {
      return request.post(`/automation/user/passwd`, data);
    },
  },
  // 角色
  roles: {
    getList: (data)=>{
      return request.get(`/automation/role/list`, { params: data });
    },
    edit: (data)=>{
      return request.post(`/automation/role/update`, data);
    },
    add: (data)=>{
      return request.post(`/automation/role/create`, data);
    },
    delete: (data)=>{
      return request.post(`/automation/role/delete`, data);
    },
  },
  permissions: {
    getList: (data)=>{
      return request.get(`./json/permissionTree.json?time=${Date.now()}`, { params: data });
    },
  },
  deviceVersion: {
    get: ()=>{
      return request.get(`./json/deviceVersion.json?time=${Date.now()}`);
    },
  },
  // user
  user: {
    getList: (data)=>{
      return request.get(`/automation/user/list`, { params: data });
    },
    edit: (data)=>{
      return request.post(`/automation/user/update`, data);
    },
    add: (data)=>{
      return request.post(`/automation/user/create`, data);
    },
    delete: (data)=>{
      return request.post(`/automation/user/delete`, data);
    },
  },
  handlelog: {
    getListByPage: (data)=>{
      return request.get(`/automation/log/user/query`, { params: data });
    },
  },
  runlog: {
    getListByPage: (data)=>{
      return request.get(`/automation/log/device/list`, { params: data });
    },
  },
  experiment:{
    getList: ()=>{
      return request.get(`/automation/experiment/list`);
    },
    edit: (data)=>{
      return request.post(`/automation/experiment/update`, data);
    },
    add: (data)=>{
      return request.post(`/automation/experiment/create`, data);
    },
    delete: (data)=>{
      return request.post(`/automation/experiment/delete`, data);
    },
  },
  esampleProgress:{
    getList: (params)=>{
      return request.get(`/automation/esample/progress`, { params });
    },
  },
  flow: {
    get: (id: number)=>{
      return request.get(`/backend/flow/${id}`);
    },
    // 模块调试：获取所有可调试的模块 flow 列表
    getAllFlow: ()=>{
      return request.get(`/backend/flow/debug/modules`);
    },
    getFlowData: (params)=>{
      return request.get(`/automation/eflow/fetch`, { params });
    },
    editFlowData: (data)=>{
      return request.post(`/automation/eflow/save`, data);
    },
    runFlow: (data)=>{
      return request.post(`/automation/eflow/run`, data);
    },
    pauseFlow: (data)=>{
      return request.post(`/automation/eflow/pause`, data);
    },
    resumeFlow: (data)=>{
      return request.post(`/automation/eflow/resume`, data);
    },
    stopFlow: (data)=>{
      return request.post(`/automation/eflow/stop`, data);
    },
    step: (data)=>{
      return request.post(`/backend/flow/debug`, data);
    },
    oneStart: (data)=>{
      return request.post(`/backend/flow/section`, data);
    },
    program: (data)=>{
      return request.post(`/backend/program`, data);
    },
  },
  paramsConfig:{
    edit: (data)=>{
      return request.post(`/automation/param/save`, data);
    },
    get: ()=>{
      return request.get(`/automation/param/list`);
    },

    editVar: (data)=>{
      return request.post(`/automation/var/save`, data);
    },
    getVar: ()=>{
      return request.get(`/automation/var/list`);
    },
  },
  // 物料相关接口（耗材管理选试剂用）
  material: {
    getList: (params)=>{
      return request.get(`/automation/material/list`, { params });
    }
  }
}

