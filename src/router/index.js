import { createRouter, createWebHistory } from 'vue-router'
import ProjectManagement from '../components/ProjectManagement.vue'
import AgentManagement from '../components/AgentManagement.vue'
import DeviceManagement from '../components/DeviceManagement.vue'
import DeviceVersionManagement from '../components/DeviceVersionManagement.vue'
import SimManagement from '../components/SimManagement.vue'
import ProjectDetail from '../views/ProjectDetail.vue'
import GatewayDetail from '../views/GatewayDetail.vue'
import DeviceDetail from '../views/DeviceDetail.vue'
import AlarmSet from '../views/AlarmSet.vue'
import AlarmRecord from '../views/AlarmRecord.vue'
import WorkOrder from '../views/WorkOrder.vue'
import InspectPlan from '../views/InspectPlan.vue'
import InspectRecord from '../views/InspectRecord.vue'
import UpgradeProgress from '../views/UpgradeProgress.vue'
import UpgradeDeviceSelect from '../views/UpgradeDeviceSelect.vue'
import HelloWorld from '../components/HelloWorld.vue'

import UserManagement from '../views/system/UserManagement.vue'
import RoleManagement from '../views/system/RoleManagement.vue'
import MenuManagement from '../views/system/MenuManagement.vue'
import DeptManagement from '../views/system/DeptManagement.vue'
import DictManagement from '../views/system/DictManagement.vue'
import LogManagement from '../views/system/LogManagement.vue'
import WarningRuleConfig from '../views/system/WarningRuleConfig.vue'
import ProjectCockpit from '../views/ProjectCockpit.vue'
import EmptyPage from '../components/EmptyPage.vue'

import UserLogin from '../components/UserLogin.vue'

import ProductManagement from '../components/ProductManagement.vue'

// Energy Carbon Components
import EnergyConsumptionQuery from '../views/energy/carbon/EnergyConsumptionQuery.vue'
import EnergyIntensityCalc from '../views/energy/carbon/EnergyIntensityCalc.vue'
import EnergyAnalysisStrategy from '../views/energy/carbon/EnergyAnalysisStrategy.vue'
import EnergyEfficiencyBenchmarking from '../views/energy/carbon/EnergyEfficiencyBenchmarking.vue'
import EnergyFlowAnalysis from '../views/energy/carbon/EnergyFlowAnalysis.vue'
import CarbonBudgetManagement from '../views/energy/carbon/CarbonBudgetManagement.vue'
import CarbonEmissionAccounting from '../views/energy/carbon/CarbonEmissionAccounting.vue'
import ProductCarbonFootprint from '../views/energy/carbon/ProductCarbonFootprint.vue'
import SupplyChainCarbon from '../views/energy/carbon/SupplyChainCarbon.vue'
import CarbonVerificationSupport from '../views/energy/carbon/CarbonVerificationSupport.vue'
import CarbonAssetManagement from '../views/energy/carbon/CarbonAssetManagement.vue'
import EnergyEfficiencyOptimization from '../views/energy/carbon/EnergyEfficiencyOptimization.vue'

// Finance Components
import AdminProjectOverview from '../views/finance/AdminProjectOverview.vue'
import AdminPaymentRecord from '../views/finance/AdminPaymentRecord.vue'
import AdminBillingConfig from '../views/finance/AdminBillingConfig.vue'
import AdminDeviceStatus from '../views/finance/AdminDeviceStatus.vue'
import AdminProjectDeviceList from '../views/finance/AdminProjectDeviceList.vue'
import AgentProjectFee from '../views/finance/AgentProjectFee.vue'
import AgentProjectDetail from '../views/finance/AgentProjectDetail.vue'
import AgentDeviceList from '../views/finance/AgentDeviceList.vue'
import AgentExpiryWarning from '../views/finance/AgentExpiryWarning.vue'
import AgentExpiryDetail from '../views/finance/AgentExpiryDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/cockpit',
    name: 'Cockpit',
    component: HelloWorld,
    props: { msg: '驾驶舱' }
  },
  {
    path: '/project-cockpit',
    name: 'ProjectCockpit',
    component: ProjectCockpit
  },
  {
    path: '/agent',
    name: 'Agent',
    component: AgentManagement
  },
  {
    path: '/project',
    name: 'Project',
    component: ProjectManagement
  },
  {
    path: '/project/detail',
    name: 'ProjectDetail',
    component: ProjectDetail
  },
  {
    path: '/gateway/detail',
    name: 'GatewayDetail',
    component: GatewayDetail
  },
  {
    path: '/device/detail',
    name: 'DeviceDetail',
    component: DeviceDetail
  },
  {
    path: '/device',
    name: 'Device',
    component: DeviceManagement
  },
  {
    path: '/sim',
    name: 'SimManagement',
    component: SimManagement
  },
  {
    path: '/version',
    name: 'DeviceVersion',
    component: DeviceVersionManagement
  },
  {
    path: '/product',
    name: 'Product',
    component: ProductManagement
  },
  {
    path: '/customer',
    name: 'Customer',
    component: EmptyPage,
    props: { msg: '客户管理' }
  },
  {
    path: '/alarm-set',
    name: 'AlarmSet',
    component: AlarmSet
  },
  {
    path: '/alarm-record',
    name: 'AlarmRecord',
    component: AlarmRecord
  },
  {
    path: '/work-order',
    name: 'WorkOrder',
    component: WorkOrder
  },
  {
    path: '/inspect-plan',
    name: 'InspectPlan',
    component: InspectPlan
  },
  {
    path: '/inspect-record',
    name: 'InspectRecord',
    component: InspectRecord
  },
  {
    path: '/upgrade-progress',
    name: 'UpgradeProgress',
    component: UpgradeProgress
  },
  {
    path: '/upgrade-device-select',
    name: 'UpgradeDeviceSelect',
    component: UpgradeDeviceSelect
  },
  {
    path: '/user',
    name: 'User',
    component: UserManagement
  },
  {
    path: '/role',
    name: 'Role',
    component: RoleManagement
  },
  {
    path: '/menu',
    name: 'Menu',
    component: MenuManagement
  },
  {
    path: '/dept',
    name: 'Dept',
    component: DeptManagement
  },
  {
    path: '/dict',
    name: 'Dict',
    component: DictManagement
  },
  {
    path: '/log',
    name: 'Log',
    component: LogManagement
  },
  {
    path: '/warning-rule',
    name: 'WarningRule',
    component: WarningRuleConfig
  },
  // Energy Carbon Management Sub-menus
  { path: '/carbon/query', name: 'CarbonQuery', component: EnergyConsumptionQuery },
  { path: '/carbon/intensity', name: 'CarbonIntensity', component: EnergyIntensityCalc },
  { path: '/carbon/analysis', name: 'CarbonAnalysis', component: EnergyAnalysisStrategy },
  { path: '/carbon/benchmarking', name: 'CarbonBenchmarking', component: EnergyEfficiencyBenchmarking },
  { path: '/carbon/flow', name: 'CarbonFlow', component: EnergyFlowAnalysis },
  { path: '/carbon/optimization', name: 'CarbonOptimization', component: EnergyEfficiencyOptimization },
  { path: '/carbon/budget', name: 'CarbonBudget', component: CarbonBudgetManagement },
  { path: '/carbon/emission', name: 'CarbonEmission', component: CarbonEmissionAccounting },
  { path: '/carbon/footprint', name: 'CarbonFootprint', component: ProductCarbonFootprint },
  { path: '/carbon/supply-chain', name: 'CarbonSupplyChain', component: SupplyChainCarbon },
  { path: '/carbon/verification', name: 'CarbonVerification', component: CarbonVerificationSupport },
  { path: '/carbon/assets', name: 'CarbonAssets', component: CarbonAssetManagement },
  // Manufacturer Finance
  {
    path: '/finance/mfr/overview',
    name: 'MfrOverview',
    component: AdminProjectOverview
  },
  {
    path: '/finance/mfr/billing',
    name: 'MfrBilling',
    component: AdminPaymentRecord
  },
  {
    path: '/finance/mfr/config',
    name: 'MfrConfig',
    component: AdminBillingConfig
  },
  {
    path: '/finance/mfr/device-status',
    name: 'MfrDeviceStatus',
    component: AdminDeviceStatus
  },
  {
    path: '/finance/mfr/project-device-list',
    name: 'MfrProjectDeviceList',
    component: AdminProjectDeviceList
  },
  // Agent Finance
  {
    path: '/finance/agent/project-overview',
    name: 'AgentProjectOverview',
    component: AgentProjectFee
  },
  {
    path: '/finance/agent/project-detail',
    name: 'AgentProjectDetail',
    component: AgentProjectDetail
  },
  {
    path: '/finance/agent/device-list',
    name: 'AgentDeviceList',
    component: AgentDeviceList
  },
  {
  path: '/finance/agent/expiry-warning',
  name: 'AgentExpiryWarning',
  component: AgentExpiryWarning
  },
  {
    path: '/finance/agent/expiry-detail',
    name: 'AgentExpiryDetail',
    component: AgentExpiryDetail
  }
  ]
const router = createRouter({
  history: createWebHistory('/web/'),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
  
  if (to.path === '/login') {
    if (isLoggedIn) {
      next('/cockpit') // 已登录则跳转到首页，防止在登录页显示主布局导航
    } else {
      next()
    }
  } else {
    if (!isLoggedIn) {
      next('/login') // 未登录强制跳转登录
    } else {
      next()
    }
  }
})

export default router
