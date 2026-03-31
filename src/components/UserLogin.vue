<template>
  <div class="login-container">
    <!-- Animated Background Nodes -->
    <div class="bg-nodes">
      <div v-for="i in 6" :key="i" :class="['node', `node-${i}`]"></div>
    </div>

    <div class="login-card fade-in">
      <div class="login-header">
        <div class="logo-wrapper">
          <thunderbolt-filled class="logo-icon" />
        </div>
        <h1 class="system-name">物联网监测管理平台</h1>
        <!-- <p class="system-subtitle">Intelligent Electricity Monitoring System</p> -->
      </div>

      <a-form :model="loginForm" @finish="handleLogin" class="login-form">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="loginForm.username" placeholder="请输入登录账号" size="large" autocomplete="username">
            <template #prefix><user-outlined class="input-icon" /></template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="loginForm.password" placeholder="请输入登录密码" size="large" autocomplete="current-password">
            <template #prefix><lock-outlined class="input-icon" /></template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="captcha" :rules="[{ required: true, message: '请输入验证码' }]">
          <div class="captcha-wrapper">
            <a-input v-model:value="loginForm.captcha" placeholder="验证码" size="large" class="captcha-input">
              <template #prefix><safety-certificate-outlined class="input-icon" /></template>
            </a-input>
            <div class="captcha-code" @click="refreshCaptcha" title="点击切换">
              {{ captchaText }}
            </div>
          </div>
        </a-form-item>

        <!-- <div class="login-options">
          <a-checkbox v-model:checked="rememberMe">记住密码</a-checkbox>
          <a class="forgot-pwd">忘记密码？</a>
        </div> -->

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading" class="submit-btn">
            进入系统
          </a-button>
        </a-form-item>
      </a-form>

      <!-- <div class="login-footer">
        <span>© 2026 Intelligent Monitoring Cloud. All Rights Reserved.</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  UserOutlined, 
  LockOutlined, 
  ThunderboltFilled,
  SafetyCertificateOutlined 
} from '@ant-design/icons-vue'

const emit = defineEmits(['login-success'])

const loading = ref(false)
const rememberMe = ref(true)
const captchaText = ref('')
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  captcha: ''
})

const refreshCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = code
}

const handleLogin = () => {
  if (loginForm.captcha.toUpperCase() !== captchaText.value) {
    message.error('验证码错误')
    refreshCaptcha()
    return
  }

  loading.value = true
  // 模拟登录
  setTimeout(() => {
    loading.value = false
    message.success('登录成功，欢迎进入系统')
    emit('login-success')
  }, 800)
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #001529;
  /* background-image: url('@/assets/top.png'); */
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
  overflow: hidden;
}

/* Background Animation Elements */
.bg-nodes .node {
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(24, 144, 255, 0.05);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse 8s infinite alternate;
}
.node-1 { top: 10%; left: 10%; }
.node-2 { bottom: 10%; right: 10%; width: 300px; height: 300px; }
.node-3 { top: 40%; right: 20%; }

@keyframes pulse {
  0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
  100% { transform: scale(1.2) translate(10px, 10px); opacity: 0.5; }
}

.login-card {
  position: relative;
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.fade-in { animation: fadeIn 0.5s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 28px;
  color: #fff;
}

.system-name {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.input-icon { color: #bfbfbf; }

:deep(.ant-input-affix-wrapper) {
  background: #fff !important;
  border: 1px solid #d9d9d9 !important;
}

:deep(.ant-input-affix-wrapper:hover), 
:deep(.ant-input-affix-wrapper-focused) {
  border-color: #1890ff !important;
}

:deep(.ant-input) {
  background: transparent !important;
  color: #333 !important;
}

.captcha-wrapper {
  display: flex;
  gap: 12px;
}

.captcha-input { flex: 1; }

.captcha-code {
  width: 100px;
  height: 40px;
  background: #f0f2f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.submit-btn {
  height: 40px;
  background: #1890ff;
  border: none;
  font-size: 16px;
  border-radius: 4px;
}

.submit-btn:hover {
  background: #40a9ff;
  transform: none;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
}
</style>
