<template>
  <div class="agent-project-detail fade-in">
    <!-- 顶部数据统计 -->
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

    <a-row :gutter="16" class="main-content">
      <!-- 左侧：设备列表 -->
      <a-col :span="15">
        <div class="section-container table-section">
          <div class="section-header">
            <div class="section-title">项目设备详情 - {{ projectName }}</div>
            <a-space>
              <a-input-search placeholder="设备 ID" style="width: 200px" size="small" />
              <a-button size="small" @click="$router.back()">返回</a-button>
            </a-space>
          </div>
          <a-table 
            :columns="deviceColumns" 
            :data-source="deviceList" 
            :pagination="{ pageSize: 8 }"
            size="small"
            class="ruoyi-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <span :class="['status-tag', record.status.toLowerCase()]">
                  {{ record.status === 'ACTIVE' ? '运行中' : (record.status === 'GRACE' ? '宽限期' : '已锁定') }}
                </span>
              </template>
              <template v-if="column.key === 'amount'">
                <span class="amount-val">¥ {{ record.amount.toFixed(2) }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>

      <!-- 右侧：账本与支付 -->
      <a-col :span="9">
        <div class="right-column-wrapper">
          <!-- 账本流水 -->
          <div class="section-container ledger-section">
            <div class="section-header">
              <div class="section-title">账本流水</div>
            </div>
            <div class="timeline-wrapper custom-scrollbar">
              <a-timeline>
                <a-timeline-item v-for="event in ledgerEvents" :key="event.id" :color="event.type === 'BILL' ? 'red' : 'green'">
                  <div class="event-item">
                    <div class="event-time">{{ event.time }}</div>
                    <div class="event-content">
                      <span class="event-type">{{ event.typeName }}</span>
                      <span :class="['event-amount', event.type === 'BILL' ? 'add' : 'sub']">
                        {{ event.type === 'BILL' ? '+' : '-' }} ¥ {{ event.amount }}
                      </span>
                    </div>
                    <div class="event-desc">{{ event.desc }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </div>

          <!-- 付款核销 -->
          <div class="section-container payment-section" v-if="debtAmount > 0">
            <div class="section-header">
              <div class="section-title">付款核销</div>
            </div>
            <div class="payment-box">
              <div class="payment-info">
                <div class="info-row">
                  <span class="label">应付总额:</span>
                  <span class="val red-text">¥ {{ debtAmount.toLocaleString() }}</span>
                </div>
                <div class="info-row">
                  <span class="label">凭证状态:</span>
                  <a-tag :color="proofUploaded ? 'processing' : 'default'">
                    {{ proofUploaded ? '审核中' : '未提交' }}
                  </a-tag>
                </div>
              </div>
              <div class="payment-actions">
                <a-upload
                  v-if="!proofUploaded"
                  name="file"
                  :multiple="false"
                  @change="handleUpload"
                  :showUploadList="false"
                >
                  <a-button type="primary" block>
                    <upload-outlined /> 上传付款凭证
                  </a-button>
                </a-upload>
                <a-button v-else type="primary" ghost block disabled>凭证审核中</a-button>
                <div class="payment-tip">上传凭证后，厂家将在 1-2 个工作日内完成核销</div>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  DatabaseOutlined, 
  SafetyCertificateOutlined, 
  FieldTimeOutlined, 
  LockOutlined,
  UploadOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const projectName = ref(route.query.name || '萧山电力园项目');
const debtAmount = ref(1500);
const proofUploaded = ref(false);

const statsCards = [
  { title: '设备总数', value: '50', icon: DatabaseOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '运行中', value: '47', icon: SafetyCertificateOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '宽限期', value: '0', icon: FieldTimeOutlined, color: '#faad14', bgColor: '#fff7e6' },
  { title: '已锁定', value: '3', icon: LockOutlined, color: '#ff4d4f', bgColor: '#fff1f0', isUrgent: true },
];

const deviceColumns = [
  { title: '设备 ID', dataIndex: 'deviceId', key: 'deviceId', align: 'center' },
  { title: '类型', dataIndex: 'type', key: 'type', align: 'center' },
  { title: '到期日', dataIndex: 'expiryDate', key: 'expiryDate', align: 'center' },
  { title: '费用 (元)', dataIndex: 'amount', key: 'amount', align: 'right' },
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center' }
];

const deviceList = ref([
  { id: 1, deviceId: 'GW_001', type: '网关', expiryDate: '2024-03-20', amount: 500, status: 'LOCKED' },
  { id: 2, deviceId: 'SUB_101', type: '子设备', expiryDate: '2024-03-20', amount: 500, status: 'LOCKED' },
  { id: 3, deviceId: 'SUB_102', type: '子设备', expiryDate: '2024-03-20', amount: 500, status: 'LOCKED' },
  { id: 4, deviceId: 'GW_005', type: '网关', expiryDate: '2025-03-24', amount: 500, status: 'ACTIVE' },
  { id: 5, deviceId: 'SUB_201', type: '子设备', expiryDate: '2025-01-15', amount: 120, status: 'ACTIVE' },
  { id: 6, deviceId: 'SUB_202', type: '子设备', expiryDate: '2025-04-15', amount: 120, status: 'ACTIVE' },
  { id: 7, deviceId: 'GW_095', type: '网关', expiryDate: '2024-06-05', amount: 500, status: 'ACTIVE' },
  { id: 8, deviceId: 'SUB_305', type: '子设备', expiryDate: '2024-08-22', amount: 120, status: 'ACTIVE' }
]);

const ledgerEvents = ref([
  { id: 1, time: '2024-03-23 10:00', type: 'VERIFY', typeName: '核销完成', amount: 3000, desc: '厂家(admin)完成核销，解锁设备 GW_005' },
  { id: 2, time: '2024-03-20 00:00', type: 'BILL', typeName: '账单追加', amount: 500, desc: '设备 GW_001 到期出账' },
  { id: 3, time: '2024-03-20 00:00', type: 'BILL', typeName: '账单追加', amount: 500, desc: '设备 SUB_101 到期出账' },
  { id: 4, time: '2024-03-20 00:00', type: 'BILL', typeName: '账单追加', amount: 500, desc: '设备 SUB_102 到期出账' },
  { id: 5, time: '2023-12-31 15:00', type: 'VERIFY', typeName: '期初核销', amount: 1500, desc: '季度清算完成' }
]);

const handleUpload = (info) => {
  if (info.file.status === 'uploading') return;
  message.success('凭证上传成功，等待厂家审核');
  proofUploaded.value = true;
};
</script>

<style scoped>
.agent-project-detail {
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
.stat-col { margin-bottom: 0; }
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

/* 主内容区域 */
.main-content {
  flex: 1;
  min-height: 0;
}

.section-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-section {
  overflow: hidden;
}

.right-column-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.ledger-section {
  flex: 1;
  min-height: 0;
}

.payment-section {
  flex-shrink: 0;
  height: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

/* 状态标签 */
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

/* 账本时间线 */
.timeline-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.event-item { margin-bottom: 4px; }
.event-time { font-size: 11px; color: #8c8c8c; }
.event-content { display: flex; justify-content: space-between; align-items: center; margin: 4px 0; }
.event-type { font-weight: bold; font-size: 13px; }
.event-amount { font-weight: bold; }
.event-amount.add { color: #ff4d4f; }
.event-amount.sub { color: #52c41a; }
.event-desc { font-size: 12px; color: #595959; }

/* 支付盒子 */
.payment-box {
  background: #f8f9fb;
  padding: 16px;
  border-radius: 4px;
}
.payment-info { margin-bottom: 16px; }
.info-row { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
.info-row .label { color: #8c8c8c; }
.info-row .val { font-size: 18px; font-weight: bold; }
.red-text { color: #ff4d4f; }

.payment-tip {
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 8px;
  text-align: center;
}

/* 滚动条 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 3px; }

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
}
:deep(.ant-table) { font-size: 12px; }
</style>
