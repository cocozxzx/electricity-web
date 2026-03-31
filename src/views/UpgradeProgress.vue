<template>
  <div class="upgrade-progress-container fade-in">
    <a-row :gutter="16" class="full-height-row">
      <!-- Left: Summary Info -->
      <a-col :span="8" class="full-height-col">
        <a-card title="升级任务概览" :bordered="false" class="info-card">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="升级包名称">{{ packageName }}</a-descriptions-item>
            <a-descriptions-item label="目标版本">{{ version }}</a-descriptions-item>
            <a-descriptions-item label="设备数量">{{ deviceCount }} 台</a-descriptions-item>
            <a-descriptions-item label="开始时间">{{ startTime }}</a-descriptions-item>
          </a-descriptions>
          
          <div class="overall-progress">
            <div class="progress-label">总体进度</div>
            <a-progress 
              :percent="overallProgress" 
              :status="overallStatus"
              :stroke-color="{
                '0%': '#108ee9',
                '100%': '#87d068',
              }"
            />
          </div>

          <div class="status-stats">
            <a-row :gutter="8">
              <a-col :span="8">
                <div class="stat-item success">
                  <div class="val">{{ successCount }}</div>
                  <div class="lab">成功</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="stat-item processing">
                  <div class="val">{{ upgradingCount }}</div>
                  <div class="lab">进行中</div>
                </div>
              </a-col>
              <a-col :span="8">
                <div class="stat-item error">
                  <div class="val">{{ failCount }}</div>
                  <div class="lab">失败</div>
                </div>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <a-card title="实时执行日志" :bordered="false" class="log-card">
          <div class="log-console custom-scrollbar" ref="logBox">
            <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
              <span class="log-time">[{{ log.time }}]</span>
              {{ log.msg }}
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- Right: Device List -->
      <a-col :span="16" class="full-height-col">
        <a-card title="设备升级详情" :bordered="false" class="device-card">
          <a-table 
            :columns="columns" 
            :data-source="deviceList" 
            :pagination="pagination"
            size="middle"
            class="ruoyi-table custom-scrollbar"
            :scroll="{ y: 'calc(100vh - 350px)' }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  <template #icon>
                    <loading-outlined v-if="record.status === '升级中' || record.status === '下载中'" />
                    <check-circle-outlined v-else-if="record.status === '成功'" />
                    <close-circle-outlined v-else-if="['升级失败', '下载失败', '校验失败', '烧写失败', '失败'].includes(record.status)" />
                    <clock-circle-outlined v-else />
                  </template>
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'progress'">
                <a-progress :percent="record.progress" size="small" :status="['升级失败', '下载失败', '校验失败', '烧写失败', '失败'].includes(record.status) ? 'exception' : 'active'" />
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()
const packageName = ref(route.query.packageName || 'GW_V2.3.2_Patch')
const version = ref(route.query.version || 'V2.3.2')
const deviceCount = ref(15)
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 120, align: 'center' },
  { title: '进度', dataIndex: 'progress', key: 'progress', width: 200, align: 'center' },
  { title: '描述', dataIndex: 'remark', key: 'remark', align: 'center' },
]

// Fixed final states for the simulation
const deviceList = ref([
  { key: '1', name: '网关-001', deviceId: 'GW_88291', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '2', name: '网关-002', deviceId: 'GW_88292', status: '等待中', progress: 0, remark: '排队中', targetStatus: '下载失败', targetProgress: 15, finalRemark: '网络连接超时' },
  { key: '3', name: '智能开关-A1', deviceId: 'SW_11021', status: '等待中', progress: 0, remark: '排队中', targetStatus: '校验失败', targetProgress: 100, finalRemark: 'MD5签名不匹配' },
  { key: '4', name: '智能开关-A2', deviceId: 'SW_11022', status: '等待中', progress: 0, remark: '排队中', targetStatus: '烧写失败', targetProgress: 65, finalRemark: 'Flash分区写入异常' },
  { key: '5', name: '网关-003', deviceId: 'GW_88293', status: '等待中', progress: 0, remark: '排队中', targetStatus: '升级失败', targetProgress: 80, finalRemark: '设备响应异常' },
  { key: '6', name: '智能开关-B1', deviceId: 'SW_11023', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '7', name: '网关-004', deviceId: 'GW_88294', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '8', name: '智能开关-C1', deviceId: 'SW_11024', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '9', name: '智能开关-C2', deviceId: 'SW_11025', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '10', name: '网关-005', deviceId: 'GW_88295', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '11', name: '智能开关-D1', deviceId: 'SW_11026', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '12', name: '网关-006', deviceId: 'GW_88296', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '13', name: '智能开关-E1', deviceId: 'SW_11027', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '14', name: '智能开关-E2', deviceId: 'SW_11028', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
  { key: '15', name: '网关-007', deviceId: 'GW_88297', status: '等待中', progress: 0, remark: '排队中', targetStatus: '成功', targetProgress: 100, finalRemark: '升级成功，已重启' },
])

const logs = ref([])
const logBox = ref(null)

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 15,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const getStatusColor = (status) => {
  const map = {
    '等待中': 'default',
    '下载中': 'processing',
    '升级中': 'processing',
    '成功': 'success',
    '升级失败': 'error',
    '下载失败': 'error',
    '校验失败': 'error',
    '烧写失败': 'error',
    '失败': 'error'
  }
  return map[status] || 'default'
}

const overallProgress = computed(() => {
  if (deviceList.value.length === 0) return 0
  const total = deviceList.value.reduce((acc, cur) => acc + cur.progress, 0)
  return Math.floor(total / deviceList.value.length)
})

const overallStatus = computed(() => {
  if (overallProgress.value >= 100) return 'success'
  return 'active'
})

const successCount = computed(() => deviceList.value.filter(d => d.status === '成功').length)
const failCount = computed(() => deviceList.value.filter(d => ['升级失败', '下载失败', '校验失败', '烧写失败', '失败'].includes(d.status)).length)
const upgradingCount = computed(() => deviceList.value.filter(d => d.status === '下载中' || d.status === '升级中').length)

const addLog = (msg, type = 'info') => {
  logs.value.push({
    time: dayjs().format('HH:mm:ss'),
    msg,
    type
  })
  nextTick(() => {
    if (logBox.value) {
      logBox.value.scrollTop = logBox.value.scrollHeight
    }
  })
}

// Simulation Logic
let timer = null
const MAX_CONCURRENT = 3 // 最大并发升级数

const startSimulation = () => {
  addLog(`升级任务下发成功，包含 ${deviceList.value.length} 台设备，最大并发数：${MAX_CONCURRENT}`, 'success')

  timer = setInterval(() => {
    const activeDevices = deviceList.value.filter(d => d.status !== d.targetStatus)
    
    if (activeDevices.length === 0) {
      clearInterval(timer)
      addLog('所有设备升级任务处理完成', 'success')
      return
    }

    // 获取当前正在升级的设备数量
    let currentUpgrading = deviceList.value.filter(d => d.status === '下载中' || d.status === '升级中').length

    activeDevices.forEach(device => {
      // Progress simulation based on current status
      if (device.status === '等待中') {
        // 队列控制：只有在当前并发数小于最大限制时才开始下载
        if (currentUpgrading < MAX_CONCURRENT) {
          device.status = '下载中'
          device.remark = '正在获取固件包'
          addLog(`设备 ${device.name} 进入队列并开始下载 (当前并发: ${currentUpgrading + 1}/${MAX_CONCURRENT})`, 'info')
          currentUpgrading++
        }
      } else if (device.status === '下载中') {
        if (device.targetStatus === '下载失败' && device.progress >= device.targetProgress) {
          device.status = '下载失败'
          device.remark = device.finalRemark
          addLog(`设备 ${device.name} 下载失败: ${device.finalRemark}`, 'error')
        } else {
          device.progress += Math.floor(Math.random() * 15) + 5
          if (device.progress >= 100) {
            device.progress = 100
            if (device.targetStatus === '校验失败') {
              device.status = '校验失败'
              device.remark = device.finalRemark
              addLog(`设备 ${device.name} 校验失败: ${device.finalRemark}`, 'error')
            } else {
              device.status = '升级中'
              device.remark = '正在烧录固件'
              addLog(`设备 ${device.name} 下载完成，开始烧录`, 'info')
            }
          }
        }
      } else if (device.status === '升级中') {
        if (device.targetStatus === '烧写失败' && device.progress >= device.targetProgress) {
          device.status = '烧写失败'
          device.remark = device.finalRemark
          addLog(`设备 ${device.name} 烧写失败: ${device.finalRemark}`, 'error')
        } else if (device.targetStatus === '升级失败' && device.progress >= device.targetProgress) {
          device.status = '升级失败'
          device.remark = device.finalRemark
          addLog(`设备 ${device.name} 升级失败: ${device.finalRemark}`, 'error')
        } else if (device.targetStatus === '成功') {
          device.progress += Math.floor(Math.random() * 10) + 2
          if (device.progress >= 100) {
            device.progress = 100
            device.status = '成功'
            device.remark = device.finalRemark
            addLog(`设备 ${device.name} 升级成功`, 'success')
          }
        } else {
          // Keep incrementing progress for failed states that reach a certain point
          device.progress += Math.floor(Math.random() * 10) + 2
        }
      }
    })
  }, 1000)
}

onMounted(() => {
  startSimulation()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.upgrade-progress-container {
  height: calc(100vh - 80px - 50px - 40px);
  overflow: hidden;
}

.full-height-row { height: 100%; margin: 0 !important; }
.full-height-col { height: 100%; display: flex; flex-direction: column; }

.info-card, .log-card, .device-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.log-card { 
  margin-top: 16px; 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  min-height: 0;
}

:deep(.log-card .ant-card-body) { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  padding: 12px;
}

.device-card { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
}

:deep(.device-card .ant-card-body) { 
  flex: 1; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; 
}

.overall-progress {
  margin-top: 16px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

.progress-label { margin-bottom: 4px; font-weight: 500; color: #555; font-size: 13px; }

.status-stats { margin-top: 12px; }
.stat-item { text-align: center; padding: 8px 0; background: #f9f9f9; border-radius: 4px; }
.stat-item.success .val { color: #52c41a; }
.stat-item.processing .val { color: #1890ff; }
.stat-item.error .val { color: #ff4d4f; }
.stat-item .val { font-size: 18px; font-weight: bold; }
.stat-item .lab { font-size: 12px; color: #888; }

.log-console {
  background: #1e1e1e;
  color: #dcdcdc;
  padding: 12px;
  flex: 1;
  overflow-y: auto !important;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  border-radius: 4px;
}

.log-item { margin-bottom: 4px; line-height: 1.5; }
.log-item.success { color: #52c41a; }
.log-item.error { color: #ff4d4f; }
.log-time { color: #888; margin-right: 8px; }

.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Custom Scrollbar Styling */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}
.custom-scrollbar :deep(::-webkit-scrollbar) { width: 6px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb) { background: #e8e8e8; border-radius: 3px; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }
</style>
