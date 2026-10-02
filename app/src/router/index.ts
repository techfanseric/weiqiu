import { isPreview } from '@/runtime';
import NProgress from '@/config/nprogress';
import { createRouter, createWebHashHistory } from 'vue-router'
const layout  = () => import('@/components/layout/index.vue')
import type { RouteRecordRaw } from 'vue-router';
import { isLogin } from '@/utils/auth';
import { loginOut, permissions, userInfo } from '@/hooks/user';

export const menuRouter: RouteRecordRaw = {
    path: '',
    name: 'menu',
    component: layout,
    children: [
      {
        path: '',
        name: 'home',
        meta: {
          icon: 'icon-home',
          label: '首页',
        },
        component: () => import('@/views/home/index.vue'),
      },
      {
        path: 'material',
        name: 'material',
        meta: {
          icon: 'icon-tag',
          label: '物料管理',
          permission: 'material.view'
        },
        redirect: { name: 'material-sample' },
        children: [
          {
            path: 'sample',
            name: 'material-sample',
            meta: {
              label: '试剂管理',
            },
            component: () => import('@/views/material/sample/index.vue'),
          },
          {
            path: 'consumable',
            name: 'material-consumable',
            meta: {
              label: '耗材管理',
            },
            component: () => import('@/views/material/consumable/index.vue'),
          },
        ],
      },
      {
        path: 'experiment',
        name: 'experiment',
        meta: {
          icon: 'icon-branch',
          label: '实验流程',
          keepAlive: true ,
          permission: 'flow.view'
        },
        component: () => import('@/views/experiment/index.vue'),
      },
      {
        path: 'flow/:id',
        name: 'flow',
        meta: {
          icon: 'icon-branch',
          label: '工艺流程',
          hideInMenu: true
        },
        component: () => import('@/views/flow/index.vue'),
      },
      {
        path: 'module',
        name: 'module',
        meta: {
          icon: 'icon-common',
          label: '模块调试',
          permission: 'module.view'
        },
        component: () => import('@/views/module/index.vue'),
      },
      {
        path: 'params-config',
        name: 'params-config',
        meta: {
          icon: 'icon-archive',
          label: '参数配置',
          permission: 'params-config.view'
        },
        component: () => import('@/views/params-config/PasswordGate.vue'),
      },
      {
        path: 'experimental-record',
        name: 'experimental-record',
        meta: {
          icon: 'icon-experiment',
          label: '实验记录'
        },
        component: () => import('@/views/experimental-record/index.vue'),
      },
      {
        path: 'runlog',
        name: 'runlog',
        meta: {
          icon: 'icon-bookmark',
          label: '错误日志',  
          permission: 'runlog.view'
        },
        component: () => import('@/views/log/runlog/index.vue'),
      },
    ],
  }

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    { path: '/display', name: 'display', component: () => import('@/display/index.vue'), meta: { label: '展示大屏' } },
    menuRouter
  ]
})
// 定义全局前置守卫
// router.beforeEach(async(to, from, next) => {
//   NProgress.start();
//   if (to.name !== 'login' && !isPreview && !(to.name === 'display' && to.query.mode === 'demo')) {
//     if(!isLogin()){
//       let redirect = to.name as string
//       next({ name: 'login', query:{ redirect } });
//       return
//     }
//     if(!userInfo.value.token){
//       loginOut();
//       return
//     }
//     // else{
//     //   if(!role.value.id){
//     //     await api.roles.get(userInfo.value.role_id);
//     //   }
//     // }
//   }
//   next();
// });


router.beforeEach(async(to, from, next) => {
  NProgress.start();
  if (to.name !== 'login' && !isPreview && !(to.name === 'display' && to.query.mode === 'demo')) {
    if(!isLogin()){
      let redirect = to.name as string
      next({ name: 'login', query:{ redirect } });
      return
    }
    if(!userInfo.value.token){
      // 改为使用 next() 重定向，而不是直接 router.push
      next({ name: 'login' });
      return
    }
    
    // 添加权限检查
    // const requiredPermission = to.meta?.permission;
    // if (requiredPermission && !permissions.value.includes(requiredPermission)) {
    //   next({ name: 'home' }); // 或显示无权限页面
    //   return
    // }
  }
  next();
});


router.afterEach((to) => {
  NProgress.done();
});

export default router