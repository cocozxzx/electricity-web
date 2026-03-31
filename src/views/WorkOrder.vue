<template>
  <div class="work-order-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item><a-input v-model:value="searchForm.deviceId" placeholder="设备ID" style="width: 150px" /></a-form-item>
        <a-form-item><a-input v-model:value="searchForm.deviceName" placeholder="设备名称" style="width: 150px" /></a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.project" placeholder="所属项目" style="width: 180px" show-search allow-clear option-filter-prop="label">
            <a-select-option value="p1" label="宝安人才公寓">宝安人才公寓</a-select-option>
            <a-select-option value="p2" label="天河办公楼">天河办公楼</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.faultType" placeholder="故障类型" style="width: 150px" show-search allow-clear>
            <a-select-option value="voltage">过压告警</a-select-option>
            <a-select-option value="leakage">漏电告警</a-select-option>
            <a-select-option value="trip">跳闸告警</a-select-option>
            <a-select-option value="signal">信号微弱</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.priority" placeholder="紧急程度" style="width: 120px" allow-clear>
            <a-select-option value="紧急">紧急</a-select-option>
            <a-select-option value="一般">一般</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.status" placeholder="工单状态" style="width: 120px" allow-clear>
            <a-select-option value="处理中">处理中</a-select-option>
            <a-select-option value="待审核">待审核</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
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
            <a-button type="primary" class="add-btn" @click="openAddModal">创建工单</a-button>
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
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'priority'">
            <a-tag :color="record.priority === '紧急' ? 'red' : 'blue'">{{ record.priority }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusTagColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="openAuditModal(record)">审核</a>
              <a class="action-link detail" @click="openDetailModal(record)">详情</a>
              <a-popconfirm title="确定删除该工单吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Create Work Order Modal -->
    <a-modal v-model:visible="addVisible" title="创建工单" width="700px" @ok="handleAddSubmit" ok-text="立即创建" cancel-text="取消" destroy-on-close>
      <a-form :model="addForm" layout="vertical" class="pretty-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="所属项目" required>
              <a-select v-model:value="addForm.project" placeholder="请选择所属项目" show-search option-filter-prop="label">
                <a-select-option value="p1" label="宝安人才公寓">宝安人才公寓</a-select-option>
                <a-select-option value="p2" label="天河办公楼">天河办公楼</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="紧急程度" required>
              <a-select v-model:value="addForm.priority" placeholder="请选择紧急程度">
                <a-select-option value="紧急">紧急</a-select-option>
                <a-select-option value="一般">一般</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备名称" required>
              <a-select v-model:value="addForm.deviceId" placeholder="选择关联设备" show-search>
                <a-select-option v-for="i in 5" :key="i" :value="'DEV_'+(1000+i)">测试设备_{{i}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="故障类型" required>
              <a-select v-model:value="addForm.faultType" placeholder="请选择故障类型" show-search>
                <a-select-option value="过压告警">过压告警</a-select-option>
                <a-select-option value="欠压告警">欠压告警</a-select-option>
                <a-select-option value="漏电预警">漏电预警</a-select-option>
                <a-select-option value="高温告警">高温告警</a-select-option>
                <a-select-option value="过流告警">过流告警</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="处理人" required>
              <a-select v-model:value="addForm.assignee" placeholder="选择处理人">
                <a-select-option value="张工">张工</a-select-option>
                <a-select-option value="李工">李工</a-select-option>
                <a-select-option value="王工">王工</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="故障描述">
              <a-textarea v-model:value="addForm.description" placeholder="请输入详细的故障描述信息" :rows="4" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Audit Modal -->
    <a-modal v-model:visible="auditVisible" title="工单审核" width="800px" @ok="handleAuditSubmit" ok-text="提交审核" cancel-text="取消" destroy-on-close>
      <div class="detail-content" v-if="currentRecord.id">
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item label="工单编号">{{ currentRecord.id }}</a-descriptions-item>
            <a-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</a-descriptions-item>
            <a-descriptions-item label="所属项目">{{ currentRecord.project }}</a-descriptions-item>
            <a-descriptions-item label="故障类型">{{ currentRecord.faultType }}</a-descriptions-item>
            <a-descriptions-item label="紧急程度">{{ currentRecord.priority }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ currentRecord.createTime }}</a-descriptions-item>
            <a-descriptions-item label="故障描述" :span="2">{{ currentRecord.description }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="detail-section">
          <div class="section-title">维修反馈</div>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item label="处理人">{{ currentRecord.assignee }}</a-descriptions-item>
            <a-descriptions-item label="完成时间">{{ currentRecord.finishTime }}</a-descriptions-item>
            <a-descriptions-item label="排查说明" :span="2">{{ currentRecord.troubleshooting }}</a-descriptions-item>
            <a-descriptions-item label="处置措施" :span="2">{{ currentRecord.measures }}</a-descriptions-item>
            <a-descriptions-item label="现场照片" :span="2">
              <a-space>
                <a-image :width="80" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
                <a-image :width="80" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="detail-section">
          <div class="section-title">审核意见</div>
          <a-form :model="auditForm" layout="vertical" class="pretty-form">
            <a-form-item label="审核结果" required>
              <a-radio-group v-model:value="auditForm.result">
                <a-radio value="通过">审核通过</a-radio>
                <a-radio value="驳回">审核驳回</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="审核意见">
              <a-textarea v-model:value="auditForm.opinion" placeholder="请输入详细的审核意见" :rows="3" />
            </a-form-item>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- Detail Modal -->
    <a-modal v-model:visible="detailVisible" title="工单详情" width="800px" :footer="null" destroy-on-close>
      <div class="detail-content" v-if="currentRecord.id">
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item label="工单编号">{{ currentRecord.id }}</a-descriptions-item>
            <a-descriptions-item label="设备名称">{{ currentRecord.deviceName }}</a-descriptions-item>
            <a-descriptions-item label="所属项目">{{ currentRecord.project }}</a-descriptions-item>
            <a-descriptions-item label="故障类型">{{ currentRecord.faultType }}</a-descriptions-item>
            <a-descriptions-item label="紧急程度">{{ currentRecord.priority }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ currentRecord.createTime }}</a-descriptions-item>
            <a-descriptions-item label="故障描述" :span="2">{{ currentRecord.description }}</a-descriptions-item>
          </a-descriptions>
        </div>
        
        <div class="detail-section" v-if="currentRecord.status === '待审核' || currentRecord.status === '已完成'">
          <div class="section-title">维修反馈</div>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item label="处理人">{{ currentRecord.assignee }}</a-descriptions-item>
            <a-descriptions-item label="完成时间">{{ currentRecord.finishTime }}</a-descriptions-item>
            <a-descriptions-item label="排查说明" :span="2">{{ currentRecord.troubleshooting }}</a-descriptions-item>
            <a-descriptions-item label="处置措施" :span="2">{{ currentRecord.measures }}</a-descriptions-item>
            <a-descriptions-item label="现场照片" :span="2">
              <a-space>
                <a-image :width="80" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
                <a-image :width="80" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section" v-if="currentRecord.status === '已完成'">
          <div class="section-title">审核意见</div>
          <a-descriptions bordered :column="1" size="small">
            <a-descriptions-item label="审核结果">审核通过</a-descriptions-item>
            <a-descriptions-item label="审核意见">经核实，该工单处理规范，现场恢复良好，准予结单。</a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
      <div class="modal-footer-btn">
        <a-button @click="detailVisible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const searchForm = reactive({
  deviceId: '',
  deviceName: '',
  project: undefined,
  faultType: undefined,
  priority: undefined,
  status: undefined,
  dateRange: []
})

const columns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '工单编号', dataIndex: 'id', key: 'id', align: 'center' },
  { title: '关联告警', dataIndex: 'alarmId', key: 'alarmId', align: 'center' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', align: 'center' },
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '故障类型', dataIndex: 'faultType', key: 'faultType', align: 'center' },
  { title: '紧急程度', dataIndex: 'priority', key: 'priority', width: 100, align: 'center' },
  { title: '处理人', dataIndex: 'assignee', key: 'assignee', width: 100, align: 'center' },
  { title: '工单状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' }
]

const dataSource = ref(Array.from({ length: 10 }).map((_, i) => ({
  id: `WO_20260312_${(i+1).toString().padStart(3, '0')}`,
  alarmId: `ALM_${2000 + i}`,
  deviceId: `DEV_${1000 + i}`,
  deviceName: `测试设备_${i + 1}`,
  project: i % 2 === 0 ? '宝安人才公寓' : '天河办公楼',
  faultType: ['过压告警', '漏电告警', '跳闸告警', '信号微弱'][i % 4],
  priority: i % 3 === 0 ? '紧急' : '一般',
  assignee: ['张工', '李工', '王工'][i % 3],
  status: ['处理中', '待审核', '已完成'][i % 3],
  createTime: '2026-03-12 09:00:00',
  description: '设备触发相关告警，需要现场核查线路及设备运行状态。',
  finishTime: '2026-03-12 14:30:00',
  troubleshooting: '经现场排查，发现设备接线端子有轻微松动迹象。',
  measures: '对松动的接线端子进行了紧固处理，恢复后测试运行稳定。'
})))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const getStatusTagColor = (status) => {
  const map = {
    '处理中': 'blue',
    '待审核': 'orange',
    '已完成': 'green'
  }
  return map[status] || 'default'
}

const getStatusBadge = (status) => {
  const map = {
    '处理中': 'processing',
    '待审核': 'warning',
    '已完成': 'success'
  }
  return map[status] || 'default'
}

const getStatusColor = (status) => {
  const map = {
    '处理中': '#1890ff',
    '待审核': '#faad14',
    '已完成': '#52c41a'
  }
  return map[status] || '#000'
}

// Modals state
const addVisible = ref(false)
const auditVisible = ref(false)
const detailVisible = ref(false)
const currentRecord = ref({})

const addForm = reactive({
  project: undefined,
  deviceId: undefined,
  faultType: undefined,
  priority: '一般',
  assignee: undefined,
  description: ''
})

const auditForm = reactive({
  result: '通过',
  opinion: ''
})

const openAddModal = () => {
  Object.assign(addForm, { project: undefined, deviceId: undefined, faultType: undefined, priority: '一般', assignee: undefined, description: '' })
  addVisible.value = true
}

const handleAddSubmit = () => {
  message.success('工单创建成功')
  addVisible.value = false
}

const openAuditModal = (record) => {
  currentRecord.value = { ...record }
  auditForm.result = '通过'
  auditForm.opinion = ''
  auditVisible.value = true
}

const handleAuditSubmit = () => {
  message.success(`工单 ${currentRecord.value.id} 审核成功`)
  auditVisible.value = false
}

const openDetailModal = (record) => {
  currentRecord.value = { ...record }
  detailVisible.value = true
}

const handleExport = () => message.info('数据导出中...')

const handleDelete = (record) => {
  dataSource.value = dataSource.value.filter(item => item.id !== record.id)
  message.success('删除成功')
}
</script>

<style scoped>
.work-order-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.search-form-container {
  background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1;
}
.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}
.action-btn { border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.add-btn { background-color: #1890ff; border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.action-btn:hover, .add-btn:hover { transform: translateY(-1px); }

.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }
.action-link { font-size: 13px; transition: all 0.2s; }
.action-link:hover { opacity: 0.8; text-decoration: underline; }
.action-link.detail { color: #1890ff; }
.action-link.delete { color: #ff4d4f; }

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

.detail-content { max-height: 600px; overflow-y: auto; padding-right: 10px; }
.detail-section { margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; padding-left: 8px; border-left: 4px solid #1890ff; }
.modal-footer-btn { text-align: right; margin-top: 20px; }
.pretty-form :deep(.ant-form-item-label) { font-weight: bold; }
</style>
