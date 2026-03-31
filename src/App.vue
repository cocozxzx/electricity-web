<template>
  <a-config-provider :locale="zhCN">
    <!-- 登录页显示：不带导航栏、不带侧边栏的纯净页面 -->
    <div v-if="route.path === '/login'" class="login-only-wrapper">
      <router-view v-slot="{ Component }">
        <component :is="Component" @login-success="handleLoginSuccess" />
      </router-view>
    </div>

    <!-- 系统主布局显示 -->
    <a-layout v-else :class="['layout', { 'dark-bg': route.path === '/cockpit' || route.path === '/project-cockpit' }]">
      <!-- <a-layout-header class="header"> -->
      <a-layout-header class="header">
        <div class="header-left">
          <a-button 
            v-for="item in leftMenu" 
            :key="item.key" 
            type="link" 
            :class="['nav-btn', { active: currentSection === item.key }]"
            @click="handleTopMenuClick(item.key)"
          >
            {{ item.label }}
          </a-button>
        </div>
        <div class="header-center">
          <template v-if="route.path === '/project-cockpit'">
            <a-dropdown :trigger="['click']" overlayClassName="sci-fi-dropdown-wrapper">
              <h1 class="project-title clickable-title">
                {{ route.query.name || '上海静安数据中心' }} 
                <span class="title-arrow-wrap"><down-outlined class="title-down-icon" /></span>
              </h1>
              <template #overlay>
                <a-menu class="sci-fi-dropdown-menu" @click="handleProjectSwitch">
                  <a-menu-item key="萧山区电力园项目">萧山区电力园项目</a-menu-item>
                  <a-menu-item key="上海静安数据中心">上海静安数据中心</a-menu-item>
                  <a-menu-item key="西湖区运行中心">西湖区运行中心</a-menu-item>
                  <a-menu-item key="拱墅区配电站">拱墅区配电站</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <h1 class="project-title">浙江德菱科技股份有限公司</h1>
          </template>
        </div>
        <div class="header-right">
          <a-button 
            v-for="item in rightMenu" 
            :key="item.key" 
            type="link" 
            :class="['nav-btn', { active: currentSection === item.key }]"
            @click="handleTopMenuClick(item.key)"
          >
            {{ item.label }}
          </a-button>
          <a-button type="link" class="nav-btn" @click="handleLogout">
            <template #icon><logout-outlined /></template>
            退出
          </a-button>
        </div>
      </a-layout-header>

      <a-layout :class="['main-layout-wrapper', { 'dark-bg': route.path === '/cockpit' || route.path === '/project-cockpit' }]">
        <!-- RuoYi Style Sidebar -->
        <a-layout-sider 
          v-if="showSidebar" 
          width="210" 
          class="ruoyi-sider"
          theme="dark"
        >
          <a-menu
            v-model:selectedKeys="selectedSidebarKeys"
            v-model:openKeys="openKeys"
            mode="inline"
            class="ruoyi-menu"
            @click="handleSidebarMenuClick"
          >
            <!-- Org Menu -->
            <template v-if="currentSection === 'org'">
              <a-menu-item key="/agent">
                <template #icon><user-outlined /></template>
                代理商管理
              </a-menu-item>
              <a-menu-item key="/customer">
                <template #icon><team-outlined /></template>
                客户管理
              </a-menu-item>
              <a-menu-item key="/project">
                <template #icon><project-outlined /></template>
                项目管理
              </a-menu-item>
            </template>

            <!-- Assets Menu -->
            <template v-else-if="currentSection === 'assets'">
              <a-menu-item key="/device">
                <template #icon><hdd-outlined /></template>
                设备管理
              </a-menu-item>
              <a-menu-item key="/sim">
                <template #icon><credit-card-outlined /></template>
                SIM卡管理
              </a-menu-item>
              <a-menu-item key="/product">
                <template #icon><appstore-outlined /></template>
                物模型管理
              </a-menu-item>
              <a-menu-item key="/version">
                <template #icon><file-protect-outlined /></template>
                设备版本管理
              </a-menu-item>
            </template>

            <!-- Ops Menu -->
            <template v-else-if="currentSection === 'ops'">
              <a-sub-menu key="alarm-group">
                <template #icon><alert-outlined /></template>
                <template #title>告警管理</template>
                <a-menu-item key="/alarm-set">告警设置</a-menu-item>
                <a-menu-item key="/alarm-record">告警记录</a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="maint-group">
                <template #icon><tool-outlined /></template>
                <template #title>运维管理</template>
                <a-menu-item key="/work-order">运维工单</a-menu-item>
                <a-menu-item key="/inspect-plan">巡检计划</a-menu-item>
                <a-menu-item key="/inspect-record">巡检记录</a-menu-item>
              </a-sub-menu>
            </template>

            <!-- Energy Menu -->
            <template v-else-if="currentSection === 'energy'">
              <a-sub-menu key="carbon-group">
                <template #icon><dot-chart-outlined /></template>
                <template #title>能碳管理</template>
                <a-menu-item key="/carbon/query">能耗查询</a-menu-item>
                <a-menu-item key="/carbon/intensity">能源消费强度</a-menu-item>
                <a-menu-item key="/carbon/analysis">能源分析与策略</a-menu-item>
                <a-menu-item key="/carbon/benchmarking">能效对标</a-menu-item>
                <a-menu-item key="/carbon/flow">能流分析</a-menu-item>
                <a-menu-item key="/carbon/optimization">能效平衡与优化</a-menu-item>
                <a-menu-item key="/carbon/budget">用能与碳排放预算管理</a-menu-item>
                <a-menu-item key="/carbon/emission">碳排放核算</a-menu-item>
                <a-menu-item key="/carbon/footprint">产品碳足迹核算</a-menu-item>
                <a-menu-item key="/carbon/supply-chain">供应链碳管理</a-menu-item>
                <a-menu-item key="/carbon/verification">碳核查支撑</a-menu-item>
                <a-menu-item key="/carbon/assets">碳资产管理</a-menu-item>
              </a-sub-menu>
              <a-menu-item key="/power-analysis">
                <template #icon><line-chart-outlined /></template>
                电能分析
              </a-menu-item>
              <a-menu-item key="/data-query">
                <template #icon><search-outlined /></template>
                数据查询
              </a-menu-item>
            </template>

            <!-- Finance Menu -->
            <template v-else-if="currentSection === 'finance'">
              <a-sub-menu key="mfr-finance-group">
                <template #icon><shop-outlined /></template>
                <template #title>厂家总控台</template>
                <a-menu-item key="/finance/mfr/overview">数据总览</a-menu-item>
                <a-menu-item key="/finance/mfr/billing">账单核销</a-menu-item>
                <a-menu-item key="/finance/mfr/device-status">设备状态</a-menu-item>
                <a-menu-item key="/finance/mfr/config">参数配置</a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="agent-finance-group">
                <template #icon><bank-outlined /></template>
                <template #title>代理商门户</template>
                <a-menu-item key="/finance/agent/project-overview">项目总览</a-menu-item>
                <a-menu-item key="/finance/agent/expiry-warning">到期预警</a-menu-item>
              </a-sub-menu>
            </template>

            <!-- Reports Menu -->
            <template v-else-if="currentSection === 'reports'">
              <a-menu-item key="/report-list">
                <template #icon><bar-chart-outlined /></template>
                报表
              </a-menu-item>
            </template>

            <!-- System Menu -->
            <template v-else-if="currentSection === 'system'">
              <a-menu-item key="/user">
                <template #icon><user-outlined /></template>
                用户管理
              </a-menu-item>
              <a-menu-item key="/role">
                <template #icon><safety-certificate-outlined /></template>
                角色管理
              </a-menu-item>
              <a-menu-item key="/menu">
                <template #icon><menu-outlined /></template>
                菜单管理
              </a-menu-item>
              <a-menu-item key="/dict">
                <template #icon><book-outlined /></template>
                字典管理
              </a-menu-item>
              <a-menu-item key="/dept">
                <template #icon><apartment-outlined /></template>
                部门管理
              </a-menu-item>
              <a-menu-item key="/log">
                <template #icon><history-outlined /></template>
                日志管理
              </a-menu-item>
            </template>
          </a-menu>
        </a-layout-sider>

        <a-layout-content :class="['main-content', { 'dark-bg': route.path === '/cockpit' || route.path === '/project-cockpit' }]">
          <div class="content-wrapper">
            <div class="breadcrumb-container" v-if="currentPath.length > 0">
              <a-breadcrumb class="ruoyi-breadcrumb">
                <a-breadcrumb-item v-for="p in currentPath" :key="p">{{ p }}</a-breadcrumb-item>
              </a-breadcrumb>
            </div>
            <div :class="['scroll-container', { 'dark-bg': route.path === '/cockpit' || route.path === '/project-cockpit' }]">
              <div :class="['app-container', { 'no-padding': route.path === '/cockpit' || route.path === '/project-cockpit' }]">
                <router-view v-slot="{ Component }">
                  <transition name="fade-transform" mode="out-in">
                    <component :is="Component" />
                  </transition>
                </router-view>
              </div>
            </div>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { 
  UserOutlined, 
  TeamOutlined, 
  ProjectOutlined,
  AppstoreOutlined,
  HddOutlined,
  CreditCardOutlined,
  FileProtectOutlined,
  AlertOutlined,
  ToolOutlined,
  DotChartOutlined,
  LineChartOutlined,
  SearchOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  BookOutlined,
  ApartmentOutlined,
  HistoryOutlined,
  LogoutOutlined,
  DownOutlined,
  BankOutlined,
  ShopOutlined
} from '@ant-design/icons-vue'
import UserLogin from './components/UserLogin.vue'

const router = useRouter()
const route = useRoute()

const isLoggedIn = ref(sessionStorage.getItem('isLoggedIn') === 'true')
const selectedSidebarKeys = ref([])
const openKeys = ref(['alarm-group', 'maint-group', 'agent-finance-group', 'mfr-finance-group', 'carbon-group'])

const handleLoginSuccess = () => {
  isLoggedIn.value = true
  sessionStorage.setItem('isLoggedIn', 'true')
  router.push('/cockpit')
}

const handleLogout = () => {
  isLoggedIn.value = false
  sessionStorage.removeItem('isLoggedIn')
  router.push('/login')
}

const leftMenu = [
  { key: 'cockpit', label: '驾驶舱' },
  { key: 'org', label: '组织管理' },
  { key: 'assets', label: '资产中心' },
  { key: 'ops', label: '运行维护' }
]

const rightMenu = [
  { key: 'energy', label: '能源监测' },
  { key: 'finance', label: '财务管理' },
  { key: 'reports', label: '数据报表' },
  { key: 'system', label: '系统管理' }
]

const sidebarConfig = {
  org: ['/agent', '/customer', '/project'],
  assets: ['/device', '/sim', '/product', '/version', '/upgrade-device-select', '/upgrade-progress'],
  ops: ['/alarm-set', '/alarm-record', '/work-order', '/inspect-plan', '/inspect-record'],
  energy: [
    '/carbon/query',
    '/carbon/intensity',
    '/carbon/analysis',
    '/carbon/benchmarking',
    '/carbon/flow',
    '/carbon/optimization',
    '/carbon/budget',
    '/carbon/emission',
    '/carbon/footprint',
    '/carbon/supply-chain',
    '/carbon/verification',
    '/carbon/assets',
    '/power-analysis', 
    '/data-query'
  ],
  finance: [
    '/finance/mfr/overview',
    '/finance/mfr/billing',
    '/finance/mfr/device-status',
    '/finance/mfr/project-device-list',
    '/finance/mfr/config',
    '/finance/agent/project-overview',
    '/finance/agent/project-detail',
    '/finance/agent/device-list',
    '/finance/agent/expiry-warning',
    '/finance/agent/expiry-detail'
  ],
  reports: ['/report-list'],
  system: ['/user', '/role', '/menu', '/dict', '/dept', '/log']
}

const currentSection = computed(() => {
  const path = route.path
  if (path === '/cockpit' || path === '/project-cockpit') return 'cockpit'
  
  if (path.startsWith('/project/detail') || 
      path.startsWith('/gateway/detail') || 
      path.startsWith('/device/detail')) {
    return 'org'
  }

  for (const [section, paths] of Object.entries(sidebarConfig)) {
    if (paths.some(p => path === p || (path.startsWith(p + '/') && p !== '/'))) return section
  }
  return ''
})

const showSidebar = computed(() => {
  return ['org', 'assets', 'ops', 'energy', 'finance', 'reports', 'system'].includes(currentSection.value)
})

const handleTopMenuClick = (key) => {
  if (key === 'cockpit') {
    router.push('/cockpit')
  } else {
    const defaultPath = sidebarConfig[key]?.[0]
    if (defaultPath) {
      router.push(defaultPath)
    }
  }
}

const handleSidebarMenuClick = ({ key }) => {
  router.push(key)
}

const handleProjectSwitch = ({ key }) => {
  router.push({
    path: '/project-cockpit',
    query: { name: key }
  })
}

// Sync sidebar selection with current route
watch(() => route.path, (newPath) => {
  if (newPath === '/cockpit' || newPath === '/project-cockpit') {
    selectedSidebarKeys.value = []
    return
  }

  if (newPath.startsWith('/project/detail') || 
      newPath.startsWith('/gateway/detail') || 
      newPath.startsWith('/device/detail')) {
    selectedSidebarKeys.value = ['/project']
    return
  }

  for (const paths of Object.values(sidebarConfig)) {
    const match = paths.find(p => newPath === p || (newPath.startsWith(p) && p !== '/'))
    if (match) {
      selectedSidebarKeys.value = [match]
      return
    }
  }
  selectedSidebarKeys.value = []
}, { immediate: true })

const currentPath = computed(() => {
  const path = route.path
  const pathMap = {
    '/agent': ['首页', '组织管理', '代理商管理'],
    '/customer': ['首页', '组织管理', '客户管理'],
    '/project': ['首页', '组织管理', '项目管理'],
    '/project/detail': ['首页', '组织管理', '项目管理', '项目详情'],
    '/gateway/detail': ['首页', '组织管理', '项目管理', '项目详情', '网关详情'],
    '/device/detail': ['首页', '组织管理', '项目管理', '项目详情', '设备详情'],
    '/device': ['首页', '资产中心', '设备管理'],
    '/sim': ['首页', '资产中心', 'SIM卡管理'],
    '/product': ['首页', '资产中心', '物模型管理'],
    '/version': ['首页', '资产中心', '设备版本管理'],
    '/upgrade-device-select': ['首页', '资产中心', '设备版本管理', '选择设备'],
    '/upgrade-progress': ['首页', '资产中心', '设备版本管理', '升级进度'],
    '/alarm-set': ['首页', '运行维护', '告警管理', '告警设置'],
    '/alarm-record': ['首页', '运行维护', '告警管理', '告警记录'],
    '/work-order': ['首页', '运行维护', '运维管理', '运维工单'],
    '/inspect-plan': ['首页', '运行维护', '运维管理', '巡检计划'],
    '/inspect-record': ['首页', '运行维护', '运维管理', '巡检记录'],
    '/carbon/query': ['首页', '能源监测', '能碳管理', '能耗查询'],
    '/carbon/intensity': ['首页', '能源监测', '能碳管理', '能源消费强度'],
    '/carbon/analysis': ['首页', '能源监测', '能碳管理', '能源分析与策略'],
    '/carbon/benchmarking': ['首页', '能源监测', '能碳管理', '能效对标'],
    '/carbon/flow': ['首页', '能源监测', '能碳管理', '能流分析'],
    '/carbon/optimization': ['首页', '能源监测', '能碳管理', '能效平衡与优化'],
    '/carbon/budget': ['首页', '能源监测', '能碳管理', '用能与碳排放预算管理'],
    '/carbon/emission': ['首页', '能源监测', '能碳管理', '碳排放核算'],
    '/carbon/footprint': ['首页', '能源监测', '能碳管理', '产品碳足迹核算'],
    '/carbon/supply-chain': ['首页', '能源监测', '能碳管理', '供应链碳管理'],
    '/carbon/verification': ['首页', '能源监测', '能碳管理', '碳核查支撑'],
    '/carbon/assets': ['首页', '能源监测', '能碳管理', '碳资产管理'],
    '/power-analysis': ['首页', '能源监测', '电能分析'],
    '/data-query': ['首页', '能源监测', '数据查询'],
    '/finance/mfr/overview': ['首页', '财务管理', '厂家总控台', '数据总览'],
    '/finance/mfr/billing': ['首页', '财务管理', '厂家总控台', '账单核销'],
    '/finance/mfr/device-status': ['首页', '财务管理', '厂家总控台', '设备状态'],
    '/finance/mfr/project-device-list': ['首页', '财务管理', '厂家总控台', '设备详情'],
    '/finance/mfr/config': ['首页', '财务管理', '厂家总控台', '参数配置'],
    '/finance/agent/project-overview': ['首页', '财务管理', '代理商门户', '项目总览'],
    '/finance/agent/project-detail': ['首页', '财务管理', '代理商门户', '项目详情'],
    '/finance/agent/device-list': ['首页', '财务管理', '代理商门户', '设备列表'],
    '/finance/agent/expiry-warning': ['首页', '财务管理', '代理商门户', '到期预警'],
    '/finance/agent/expiry-detail': ['首页', '财务管理', '代理商门户', '到期预警', '详情'],
    '/report-list': ['首页', '数据报表', '报表'],
    '/user': ['首页', '系统管理', '用户管理'],
    '/role': ['首页', '系统管理', '角色管理'],
    '/menu': ['首页', '系统管理', '菜单管理'],
    '/dict': ['首页', '系统管理', '字典管理'],
    '/dept': ['首页', '系统管理', '部门管理'],
    '/log': ['首页', '系统管理', '日志管理']
  }
  
  if (path === '/cockpit' || path === '/project-cockpit') return []
  
  if (pathMap[path]) return pathMap[path]
  return ['首页']
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: url('@/assets/top.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: 0 40px;
  height: 80px;
  line-height: 80px;
  border-bottom: none;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left, .header-right {
  display: flex;
  gap: 15px;
  flex: 1;
  align-items: center;
  padding-top: 40px;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
  z-index: 10;
}

.project-title {
  color: #00eaff;
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  text-shadow: 0 0 15px rgba(0, 234, 255, 0.7);
  letter-spacing: 2px;
  white-space: nowrap;
}

.project-title.clickable-title {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
}

.project-title.clickable-title:hover {
  text-shadow: 0 0 20px rgba(0, 234, 255, 0.8);
  opacity: 0.9;
}

.title-arrow-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(0, 234, 255, 0.1);
  border: 1px solid rgba(0, 234, 255, 0.4);
  border-radius: 4px;
  transition: all 0.3s;
}

.project-title.clickable-title:hover .title-arrow-wrap {
  background: rgba(0, 234, 255, 0.2);
  border-color: #00eaff;
  box-shadow: 0 0 12px rgba(0, 234, 255, 0.5);
}

.title-down-icon {
  font-size: 16px;
  color: #00eaff;
}

.nav-btn {
  color: #fff;
  font-size: 16px;
  height: 40px;
  padding: 0 20px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  color: #00eaff !important;
  background: rgba(255, 255, 255, 0.1);
}

.nav-btn.active {
  background-image: url('@/assets/button.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #fff !important;
  font-weight: bold;
}

.main-layout-wrapper {
  background: #f0f2f5;
  margin-top: 80px;
  height: calc(100vh - 80px);
}

.main-layout-wrapper.dark-bg,
.layout.dark-bg,
.main-content.dark-bg {
  background: #030816 !important;
}

/* RuoYi Sider Styles */
.ruoyi-sider {
  background: #304156 !important;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  transition: all 0.3s;
  height: calc(100vh - 80px);
  position: fixed;
  left: 0;
  top: 80px;
  z-index: 100;
}

.ruoyi-menu {
  background: transparent !important;
  border-right: none !important;
  padding-top: 10px;
}

:deep(.ant-menu-item),
:deep(.ant-menu-submenu-title) {
  margin-top: 4px !important;
  margin-bottom: 4px !important;
  color: #bfcbd9 !important;
}

:deep(.ant-menu-item-selected),
:deep(.ant-menu-submenu-selected > .ant-menu-submenu-title) {
  background-color: #1890ff !important;
  color: #fff !important;
}

:deep(.ant-menu-item:hover),
:deep(.ant-menu-submenu-title:hover) {
  color: #fff !important;
}

/* Content Area Styles */
.main-content {
  background: #f0f2f5;
  padding: 0;
  margin-left: 210px;
}

.layout:not(:has(.ruoyi-sider)) .main-content {
  margin-left: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.breadcrumb-container {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 90;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  background: #f0f2f5;
}

.scroll-container.dark-bg {
  background: #030816 !important;
}

.ruoyi-breadcrumb :deep(.ant-breadcrumb-link) {
  color: #606266 !important;
}

.app-container {
  padding: 20px;
  flex: 1;
}

.app-container.no-padding {
  padding: 0;
}

.page-component-wrapper {
  height: 100%;
}

.content-card {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  min-height: calc(100vh - 80px - 50px - 40px - 70px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  color: #333;
}

.footer {
  text-align: center;
  background: #f0f2f5;
  color: #666;
  padding: 16px;
  border-top: 1px solid #dcdfe6;
}

/* Transition Animations */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

:deep(.ant-btn-link) {
  color: #fff;
}
</style>

<style>
body {
  margin: 0;
  background-color: #000b17;
}

/* Global button/input animations to maintain consistency */
.ant-btn, .ant-input, .ant-select, .ant-picker {
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
}

/* Sci-fi Dropdown Menu Styles (Global) */
.sci-fi-dropdown-wrapper .sci-fi-dropdown-menu {
  background: rgba(5, 20, 45, 0.98) !important;
  border: 1px solid #00eaff !important;
  box-shadow: 0 0 25px rgba(0, 234, 255, 0.4) !important;
  padding: 6px !important;
}

.sci-fi-dropdown-wrapper .sci-fi-dropdown-menu .ant-dropdown-menu-item {
  color: #00eaff !important;
  opacity: 0.85;
  font-weight: bold !important;
  text-align: center !important;
  padding: 12px 30px !important;
  margin: 4px 0;
  border-radius: 4px;
  transition: all 0.3s !important;
}

.sci-fi-dropdown-wrapper .sci-fi-dropdown-menu .ant-dropdown-menu-item:hover {
  background: rgba(0, 234, 255, 0.15) !important;
  opacity: 1;
  text-shadow: 0 0 10px rgba(0, 234, 255, 0.9) !important;
}

.ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ant-btn:active {
  transform: translateY(0);
}
</style>
