<template>
  <div class="gateway-detail fade-in">
    <div class="detail-header">
      <div class="header-left">
        <a-button @click="$router.back()" class="back-btn" shape="circle">
          <template #icon><left-outlined /></template>
        </a-button>
        <div class="title-info">
          <div class="title-row">
            <h2 class="title">测试网关001</h2>
            <signal-filled class="signal-icon" />
          </div>
          <div class="status-tags">
            <span class="status-dot online"></span>
            <span class="status-text">在线</span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
        <a-tab-pane key="basic" tab="基础信息">
          <div class="info-grid">
            <div class="info-item" v-for="(item, index) in infoItems" :key="index">
              <span class="label">{{ item.label }}</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </a-tab-pane>
        
        <!-- Real-time Monitoring -->
        <a-tab-pane key="realtime" tab="实时监控">
          <div class="realtime-header">
            <a-button @click="showMetricSelect = true">
              <template #icon><unordered-list-outlined /></template>
              监测数据项选择
            </a-button>
          </div>
          <div class="monitor-cards">
            <div v-for="metric in visibleMetrics" :key="metric.id" class="monitor-card">
              <div class="card-top">
                <span class="label">{{ metric.label }}</span>
                <component :is="metric.icon" :style="{ color: metric.iconColor }" class="card-icon" />
              </div>
              <div class="card-main">
                <template v-if="metric.type === 'progress'">
                  <div class="progress-val">{{ metric.value }}</div>
                  <a-progress :percent="metric.percent" :show-info="false" stroke-color="#5b73e8" />
                  <div class="progress-footer">
                    <span>在线: {{ metric.online }}</span>
                    <span>离线: {{ metric.offline }}</span>
                  </div>
                </template>
                <template v-else-if="metric.type === 'complex'">
                  <div class="complex-info">
                    <div class="main-text">{{ metric.value }}</div>
                    <div class="sub-text">{{ metric.subLabel }}: {{ metric.subValue }}</div>
                  </div>
                </template>
                <template v-else>
                  <span class="main-val">{{ metric.value }}</span>
                  <span class="unit" v-if="metric.unit">{{ metric.unit }}</span>
                </template>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Metric Selection Modal -->
    <a-modal v-model:visible="showMetricSelect" title="监测数据项选择" @ok="showMetricSelect = false">
      <a-checkbox-group v-model:value="selectedMetricIds" style="width: 100%">
        <a-row :gutter="[0, 12]">
          <a-col :span="12" v-for="m in allMetrics" :key="m.id">
            <a-checkbox :value="m.id">{{ m.label }}</a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </a-modal>

    <!-- Configure Modal -->
    <a-modal v-model:visible="configModalVisible" title="参数配置" @ok="handleConfigSubmit" width="500px" ok-text="确认修改" cancel-text="取消" class="custom-modal">
      <div v-if="currentConfigRecord" style="padding: 10px 0;">
        <div style="margin-bottom: 8px; color: #606266; font-size: 14px;">{{ currentConfigRecord.desc }} ({{ currentConfigRecord.id }})</div>
        <a-input v-model:value="configValue" style="margin-bottom: 12px; height: 36px;" />
        <div style="color: #909399; font-size: 13px;">取值范围: {{ currentConfigRecord.range }}</div>
      </div>
    </a-modal>

    <!-- Restore Default Modal -->
    <a-modal v-model:visible="restoreModalVisible" width="500px" :footer="null" class="custom-modal">
      <template #title>
        <span style="display: flex; align-items: center; gap: 8px; font-size: 16px;">
          <thunderbolt-filled style="color: #faad14; font-size: 18px;" /> 远程控制鉴权
        </span>
      </template>
      <div style="padding: 10px 0;">
        <a-alert message="远程控制存在物理安全风险，请确认现场无人员违规作业！" type="error" show-icon style="margin-bottom: 20px; background-color: #fff2f0; border-color: #ffccc7; color: #ff4d4f;" />
        
        <div v-if="restoreStatus === 'idle'">
          <div style="margin-bottom: 8px; color: #606266;">请输入密码验证 <span style="color: #ff4d4f;">*</span></div>
          <a-input-password v-model:value="restorePassword" style="height: 36px;" />
          <div style="text-align: right; margin-top: 30px;">
            <a-space>
              <a-button @click="restoreModalVisible = false" style="border-radius: 4px;">取消</a-button>
              <a-button type="primary" danger @click="handleRestoreSubmit" style="border-radius: 4px; background-color: #ff4d4f;">确认下发</a-button>
            </a-space>
          </div>
        </div>

        <div v-else style="padding: 20px 0;">
          <a-steps :current="restoreCurrentStep" size="small" label-placement="vertical">
            <a-step title="密码验证" />
            <a-step title="指令下发" />
            <a-step title="下发成功" />
          </a-steps>
          <div style="text-align: center; margin-top: 30px; min-height: 24px;">
            <div v-if="restoreStatus === 'verifying'" style="color: #1890ff; font-weight: 500;">
              <a-spin size="small" style="margin-right: 8px;" />密码正确，验证通过...
            </div>
            <div v-else-if="restoreStatus === 'issuing'" style="color: #1890ff; font-weight: 500;">
              <a-spin size="small" style="margin-right: 8px;" />指令下发中...
            </div>
            <div v-else-if="restoreStatus === 'success'" style="color: #52c41a; font-weight: bold; font-size: 16px;">
              <check-circle-filled style="margin-right: 8px;" />下发成功
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { 
  LeftOutlined, 
  SignalFilled, 
  UnorderedListOutlined,
  ThermometerOutlined,
  CloudOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  MedicineBoxOutlined,
  ThunderboltFilled,
  CheckCircleFilled
} from '@ant-design/icons-vue'

const activeTab = ref('basic')
const showMetricSelect = ref(false)

// Config Modal State
const configModalVisible = ref(false)
const currentConfigRecord = ref(null)
const configValue = ref('')

const openConfigModal = (record) => {
  currentConfigRecord.value = record
  configValue.value = record.value
  configModalVisible.value = true
}

const handleConfigSubmit = () => {
  message.success('配置修改成功')
  configModalVisible.value = false
}

// Restore Default Modal State
const restoreModalVisible = ref(false)
const restorePassword = ref('')
const restoreStatus = ref('idle') // idle, verifying, issuing, success

const restoreCurrentStep = computed(() => {
  switch (restoreStatus.value) {
    case 'verifying': return 0
    case 'issuing': return 1
    case 'success': return 2
    default: return 0
  }
})

const openRestoreModal = () => {
  restorePassword.value = ''
  restoreStatus.value = 'idle'
  restoreModalVisible.value = true
}

const handleRestoreSubmit = () => {
  if (!restorePassword.value) {
    message.warning('请输入密码验证')
    return
  }
  
  restoreStatus.value = 'verifying'
  setTimeout(() => {
    restoreStatus.value = 'issuing'
    setTimeout(() => {
      restoreStatus.value = 'success'
      setTimeout(() => {
        message.success('恢复默认设置成功')
        restoreModalVisible.value = false
      }, 1000)
    }, 1500)
  }, 1000)
}

const infoItems = [
  { label: '累计运行时间', value: '1,245.5 小时' },
  { label: '子设备已配置数', value: '15' },
  { label: '定时上报时间', value: '2026-03-11 14:00:00' },
  { label: '定时上报使能', value: '已启用' },
  { label: '目标服务器地址', value: 'iot-as-mqtt.cn-shanghai.aliyuncs.com' },
  { label: '目标服务器端口', value: '1883' },
  { label: 'TLS使能', value: '未启用' },
  { label: '目标服务器协议类型', value: 'MQTT 3.1.1' },
  { label: '目标服务器产品key', value: 'a123b456c789' },
  { label: '目标服务器产品密钥', value: '****** (已隐藏)' },
  { label: '无标服务器工作区域', value: '华东2 (上海)' },
  { label: '目标服务器注册类型', value: '一型一密' },
]

const allMetrics = [
  { id: 1, label: '载板温度', value: '42.5', unit: '℃', icon: ThermometerOutlined, iconColor: '#f56c6c' },
  { id: 2, label: '载板湿度', value: '55', unit: '%', icon: CloudOutlined, iconColor: '#409eff' },
  { id: 3, label: '信号强度', value: '55', unit: '', icon: SignalFilled, iconColor: '#409eff' },
  { id: 4, label: '子设备状态', type: 'progress', value: '12 / 15', percent: 80, online: 12, offline: 3, icon: DashboardOutlined, iconColor: '#67c23a' },
  { id: 5, label: '接口占用', value: '3 / 8', unit: '', icon: ThunderboltOutlined, iconColor: '#409eff' },
  { id: 6, label: '累计运行', value: '1,245', unit: 'h', icon: FieldTimeOutlined, iconColor: '#e6a23c' },
  { id: 7, label: '数据上报', type: 'complex', value: '最后一次上报: 14:25:33', subLabel: '上报频率', subValue: '60s', icon: CloudUploadOutlined, iconColor: '#909399' },
]

const selectedMetricIds = ref([1, 2, 3, 4, 5, 6, 7])
const visibleMetrics = computed(() => allMetrics.filter(m => selectedMetricIds.value.includes(m.id)))

const thresholdColumns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '标识符', dataIndex: 'id', key: 'id' },
  { title: '参数描述', dataIndex: 'desc', key: 'desc' },
  { title: '数据类型', dataIndex: 'type', key: 'type' },
  { title: '单位', dataIndex: 'unit', key: 'unit' },
  { title: '取值范围', dataIndex: 'range', key: 'range' },
  { title: '当前阈值', dataIndex: 'value', key: 'value' },
  { title: '操作', key: 'action', width: 100 },
]

const thresholdData = [
  { id: 'Ir1', desc: '过载长延时整定值', type: 'Float', unit: '无', range: '0.4In ~ 1In', value: '0.8' },
  { id: 'Ir1_T', desc: '过载长延时时间', type: 'Float', unit: 'S (秒)', range: '3 ~ 18', value: '10' },
  { id: 'Ir1_T_Reset', desc: '长延时热记忆恢复时间', type: 'Float', unit: '分', range: '10 ~ 100', value: '30' },
  { id: 'Ir2', desc: '短路短延时倍数', type: 'Float', unit: '无', range: '2 ~ 12', value: '5' },
  { id: 'Ir2_T', desc: '短路短延时时间', type: 'Float', unit: 'S (秒)', range: '0.1 ~ 1.0', value: '0.3' },
  { id: 'Ir3', desc: '短路瞬时倍数', type: 'Float', unit: '倍', range: '4 ~ 14', value: '10' },
  { id: 'GY', desc: '过压整定值', type: 'Float', unit: 'V', range: '240 ~ 322', value: '280' },
  { id: 'GY_T', desc: '过压延时', type: 'Float', unit: 'S (秒)', range: '1 ~ 999', value: '5' },
  { id: 'QY', desc: '欠压整定值', type: 'Float', unit: 'V', range: '100 ~ 220', value: '180' },
  { id: 'QY_T', desc: '欠压延时', type: 'Float', unit: 'S (秒)', range: '1 ~ 999', value: '5' },
]

const pagination = { current: 1, pageSize: 10, total: 38, showTotal: (t) => `共 ${t} 条记录`, showSizeChanger: true }
</script>

<style scoped>
.gateway-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-info .title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online { background-color: #52c41a; }

.status-text {
  font-size: 12px;
  color: #52c41a;
}

.signal-icon {
  color: #52c41a;
  font-size: 18px;
}

.detail-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 10px;
}

.info-item {
  background: #f8f9fb;
  border-radius: 6px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eef1f6;
}

.info-item .label { color: #909399; font-size: 14px; }
.info-item .value { color: #303133; font-weight: 500; font-size: 14px; }

/* Realtime Tab Styles */
.realtime-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.monitor-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.monitor-card {
  background: #fff;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  padding: 20px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
}

.monitor-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-top .label {
  color: #909399;
  font-size: 14px;
}

.card-icon {
  font-size: 20px;
}

.card-main {
  margin-top: 16px;
}

.main-val {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.progress-val {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.complex-info .main-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.complex-info .sub-text {
  font-size: 12px;
  color: #909399;
}

/* Threshold Tab Styles */
.threshold-container .search-bar {
  margin-bottom: 20px;
  background: #f8f9fb;
  padding: 16px;
  border-radius: 8px;
}

.action-link {
  color: #1890ff;
  cursor: pointer;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
