<template>
  <div class="upgrade-device-select fade-in">
    <a-card :bordered="false" class="content-card full-height-card">
      <div class="selection-info" style="margin-bottom: 16px;">
        <a-alert type="info" show-icon>
          <template #message>
            正在为升级包 <b>{{ packageName }} ({{ version }})</b> 选择目标设备。系统将仅列出与 <b>{{ product }}</b> 匹配的在线设备。
          </template>
        </a-alert>
      </div>

      <!-- Search Form -->
      <div class="search-form-container">
        <a-form layout="inline" :model="deviceSearchForm" class="search-form">
          <a-form-item>
            <a-input v-model:value="deviceSearchForm.name" placeholder="设备名称" />
          </a-form-item>
          <a-form-item>
            <a-input v-model:value="deviceSearchForm.deviceId" placeholder="设备ID" />
          </a-form-item>
          <a-form-item>
            <a-select v-model:value="deviceSearchForm.project" placeholder="所属项目" style="width: 180px">
              <a-select-option value="p1">宝安人才公寓</a-select-option>
              <a-select-option value="p2">天河办公楼</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-select v-model:value="deviceSearchForm.onlineStatus" placeholder="通讯状态" style="width: 120px">
              <a-select-option value="online">在线</a-select-option>
              <a-select-option value="offline">离线</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" class="action-btn">查询</a-button>
              <a-button class="action-btn">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- Device Table -->
      <div class="table-container flex-table">
        <a-table
          :columns="deviceColumns"
          :data-source="mockDevices"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys: selectedDeviceKeys, onChange: onDeviceSelectChange }"
          size="middle"
          class="ruoyi-table custom-scrollbar"
          :scroll="{ y: 'calc(100vh - 450px)' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'onlineStatus'">
              <a-badge :status="record.onlineStatus === 'online' ? 'success' : 'default'" :text="record.onlineStatus === 'online' ? '在线' : '离线'" />
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag color="blue">待升级</a-tag>
            </template>
          </template>
        </a-table>
      </div>

      <div class="footer-actions">
        <a-space size="large">
          <span class="selected-count">已选择 <b style="color: #1890ff;">{{ selectedDeviceKeys.length }}</b> 台设备</span>
          <a-button @click="$router.back()">取消</a-button>
          <a-button type="primary" @click="handleConfirmUpgrade">确认下发升级指令</a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LeftOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()

const packageName = ref(route.query.packageName || '未知升级包')
const version = ref(route.query.version || 'V1.0.0')
const product = ref(route.query.product || '未知产品')

const deviceSearchForm = reactive({
  name: '',
  deviceId: '',
  project: undefined,
  onlineStatus: undefined
})

const selectedDeviceKeys = ref([])

const deviceColumns = [
  { title: '设备名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', align: 'center' },
  { title: '当前版本', dataIndex: 'currentVersion', key: 'currentVersion', align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '通讯状态', dataIndex: 'onlineStatus', key: 'onlineStatus', align: 'center' },
  // { title: '状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '状态更新时间', dataIndex: 'updateTime', key: 'updateTime', align: 'center' },
]

const mockDevices = ref([
  { key: '1', name: '网关-001', deviceId: 'GW_88291', currentVersion: 'V2.3.1', project: '宝安人才公寓', onlineStatus: 'online',  updateTime: '2024-03-10 10:00:00' },
  { key: '2', name: '网关-002', deviceId: 'GW_88292', currentVersion: 'V2.3.0', project: '天河办公楼', onlineStatus: 'online',  updateTime: '2024-03-11 11:20:00' },
  { key: '3', name: '智能开关-A1', deviceId: 'SW_11021', currentVersion: 'V1.0.5', project: '宝安人才公寓', onlineStatus: 'offline', updateTime: '2024-03-12 09:45:00' },
  { key: '4', name: '智能开关-A2', deviceId: 'SW_11022', currentVersion: 'V1.0.5', project: '宝安人才公寓', onlineStatus: 'online',  updateTime: '2024-03-12 09:50:00' },
  { key: '5', name: '网关-003', deviceId: 'GW_88293', currentVersion: 'V2.3.1', project: '宝安人才公寓', onlineStatus: 'offline',  updateTime: '2024-03-13 14:00:00' },
  { key: '6', name: '智能开关-B1', deviceId: 'SW_11023', currentVersion: 'V1.0.5', project: '天河办公楼', onlineStatus: 'online',  updateTime: '2024-03-13 15:20:00' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 6,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const onDeviceSelectChange = (keys) => {
  selectedDeviceKeys.value = keys
}

const handleConfirmUpgrade = () => {
  if (selectedDeviceKeys.value.length === 0) {
    return message.warning('请至少选择一个设备进行升级')
  }
  
  router.push({
    path: '/upgrade-progress',
    query: {
      packageName: packageName.value,
      version: version.value,
      deviceCount: selectedDeviceKeys.value.length
    }
  })
}
</script>

<style scoped>
.upgrade-device-select { height: 100%; overflow: hidden; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.full-height-card {
  height: calc(100vh - 80px - 50px - 40px);
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.search-form-container {
  background: #f8f9fb; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1;
}

.table-container { flex: 1; overflow: hidden; }

.footer-actions {
  margin-top: 16px;
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.selected-count { font-size: 14px; color: #606266; }

.action-btn { border-radius: 4px; transition: all 0.2s; font-size: 13px; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }

/* Custom Scrollbar Styling */
.custom-scrollbar :deep(.ant-table-body) {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}
.custom-scrollbar :deep(::-webkit-scrollbar) { width: 6px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb) { background: #e8e8e8; border-radius: 3px; }
</style>
