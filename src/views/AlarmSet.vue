<template>
  <div class="alarm-set-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item><a-input v-model:value="searchForm.name" placeholder="类型名称" /></a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.level" placeholder="告警级别" style="width: 120px" allow-clear>
            <a-select-option value="严重">严重</a-select-option>
            <a-select-option value="较大">较大</a-select-option>
            <a-select-option value="关注">关注</a-select-option>
            <a-select-option value="一般">一般</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.status" placeholder="启用状态" style="width: 120px" allow-clear>
            <a-select-option value="启用">启用</a-select-option>
            <a-select-option value="停用">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn" @click="handleExport">
              导出
            </a-button>
            <a-button type="primary" class="add-btn" @click="openAddModal">
              新增
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :pagination="pagination"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        row-key="id"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'autoOrder'">
            <span :style="{ color: record.autoOrder === '是' ? '#1890ff' : '#999' }">{{ record.autoOrder }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <span :style="{ color: record.status === '启用' ? '#52c41a' : '#ff4d4f' }">{{ record.status }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="openEditModal(record)">编辑</a>
              <a class="action-link" :style="{ color: record.status === '启用' ? '#ff4d4f' : '#52c41a' }" @click="openStatusConfirm(record)">
                {{ record.status === '启用' ? '停用' : '启用' }}
              </a>
              <a-popconfirm title="确定删除该告警设置吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Add/Edit Modal -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="600px" @ok="handleModalSubmit" ok-text="保存" cancel-text="取消">
      <a-form :model="formState" layout="vertical" class="pretty-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="类型名称" required>
              <a-input v-model:value="formState.typeName" placeholder="请输入类型名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="告警级别" required>
              <a-select v-model:value="formState.level" placeholder="请选择级别">
                <a-select-option value="严重">严重</a-select-option>
                <a-select-option value="较大">较大</a-select-option>
                <a-select-option value="关注">关注</a-select-option>
                <a-select-option value="一般">一般</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="自动工单" required>
              <a-radio-group v-model:value="formState.autoOrder">
                <a-radio value="是">是</a-radio>
                <a-radio value="否">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="通知人员" required>
              <a-select v-model:value="formState.notifyPerson" mode="multiple" placeholder="请选择通知人员">
                <a-select-option value="admin">管理员</a-select-option>
                <a-select-option value="ops">运维经理</a-select-option>
                <a-select-option value="customer">客户</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="通知方式" required>
              <a-checkbox-group v-model:value="formState.noticeMethods">
                <a-checkbox value="公众号通知">公众号通知</a-checkbox>
                <a-checkbox value="短信通知">短信通知</a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Status Confirmation -->
    <a-modal v-model:visible="statusVisible" :title="statusModalTitle" @ok="handleStatusConfirm" ok-text="确认" cancel-text="取消" :ok-button-props="{ danger: currentRecord.status === '启用' }">
      <div class="status-confirm-content">
        <exclamation-circle-outlined :style="{ color: currentRecord.status === '启用' ? '#ff4d4f' : '#faad14', fontSize: '24px' }" />
        <span class="status-text">确定要{{ currentRecord.status === '启用' ? '停用' : '启用' }}该告警设置吗？</span>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { PlusOutlined, DeleteOutlined, ExportOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const searchForm = reactive({
  name: '',
  level: undefined,
  status: undefined
})

const columns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '类型编号', dataIndex: 'typeCode', key: 'typeCode', align: 'center' },
  { title: '类型名称', dataIndex: 'typeName', key: 'typeName', align: 'center' },
  { title: '通知方式', dataIndex: 'noticeMethods', key: 'noticeMethods', align: 'center' },
  { title: '通知人员', dataIndex: 'notifyPerson', key: 'notifyPerson', align: 'center' },
  { title: '告警级别', dataIndex: 'level', key: 'level', align: 'center' },
  { title: '自动工单', dataIndex: 'autoOrder', key: 'autoOrder', align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '操作', key: 'action', width: 200, align: 'center' }
]

const dataSource = ref(Array.from({ length: 10 }).map((_, i) => {
  const levels = ['严重', '较大', '关注', '一般']
  return {
    id: i + 1,
    typeCode: `ALM_TYPE_${(i + 1).toString().padStart(3, '0')}`,
    typeName: ['过压告警', '欠压告警', '漏电预警', '高温告警', '过流告警'][i % 5],
    noticeMethods: i % 2 === 0 ? '公众号通知, 短信通知' : '公众号通知',
    notifyPerson: '运维经理, 管理员',
    level: levels[i % 4],
    autoOrder: i % 2 === 0 ? '是' : '否',
    status: i % 5 === 4 ? '停用' : '启用'
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

const selectedRowKeys = ref([])
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

const getLevelColor = (level) => {
  const colors = {
    '严重': 'red',
    '较大': 'orange',
    '关注': 'blue',
    '一般': 'cyan'
  }
  return colors[level] || 'default'
}

// Modal State
const modalVisible = ref(false)
const modalType = ref('add')
const modalTitle = computed(() => modalType.value === 'add' ? '新增告警设置' : '编辑告警设置')
const formState = reactive({
  typeCode: '',
  typeName: '',
  level: undefined,
  autoOrder: '是',
  notifyPerson: [],
  noticeMethods: ['公众号通知'],
  status: '启用'
})

const openAddModal = () => {
  modalType.value = 'add'
  Object.assign(formState, {
    typeCode: '',
    typeName: '',
    level: undefined,
    autoOrder: '是',
    notifyPerson: [],
    noticeMethods: ['公众号通知'],
    status: '启用'
  })
  modalVisible.value = true
}

const openEditModal = (record) => {
  modalType.value = 'edit'
  Object.assign(formState, {
    typeCode: record.typeCode,
    typeName: record.typeName,
    level: record.level,
    autoOrder: record.autoOrder,
    notifyPerson: record.notifyPerson.split(', '),
    noticeMethods: record.noticeMethods ? record.noticeMethods.split(', ') : [],
    status: record.status
  })
  modalVisible.value = true
}

const handleModalSubmit = () => {
  message.success(`${modalTitle.value}成功`)
  modalVisible.value = false
}

// Status Confirmation
const statusVisible = ref(false)
const currentRecord = ref({})
const statusModalTitle = computed(() => currentRecord.value.status === '启用' ? '确认停用' : '确认启用')

const openStatusConfirm = (record) => {
  currentRecord.value = record
  statusVisible.value = true
}

const handleStatusConfirm = () => {
  currentRecord.value.status = currentRecord.value.status === '启用' ? '停用' : '启用'
  message.success(`${currentRecord.value.status}成功`)
  statusVisible.value = false
}

const handleDelete = (record) => {
  dataSource.value = dataSource.value.filter(item => item.id !== record.id)
  message.success('删除成功')
}

const handleExport = () => message.info('数据导出中...')
</script>

<style scoped>
.alarm-set-container { height: 100%; }
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

.status-confirm-content { display: flex; align-items: center; gap: 16px; padding: 10px 0; }
.status-text { font-size: 16px; }

.pretty-form :deep(.ant-form-item-label) { font-weight: bold; }
</style>
