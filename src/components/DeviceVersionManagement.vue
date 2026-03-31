<template>
  <div class="device-version-management fade-in">
    <!-- Search Form -->
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item><a-input v-model:value="searchForm.packageName" placeholder="升级包名称" /></a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.product" placeholder="所属产品" style="width: 180px">
            <a-select-option value="IoT智能网关">IoT智能网关</a-select-option>
            <a-select-option value="智能断路器">智能断路器</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-range-picker v-model:value="searchForm.addTime" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn">导出</a-button>
            <a-button class="action-btn" @click="importVisible = true">批量导入</a-button>
            <a-button type="primary" class="add-btn" @click="openAddModal">
              添加升级包
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- Table -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-selection="{}"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="openDetailModal(record)">详情</a>
              <a class="action-link upgrade" style="color: #faad14" @click="openUpgradeModal(record)">升级</a>
              <a-popconfirm title="确定要删除该升级包吗？" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Add/Edit/Detail Modal -->
    <a-modal 
      v-model:visible="modalVisible" 
      :title="modalTitle" 
      width="650px" 
      @ok="handleModalSubmit"
      :footer="modalType === 'detail' ? null : undefined"
      destroy-on-close
    >
      <a-form :model="modalForm" layout="vertical" :disabled="modalType === 'detail'" class="pretty-form">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="升级包名称" :required="modalType !== 'detail'">
              <a-input v-model:value="modalForm.packageName" placeholder="请输入升级包名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="升级包版本号" :required="modalType !== 'detail'">
              <a-input v-model:value="modalForm.version" placeholder="请输入版本号" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="所属产品" :required="modalType !== 'detail'">
              <a-select v-model:value="modalForm.product" placeholder="请选择所属产品">
                <a-select-option value="IoT智能网关">IoT智能网关</a-select-option>
                <a-select-option value="智能断路器">智能断路器</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="升级内容">
          <a-textarea v-model:value="modalForm.upgradeContent" placeholder="请输入升级内容" :rows="4" />
        </a-form-item>

        <a-form-item label="升级包" :required="modalType !== 'detail'" v-if="modalType !== 'detail'">
          <a-upload-dragger
            v-model:fileList="modalForm.fileList"
            name="file"
            :multiple="false"
            action=""
            @change="handleFileChange"
          >
            <p class="ant-upload-drag-icon">
              <upload-outlined />
            </p>
            <p class="ant-upload-text">点击或拖拽固件包到此区域上传</p>
          </a-upload-dragger>
        </a-form-item>
        <a-form-item label="已上传文件" v-else>
          <a-tag color="blue">
            <template #icon><file-outlined /></template>
            {{ modalForm.packageName }}.bin
          </a-tag>
        </a-form-item>
      </a-form>
      <template #footer v-if="modalType === 'detail'">
        <a-button @click="modalVisible = false">关闭</a-button>
      </template>
    </a-modal>

    <!-- Batch Import Modal -->
    <a-modal v-model:visible="importVisible" title="Excel批量导入" width="600px" @ok="importVisible = false" ok-text="开始导入" cancel-text="取消">
      <div class="import-content">
        <a-button type="primary" class="download-btn" style="margin-bottom: 20px;">
          <template #icon><download-outlined /></template>
          下载标准导入模板
        </a-button>
        <a-upload-dragger name="file" :multiple="false">
          <p class="ant-upload-drag-icon"><cloud-upload-outlined /></p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p class="ant-upload-hint">支持 .xlsx / .xls 格式</p>
        </a-upload-dragger>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PlusOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  FileOutlined,
  DownloadOutlined,
  CloudUploadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()

const searchForm = reactive({
  packageName: '', product: undefined, addTime: []
})

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: '升级包名称', dataIndex: 'packageName', key: 'packageName', align: 'center' },
  { title: '升级包版本号', dataIndex: 'version', key: 'version', align: 'center' },
  { title: '升级包大小', dataIndex: 'size', key: 'size', align: 'center' },
  { title: '所属产品', dataIndex: 'product', key: 'product', align: 'center' },
  { title: '添加时间', dataIndex: 'addTime', key: 'addTime', align: 'center' },
  { title: '操作', key: 'action', width: 220, align: 'center' },
]

const dataSource = ref([
  { id: 1, packageName: 'GW_V2.3.2_Patch', version: 'V2.3.2', size: '4.2 MB', product: 'IoT智能网关', addTime: '2023-10-15 09:30:00' },
  { id: 2, packageName: 'CB_Smart_V1.1.0', version: 'V1.1.0', size: '1.8 MB', product: '智能断路器', addTime: '2023-11-20 10:10:00' },
  { id: 3, packageName: 'GW_Security_Update', version: 'V2.3.1', size: '3.5 MB', product: 'IoT智能网关', addTime: '2023-12-05 14:25:00' },
  { id: 4, packageName: 'GW_Full_V2.3.5', version: 'V2.3.5', size: '12.8 MB', product: 'IoT智能网关', addTime: '2024-01-10 16:40:00' },
  { id: 5, packageName: 'CB_Fix_V1.1.2', version: 'V1.1.2', size: '2.1 MB', product: '智能断路器', addTime: '2024-02-15 11:20:00' },
])

const pagination = reactive({
  current: 1, 
  pageSize: 10, 
  total: 1280, 
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
   pageSizeOptions: ['10', '20', '50', '100'],
   onChange: (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    generateMockData();
  }
})

// Modals state
const modalVisible = ref(false)
const modalType = ref('add') // 'add', 'edit', 'detail'
const modalTitle = computed(() => {
  if (modalType.value === 'add') return '添加升级包'
  if (modalType.value === 'edit') return '编辑升级包'
  return '升级包详情'
})
const currentItem = ref({})
const importVisible = ref(false)

const modalForm = reactive({
  packageName: '',
  version: '',
  type: '整包',
  product: undefined,
  module: 'default',
  algorithm: 'MD5',
  upgradeContent: '',
  fileList: []
})

const openAddModal = () => {
  modalType.value = 'add'
  Object.assign(modalForm, {
    packageName: '',
    version: '',
    type: '整包',
    product: undefined,
    module: 'default',
    algorithm: 'MD5',
    upgradeContent: '',
    fileList: []
  })
  modalVisible.value = true
}

const openEditModal = (record) => {
  modalType.value = 'edit'
  currentItem.value = record
  Object.assign(modalForm, {
    packageName: record.packageName,
    version: record.version,
    type: '整包',
    product: record.product,
    module: 'default',
    algorithm: 'MD5',
    upgradeContent: '',
    fileList: []
  })
  modalVisible.value = true
}

const openUpgradeModal = (record) => {
  router.push({
    path: '/upgrade-device-select',
    query: {
      packageName: record.packageName,
      version: record.version,
      product: record.product
    }
  })
}

const handleModalSubmit = () => {
  if (modalType.value === 'detail') {
    modalVisible.value = false
    return
  }
  message.success(`${modalTitle.value}成功`)
  modalVisible.value = false
}

const openDetailModal = (record) => {
  modalType.value = 'detail'
  currentItem.value = record
  Object.assign(modalForm, {
    packageName: record.packageName,
    version: record.version,
    type: '整包',
    product: record.product,
    module: 'default',
    algorithm: 'MD5',
    upgradeContent: '1. 修复已知漏洞\n2. 提升系统稳定性',
    fileList: []
  })
  modalVisible.value = true
}

const handleFileChange = (info) => {
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 上传成功`)
  }
}

const handleDelete = (record) => {
  message.success(`已删除升级包：${record.packageName}`)
}
</script>

<style scoped>
.device-version-management { height: 100%; }
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
.action-link { font-size: 13px; transition: all 0.2s; cursor: pointer; }
.action-link:hover { opacity: 0.8; text-decoration: underline; }
.action-link.detail { color: #1890ff; }
.action-link.edit { color: #1890ff; }
.action-link.upgrade { color: #faad14; }
.action-link.delete { color: #ff4d4f; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }

/* Custom Scrollbar Styling */
.custom-scrollbar :deep(.ant-table-body),
.custom-scrollbar :deep(.ant-table-content) {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}

.custom-scrollbar :deep(::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
}

.custom-scrollbar :deep(::-webkit-scrollbar-thumb) {
  background: #e8e8e8;
  border-radius: 4px;
}

.custom-scrollbar :deep(::-webkit-scrollbar-thumb:hover) {
  background: #d9d9d9;
}

.custom-scrollbar :deep(::-webkit-scrollbar-track) {
  background: transparent;
}

.import-content { text-align: center; padding: 20px 0; }
</style>
