<template>
  <div class="project-detail fade-in">
    <div class="detail-header">
      <div class="header-left">
        <a-button @click="$router.back()" class="back-btn">
          <template #icon><left-outlined /></template>
          返回
        </a-button>
        <h2 class="project-title">{{ projectName || '项目详情' }}</h2>
      </div>
    </div>
    
    <div class="detail-tabs">
      <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
        <!-- Topology Tab -->
        <a-tab-pane key="topology">
          <template #tab>
            <span><deployment-unit-outlined /> 拓扑结构</span>
          </template>
          <div class="topology-container">
            <a-row :gutter="16" style="height: 100%;">
              <a-col :span="16" style="height: 100%;">
                <div class="panel-box">
                  <div class="panel-title">
                    <apartment-outlined style="color: #5b73e8; margin-right: 8px;" />
                    电气拓扑图
                  </div>
                  <div 
                    class="topology-content" 
                    @wheel="handleWheel"
                    @mousedown="handleMouseDown"
                    @mousemove="handleMouseMove"
                    @mouseup="handleMouseUp"
                    @mouseleave="handleMouseUp"
                  >
                    <div 
                      class="topology-tree-wrapper"
                      :style="{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }"
                    >
                      <div class="topology-tree">
                        <!-- Main Node -->
                        <div class="node-level level-1">
                          <div class="topo-node main-node">
                            <div class="node-header">
                              <span class="status-dot online"></span>
                              <thunderbolt-filled style="color: #5b73e8; margin-right: 8px;" />
                              <span class="node-name">项目总配电节点 PM-001</span>
                            </div>
                            <div class="node-info">
                              <span>项目: {{ projectName || '项目名称' }}</span>
                              <span style="margin-left: 16px;">总子设备: 54</span>
                            </div>
                          </div>
                          <div class="tree-line vertical"></div>
                          <div class="tree-line horizontal"></div>
                        </div>
                        
                        <!-- Sub Nodes -->
                        <div class="node-level level-2">
                          <div 
                            v-for="(node, index) in topoSubNodes" 
                            :key="index" 
                            :class="['topo-node', 'sub-node', { offline: !node.online }]"
                            @click="showDeviceDrawer(node)"
                          >
                            <div class="node-header">
                              <span :class="['status-dot', node.online ? 'online' : 'offline']"></span>
                              <span class="node-name">{{ node.name }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <a-button class="reset-btn" @click="resetView">
                      <template #icon><undo-outlined /></template>
                      还原
                    </a-button>
                  </div>
                </div>
              </a-col>
              <a-col :span="8" style="height: 100%;">
                <div class="panel-box">
                  <div class="panel-title">
                    <share-alt-outlined style="color: #5b73e8; margin-right: 8px;" />
                    设备关系图
                  </div>
                  <div class="relation-content">
                    <div class="relation-tree-box">
                      <a-tree
                        :tree-data="relationTreeData"
                        default-expand-all
                        :show-line="{ showLeafIcon: false }"
                        class="relation-tree"
                      >
                        <template #title="{ dataRef }">
                          <span :class="['tree-node-label', dataRef.type]">
                            <component :is="dataRef.icon" v-if="dataRef.icon" class="node-icon" />
                            {{ dataRef.title }}
                          </span>
                        </template>
                      </a-tree>
                    </div>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-tab-pane>

        <!-- Gateway Monitoring Tab -->
        <a-tab-pane key="gateway">
          <template #tab>
            <span><hdd-outlined /> 网关监控</span>
          </template>
          <div class="monitor-tab-content">
            <div class="search-form-container mini">
              <a-form layout="inline" :model="gatewaySearch">
                <a-form-item>
                  <a-input v-model:value="gatewaySearch.name" placeholder="网关名称" style="width: 160px" />
                </a-form-item>
                <a-form-item>
                  <a-select v-model:value="gatewaySearch.status" placeholder="全部状态" style="width: 120px">
                    <a-select-option value="online">在线</a-select-option>
                    <a-select-option value="offline">离线</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-range-picker v-model:value="gatewaySearch.date" style="width: 240px" />
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button type="primary" class="action-btn">查询</a-button>
                    <a-button class="action-btn">重置</a-button>
                    <a-button class="action-btn">导出</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </div>
            <div class="table-container">
              <a-table :columns="gatewayColumns" :data-source="gatewayData" size="middle" :pagination="pagination" class="ruoyi-table custom-scrollbar">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-badge :status="record.status === '在线' ? 'success' : 'default'" :text="record.status" />
                  </template>
                  <template v-else-if="column.key === 'subCount'">
                    <span>{{ record.subCount }} <a class="action-link" @click="showMountModal(record)">挂载详情</a></span>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a class="action-link" @click="goToGatewayDetail(record)">详情</a>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>

        <!-- Device Monitoring Tab -->
        <a-tab-pane key="device">
          <template #tab>
            <span><api-outlined /> 设备监控</span>
          </template>
          <div class="monitor-tab-content">
            <div class="search-form-container mini">
              <a-form layout="inline" :model="deviceSearch">
                <a-form-item>
                  <a-input v-model:value="deviceSearch.name" placeholder="子设备名称" style="width: 160px" />
                </a-form-item>
                <a-form-item>
                  <a-select v-model:value="deviceSearch.status" placeholder="通讯状态" style="width: 120px">
                    <a-select-option value="online">在线</a-select-option>
                    <a-select-option value="offline">离线</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-select v-model:value="deviceSearch.switch" placeholder="开关状态" style="width: 120px">
                    <a-select-option value="on">合闸</a-select-option>
                    <a-select-option value="off">分闸</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-select v-model:value="deviceSearch.gateway" placeholder="所属网关" style="width: 120px">
                    <a-select-option value="gw1">GW-00128</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-range-picker v-model:value="deviceSearch.date" style="width: 240px" />
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button type="primary" class="action-btn">查询</a-button>
                    <a-button class="action-btn">重置</a-button>
                    <a-button class="action-btn">导出</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </div>
            <div class="table-container">
              <a-table :columns="deviceColumns" :data-source="deviceData" size="middle" :pagination="pagination" class="ruoyi-table custom-scrollbar">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'status'">
                    <a-badge :status="record.status === '在线' ? 'success' : 'default'" :text="record.status" />
                  </template>
                  <template v-else-if="column.key === 'switchStatus'">
                    <a-tag :color="record.switchStatus === '合闸' ? 'success' : (record.switchStatus === '分闸' ? 'warning' : 'default')">
                      {{ record.switchStatus }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'gateway'">
                    <a class="action-link" @click="goToGatewayDetail({ gwId: record.gateway, name: record.gateway })">{{ record.gateway }}</a>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a class="action-link" @click="goToDeviceDetail(record)">详情</a>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>

        <!-- Project Report Tab -->
        <a-tab-pane key="report">
          <template #tab>
            <span><file-text-outlined /> 项目报告</span>
          </template>
          <div class="monitor-tab-content">
            <div class="table-container">
              <a-table :columns="reportColumns" :data-source="reportData" size="middle" :pagination="pagination" class="centered-table">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-else-if="column.key === 'type'">
                    <a-tag :color="record.type === '年报' ? 'gold' : 'purple'">
                      {{ record.type }}
                    </a-tag>
                  </template>
                  <template v-else-if="column.key === 'action'">
                    <a-button type="primary" size="small" ghost @click="handleExportWord(record)">
                      导出word
                    </a-button>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Device Info Drawer (Topology) -->
    <a-drawer
      v-model:visible="drawerVisible"
      :title="null"
      placement="right"
      width="450px"
      :closable="false"
      class="device-info-drawer"
    >
      <div class="drawer-header" v-if="selectedNode">
        <div class="drawer-title">
          <span class="status-dot" :class="selectedNode.online ? 'online' : 'offline'"></span>
          <span class="name">CB-00001 · {{ selectedNode.name }}</span>
        </div>
        <a-button type="text" @click="drawerVisible = false" class="close-btn">
          <template #icon><close-outlined /></template>
        </a-button>
      </div>
      
      <div class="drawer-body">
        <div class="info-card">
          <div class="info-row">
            <div class="info-item"><span class="label">设备ID:</span> <span class="value">CB-00001</span></div>
            <div class="info-item"><span class="label">设备型号:</span> <span class="value">CB-100-Smart</span></div>
          </div>
          <div class="info-row">
            <div class="info-item"><span class="label">通讯状态:</span> <span class="value" :class="selectedNode?.online ? 'status-online' : ''">{{ selectedNode?.online ? '在线' : '离线' }}</span></div>
            <div class="info-item"><span class="label">开关状态:</span> <span class="value status-on">合闸</span></div>
          </div>
          <div class="info-row">
            <div class="info-item"><span class="label">所属项目:</span> <span class="value">深圳宝安项目</span></div>
            <div class="info-item"><span class="label">所属网关:</span> <span class="value">GW-00128</span></div>
          </div>
          <div class="info-row">
            <div class="info-item"><span class="label">制造商:</span> <span class="value">思格瑞电力科技</span></div>
            <div class="info-item"><span class="label">生产日期:</span> <span class="value">2024-12-10</span></div>
          </div>
          <div class="info-row">
            <div class="info-item"><span class="label">额定电压:</span> <span class="value">220V</span></div>
            <div class="info-item"><span class="label">额定电流:</span> <span class="value">100A</span></div>
          </div>
          <div class="info-row">
            <div class="info-item"><span class="label">断路器极数:</span> <span class="value">1P+N</span></div>
          </div>
        </div>

        <div class="control-section" v-if="selectedNode" style="margin-top: 12px; padding: 20px; background: #f8f9fb; border-radius: 8px;">
          <div class="section-title" style="font-size: 14px; color: #1890ff; margin-bottom: 16px; font-weight: 500;">远程开关控制</div>
          <div class="control-buttons" style="display: flex; gap: 12px;">
            <a-button type="primary" style="background-color: #67c23a; border-color: #67c23a; flex: 1; height: 40px; border-radius: 4px;" @click="openAuthModal('远程合闸')">
              <template #icon><poweroff-outlined /></template>远程合闸
            </a-button>
            <a-button type="primary" danger style="flex: 1; height: 40px; border-radius: 4px;" @click="openAuthModal('远程分闸')">
              <template #icon><poweroff-outlined /></template>远程分闸
            </a-button>
          </div>
        </div>

        <div class="metrics-section" style="margin-top: 24px;">
          <div class="section-title"><thunderbolt-outlined /> 实时关键指标</div>
          <div class="metrics-grid">
            <div class="metric-box" v-for="(m, i) in drawerMetrics" :key="i">
              <div class="m-label">{{ m.label }} / 阈值</div>
              <div class="m-values">
                <span class="m-val">{{ m.val }}</span>
                <span class="m-sep">/</span>
                <span class="m-limit">{{ m.limit }}</span>
                <span class="m-unit">{{ m.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="drawer-footer">
        <a-button type="primary" block @click="goToDeviceDetail({ devId: 'CB-00001', name: selectedNode?.name })" class="full-detail-btn">
          查看完整详情 <right-outlined />
        </a-button>
      </div>
    </a-drawer>

    <!-- Auth Modal (Remote Control) -->
    <a-modal v-model:visible="authModalVisible" width="500px" :footer="null" centered>
      <template #title>
        <span style="display: flex; align-items: center; gap: 8px;">
          <thunderbolt-filled style="color: #faad14;" /> {{ authAction }}鉴权
        </span>
      </template>
      <div style="padding: 10px 0;">
        <a-alert message="远程控制存在物理安全风险，请确认现场无人员违规作业！" type="error" show-icon style="margin-bottom: 20px;" />
        
        <div v-if="authStatus === 'idle'">
          <div style="margin-bottom: 8px; color: #606266;">请输入密码验证 <span style="color: #ff4d4f;">*</span></div>
          <a-input-password v-model:value="authPassword" style="height: 36px;" />
          <div style="text-align: right; margin-top: 30px;">
            <a-space>
              <a-button @click="authModalVisible = false" style="border-radius: 4px;">取消</a-button>
              <a-button type="primary" danger @click="handleAuthSubmit" style="border-radius: 4px; background-color: #ff4d4f;">确认下发</a-button>
            </a-space>
          </div>
        </div>

        <div v-else style="padding: 20px 0;">
          <a-steps :current="authCurrentStep" size="small" label-placement="vertical">
            <a-step title="密码验证" />
            <a-step title="指令下发" />
            <a-step title="下发成功" />
          </a-steps>
          <div style="text-align: center; margin-top: 30px; min-height: 24px;">
            <div v-if="authStatus === 'verifying'" style="color: #1890ff; font-weight: 500;">
              <a-spin size="small" style="margin-right: 8px;" />密码正确，验证通过...
            </div>
            <div v-else-if="authStatus === 'issuing'" style="color: #1890ff; font-weight: 500;">
              <a-spin size="small" style="margin-right: 8px;" />指令下发中...
            </div>
            <div v-else-if="authStatus === 'success'" style="color: #52c41a; font-weight: bold; font-size: 16px;">
              <check-circle-filled style="margin-right: 8px;" />下发成功
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- Mount Details Modal (Gateway) -->
    <a-modal
      v-model:visible="mountModalVisible"
      :title="mountModalTitle"
      width="800px"
      :footer="null"
      centered
    >
      <a-table 
        :columns="mountColumns" 
        :data-source="mountData" 
        size="middle" 
        :pagination="{ current: 1, pageSize: 10, total: 24, showTotal: t => `共 ${t} 条记录`, showSizeChanger: true }"
      />
      <div style="text-align: right; margin-top: 20px;">
        <a-button type="primary" @click="mountModalVisible = false" style="background-color: #5b73e8; border-color: #5b73e8; padding: 0 30px;">关闭</a-button>
      </div>
    </a-modal>

    <!-- Export Report Modal (Yearly/Monthly/Weekly) -->
    <a-modal
      v-model:visible="exportReportModalVisible"
      title="导出报表"
      width="1000px"
      @ok="handleExportOk"
      cancelText="取消"
      okText="导出Word"
      centered
    >
      <div class="report-export-modal">
        <div class="date-picker-container">
          <a-date-picker v-model:value="reportForm.date" placeholder="选择日期" style="width: 200px" />
        </div>

        <div class="report-document premium-style">
          <div class="report-header-premium">
            <div class="report-org">浙江德菱科技股份有限公司</div>
            <div class="report-title-main">{{ projectName }}安全运行{{ reportType }}</div>
            <div class="report-date-range">
              <span class="label">报告周期：</span>
              {{ reportForm.year1 }} 年 {{ reportForm.month1 }} 月 {{ reportForm.day1 }} 日 至 
              {{ reportForm.year2 }} 年 {{ reportForm.month2 }} 月 {{ reportForm.day2 }} 日
            </div>
            <div class="report-divider-double"></div>
          </div>

          <div class="report-content-premium">
            <!-- Section 1: Project & Device Overview -->
            <div class="section-premium">
              <div class="section-head">01 项目与设备概况</div>
              <div class="section-body">
                <div class="grid-stats">
                  <div class="stat-box">
                    <div class="stat-label">负责人</div>
                    <div class="stat-value centered-val">{{ reportForm.manager }}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">联系电话</div>
                    <div class="stat-value centered-val">{{ reportForm.phone }}</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-label">设备接入总数</div>
                    <div class="stat-value centered-val">{{ reportForm.deviceCount }}</div>
                  </div>
                </div>
                <div class="detail-row">
                  设备构成详情：包含智能网关 <span class="highlight-inline">{{ reportForm.gatewayCount }}</span> 台，
                  塑壳重合闸 <span class="highlight-inline">{{ reportForm.recloserCount }}</span> 台，
                  单相断路器 <span class="highlight-inline">{{ reportForm.singleBreakerCount }}</span> 台，
                  三相断路器 <span class="highlight-inline">{{ reportForm.threeBreakerCount }}</span> 台。
                </div>
              </div>
            </div>

            <!-- Section 2: Alarm Statistics -->
            <div class="section-premium">
              <div class="section-head">02 预警与报警分析</div>
              <div class="section-body">
                <div class="alarm-summary">
                  本周期内共产生报警 <span class="highlight-red">{{ reportForm.alarmCount }}</span> 次，
                  已完成闭环处置 <span class="highlight-green">{{ reportForm.handledCount }}</span> 次。
                </div>
                <div class="alarm-grid">
                  <div class="alarm-item critical">
                    <div class="label">严重</div>
                    <div class="value">{{ reportForm.criticalCount }}</div>
                  </div>
                  <div class="alarm-item major">
                    <div class="label">较大</div>
                    <div class="value">{{ reportForm.majorCount }}</div>
                  </div>
                  <div class="alarm-item minor">
                    <div class="label">关注</div>
                    <div class="value">{{ reportForm.minorCount }}</div>
                  </div>
                  <div class="alarm-item info">
                    <div class="label">一般</div>
                    <div class="value">{{ reportForm.infoCount }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Inspection Work -->
            <div class="section-premium">
              <div class="section-head">03 运维巡检执行情况</div>
              <div class="section-body">
                <div class="inspection-grid-premium">
                  <div class="ins-card">
                    <div class="ins-label">巡检计划数</div>
                    <div class="ins-value">{{ reportForm.planCount }}</div>
                  </div>
                  <div class="ins-card">
                    <div class="ins-label">执行次数</div>
                    <div class="ins-value">{{ reportForm.executeCount }}</div>
                  </div>
                  <div class="ins-card success">
                    <div class="ins-label">巡检正常</div>
                    <div class="ins-value">{{ reportForm.normalCount }}</div>
                  </div>
                  <div class="ins-card warning">
                    <div class="ins-label">发现异常</div>
                    <div class="ins-value">{{ reportForm.abnormalCount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="report-footer-premium">
            <div class="seal-area">
              <div class="footer-comp">浙江德菱科技股份有限公司</div>
              <div class="footer-date">
                {{ reportForm.year1 }} 年 {{ reportForm.month1 }} 月 {{ reportForm.day1 }} 日
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>  </div>
</template>

<script setup>
import { ref, reactive, h, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import imagePng from '@/assets/button.png'
import image1Png from '@/assets/top.png'
import { 
  LeftOutlined,
  DeploymentUnitOutlined,
  HddOutlined,
  ApiOutlined,
  ApartmentOutlined,
  ThunderboltFilled,
  UndoOutlined,
  ShareAltOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  CloseOutlined,
  RightOutlined,
  FileTextOutlined,
  FileWordOutlined,
  PoweroffOutlined,
  CheckCircleFilled,
  ClearOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const projectName = ref(route.query.name || '深圳宝安区智慧用电项目')
const activeTab = ref('topology')

// Auth Modal State (Remote Control)
const authModalVisible = ref(false)
const authAction = ref('')
const authPassword = ref('')
const authStatus = ref('idle') // idle, verifying, issuing, success

const authStatusText = computed(() => {
  switch (authStatus.value) {
    case 'verifying': return '验证中...'
    case 'issuing': return '下发中...'
    case 'success': return '执行成功'
    default: return ''
  }
})

const authCurrentStep = computed(() => {
  switch (authStatus.value) {
    case 'verifying': return 0
    case 'issuing': return 1
    case 'success': return 2
    default: return 0
  }
})

const openAuthModal = (action) => {
  authAction.value = action
  authPassword.value = ''
  authStatus.value = 'idle'
  authModalVisible.value = true
}

const handleAuthSubmit = () => {
  if (!authPassword.value) {
    message.warning('请输入密码验证')
    return
  }
  
  authStatus.value = 'verifying'
  setTimeout(() => {
    authStatus.value = 'issuing'
    setTimeout(() => {
      authStatus.value = 'success'
      setTimeout(() => {
        message.success(`${authAction.value}执行成功`)
        authModalVisible.value = false
      }, 1000)
    }, 1500)
  }, 1000)
}

// Report Export State
const exportReportModalVisible = ref(false)
const reportType = ref('')
const reportForm = reactive({
  date: dayjs('2026-03-09'),
  year1: '2026',
  month1: '03',
  day1: '09',
  year2: '2026',
  month2: '03',
  day2: '15',
  // Project Info
  manager: '张三',
  phone: '13800138000',
  // Device Info
  deviceCount: '150',
  gatewayCount: '5',
  recloserCount: '20',
  singleBreakerCount: '80',
  threeBreakerCount: '45',
  // Alarm Info
  alarmCount: '12',
  criticalCount: '2',
  majorCount: '3',
  minorCount: '4',
  infoCount: '3',
  handledCount: '12',
  // Inspection Info
  planCount: '4',
  executeCount: '4',
  normalCount: '3',
  abnormalCount: '1',
})

watch([() => reportForm.date, reportType], ([newDate, newType]) => {
  if (newDate && newType) {
    const start = dayjs(newDate)
    let end
    if (newType === '年报') {
      end = start.add(1, 'year').subtract(1, 'day')
    } else if (newType === '月报') {
      end = start.add(1, 'month').subtract(1, 'day')
    } else {
      // For Weekly Report (周报), 7 days inclusive
      end = start.add(6, 'day')
    }
    
    reportForm.year1 = start.format('YYYY')
    reportForm.month1 = start.format('MM')
    reportForm.day1 = start.format('DD')
    
    reportForm.year2 = end.format('YYYY')
    reportForm.month2 = end.format('MM')
    reportForm.day2 = end.format('DD')

    // Simulate dynamic data changes based on date
    const seed = start.month() + start.date() + (newType === '年报' ? 100 : 0)
    reportForm.deviceCount = (140 + (seed % 20)).toString()
    reportForm.gatewayCount = (4 + (seed % 3)).toString()
    reportForm.recloserCount = (15 + (seed % 10)).toString()
    reportForm.singleBreakerCount = (70 + (seed % 15)).toString()
    reportForm.threeBreakerCount = (40 + (seed % 10)).toString()
    
    reportForm.alarmCount = (10 + (seed % 30)).toString()
    reportForm.criticalCount = Math.floor(parseInt(reportForm.alarmCount) * 0.1).toString()
    reportForm.majorCount = Math.floor(parseInt(reportForm.alarmCount) * 0.2).toString()
    reportForm.minorCount = Math.floor(parseInt(reportForm.alarmCount) * 0.3).toString()
    reportForm.infoCount = (parseInt(reportForm.alarmCount) - parseInt(reportForm.criticalCount) - parseInt(reportForm.majorCount) - parseInt(reportForm.minorCount)).toString()
    reportForm.handledCount = reportForm.alarmCount

    reportForm.planCount = (newType === '年报' ? 52 : (newType === '月报' ? 4 : 1)).toString()
    reportForm.executeCount = reportForm.planCount
    reportForm.normalCount = (parseInt(reportForm.executeCount) - (seed % 2 === 0 ? 0 : 1)).toString()
    reportForm.abnormalCount = (parseInt(reportForm.executeCount) - parseInt(reportForm.normalCount)).toString()
  }
}, { immediate: true })

const handleExportOk = () => {
  message.success(`正在导出${reportType.value}Word报告...`)
  exportReportModalVisible.value = false
}

// Navigation
const goToGatewayDetail = (record) => {
  router.push({ path: '/gateway/detail', query: { id: record.gwId, name: record.name || record.gwId } })
}

const goToDeviceDetail = (record) => {
  router.push({ path: '/device/detail', query: { id: record.devId, name: record.name } })
}

// Project Report Data
const reportColumns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '报告名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '报告类型', dataIndex: 'type', key: 'type', align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' },
]
const reportData = [
  { id: 1, name: '项目运维年报', type: '年报' },
  { id: 2, name: '项目运维月报', type: '月报' },
  { id: 3, name: '项目运维周报', type: '周报' },
]

const handleExportWord = (record) => {
  reportType.value = record.type
  exportReportModalVisible.value = true
}

// Drawer Logic (Topology)
const drawerVisible = ref(false)
const selectedNode = ref(null)
const showDeviceDrawer = (node) => {
  selectedNode.value = node
  drawerVisible.value = true
}

const drawerMetrics = [
  { label: 'A相电压', val: '220.3', limit: '264', unit: 'V' },
  { label: 'A相电流', val: '68.2', limit: '100', unit: 'A' },
  { label: 'B相电压', val: '221.1', limit: '264', unit: 'V' },
  { label: 'B相电流', val: '52.1', limit: '100', unit: 'A' },
  { label: 'C相电压', val: '219.8', limit: '264', unit: 'V' },
  { label: 'C相电流', val: '45.6', limit: '100', unit: 'A' },
  { label: '漏电流', val: '18', limit: '30', unit: 'mA' },
  { label: '端子温度', val: '42', limit: '85', unit: '℃' },
]

// Modal Logic (Gateway Mount)
const mountModalVisible = ref(false)
const mountModalTitle = ref('')
const showMountModal = (record) => {
  mountModalTitle.value = `${record.name} 挂载子设备列表`
  mountModalVisible.value = true
}

const mountColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '子设备名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '子设备ID', dataIndex: 'devId', key: 'devId', align: 'center' },
  { title: '设备型号', dataIndex: 'model', key: 'model', align: 'center' },
]

const mountData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `1号楼回路${i + 1}`,
  devId: `CB-0000${i + 1}`,
  model: 'CB-100-Smart'
}))

// Zoom and Pan State
const zoom = ref(1.2)
const offset = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })

const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newZoom = Math.max(0.5, Math.min(3, zoom.value + delta))
  zoom.value = newZoom
}

const handleMouseDown = (e) => {
  isDragging.value = true
  dragStart.x = e.clientX - offset.x
  dragStart.y = e.clientY - offset.y
}

const handleMouseMove = (e) => {
  if (!isDragging.value) return
  offset.x = e.clientX - dragStart.x
  offset.y = e.clientY - dragStart.y
}

const handleMouseUp = () => {
  isDragging.value = false
}

const resetView = () => {
  zoom.value = 1.2
  offset.x = 0
  offset.y = 0
}

const topoSubNodes = [
  { name: '总路100A重合闸', online: true, voltage: '220.6V', current: '66.1A' },
  { name: '水泵回路32A', online: true, voltage: '221.3V', current: '21.2A' },
  { name: '空调回路32A', online: false, voltage: '', current: '' },
  { name: '照明回路16A', online: true, voltage: '219.9V', current: '8.1A' },
  { name: '插座回路20A', online: true, voltage: '220.4V', current: '13.6A' },
  { name: '备用回路10A', online: false, voltage: '', current: '' }
]

const relationTreeData = ref([
  {
    title: projectName.value,
    key: '0-0',
    type: 'project',
    icon: 'DatabaseOutlined',
    children: [
      {
        title: '网关 GW-00128',
        key: '0-0-0',
        type: 'gateway',
        icon: 'HddOutlined',
        children: [
          { title: 'CB-00001 总路100A重合闸', key: '0-0-0-0', type: 'device', icon: 'ThunderboltOutlined' },
          { title: 'CB-00002 照明回路16A', key: '0-0-0-1', type: 'device', icon: 'ThunderboltOutlined' },
          { title: 'CB-00003 插座回路20A', key: '0-0-0-2', type: 'device', icon: 'ThunderboltOutlined' },
        ]
      },
      {
        title: '网关 GW-00129',
        key: '0-0-1',
        type: 'gateway',
        icon: 'HddOutlined',
        children: [
          { title: 'CB-00101 水泵回路32A', key: '0-0-1-0', type: 'device', icon: 'ThunderboltOutlined' },
          { title: 'CB-00102 办公照明回路', key: '0-0-1-1', type: 'device', icon: 'ThunderboltOutlined' },
        ]
      }
    ],
  },
])

// Gateway Data
const gatewaySearch = reactive({ name: '', status: undefined, date: [] })
const gatewayColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '网关ID', dataIndex: 'gwId', key: 'gwId', align: 'center' },
  { title: '网关名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '通讯状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '载板温度', dataIndex: 'temp', key: 'temp', align: 'center' },
  { title: '载板湿度', dataIndex: 'humi', key: 'humi', align: 'center' },
  { title: '信号强度', dataIndex: 'signal', key: 'signal', align: 'center' },
  { title: '最后心跳', dataIndex: 'lastHeartbeat', key: 'lastHeartbeat', align: 'center' },
  { title: '子设备挂载数', dataIndex: 'subCount', key: 'subCount', align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]
const gatewayData = [
  { id: 1, gwId: 'GW-00128', name: '宝安1号楼网关', status: '在线', temp: '35.5℃', humi: '45%', signal: '-45dBm', lastHeartbeat: '2025-06-15 14:32', subCount: 24 },
  { id: 2, gwId: 'GW-00129', name: '宝安2号楼网关', status: '在线', temp: '36.2℃', humi: '42%', signal: '-60dBm', lastHeartbeat: '2025-06-15 14:31', subCount: 18 },
  { id: 3, gwId: 'GW-00130', name: '宝安3号楼网关', status: '离线', temp: '-', humi: '-', signal: '-90dBm', lastHeartbeat: '2025-06-14 09:15', subCount: 12 },
]

// Device Data
const deviceSearch = reactive({ name: '', status: undefined, switch: undefined, gateway: undefined, date: [] })
const deviceColumns = [
  { title: '子设备ID', dataIndex: 'devId', key: 'devId', align: 'center' },
  { title: '设备名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '通讯状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '开关状态', dataIndex: 'switchStatus', key: 'switchStatus', align: 'center' },
  { title: '通讯时间', dataIndex: 'commTime', key: 'commTime', align: 'center' },
  { title: '所属网关', dataIndex: 'gateway', key: 'gateway', align: 'center' },
  { title: '操作', key: 'action', width: 80, align: 'center' },
]
const deviceData = [
  { devId: 'CB-00001', name: '总路100A重合闸', status: '在线', switchStatus: '合闸', commTime: '2025-06-15 14:32:01', gateway: 'GW-00128' },
  { devId: 'CB-00002', name: '照明回路16A', status: '在线', switchStatus: '合闸', commTime: '2025-06-15 14:32:03', gateway: 'GW-00128' },
  { devId: 'CB-00003', name: '插座回路20A', status: '在线', switchStatus: '合闸', commTime: '2025-06-15 14:32:05', gateway: 'GW-00128' },
  { devId: 'CB-00004', name: '空调回路32A', status: '离线', switchStatus: '离线', commTime: '2025-06-14 23:30:00', gateway: 'GW-00128' },
  { devId: 'CB-00005', name: '水泵电源开关', status: '在线', switchStatus: '分闸', commTime: '2025-06-15 14:31:00', gateway: 'GW-00129' },
]

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 5,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})
</script>

<style scoped>
.project-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.detail-header {
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  border-radius: 4px;
}

.project-title {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.detail-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.custom-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.ant-tabs-content) { height: 100%; }
:deep(.ant-tabs-tabpane) { height: 100%; }

.topology-container {
  height: calc(100vh - 320px);
}

.panel-box {
  background: #fff;
  border-radius: 8px;
  height: 100%;
  border: 1px solid #e6ebf1;
  display: flex;
  flex-direction: column;
}

.panel-title {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: bold;
  border-bottom: 1px solid #e6ebf1;
}

.topology-content {
  position: relative;
  flex: 1;
  background: #f8f9fb;
  overflow: hidden;
  user-select: none;
}

.topology-tree-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: 50% 50%;
  transition: transform 0.1s ease-out;
}

.topology-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-level {
  display: flex;
  justify-content: center;
  position: relative;
}

.level-1 {
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.level-2 {
  gap: 24px;
  flex-wrap: wrap;
  max-width: 800px;
}

.topo-node {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6ebf1;
  z-index: 2;
  cursor: pointer;
  transition: all 0.3s;
}

.topo-node:hover {
  border-color: #1890ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.main-node {
  padding: 12px 20px;
  border: 2px solid #5b73e8;
  border-left: 6px solid #5b73e8;
  min-width: 320px;
}

.sub-node {
  padding: 12px;
  min-width: 200px;
  border-left: 6px solid #52c41a;
}

.sub-node.offline { border-left-color: #d9d9d9; }

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.online { background-color: #52c41a; }
.status-dot.offline { background-color: #d9d9d9; }

.node-info { font-size: 12px; color: #666; }

.tree-line {
  background-color: #e6ebf1;
  position: absolute;
  z-index: 1;
}

.tree-line.vertical { width: 2px; height: 40px; bottom: -40px; left: 50%; }
.tree-line.horizontal { height: 2px; width: 600px; bottom: -40px; left: 50%; transform: translateX(-50%); }

.level-2 .topo-node::before {
  content: '';
  position: absolute;
  top: -40px;
  left: 50%;
  width: 2px;
  height: 40px;
  background-color: #e6ebf1;
}

.reset-btn { position: absolute; bottom: 20px; right: 20px; z-index: 10; }

.relation-content { flex: 1; padding: 16px; overflow-y: auto; }

.monitor-tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e6ebf1;
  padding: 16px;
}

.search-form-container.mini { margin-bottom: 12px; padding: 0; border: none; }

.action-link { color: #1890ff; cursor: pointer; }

.centered-table :deep(.ant-table-cell) {
  text-align: center !important;
}

.tree-node-label { padding: 4px 12px; border-radius: 10px; font-size: 14px; font-weight: 500; }
.tree-node-label.project { background: #e6f7ff; color: #1890ff; }
.tree-node-label.gateway { background: #f6ffed; color: #52c41a; }
.tree-node-label.device { background: #fffbe6; color: #d48806; }

/* Drawer Styles */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f2f5;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
}

.drawer-body { 
  padding: 16px 24px; 
  height: calc(100% - 160px);
  overflow-y: auto;
}

.info-card {
  background: #f8f9fb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #eef1f6;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.info-row:last-child { margin-bottom: 0; }

.info-item { 
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-item .label { 
  color: #909399; 
  font-size: 12px;
}
.info-item .value { 
  color: #303133; 
  font-weight: 600;
  font-size: 13px;
}
.info-item .value.status-online { color: #52c41a; }
.info-item .value.status-on { color: #52c41a; }

.metrics-section .section-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric-box {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s;
}

.metric-box:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.m-label { 
  font-size: 13px; 
  color: #909399; 
  margin-bottom: 12px; 
}
.m-values { 
  display: flex; 
  align-items: baseline; 
  justify-content: center; 
  gap: 6px; 
}
.m-val { 
  font-size: 22px; 
  font-weight: bold; 
  color: #52c41a; 
}
.m-sep { color: #dcdfe6; font-size: 14px; }
.m-limit { 
  font-size: 16px; 
  font-weight: bold; 
  color: #f56c6c; 
}
.m-unit { 
  font-size: 12px; 
  color: #909399; 
  margin-left: 2px; 
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  background: #fff;
  border-top: 1px solid #f0f2f5;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
}

.full-detail-btn {
  height: 44px;
  background-color: #5b73e8;
  border-color: #5b73e8;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
}

/* Report Export Modal Styles */
.report-export-modal {
  padding: 10px 20px;
  color: #333;
  background-color: #f0f2f5;
}

.report-document {
  background-color: #fff;
  padding: 40px 60px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  margin: 0 auto;
  min-height: 800px;
}

.date-picker-container {
  margin-bottom: 20px;
}

.report-header {
  text-align: center;
}

/* Sewage Report Styles */
.report-header-sewage {
  text-align: center;
  margin-bottom: 30px;
}

.report-title-red {
  color: #f5222d;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 15px;
}

.report-time-range {
  font-size: 18px;
  margin-bottom: 10px;
}

.report-no-line {
  font-size: 16px;
}

.report-red-divider {
  height: 2px;
  background-color: #f5222d;
  margin: 20px 0;
}

.report-content-sewage {
  font-size: 16px;
  line-height: 2.2;
  text-align: justify;
}

.report-content-sewage p {
  margin-bottom: 15px;
  text-indent: 2em;
}

.underline-input-mini {
  border: none;
  border-bottom: 1px solid #333;
  outline: none;
  text-align: center;
  width: 35px;
  background: transparent;
}

.underline-input-small {
  border: none;
  border-bottom: 1px solid #333;
  outline: none;
  text-align: center;
  width: 60px;
  background: transparent;
  color: #1890ff;
  font-weight: bold;
}

.underline-input-medium {
  border: none;
  border-bottom: 1px solid #333;
  outline: none;
  text-align: center;
  width: 90px;
  background: transparent;
  color: #1890ff;
  font-weight: bold;
}

.underline-text {
  text-decoration: underline;
  padding: 0 5px;
}

.triple-lines {
  margin: 40px 0;
}

.h-line {
  border-bottom: 1px solid #333;
  margin-bottom: 30px;
  height: 1px;
}

.report-footer-sewage {
  margin-top: 60px;
  text-align: right;
  padding-right: 20px;
}

.footer-comp {
  font-size: 18px;
  margin-bottom: 15px;
}

.footer-date-place {
  font-size: 18px;
  letter-spacing: 15px;
}

/* Stats Report Styles */
.report-content-stats {
  padding: 20px 0;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  border-left: 4px solid #f5222d;
  padding-left: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px 40px;
  padding-left: 15px;
}

.stats-item {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.underline-input-stats {
  border: none;
  border-bottom: 1px solid #333;
  outline: none;
  background: transparent;
  flex: 1;
  padding: 0 5px;
  font-family: inherit;
}

.underline-input-stats.short {
  width: 60px;
  flex: none;
  text-align: center;
}

/* Premium Report Styles */
.premium-style {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #262626;
}

.report-header-premium {
  text-align: center;
  margin-bottom: 40px;
}

.report-org {
  font-size: 18px;
  color: #595959;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.report-title-main {
  font-size: 32px;
  font-weight: 800;
  color: #cf1322;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.report-date-range {
  font-size: 16px;
  color: #595959;
}

.report-date-range .label {
  font-weight: bold;
}

.report-divider-double {
  border-top: 3px solid #cf1322;
  border-bottom: 1px solid #cf1322;
  height: 6px;
  margin-top: 20px;
}

.report-content-premium {
  padding: 20px 0;
}

.section-premium {
  margin-bottom: 40px;
}

.section-head {
  font-size: 20px;
  font-weight: bold;
  color: #262626;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
  position: relative;
}

.section-head::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background-color: #cf1322;
}

.grid-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-box {
  background: #fdfdfe;
  border: 1px solid #f0f0f0;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #262626;
}

.stat-value.centered-val {
  text-align: center;
}

.detail-row {
  font-size: 15px;
  line-height: 1.8;
  padding: 10px 15px;
  background: #fafafa;
  border-left: 4px solid #d9d9d9;
}

.highlight-inline {
  font-weight: bold;
  color: #cf1322;
  padding: 0 4px;
}

.alarm-summary {
  font-size: 16px;
  margin-bottom: 20px;
}

.highlight-red { color: #cf1322; font-weight: bold; font-size: 18px; }
.highlight-green { color: #389e0d; font-weight: bold; font-size: 18px; }

.alarm-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.alarm-item {
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #f0f0f0;
}

.alarm-item.critical { background: #fff1f0; border-color: #ffa39e; }
.alarm-item.major { background: #fff7e6; border-color: #ffd591; }
.alarm-item.minor { background: #e6f7ff; border-color: #91d5ff; }
.alarm-item.info { background: #f6ffed; border-color: #b7eb8f; }

.alarm-item .label { font-size: 13px; color: #595959; margin-bottom: 5px; }
.alarm-item .value { font-size: 20px; font-weight: bold; }

.inspection-grid-premium {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.ins-card {
  padding: 15px;
  border-radius: 8px;
  background: #fdfdfe;
  border: 1px solid #f0f0f0;
  text-align: center;
}

.ins-card.success {
  background: #f6ffed;
  border-color: #b7eb8f;
}

.ins-card.warning {
  background: #fffbe6;
  border-color: #ffe58f;
}

.ins-label {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.ins-value {
  font-size: 22px;
  font-weight: bold;
  color: #262626;
}

.report-footer-premium {
  margin-top: 60px;
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;
}

.seal-area {
  text-align: center;
  position: relative;
}

.footer-comp {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.footer-date {
  font-size: 16px;
  letter-spacing: 2px;
}
</style>
