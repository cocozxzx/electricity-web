<template>
  <div class="admin-billing fade-in">
    <!-- 顶部筛选栏 -->
    <div class="search-form-container">
      <a-form layout="inline" class="search-form" :model="searchForm">
        <a-form-item>
          <a-tree-select
            v-model:value="searchForm.agentName"
            placeholder="请选择代理商"
            style="width: 200px"
            :tree-data="agentTreeData"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-input
            v-model:value="searchForm.projectName"
            placeholder="请输入项目名称"
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn" @click="onSearch">查询</a-button>
            <a-button class="action-btn" @click="onReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="PENDING" tab="待核销">
          <a-table 
            :columns="pendingColumns" 
            :data-source="pendingList" 
            :pagination="pagination"
            row-key="id"
            size="middle"
            class="ruoyi-table custom-scrollbar"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'projectName'">
                <div class="project-name-cell" :class="{ 'has-locked': record.lockedCount > 0 }">
                  {{ record.projectName }}
                </div>
              </template>
              <template v-if="column.key === 'debtAmount'">
                <span class="debt-amount">¥ {{ record.debtAmount.toLocaleString() }}</span>
              </template>
              <template v-if="column.key === 'lockedCount'">
                <span v-if="record.lockedCount > 0" class="status-tag locked">
                  <lock-outlined /> {{ record.lockedCount }}
                </span>
                <span v-else>-</span>
              </template>
              <template v-if="column.key === 'graceCount'">
                <span v-if="record.graceCount > 0" class="status-tag grace">
                  {{ record.graceCount }}
                </span>
                <span v-else>-</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="primary" size="small" class="add-btn" :disabled="record.debtAmount === 0" @click="openVerification(record)">
                  核销
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="HISTORY" tab="核销历史">
          <a-table 
            :columns="historyColumns" 
            :data-source="historyList" 
            :pagination="pagination" 
            row-key="id"
            size="middle"
            class="ruoyi-table custom-scrollbar"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">
                <span class="debt-amount">¥ {{ record.amount.toLocaleString() }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a class="action-link detail" @click="viewHistoryDetail(record)">查看详情</a>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 核销弹窗 -->
    <a-modal
      v-model:visible="modalVisible"
      title="执行核销"
      width="800px"
      @ok="handleVerify"
      ok-text="确认核销"
      cancel-text="取消"
      class="custom-modal"
    >
      <div v-if="currentProject" class="modal-content-inner">
        <a-descriptions title="项目信息" :column="2" bordered size="small">
          <a-descriptions-item label="项目名称">{{ currentProject.projectName }}</a-descriptions-item>
          <a-descriptions-item label="代理商">{{ currentProject.agent }}</a-descriptions-item>
        </a-descriptions>

        <div class="modal-section" style="margin-top: 16px;">
          <div class="section-title">欠款明细</div>
          <a-table 
            :columns="detailColumns" 
            :data-source="currentProject.details" 
            :pagination="false" 
            size="small"
            bordered
            class="ruoyi-table"
          />
          <div class="total-bar">
            欠款总额：<span class="total-val">¥ {{ currentProject.debtAmount.toLocaleString() }}</span>
          </div>
        </div>

        <div class="modal-section" style="margin-top: 16px;">
          <div class="section-title">付款凭证</div>
          <div class="voucher-display">
            <div class="voucher-img-placeholder">
              <file-image-outlined style="font-size: 32px; color: #bfbfbf" />
              <div style="margin-top: 8px; color: #8c8c8c">代理商上传的付款凭证.jpg</div>
            </div>
            <a-button type="link" size="small">点击查看原图</a-button>
          </div>
        </div>

        <div class="modal-section" style="margin-top: 16px;">
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="实收金额" required :validate-status="amountError ? 'error' : ''" :help="amountError">
                  <a-input-number 
                    v-model:value="verifyForm.amount" 
                    style="width: 100%" 
                    :input-style="{ textAlign: 'center' }"
                    :min="0"
                    placeholder="必须精确等于欠款总额"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="到账时间">
                  <a-date-picker v-model:value="verifyForm.date" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 历史详情弹窗 -->
    <a-modal
      v-model:visible="historyDetailVisible"
      title="核销详情"
      width="700px"
      :footer="null"
      class="custom-modal"
    >
      <div v-if="selectedHistory" class="modal-content-inner">
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="核销时间">{{ selectedHistory.time }}</a-descriptions-item>
          <a-descriptions-item label="项目名称">{{ selectedHistory.projectName }}</a-descriptions-item>
          <a-descriptions-item label="代理商">{{ selectedHistory.agent }}</a-descriptions-item>
          <a-descriptions-item label="核销金额">¥ {{ selectedHistory.amount.toLocaleString() }}</a-descriptions-item>
          <a-descriptions-item label="解锁设备数">{{ selectedHistory.unlockedCount }}</a-descriptions-item>
          <a-descriptions-item label="操作人">{{ selectedHistory.operator }}</a-descriptions-item>
        </a-descriptions>
        
        <div class="modal-section" style="margin-top: 16px;">
          <div class="section-title">解锁设备列表</div>
          <a-table 
            :columns="unlockColumns" 
            :data-source="mockUnlockData" 
            :pagination="false" 
            size="small"
            class="ruoyi-table"
          />
        </div>
      </div>
    </a-modal>

    <!-- 核销结果展示 -->
    <a-modal v-model:visible="resultVisible" title="核销结果" :footer="null">
      <a-result status="success" title="核销成功" sub-title="欠款已结清，设备已触发解锁">
        <template #extra>
          <div class="unlock-results">
            <div v-for="dev in unlockResults" :key="dev.id" class="result-item">
              <span>{{ dev.id }}</span>
              <span class="new-expiry">新到期日: {{ dev.newExpiry }}</span>
            </div>
          </div>
          <a-button key="console" type="primary" @click="resultVisible = false">完成</a-button>
        </template>
      </a-result>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { LockOutlined, FileImageOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';

const activeTab = ref('PENDING');

const searchForm = reactive({
  agentName: undefined,
  projectName: ''
});

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
]);

const pendingColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '代理商', dataIndex: 'agent', key: 'agent', align: 'center' },
  { title: '欠款金额', dataIndex: 'debtAmount', key: 'debtAmount', align: 'right' },
  { title: '锁定设备数', dataIndex: 'lockedCount', key: 'lockedCount', align: 'center' },
  { title: '宽限期设备数', dataIndex: 'graceCount', key: 'graceCount', align: 'center' },
  { title: '最早到期账单', dataIndex: 'oldestBill', key: 'oldestBill', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 100 }
];

const pendingList = ref([
  { id: 1, projectName: '萧山电力园', agent: '智慧能源', debtAmount: 500, lockedCount: 1, graceCount: 2, oldestBill: '2024-03-20', details: [{ id: 'GW_001', period: '2024-01 ~ 2024-03', amount: 500 }] },
  { id: 2, projectName: '西湖运行中心', agent: '电力工程部', debtAmount: 1200, lockedCount: 0, graceCount: 5, oldestBill: '2024-03-22', details: [{ id: 'GW_088', period: '2024-01 ~ 2024-03', amount: 1200 }] },
  { id: 3, projectName: '静安中心', agent: '智慧能源', debtAmount: 3200, lockedCount: 2, graceCount: 0, oldestBill: '2024-03-15', details: [{ id: 'GW_012', period: '2024-02 ~ 2024-04', amount: 1600 }, { id: 'GW_013', period: '2024-02 ~ 2024-04', amount: 1600 }] },
  { id: 4, projectName: '深圳宝安智慧用电', agent: '万众云联科技', debtAmount: 850, lockedCount: 0, graceCount: 3, oldestBill: '2024-03-18', details: [{ id: 'SUB_056', period: '2024-01 ~ 2024-06', amount: 850 }] },
  { id: 5, projectName: '徐州泉山监测点', agent: '徐州市民宗局', debtAmount: 4500, lockedCount: 5, graceCount: 10, oldestBill: '2024-03-10', details: [{ id: 'GW_X01', period: '2024-01 ~ 2024-12', amount: 4500 }] },
  { id: 6, projectName: '广州珠江新城', agent: '南方电网伙伴', debtAmount: 2100, lockedCount: 1, graceCount: 0, oldestBill: '2024-03-21', details: [{ id: 'GW_GZ02', period: '2024-03 ~ 2024-06', amount: 2100 }] },
  { id: 7, projectName: '苏州工业园', agent: '华东大区代理', debtAmount: 150, lockedCount: 0, graceCount: 1, oldestBill: '2024-03-23', details: [{ id: 'SUB_S12', period: '2024-03 ~ 2024-04', amount: 150 }] },
  { id: 8, projectName: '贵阳中心大厦', agent: '贵阳华旭电气', debtAmount: 600, lockedCount: 0, graceCount: 2, oldestBill: '2024-03-19', details: [{ id: 'GW_GY09', period: '2024-02 ~ 2024-05', amount: 600 }] },
  { id: 9, projectName: '南山科技园', agent: '深圳中兴通讯', debtAmount: 1800, lockedCount: 2, graceCount: 4, oldestBill: '2024-03-12', details: [{ id: 'GW_NS05', period: '2024-01 ~ 2024-06', amount: 1800 }] },
  { id: 10, projectName: '高新孵化器', agent: '成都成电自动化', debtAmount: 950, lockedCount: 0, graceCount: 2, oldestBill: '2024-03-20', details: [{ id: 'GW_CD03', period: '2024-03 ~ 2024-06', amount: 950 }] }
]);

const historyColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center', customRender: ({ index }) => index + 1 },
  { title: '核销时间', dataIndex: 'time', key: 'time', align: 'center' },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '代理商', dataIndex: 'agent', key: 'agent', align: 'center' },
  { title: '核销金额', dataIndex: 'amount', key: 'amount', align: 'center' },
  { title: '解锁设备数', dataIndex: 'unlockedCount', key: 'unlockedCount', align: 'center' },
  { title: '操作人', dataIndex: 'operator', key: 'operator', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 100 }
];

const historyList = ref([
  { id: 101, time: '2024-03-23 10:00:00', projectName: '静安中心', agent: '宏图科技', amount: 8200, unlockedCount: 2, operator: 'admin' },
  { id: 102, time: '2024-03-22 15:30:00', projectName: '烽火大厦', agent: '武汉烽火科技', amount: 4500, unlockedCount: 1, operator: 'admin' },
  { id: 103, time: '2024-03-21 09:15:00', projectName: '杭州科技园', agent: '华东大区代理', amount: 2300, unlockedCount: 0, operator: 'system' },
  { id: 104, time: '2024-03-20 14:00:00', projectName: '中兴工业园', agent: '深圳中兴通讯', amount: 15600, unlockedCount: 5, operator: 'admin' },
  { id: 105, time: '2024-03-19 11:20:00', projectName: '成电科创', agent: '成都成电自动化', amount: 3200, unlockedCount: 1, operator: 'admin' },
  { id: 106, time: '2024-03-18 16:45:00', projectName: '泉山区监测', agent: '徐州市民宗局', amount: 780, unlockedCount: 0, operator: 'admin' },
  { id: 107, time: '2024-03-17 10:10:00', projectName: '高新园区', agent: '南方电网伙伴', amount: 9200, unlockedCount: 3, operator: 'system' },
  { id: 108, time: '2024-03-16 09:00:00', projectName: '万众大厦', agent: '万众云联科技', amount: 5400, unlockedCount: 2, operator: 'admin' },
  { id: 109, time: '2024-03-15 14:30:00', projectName: '珠江商业中心', agent: '南方电网伙伴', amount: 12000, unlockedCount: 4, operator: 'admin' },
  { id: 110, time: '2024-03-14 08:45:00', projectName: '宝安大厦', agent: '万众云联科技', amount: 2100, unlockedCount: 1, operator: 'admin' }
]);

const pagination = reactive({ 
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

const detailColumns = [
  { title: '设备 ID', dataIndex: 'id', key: 'id', align: 'center' },
  { title: '周期', dataIndex: 'period', key: 'period', align: 'center' },
  { title: '金额', dataIndex: 'amount', key: 'amount', align: 'center' }
];

const modalVisible = ref(false);
const currentProject = ref(null);
const verifyForm = reactive({
  amount: 0,
  date: dayjs()
});
const amountError = ref('');

const resultVisible = ref(false);
const unlockResults = ref([]);

const historyDetailVisible = ref(false);
const selectedHistory = ref(null);
const unlockColumns = [
  { title: '设备 ID', dataIndex: 'id', key: 'id', align: 'center' },
  { title: '原到期日', dataIndex: 'oldExpiry', key: 'oldExpiry', align: 'center' },
  { title: '新到期日', dataIndex: 'newExpiry', key: 'newExpiry', align: 'center' }
];
const mockUnlockData = [
  { id: 'GW_001', oldExpiry: '2024-03-20', newExpiry: '2025-03-20' },
  { id: 'SUB_005', oldExpiry: '2024-03-20', newExpiry: '2025-03-20' }
];

const openVerification = (record) => {
  currentProject.value = record;
  verifyForm.amount = record.debtAmount;
  verifyForm.date = dayjs();
  amountError.value = '';
  modalVisible.value = true;
};

const handleVerify = () => {
  if (verifyForm.amount !== currentProject.value.debtAmount) {
    amountError.value = '实收金额必须精确等于欠款总额';
    return;
  }
  
  Modal.confirm({
    title: '确认核销？',
    content: '核销为不可撤销操作，确认收到款项后执行。',
    onOk() {
      // 模拟核销过程
      message.loading('正在处理...', 1).then(() => {
        modalVisible.value = false;
        unlockResults.value = [
          { id: 'GW_001', newExpiry: '2025-03-23' }
        ];
        resultVisible.value = true;
        // 更新列表
        pendingList.value = pendingList.value.filter(p => p.id !== currentProject.value.id);
      });
    }
  });
};

const onSearch = () => {
  message.info('执行查询');
};

const onReset = () => {
  searchForm.agentName = undefined;
  searchForm.projectName = '';
  onSearch();
};

const viewHistoryDetail = (record) => {
  selectedHistory.value = record;
  historyDetailVisible.value = true;
};
</script>

<style scoped>
.admin-billing {
  height: calc(100vh - 84px); /* Adjust based on top layout height if known, or use 100% */
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex-shrink: 0;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.ant-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.ant-tabs-content), :deep(.ant-tabs-tabpane) {
  height: 100%;
}

:deep(.ant-table-wrapper) {
  height: 100%;
}

.project-name-cell {
  position: relative;
  padding-left: 12px;
}

.project-name-cell.has-locked::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  /* background: #ff4d4f; */
  border-radius: 2px;
}

.debt-amount {
  color: #cf1322;
  font-weight: bold;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-tag.locked {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffa39e;
}

.status-tag.grace {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}

.total-bar {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
}

.total-val {
  color: #cf1322;
  font-size: 18px;
}

.unlock-results {
  text-align: left;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.new-expiry {
  color: #52c41a;
}

.modal-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.voucher-display {
  padding: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  text-align: center;
}

.voucher-img-placeholder {
  width: 100%;
  height: 120px;
  background: #fff;
  border: 1px dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.action-link {
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
}

.action-link.detail {
  color: #1890ff;
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
