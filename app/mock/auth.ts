import { getSuccessData } from './index'

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'demo-only-not-a-real-account',
    name: '管理员',
    role_id: 1,
  },
  {
    id: 2,
    username: 'user',
    password: 'demo-only-not-a-real-account',
    name: '普通用户',
    role_id: 2,
  },
]


const roles = [
  {
    id: 1, 
    identify: 'admin',
    name: '管理员',
    permissions: ['*'],
  },
  {
    id: 2,
    identify: 'user',
    name: '普通用户',
    permissions: [],
  },
]

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body;
      
      // 查找用户
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      
      if (user) {
        // 生成模拟 token
        const token = `mock_token_${user.id}_${Date.now()}`;
        return getSuccessData({
          token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            role_id: user.role_id,
          },
        });
      } else {
        return {
          code: 401,
          msg: '用户名或密码错误',
          data: null,
        };
      }
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => {
      return getSuccessData(null);
    },
  },
  {
    url: '/api/auth/changePassword',
    method: 'post',
    response: ({ body }) => {
      const { id, oldPassword, newPassword } = body;
      // 这里应该校验旧密码是否正确，此处省略
      const user = users.find((u) => u.id === id);
      if (user && oldPassword == user.password) {
        // 更新密码
        users[users.indexOf(user)].password = newPassword;
      }
      return getSuccessData(null);
    }
  },
  {
    url: '/api/users/:id',
    method: 'get',
    response: ({ query }) => {
      const id = query.id;
      return getSuccessData(users.find((u) => u.id === Number(id)));
    }
  },
  {
    url: '/api/users',
    method: 'get',
    response: () => {
      return getSuccessData(users);
    }
  },
  {
    url: '/api/users/:id',
    method: 'patch',
    response: ({ query, body }) => {
      const id = query.id;
      let user = users.find((u) => u.id === Number(id));
      user.name = body.name;
      return getSuccessData({...body});
    }
  },
  {
    url: '/api/users',
    method: 'post',
    response: ({ body }) => {
      body.id = Math.max(...users.map(u => u.id)) + 1;
      users.push(body);
      return getSuccessData({...body});
    }
  },
  {
    url: '/api/users/:id',
    method: 'delete',
    response: ({ query }) => {
      const id = query.id;
      users.splice(users.findIndex((u) => u.id === Number(id)), 1);
      return getSuccessData({});
    }
  },
  {
    url: '/api/roles/:id',
    method: 'get',
    response: ({ query }) => {
      const id = query.id;
      return getSuccessData(roles.find((u) => u.id === Number(id)));
    }
  },
  {
    url: '/api/roles',
    method: 'get',
    response: () => {
      return getSuccessData(roles);
    }
  },
  {
    url: '/api/roles/:id',
    method: 'patch',
    response: ({ query, body }) => {
      const id = query.id;
      let role = roles.find((u) => u.id === Number(id));
      role.name = body.name;
      role.identify = body.identify;
      role.permissions = body.permissions;
      return getSuccessData({...role});
    }
  },
  {
    url: '/api/roles',
    method: 'post',
    response: ({ body }) => {
      body.id = Math.max(...roles.map(u => u.id)) + 1;
      roles.push(body);
      return getSuccessData({...body});
    }
  },
  {
    url: '/api/roles/:id',
    method: 'delete',
    response: ({ query }) => {
      const id = query.id;
      roles.splice(roles.findIndex((u) => u.id === Number(id)), 1);
      return getSuccessData({});
    }
  }
]

