<template>
  <div class="login-container">
    <!-- 顶部环境光：唯一的一处装饰，不再是网格 + 双光晕 -->
    <div class="ambient"></div>

    <div class="login-shell">
      <!-- 品牌 -->
      <div class="login-header"><div class="login-brand"><img src="@/assets/brand/siat-logo.png" alt="中国科学院深圳先进技术研究院" /></div>
        <!-- <div class="brand-logo">
          <img alt="logo" src="@/assets/img/logo.png" />
        </div> -->
        <h2 class="brand-title">微球智能制备</h2>
        <p class="brand-sub">实验室自动化控制系统</p>
      </div>

      <a-form
        :model="form"
        :rules="rules"
        @submit="handleSubmit"
        ref="formRef"
        class="login-form"
      >
        <a-form-item field="username" class="login-field" hide-label>
          <a-input
            v-model="form.username"
            placeholder="请输入用户名"
            :input-attrs="{ 'aria-label': '用户名', autocomplete: 'username' }"
            size="large"
            allow-clear
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" class="login-field" hide-label>
          <a-input-password
            v-model="form.password"
            placeholder="请输入密码"
            :input-attrs="{ 'aria-label': '密码', autocomplete: 'current-password' }"
            size="large"
            allow-clear
            @press-enter="handleSubmit"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item hide-label>
          <a-button
            class="login-btn"
            type="primary"
            html-type="submit"
            size="large"
            long
            :loading="loading"
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>

      <!-- <div class="login-footer">© 2026 微球 · 保留所有权利</div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon';
import type { FormInstance } from '@arco-design/web-vue';
import { setToken } from '@/utils/auth';
import api from '@/api';
import { isAdmin, userInfo } from '@/hooks/user';

const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = {
  username: [
    { required: true, message: '请输入用户名' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { minLength: 4, message: '密码长度不能少于4位' },
  ],
};

const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (valid) {
    return;
  }
  loading.value = true;
  try {
    const res = await api.auth.login({
      username: form.username,
      password: form.password,
    });
    if (res.code === 0 && res.data?.token) {
      setToken(res?.data?.token);
      localStorage.setItem('userInfo', JSON.stringify({
        ...res?.data,
        time: Date.now()
      }));
      userInfo.value = res?.data;
      if (form.username == 'admin') {
        isAdmin.value = true
      } else {
        isAdmin.value = false
      }

      Message.success('登录成功！');

      // 跳转到重定向页面或首页
      const redirect = (route.query.redirect as string) || 'home';
      router.push({ name: redirect });
    } else {
      Message.error(res.msg || '登录失败！');
    }
  } catch (error: any) {
    Message.error(error.message || '登录失败，请稍后重试！');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: var(--lx-ground, var(--color-bg-1));
}

/* 顶部环境光 */
.ambient {
  position: absolute;
  top: -260px;
  left: 50%;
  transform: translateX(-50%);
  width: 880px;
  height: 520px;
  pointer-events: none;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(94, 106, 210, 0.16) 0%,
    rgba(94, 106, 210, 0) 70%
  );
}

.login-shell {
  position: relative;
  z-index: 1;
  width: 396px;
  padding: 36px 34px 32px;
  background: var(--lx-surface-1, var(--color-bg-2));
  border: 1px solid var(--lx-hairline, var(--color-border-2));
  border-radius: var(--lx-r-lg, 14px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 24px 48px -12px rgba(0, 0, 0, 0.6);
}

.login-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--lx-hairline, var(--color-border-2));
}

.brand-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(94, 106, 210, 0.14);
  border: 1px solid rgba(94, 106, 210, 0.3);

  img {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }
}

.brand-title {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: var(--lx-text-1, var(--color-text-1));
  margin: 0 0 9px;
}

.brand-sub {
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: var(--lx-text-3, var(--color-text-3));
  margin: 0;
}

.login-form {
  :deep(.arco-form-item) {
    margin-bottom: 14px;
  }

  :deep(.arco-form-item.login-field) {
    min-height: 64px;
    margin-bottom: 4px;
  }

  :deep(.arco-form-item-message) {
    margin-top: 4px;
    min-height: 18px;
    font-size: 12px;
    line-height: 18px;
    font-weight: 400;
    color: var(--lx-danger, #b44238);
  }

  :deep(.arco-input-wrapper) {
    height: 40px;
    padding: 0 12px;
    background-color: var(--lx-surface-2, var(--color-fill-2));
    border: 1px solid var(--lx-hairline, var(--color-border-2));
    border-radius: var(--lx-r-sm, 6px);
    transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  }

  :deep(.arco-input-wrapper:hover) {
    background-color: var(--lx-surface-3, var(--color-fill-3));
    border-color: var(--lx-hairline-2, var(--color-border-3));
  }

  :deep(.arco-input-wrapper:focus-within) {
    background-color: var(--lx-surface-2, var(--color-fill-2));
    border-color: var(--lx-accent, rgb(var(--primary-6)));
    box-shadow: 0 0 0 3px var(--lx-accent-soft, transparent);
  }

  :deep(.arco-form-item-status-error .arco-input-wrapper) {
    border-color: color-mix(in srgb, var(--lx-danger, #b44238) 50%, var(--lx-hairline));
  }

  :deep(.arco-form-item-status-error .arco-input-wrapper:focus-within) {
    border-color: var(--lx-danger, #b44238);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--lx-danger, #b44238) 12%, transparent);
  }

  :deep(.arco-input) {
    color: var(--lx-text-1, var(--color-text-1));
    font-size: 0.72rem;
  }

  :deep(.arco-input::placeholder) {
    color: var(--lx-text-3, var(--color-text-3));
  }

  :deep(.arco-input-wrapper svg) {
    color: var(--lx-text-3, var(--color-text-3));
  }

  /* 清空图标默认是白的，压暗一点 */
  :deep(.arco-input-clear-icon) {
    color: var(--lx-text-3, var(--color-text-3));
  }
}

.login-btn {
  height: 42px;
  margin-top: 8px;
  border-radius: var(--lx-r-sm, 6px);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-indent: 0.24em;
}

.login-footer {
  margin-top: 18px;
  text-align: center;
  font-size: 0.6rem;
  color: var(--lx-text-3, var(--color-text-3));
}
</style>
