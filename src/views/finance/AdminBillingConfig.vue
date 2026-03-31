<template>
  <div class="admin-billing-config fade-in">
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

    <!-- 项目列表 -->
    <div class="table-container">
      <a-table 
        :columns="projectColumns" 
        :data-source="projectList" 
        :pagination="pagination"
        row-key="id"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a class="action-link detail" @click="openConfig(record)">配置定价与宽限期</a>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 配置弹窗 -->
    <a-modal
      v-model:visible="configVisible"
      :title="`项目配置: ${currentProject?.projectName}`"
      width="800px"
      @ok="handleSaveConfig"
      ok-text="确认"
      cancel-text="取消"
      class="custom-modal"
    >
      <div v-if="currentProject">
        <!-- 设备定价配置 -->
        <div class="modal-section">
          <div class="section-header">
            <span class="section-title">设备定价配置</span>
            <a-button type="primary" size="small" class="add-btn" @click="openAddType">新增设备类型</a-button>
          </div>
          <a-table 
            :columns="pricingColumns" 
            :data-source="currentProject.pricingData" 
            :pagination="false" 
            row-key="type"
            size="small"
            class="ruoyi-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'dayRate'">
                <a-input-number v-model:value="record.dayRate" :min="0" style="width: 100%" />
              </template>
              <template v-if="column.key === 'yearRate'">
                <a-input-number v-model:value="record.yearRate" :min="0" style="width: 100%" />
              </template>
              <template v-if="column.key === 'action'">
                <a-popconfirm
                  title="确定要删除该设备类型定价吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="removePricing(record)"
                >
                  <a class="action-link delete">删除</a>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <!-- 基础配置 -->
        <div class="modal-section" style="margin-top: 24px;">
          <div class="section-title" style="margin-bottom: 16px;">基础配置</div>
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="收费周期">
                  <a-space>
                    <a-input-number v-model:value="currentProject.billingValue" :min="1" style="width: 80px" />
                    <a-select v-model:value="currentProject.billingCycle" style="width: 100px">
                      <a-select-option value="月">月</a-select-option>
                      <a-select-option value="年">年</a-select-option>
                    </a-select>
                  </a-space>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="宽限天数" extra="仅对本项目生效。">
                  <a-input-number v-model:value="currentProject.graceDays" :min="1" :max="30" style="width: 100px" />
                  <span class="unit" style="margin-left: 8px;">天</span>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>
    </a-modal>

    <!-- 新增类型弹窗 -->
    <a-modal 
      v-model:visible="addModalVisible" 
      title="新增设备类型" 
      @ok="handleAddType"
      ok-text="确认"
      cancel-text="取消"
      class="custom-modal"
    >
      <a-form layout="vertical">
        <a-form-item label="类型名称" required>
          <a-select v-model:value="newType.name" placeholder="请选择设备类型">
            <a-select-option value="网关">网关</a-select-option>
            <a-select-option value="子设备">子设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日费率 (元)">
          <a-input-number v-model:value="newType.dayRate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="年费标准 (元)">
          <a-input-number v-model:value="newType.yearRate" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';

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

const projectColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '代理商名称', dataIndex: 'agentName', key: 'agentName', align: 'center' },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '宽限期', dataIndex: 'graceDays', key: 'graceDays', align: 'center', customRender: ({ text }) => `${text}天` },
  { title: '收费周期', dataIndex: 'billingCycle', key: 'billingCycle', align: 'center', customRender: ({ record }) => `${record.billingValue || 1}${record.billingCycle}` },
  { title: '最近修改时间', dataIndex: 'updateTime', key: 'updateTime', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 180 }
];

const projectList = ref([
  { id: 1, agentName: '智慧能源代理', projectName: '萧山电力园项目', graceDays: 7, billingCycle: '年', billingValue: 1, updateTime: '2024-03-20 15:30', pricingData: [{ type: '网关', dayRate: 2.00, yearRate: 600 }, { type: '子设备', dayRate: 0.50, yearRate: 150 }] },
  { id: 2, agentName: '宏图科技代理', projectName: '西湖运行中心', graceDays: 5, billingCycle: '月', billingValue: 1, updateTime: '2024-03-21 10:00', pricingData: [{ type: '网关', dayRate: 2.20, yearRate: 650 }, { type: '子设备', dayRate: 0.60, yearRate: 180 }] },
  { id: 3, agentName: '智慧能源代理', projectName: '静安中心', graceDays: 7, billingCycle: '年', billingValue: 1, updateTime: '2024-03-18 14:20', pricingData: [{ type: '网关', dayRate: 2.00, yearRate: 600 }, { type: '子设备', dayRate: 0.50, yearRate: 150 }] },
  { id: 4, agentName: '万众云联科技', projectName: '深圳宝安智慧用电', graceDays: 10, billingCycle: '月', billingValue: 1, updateTime: '2024-03-15 09:00', pricingData: [{ type: '网关', dayRate: 2.50, yearRate: 700 }, { type: '子设备', dayRate: 0.80, yearRate: 200 }] },
  { id: 5, agentName: '贵阳华旭电气', projectName: '贵阳中心大厦', graceDays: 7, billingCycle: '年', billingValue: 1, updateTime: '2024-03-16 11:30', pricingData: [{ type: '网关', dayRate: 2.00, yearRate: 600 }, { type: '子设备', dayRate: 0.50, yearRate: 150 }] },
  { id: 6, agentName: '华东大区代理', projectName: '苏州工业园项目', graceDays: 5, billingCycle: '月', billingValue: 1, updateTime: '2024-03-17 14:45', pricingData: [{ type: '网关', dayRate: 2.10, yearRate: 620 }, { type: '子设备', dayRate: 0.55, yearRate: 160 }] },
  { id: 7, agentName: '南方电网伙伴', projectName: '广州珠江新城监测', graceDays: 15, billingCycle: '年', billingValue: 1, updateTime: '2024-03-18 10:10', pricingData: [{ type: '网关', dayRate: 3.00, yearRate: 800 }, { type: '子设备', dayRate: 1.00, yearRate: 300 }] },
  { id: 8, agentName: '深圳中兴通讯', projectName: '南山科技园项目', graceDays: 7, billingCycle: '月', billingValue: 1, updateTime: '2024-03-19 16:20', pricingData: [{ type: '网关', dayRate: 2.30, yearRate: 680 }, { type: '子设备', dayRate: 0.70, yearRate: 190 }] },
  { id: 9, agentName: '成都成电自动化', projectName: '高新孵化器项目', graceDays: 5, billingCycle: '年', billingValue: 1, updateTime: '2024-03-20 13:50', pricingData: [{ type: '网关', dayRate: 2.00, yearRate: 600 }, { type: '子设备', dayRate: 0.50, yearRate: 150 }] },
  { id: 10, agentName: '武汉烽火科技', projectName: '烽火大厦监控', graceDays: 7, billingCycle: '月', billingValue: 1, updateTime: '2024-03-21 08:40', pricingData: [{ type: '网关', dayRate: 2.40, yearRate: 720 }, { type: '子设备', dayRate: 0.75, yearRate: 210 }] }
]);

const pagination = reactive({ 
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

const configVisible = ref(false);
const currentProject = ref(null);

const pricingColumns = [
  { title: '设备类型', dataIndex: 'type', key: 'type', align: 'center' },
  { title: '日费率 (元)', dataIndex: 'dayRate', key: 'dayRate', align: 'center' },
  { title: '年费标准 (元)', dataIndex: 'yearRate', key: 'yearRate', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 80 }
];

const openConfig = (record) => {
  // 深拷贝防止直接修改原数据
  currentProject.value = JSON.parse(JSON.stringify(record));
  configVisible.value = true;
};

const handleSaveConfig = () => {
  const index = projectList.value.findIndex(p => p.id === currentProject.value.id);
  if (index !== -1) {
    projectList.value[index] = JSON.parse(JSON.stringify(currentProject.value));
    projectList.value[index].updateTime = new Date().toLocaleString();
  }
  configVisible.value = false;
  message.success('配置已保存');
};

const addModalVisible = ref(false);
const newType = reactive({ name: undefined, dayRate: 0, yearRate: 0 });

const openAddType = () => {
  newType.name = undefined;
  newType.dayRate = 0;
  newType.yearRate = 0;
  addModalVisible.value = true;
};

const handleAddType = () => {
  if (!newType.name) return message.error('请选择设备类型');
  // Check if type already exists
  if (currentProject.value.pricingData.some(p => p.type === newType.name)) {
    return message.error('该设备类型已存在');
  }
  currentProject.value.pricingData.push({
    type: newType.name,
    dayRate: newType.dayRate,
    yearRate: newType.yearRate
  });
  addModalVisible.value = false;
};

const removePricing = (record) => {
  currentProject.value.pricingData = currentProject.value.pricingData.filter(p => p.type !== record.type);
  message.success('已删除');
};

const onSearch = () => {
  message.info('执行查询');
};

const onReset = () => {
  searchForm.agentName = undefined;
  searchForm.projectName = '';
  onSearch();
};
</script>

<style scoped>
.admin-billing-config {
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
}

.action-link {
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
}

.action-link.detail {
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

.modal-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.unit {
  color: #8c8c8c;
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
