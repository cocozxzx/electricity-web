<template>
  <div class="admin-project-device-list fade-in">
    <!-- 顶部数据统计 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="6" v-for="stat in stats" :key="stat.title" class="stat-col">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ backgroundColor: stat.bgColor, color: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 筛选栏 -->
    <div class="search-form-container">
      <a-form layout="inline" class="search-form" :model="searchForm">
        <a-form-item>
          <a-input v-model:value="searchForm.name" placeholder="设备名称" style="width: 130px" />
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.type" placeholder="设备类型" style="width: 110px" allow-clear>
            <a-select-option value="网关">网关</a-select-option>
            <a-select-option value="子设备">子设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.model" placeholder="设备型号" style="width: 140px" allow-clear>
            <a-select-option value="IoT-GW-Pro">IoT-GW-Pro</a-select-option>
            <a-select-option value="CB-100-Smart">CB-100-Smart</a-select-option>
            <a-select-option value="CB-200-Smart">CB-200-Smart</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="searchForm.deviceId" placeholder="设备 ID" style="width: 130px" />
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.onlineStatus" placeholder="通讯状态" style="width: 100px" allow-clear>
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.status" placeholder="当前状态" style="width: 100px" allow-clear>
            <a-select-option value="RUNNING">运行中</a-select-option>
            <a-select-option value="GRACE">宽限期</a-select-option>
            <a-select-option value="LOCKED">已锁定</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn" @click="onSearch">查询</a-button>
            <a-button class="action-btn" @click="onReset">重置</a-button>
            <a-button class="action-btn" @click="goBack">返回</a-button>
            <a-button type="primary" class="action-btn upload-btn" @click="showUploadModal">上传凭证</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 设备列表 -->
    <div class="table-container">
      <a-table 
        :columns="deviceColumns" 
        :data-source="deviceList" 
        :pagination="pagination"
        row-key="id"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'onlineStatus'">
            <a-badge :status="record.onlineStatus === '在线' ? 'success' : 'default'" :text="record.onlineStatus" />
          </template>
          <template v-if="column.key === 'expiryTime'">
            <span :class="['expiry-val', getExpiryStatus(record.expiryTime)]">{{ record.expiryTime }}</span>
          </template>
          <template v-if="column.key === 'remainingDays'">
            <span :class="['days-val', getExpiryStatus(record.expiryTime)]">
              {{ formatRemainingDays(record.expiryTime) }}
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <span :class="['status-tag', record.status.toLowerCase()]">
              {{ record.status === 'RUNNING' ? '运行中' : (record.status === 'GRACE' ? '宽限期' : '已锁定') }}
            </span>
          </template>
          <template v-if="column.key === 'amount'">
            <span class="amount-val">¥ {{ record.amount.toFixed(2) }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 上传凭证弹窗 -->
    <a-modal
      v-model:visible="uploadVisible"
      title="上传缴费凭证"
      @ok="handleUploadOk"
      @cancel="handleUploadCancel"
      ok-text="确认提交"
      cancel-text="取消"
      width="500px"
    >
      <div class="upload-modal-content">
        <a-form :model="uploadForm" layout="vertical">
          <a-form-item label="项目名称">
            <a-input v-model:value="uploadForm.projectName" disabled />
          </a-form-item>
          <a-form-item label="缴费金额 (元)" required>
            <a-input-number v-model:value="uploadForm.amount" style="width: 100%" placeholder="请输入缴费金额" />
          </a-form-item>
          <a-form-item label="凭证上传" required>
            <a-upload
              v-model:file-list="fileList"
              name="avatar"
              list-type="picture-card"
              class="avatar-uploader"
              :show-upload-list="true"
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            >
              <div v-if="fileList.length < 1">
                <plus-outlined />
                <div style="margin-top: 8px">上传图片</div>
              </div>
            </a-upload>
          </a-form-item>
          <a-form-item label="备注">
            <a-textarea v-model:value="uploadForm.remark" placeholder="请输入备注信息" :rows="4" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { 
  DatabaseOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  LockOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';

const route = useRoute();
const router = useRouter();

// 上传凭证相关
const uploadVisible = ref(false);
const fileList = ref([]);
const uploadForm = reactive({
  projectName: route.query.name || '萧山电力园项目',
  amount: undefined,
  remark: ''
});

const showUploadModal = () => {
  uploadVisible.value = true;
};

const handleUploadOk = () => {
  if (!uploadForm.amount) {
    message.warning('请输入缴费金额');
    return;
  }
  if (fileList.value.length === 0) {
    message.warning('请上传凭证图片');
    return;
  }
  message.success('凭证上传成功，请等待审核');
  uploadVisible.value = false;
  // 重置表单
  uploadForm.amount = undefined;
  uploadForm.remark = '';
  fileList.value = [];
};

const handleUploadCancel = () => {
  uploadVisible.value = false;
};

// 计算超期状态和剩余天数
const getExpiryStatus = (expiryTime) => {
  const diff = dayjs(expiryTime).diff(dayjs('2026-03-24'), 'day');
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'warning';
  return 'normal';
};

const formatRemainingDays = (expiryTime) => {
  const diff = dayjs(expiryTime).diff(dayjs('2026-03-24'), 'day');
  if (diff < 0) return `已超期 ${Math.abs(diff)} 天`;
  return `${diff} 天`;
};

const stats = [
  { title: '设备总数', value: '128', icon: DatabaseOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '运行中', value: '112', icon: CheckCircleOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '宽限期', value: '12', icon: ClockCircleOutlined, color: '#faad14', bgColor: '#fff7e6' },
  { title: '已锁定', value: '4', icon: LockOutlined, color: '#ff4d4f', bgColor: '#fff1f0' },
];

const searchForm = reactive({
  name: '',
  type: undefined,
  model: undefined,
  deviceId: '',
  onlineStatus: undefined,
  status: undefined
});

const deviceColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 70, align: 'center', fixed: 'left' },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 150, align: 'center', fixed: 'left' },
  { title: '设备类型', dataIndex: 'type', key: 'type', width: 100, align: 'center' },
  { title: '型号', dataIndex: 'model', key: 'model', width: 130, align: 'center' },
  { title: '设备 ID', dataIndex: 'deviceId', key: 'deviceId', width: 130, align: 'center' },
  { title: '通讯状态', dataIndex: 'onlineStatus', key: 'onlineStatus', width: 100, align: 'center' },
  { title: '设备激活时间', dataIndex: 'activationTime', key: 'activationTime', width: 170, align: 'center' },
  { title: '运行时间 (h)', dataIndex: 'runtime', key: 'runtime', width: 120, align: 'center' },
  { title: '到期时间', dataIndex: 'expiryTime', key: 'expiryTime', width: 130, align: 'center' },
  { title: '剩余天数', key: 'remainingDays', width: 140, align: 'center' },
  { title: '收费周期', dataIndex: 'billingCycle', key: 'billingCycle', width: 100, align: 'center' },
  { title: '周期金额 (元)', dataIndex: 'amount', key: 'amount', width: 120, align: 'center' },
  { title: '当前状态', dataIndex: 'status', key: 'status', width: 110, align: 'center', fixed: 'right' }
];

const deviceList = ref([
  { id: 1, name: '主控网关-01', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW_001', onlineStatus: '在线', activationTime: '2024-03-24 10:00:00', runtime: 17520, expiryTime: '2026-03-24', billingCycle: '年', amount: 500.00, status: 'RUNNING' },
  { id: 2, name: '照明回路开关-A1', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB_042', onlineStatus: '在线', activationTime: '2025-03-28 14:30:00', runtime: 8760, expiryTime: '2026-03-28', billingCycle: '月', amount: 120.00, status: 'GRACE' },
  { id: 3, name: '空调插座-203', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB_105', onlineStatus: '离线', activationTime: '2025-05-12 09:15:00', runtime: 7200, expiryTime: '2026-05-10', billingCycle: '年', amount: 120.00, status: 'RUNNING' },
  { id: 4, name: '备用网关-02', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW_088', onlineStatus: '离线', activationTime: '2025-03-20 16:45:00', runtime: 8700, expiryTime: '2026-03-20', billingCycle: '年', amount: 500.00, status: 'LOCKED' },
  { id: 5, name: '电梯动力监测', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB_201', onlineStatus: '在线', activationTime: '2025-01-20 11:20:00', runtime: 10200, expiryTime: '2027-01-15', billingCycle: '月', amount: 120.00, status: 'RUNNING' },
  { id: 6, name: '公共照明控制', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB_202', onlineStatus: '在线', activationTime: '2025-04-15 08:30:00', runtime: 8000, expiryTime: '2026-04-15', billingCycle: '年', amount: 120.00, status: 'RUNNING' },
  { id: 7, name: '地下停车场网关', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW_095', onlineStatus: '在线', activationTime: '2025-04-05 15:40:00', runtime: 8500, expiryTime: '2026-04-05', billingCycle: '年', amount: 500.00, status: 'GRACE' },
  { id: 8, name: '排污泵控制-B2', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB_305', onlineStatus: '离线', activationTime: '2025-08-22 10:10:00', runtime: 5000, expiryTime: '2026-08-22', billingCycle: '月', amount: 120.00, status: 'RUNNING' },
  { id: 9, name: '楼道指示灯', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB_412', onlineStatus: '在线', activationTime: '2025-02-18 13:50:00', runtime: 9500, expiryTime: '2026-02-18', billingCycle: '月', amount: 120.00, status: 'LOCKED' },
  { id: 10, name: '应急供电切换', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB_510', onlineStatus: '在线', activationTime: '2024-03-25 09:40:00', runtime: 17500, expiryTime: '2027-03-25', billingCycle: '年', amount: 120.00, status: 'RUNNING' }
]);

const pagination = reactive({ 
  current: 1,
  pageSize: 10,
  total: 128,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

const onSearch = () => {
  message.info('执行查询');
};

const onReset = () => {
  searchForm.name = '';
  searchForm.type = undefined;
  searchForm.model = undefined;
  searchForm.deviceId = '';
  searchForm.onlineStatus = undefined;
  searchForm.status = undefined;
  onSearch();
};

const goBack = () => {
  router.push('/finance/agent/expiry-warning');
};
</script>

<style scoped>
.admin-project-device-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

/* 统计卡片样式 */
.stats-cards { margin-bottom: 20px; }
.stat-card {
  background: #fff; padding: 15px; border-radius: 4px; display: flex; align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s;
  height: 100%;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-right: 15px;
}
.stat-title { color: #8c8c8c; font-size: 13px; }
.stat-value { font-size: 20px; font-weight: bold; color: #333; }

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

:deep(.ant-input), :deep(.ant-select-selector), :deep(.ant-picker), :deep(.ant-input-search .ant-input) {
  height: 32px !important;
  font-size: 13px !important;
}

.action-btn {
  border-radius: 4px;
  font-size: 13px;
}

.table-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  flex: 1;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-tag.running {
  background: #eaf5ee;
  color: #1a6b3a;
}

.status-tag.grace {
  background: #fef6e7;
  color: #7a4e00;
}

.status-tag.locked {
  background: #fdeded;
  color: #a32d2d;
}

.expiry-val.overdue, .days-val.overdue {
  color: #ff4d4f;
  font-weight: bold;
}

.expiry-val.warning, .days-val.warning {
  color: #faad14;
  font-weight: bold;
}

.amount-val {
  font-weight: bold;
  color: #333;
}

.footer-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 16px;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
  font-size: 13px !important;
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
