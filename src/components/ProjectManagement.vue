<template>
  <div class="project-management fade-in">
    <!-- Search Form -->
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item>
          <a-input v-model:value="searchForm.name" placeholder="项目名称" class="search-input" />
        </a-form-item>
        <a-form-item>
          <a-tree-select
            v-model:value="searchForm.agent"
            placeholder="全部代理商"
            style="width: 200px"
            class="search-select"
            :tree-data="agentTreeData"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-range-picker v-model:value="searchForm.date" class="search-date" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn">导出</a-button>
            <a-button type="primary" class="add-btn" @click="openAddModal">
              <!-- <template #icon><plus-outlined /></template> -->
              新增项目
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
        size="middle"
        :row-selection="{}"
        :scroll="{ y: 'calc(100vh - 300px)' }"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'warning'">
            <span class="status-count warning">{{ record.warning }}</span>
          </template>
          <template v-else-if="column.key === 'fault'">
            <span class="status-count fault">{{ record.fault }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="goToDetail(record)">详情</a>
              <a class="action-link account" @click="openAccountModal(record)">账号管理</a>
              <a class="action-link edit" @click="openEditModal(record)">编辑</a>
              <a-popconfirm
                title="确定要删除该项目吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      width="680px"
      ok-text="确认"
      cancel-text="取消"
      class="custom-modal"
    >
      <a-form layout="vertical" :model="formState">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="项目名称" required>
              <a-input v-model:value="formState.name" placeholder="请输入项目名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属代理商" required>
              <a-tree-select
                v-model:value="formState.agent"
                style="width: 100%"
                :tree-data="agentTreeData"
                placeholder="搜索或选择代理商..."
                tree-default-expand-all
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="项目地址" required>
              <a-input v-model:value="formState.addressDetail" placeholder="请输入详细地址或点击图标地图选点">
                <template #suffix>
                  <environment-outlined 
                    style="color: #1890ff; cursor: pointer; font-size: 16px;" 
                    @click="openMapPicker" 
                    title="地图选点"
                  />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目负责人" required>
              <a-input v-model:value="formState.manager" placeholder="请输入负责人姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" required>
              <a-input v-model:value="formState.phone" placeholder="请输入负责人电话" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 地图选点弹窗 -->
    <a-modal
      v-model:visible="mapVisible"
      title="地图位置选择"
      width="800px"
      @ok="handleMapConfirm"
      ok-text="确认位置"
      cancel-text="取消"
      destroy-on-close
    >
      <MapPicker v-model:value="tempAddress" @select="onMapSelect" />
    </a-modal>

    <!-- Account Management Modal -->
    <a-modal
      v-model:visible="accountModalVisible"
      title="项目账号管理"
      width="800px"
      :footer="null"
      class="custom-modal"
    >
      <div style="margin-bottom: 16px;">
        <a-alert type="info" show-icon style="display: flex; align-items: center; justify-content: space-between; padding: 8px 15px;">
          <template #message>
            <span>该项目下的账号可登录现场 App 进行设备绑定与调试</span>
          </template>
          <template #icon><info-circle-outlined /></template>
          <template #action>
            <a-button type="primary" size="small" style="background-color: #5b73e8; border-color: #5b73e8;" @click="openAddAccountModal">新增项目账号</a-button>
          </template>
        </a-alert>
      </div>

      <a-table
        :columns="accountColumns"
        :data-source="accountDataSource"
        :pagination="accountPagination"
        size="middle"
        class="ruoyi-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a class="action-link edit" style="color: #5b73e8;" @click="openEditAccountModal(record)">编辑</a>
              <a-popconfirm
                title="确定要删除该账号吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDeleteAccount(record)"
              >
                <a class="action-link delete" style="color: #ea5455;">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      <div style="text-align: right; margin-top: 16px;">
        <a-button type="primary" class="add-btn" @click="accountModalVisible = false">确定</a-button>
      </div>
    </a-modal>

    <!-- Add/Edit Account Modal -->
    <a-modal
      v-model:visible="accountFormVisible"
      :title="accountModalTitle"
      @ok="handleAccountSubmit"
      width="600px"
      ok-text="保存"
      cancel-text="取消"
      class="custom-modal"
    >
      <a-form layout="vertical" :model="accountForm">
        <a-form-item label="姓名" required>
          <a-input v-model:value="accountForm.name" placeholder="请输入姓名" />
        </a-form-item>
        <a-form-item label="登录账号" required>
          <a-input v-model:value="accountForm.account" placeholder="请输入登录账号" />
        </a-form-item>
        <a-form-item label="联系电话" required>
          <a-input v-model:value="accountForm.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="登录密码" :required="accountModalType === 'add'">
          <a-input-password v-model:value="accountForm.password" :placeholder="accountModalType === 'add' ? '请输入登录密码' : '留空则不修改密码'" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  PlusOutlined, 
  InfoCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue'
import MapPicker from './MapPicker.vue'

const router = useRouter()

const props = defineProps({
  initialProject: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['clear-initial'])

onMounted(() => {
  if (props.initialProject) {
    goToDetail(props.initialProject)
    emit('clear-initial')
  }
})

watch(() => props.initialProject, (newVal) => {
  if (newVal) {
    goToDetail(newVal)
    emit('clear-initial')
  }
})

const goToDetail = (record) => {
  router.push({
    path: '/project/detail',
    query: { id: record.id, name: record.name }
  })
}

const searchForm = reactive({
  name: '',
  agent: undefined,
  date: []
})

const agentTreeData = ref([
  {
    title: '万众云联科技',
    key: '0-0',
    value: '万众云联科技',
    children: [
      { title: '贵阳华旭电气', key: '0-0-0', value: '贵阳华旭电气' },
      { 
        title: '徐州市民宗局监测系统', 
        key: '0-0-1',
        value: '徐州市民宗局监测系统',
        children: [
          { title: '泉山区民宗局监测系统', key: '0-0-1-0', value: '泉山区民宗局监测系统' }
        ]
      },
    ],
  },
])

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '项目名称', dataIndex: 'name', key: 'name', width: 220, align: 'center' },
  { title: '项目地址', dataIndex: 'address', key: 'address', width: 280, align: 'center' },
  { title: '创建日期', dataIndex: 'createTime', key: 'createTime', width: 170, align: 'center' },
  { title: '所属代理商', dataIndex: 'agentName', key: 'agentName', width: 180, align: 'center' },
  { title: '网关数', dataIndex: 'gatewayCount', key: 'gatewayCount', width: 80, align: 'center' },
  { title: '子设备数', dataIndex: 'subDeviceCount', key: 'subDeviceCount', width: 90, align: 'center' },
  { title: '正常', dataIndex: 'normal', key: 'normal', width: 70, align: 'center' },
  { title: '告警', dataIndex: 'warning', key: 'warning', width: 70, align: 'center' },
  { title: '故障', dataIndex: 'fault', key: 'fault', width: 70, align: 'center' },
  { title: '离线', dataIndex: 'offline', key: 'offline', width: 70, align: 'center' },
  { title: '操作', key: 'action', width: 220, align: 'center' },
]

const dataSource = ref([
  { id: 1, name: '深圳宝安区智慧用电项目', address: '广东省深圳市宝安区万众大厦', createTime: '2025-01-10 10:30:45', agentName: '万众云联科技', gatewayCount: 12, subDeviceCount: 86, normal: 80, warning: 2, fault: 1, offline: 3 },
  { id: 2, name: '广州天河区商业中心监控', address: '广东省广州市天河区珠江新城', createTime: '2025-02-15 14:20:12', agentName: '万众云联科技', gatewayCount: 8, subDeviceCount: 52, normal: 50, warning: 0, fault: 0, offline: 2 },
  { id: 3, name: '上海浦东写字楼安全用电', address: '上海市浦东新区陆家嘴中心', createTime: '2025-03-20 09:15:30', agentName: '华东大区代理', gatewayCount: 5, subDeviceCount: 38, normal: 35, warning: 1, fault: 0, offline: 2 },
  { id: 4, name: '杭州萧山工业园区用电', address: '浙江省杭州市萧山区科技园', createTime: '2025-04-05 16:45:22', agentName: '华东大区代理', gatewayCount: 3, subDeviceCount: 21, normal: 20, warning: 0, fault: 0, offline: 1 },
  { id: 5, name: '贵阳中心大厦智能化项目', address: '贵州省贵阳市南明区', createTime: '2025-05-12 11:20:15', agentName: '贵阳华旭电气', gatewayCount: 10, subDeviceCount: 120, normal: 115, warning: 3, fault: 0, offline: 2 },
  { id: 6, name: '成都高新区孵化器电力监控', address: '四川省成都市高新区', createTime: '2025-06-01 14:00:00', agentName: '成都成电自动化', gatewayCount: 6, subDeviceCount: 45, normal: 42, warning: 1, fault: 1, offline: 1 },
  { id: 7, name: '武汉烽火科技园配电系统', address: '湖北省武汉市洪山区', createTime: '2025-07-10 10:10:10', agentName: '武汉烽火科技代理', gatewayCount: 15, subDeviceCount: 200, normal: 190, warning: 5, fault: 2, offline: 3 },
  { id: 8, name: '南京鼓楼智慧医疗用电', address: '江苏省南京市鼓楼区', createTime: '2025-08-22 09:00:00', agentName: '华东大区代理', gatewayCount: 4, subDeviceCount: 30, normal: 28, warning: 0, fault: 0, offline: 2 },
  { id: 9, name: '北京朝阳区软件园用电系统', address: '北京市朝阳区中关村', createTime: '2025-09-15 14:30:00', agentName: '华北科技代理', gatewayCount: 20, subDeviceCount: 310, normal: 300, warning: 4, fault: 1, offline: 5 },
  { id: 10, name: '西安海淀区智能楼宇', address: '陕西省西安市海淀区', createTime: '2025-10-01 08:45:12', agentName: '西北联合科技', gatewayCount: 7, subDeviceCount: 65, normal: 60, warning: 2, fault: 0, offline: 3 },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// Modal logic
const modalVisible = ref(false)
const modalType = ref('add')
const formState = reactive({
  name: '',
  agent: undefined,
  addressDetail: '',
  manager: '',
  phone: ''
})

const modalTitle = computed(() => modalType.value === 'add' ? '新建项目' : '编辑项目')

const openAddModal = () => {
  modalType.value = 'add'
  Object.assign(formState, {
    name: '',
    agent: undefined,
    addressDetail: '',
    manager: '',
    phone: ''
  })
  modalVisible.value = true
}

const openEditModal = (record) => {
  modalType.value = 'edit'
  Object.assign(formState, {
    name: record.name,
    agent: record.agentName,
    addressDetail: record.address,
    manager: '张三',
    phone: '13800138000'
  })
  modalVisible.value = true
}

const handleModalOk = () => {
  message.success(`${modalTitle.value}成功`)
  modalVisible.value = false
}

// Map Picker Logic
const mapVisible = ref(false)
const tempAddress = ref('')
const openMapPicker = () => {
  tempAddress.value = formState.addressDetail || ''
  mapVisible.value = true
}
const onMapSelect = (data) => {
  tempAddress.value = data.address
}
const handleMapConfirm = () => {
  formState.addressDetail = tempAddress.value
  mapVisible.value = false
  message.success('位置已锁定')
}

const handleDelete = (record) => {
  message.success(`已删除项目：${record.name}`)
}

// Account Modal Logic
const accountModalVisible = ref(false)
const accountColumns = [
  { title: '姓名', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '登录账号', dataIndex: 'account', key: 'account', align: 'center' },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', align: 'center' },
  { title: '操作', key: 'action', align: 'center' },
]

const accountDataSource = ref([
  { key: '1', name: '张伟', account: 'zhangwei', phone: '13812345678' },
  { key: '2', name: '李芳', account: 'lifang_01', phone: '13912341234' },
])

const accountPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 2,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const openAccountModal = (record) => {
  accountModalVisible.value = true
}

const handleDeleteAccount = (record) => {
  message.success(`已删除账号：${record.name}`)
}

// Add/Edit Account Form
const accountFormVisible = ref(false)
const accountModalType = ref('add')
const accountForm = reactive({
  name: '',
  account: '',
  phone: '',
  password: ''
})

const accountModalTitle = computed(() => accountModalType.value === 'add' ? '新增项目账号' : '编辑项目账号')

const openAddAccountModal = () => {
  accountModalType.value = 'add'
  accountForm.name = ''
  accountForm.account = ''
  accountForm.phone = ''
  accountForm.password = ''
  accountFormVisible.value = true
}

const openEditAccountModal = (record) => {
  accountModalType.value = 'edit'
  accountForm.name = record.name
  accountForm.account = record.account
  accountForm.phone = record.phone
  accountForm.password = ''
  accountFormVisible.value = true
}

const handleAccountSubmit = () => {
  message.success(`${accountModalTitle.value}成功`)
  accountFormVisible.value = false
}
</script>

<style scoped>
.project-management {
  height: 100%;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.search-form-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid #e6ebf1;
}

.search-form {
  margin-bottom: 0px;
}

:deep(.ant-input), :deep(.ant-select-selector), :deep(.ant-picker) {
  height: 32px !important;
  font-size: 13px !important;
}

.action-btn {
  border-radius: 4px;
  font-size: 13px;
}

.add-btn {
  background-color: #1890ff;
  border-radius: 4px;
  font-size: 13px;
}

.table-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
}

.status-count {
  font-weight: bold;
}

.status-count.warning {
  color: #ff9f43;
}

.status-count.fault {
  color: #ea5455;
}

.action-link {
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
}

.action-link.detail, .action-link.account, .action-link.edit {
  color: #1890ff;
}

.action-link.delete {
  color: #ff4d4f;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
  font-size: 13px !important;
}

:deep(.ant-modal-title) {
  font-size: 16px !important;
  font-weight: bold !important;
}

:deep(.ant-form-item) {
  margin-bottom: 12px !important;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px !important;
}

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
</style>
