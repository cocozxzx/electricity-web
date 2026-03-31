<template>
  <div class="alarm-record-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item>
          <a-input v-model:value="searchForm.deviceId" placeholder="设备ID" style="width: 150px" />
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="searchForm.deviceName" placeholder="设备名称" style="width: 150px" />
        </a-form-item>
        <a-form-item>
          <a-select 
            v-model:value="searchForm.project" 
            placeholder="所属项目" 
            style="width: 180px" 
            show-search 
            allow-clear
            option-filter-prop="label"
          >
            <a-select-option value="p1" label="宝安人才公寓">宝安人才公寓</a-select-option>
            <a-select-option value="p2" label="天河办公楼">天河办公楼</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.level" placeholder="告警级别" style="width: 120px" allow-clear>
            <a-select-option value="严重">严重</a-select-option>
            <a-select-option value="较大">较大</a-select-option>
            <a-select-option value="关注">关注</a-select-option>
            <a-select-option value="一般">一般</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.result" placeholder="处理结果" style="width: 120px" allow-clear>
            <a-select-option value="未恢复">未恢复</a-select-option>
            <a-select-option value="已恢复">已恢复</a-select-option>
            <a-select-option value="测试">测试</a-select-option>
            <a-select-option value="误报">误报</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-range-picker v-model:value="searchForm.dateRange" show-time :placeholder="['开始时间', '结束时间']" style="width: 380px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn" @click="handleExport">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :pagination="pagination"
        :row-selection="{}"
        row-key="id"
        size="middle"
        :scroll="{ x: 1800 }"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'level'">
            <a-tag :color="getLevelTagColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'result'">
            <span :style="{ color: getResultColor(record.result) }">
              {{ record.result }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="openProcessModal(record)">处理</a>
              <a class="action-link detail" @click="openDetailModal(record)">详情</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Process Modal -->
    <a-modal v-model:visible="processVisible" title="告警处理" width="500px" @ok="handleProcessSubmit" ok-text="确认处理" cancel-text="取消">
      <a-form :model="processForm" layout="vertical" class="pretty-form">
        <a-form-item label="处理结果" required>
          <a-radio-group v-model:value="processForm.result">
            <a-radio value="转工单">转工单</a-radio>
            <a-radio value="测试">测试</a-radio>
            <a-radio value="误报">误报</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Detail Modal (Consistent with DeviceDetail) -->
    <a-modal v-model:visible="detailVisible" title="详情" width="700px" :footer="null">
      <div class="alarm-detail-content">
        <div class="detail-section">
          <div class="section-mark">故障原因</div>
          <div class="fault-cards">
            <div class="fault-card"><div class="fc-label">A相</div><div class="fc-value danger">275.5 V</div></div>
            <div class="fault-card"><div class="fc-label">开关状态</div><div class="fc-value danger">已分闸</div></div>
            <div class="fault-card"><div class="fc-label">等级</div><div class="fc-value danger">{{ currentRecord.level || '严重' }}</div></div>
          </div>
        </div>
        <div class="detail-section">
          <div class="section-mark">设备信息</div>
          <div class="fault-info-row">
            <span>名称 &nbsp; {{ currentRecord.deviceName }}</span>
            <span style="margin-left: 40px;">位置 &nbsp; 浙江省杭州市余杭区</span>
          </div>
        </div>
        <div class="detail-section">
          <div class="section-mark">告警发生前实时值</div>
          <div class="fault-info-row">
            <span>电压 &nbsp; 225.5 V</span>
            <span style="margin-left: 40px;">电流 &nbsp; 15.2 A</span>
            <span style="margin-left: 40px;">漏电 &nbsp; 12.5 mA</span>
          </div>
        </div>
        <div class="detail-section">
          <div class="section-mark">原始报文</div>
          <div class="code-block">{ "VoltageA": 275.5, "Status": 1 }</div>
        </div>
        <div style="text-align: right;"><a-button @click="detailVisible = false">关闭</a-button></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const searchForm = reactive({
  deviceId: '',
  deviceName: '',
  project: undefined,
  level: undefined,
  result: undefined,
  dateRange: []
})

const columns = [
  { title: '序号', key: 'index', width: 70, align: 'center', fixed: 'left' },
  { title: '告警编号', dataIndex: 'alarmId', key: 'alarmId', width: 150, align: 'center', fixed: 'left' },
  { title: '发生时间', dataIndex: 'time', key: 'time', width: 180, align: 'center' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 120, align: 'center' },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 150, align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', width: 180, align: 'center' },
  { title: '告警类型', dataIndex: 'type', key: 'type', width: 120, align: 'center' },
  { title: '告警级别', dataIndex: 'level', key: 'level', width: 100, align: 'center' },
  { title: '处理结果', dataIndex: 'result', key: 'result', width: 100, align: 'center' },
  { title: '告警内容', dataIndex: 'content', key: 'content', width: 250, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center', fixed: 'right' }
]

const dataSource = ref(Array.from({ length: 10 }).map((_, i) => {
  const levels = ['严重', '较大', '关注', '一般']
  const results = ['未恢复', '已恢复', '测试', '误报']
  return {
    id: i + 1,
    alarmId: `ALM_20260312_${(i + 1).toString().padStart(3, '0')}`,
    time: '2026-03-12 15:54:14',
    deviceId: `DEV_${1000 + i}`,
    deviceName: `测试设备_${i + 1}`,
    project: i % 2 === 0 ? '宝安人才公寓' : '天河办公楼',
    type: ['过压告警', '漏电告警', '跳闸告警', '信号微弱'][i % 4],
    content: '监测值超出安全阈值，请尽快检查',
    level: levels[i % 4],
    result: results[i % 4]
  }
}))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const getLevelTagColor = (level) => {
  const colors = {
    '严重': 'red',
    '较大': 'orange',
    '关注': 'blue',
    '一般': 'cyan'
  }
  return colors[level] || 'default'
}

const getResultColor = (result) => {
  const colors = {
    '未恢复': '#ff4d4f',
    '已恢复': '#52c41a',
    '测试': '#1890ff',
    '误报': '#999'
  }
  return colors[result] || '#000'
}

// Modals
const processVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref({})
const processForm = reactive({
  result: '已恢复',
  remark: ''
})

const openProcessModal = (record) => {
  currentRecord.value = record
  processForm.result = '已恢复'
  processForm.remark = ''
  processVisible.value = true
}

const handleProcessSubmit = () => {
  message.success(`告警 ${currentRecord.value.alarmId} 处理成功`)
  processVisible.value = false
}

const openDetailModal = (record) => {
  currentRecord.value = record
  detailVisible.value = true
}

const handleExport = () => message.info('数据导出中...')
</script>

<style scoped>
.alarm-record-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.search-form-container {
  background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1;
}
.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}
.action-btn { border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.action-btn:hover { transform: translateY(-1px); }

.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }
.action-link { font-size: 13px; transition: all 0.2s; }
.action-link:hover { opacity: 0.8; text-decoration: underline; }
.action-link.detail { color: #1890ff; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }

.custom-scrollbar :deep(.ant-table-body),
.custom-scrollbar :deep(.ant-table-content) {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}
.custom-scrollbar :deep(::-webkit-scrollbar) { height: 8px; width: 8px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb) { background: #e8e8e8; border-radius: 4px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb:hover) { background: #d9d9d9; }
.custom-scrollbar :deep(::-webkit-scrollbar-track) { background: transparent; }

.alarm-detail-content { padding: 10px 0; }
.detail-section { margin-bottom: 24px; }
.section-mark { border-left: 4px solid #1890ff; padding-left: 8px; font-size: 15px; font-weight: bold; color: #1890ff; margin-bottom: 16px; }
.fault-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.fault-card { flex: 1; background: #fcfcfd; border: 1px solid #eef1f6; border-radius: 8px; padding: 16px; text-align: center; }
.fc-label { color: #909399; font-size: 13px; margin-bottom: 8px; }
.fc-value { font-size: 18px; font-weight: bold; }
.fc-value.danger { color: #ff4d4f; }
.fault-info-row { color: #606266; font-size: 13px; margin-bottom: 12px; }
.code-block { background: #2b2f3a; color: #cfd3dc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6; overflow-x: auto; }

.pretty-form :deep(.ant-form-item-label) { font-weight: bold; }
</style>
