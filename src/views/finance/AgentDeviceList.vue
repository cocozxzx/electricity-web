<template>
  <div class="agent-device-list fade-in">
    <!-- 顶部统计 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="6" v-for="stat in statsCards" :key="stat.title" class="stat-col">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ backgroundColor: stat.bgColor, color: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value" :class="{ 'red-text': stat.isUrgent }">{{ stat.value }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 筛选与操作 -->
    <div class="search-form-container">
      <div class="flex-header">
        <a-tabs v-model:activeKey="activeTab" class="status-tabs" size="small">
          <a-tab-pane key="ALL" tab="全部" />
          <a-tab-pane key="ACTIVE" tab="运行中" />
          <a-tab-pane key="GRACE" tab="宽限期" />
          <a-tab-pane key="LOCKED" tab="已锁定" />
        </a-tabs>
        <div class="right-actions">
          <a-space>
            <a-input-search placeholder="输入设备 ID" style="width: 200px" size="small" />
            <a-select v-model:value="sortBy" style="width: 150px" size="small">
              <a-select-option value="expiryAsc">按到期日升序</a-select-option>
              <a-select-option value="expiryDesc">按到期日降序</a-select-option>
            </a-select>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="section-container table-section">
      <a-table 
        :columns="columns" 
        :data-source="deviceList" 
        :pagination="{ pageSize: 10 }"
        size="small"
        class="ruoyi-table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'expiryDate'">
            <span :class="{ 'red-text': record.remainingDays < 0 }">{{ record.expiryDate }}</span>
          </template>
          <template v-if="column.key === 'remainingDays'">
            <span :class="['days-val', record.remainingDays < 0 ? 'urgent' : '']">
              {{ record.remainingDays < 0 ? '已超期 ' : '' }}{{ Math.abs(record.remainingDays) }}天
            </span>
          </template>
          <template v-if="column.key === 'status'">
            <span :class="['status-tag', record.status.toLowerCase()]">
              {{ record.status === 'ACTIVE' ? '运行中' : (record.status === 'GRACE' ? '宽限期' : '已锁定') }}
            </span>
          </template>
          <template v-if="column.key === 'amount'">
            <span class="amount-val">¥ {{ record.amount.toFixed(2) }}</span>
          </template>
          <template v-if="column.key === 'action'">
            <a @click="viewDetail(record)">详情</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  FieldTimeOutlined, 
  LockOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const activeTab = ref('ALL');
const sortBy = ref('expiryAsc');

const statsCards = [
  { title: '管理设备总数', value: '156', icon: DatabaseOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '运行中', value: '148', icon: SafetyCertificateOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '宽限期', value: '5', icon: FieldTimeOutlined, color: '#faad14', bgColor: '#fff7e6' },
  { title: '已锁定', value: '3', icon: LockOutlined, color: '#ff4d4f', bgColor: '#fff1f0', isUrgent: true },
];

const columns = [
  { title: '设备 ID', dataIndex: 'deviceId', key: 'deviceId', align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '设备类型', dataIndex: 'type', key: 'type', align: 'center' },
  { title: '激活时间', dataIndex: 'activationTime', key: 'activationTime', align: 'center' },
  { title: '到期日', dataIndex: 'expiryDate', key: 'expiryDate', align: 'center' },
  { title: '剩余天数', dataIndex: 'remainingDays', key: 'remainingDays', align: 'center' },
  { title: '费用 (元)', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: '当前状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
];

const deviceList = ref([
  { id: 1, deviceId: 'GW_001', project: '萧山电力园', type: '网关', activationTime: '2023-01-01', expiryDate: '2024-03-20', remainingDays: -4, amount: 500.00, status: 'LOCKED' },
  { id: 2, deviceId: 'SUB_042', project: '西湖运行中心', type: '子设备', activationTime: '2023-02-15', expiryDate: '2024-03-28', remainingDays: 4, amount: 120.00, status: 'GRACE' },
  { id: 3, deviceId: 'GW_088', project: '萧山电力园', type: '网关', activationTime: '2023-05-10', expiryDate: '2024-05-10', remainingDays: 47, amount: 500.00, status: 'ACTIVE' },
  { id: 4, deviceId: 'SUB_105', project: '萧山电力园', type: '子设备', activationTime: '2023-06-01', expiryDate: '2024-06-01', remainingDays: 69, amount: 120.00, status: 'ACTIVE' },
  { id: 5, deviceId: 'SUB_201', project: '静安中心', type: '子设备', activationTime: '2023-01-20', expiryDate: '2025-01-15', remainingDays: 300, amount: 120.00, status: 'ACTIVE' }
]);

const viewDetail = (record) => {
  router.push({ path: '/finance/agent/project-detail', query: { name: record.project } });
};
</script>

<style scoped>
.agent-device-list {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* 统计卡片样式 */
.stats-cards { flex-shrink: 0; margin-bottom: 16px; }
.stat-card {
  background: #fff; padding: 15px; border-radius: 4px; display: flex; align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s;
  height: 100%;
}
.stat-icon {
  width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-right: 15px;
}
.stat-title { color: #8c8c8c; font-size: 13px; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: bold; color: #333; }
.stat-value.red-text { color: #ff4d4f; }

/* 筛选栏 */
.search-form-container {
  background: #fff;
  padding: 0 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid #e6ebf1;
}

.flex-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-tabs :deep(.ant-tabs-nav) { margin-bottom: 0 !important; }

/* 列表区域 */
.section-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.red-text { color: #ff4d4f; font-weight: bold; }
.days-val.urgent { color: #ff4d4f; font-weight: bold; }

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.status-tag.active { background: #eaf5ee; color: #1a6b3a; }
.status-tag.grace { background: #fef6e7; color: #7a4e00; }
.status-tag.locked { background: #fdeded; color: #a32d2d; }

.amount-val { font-weight: bold; color: #333; }

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
}
:deep(.ant-table) { font-size: 12px; }
</style>
