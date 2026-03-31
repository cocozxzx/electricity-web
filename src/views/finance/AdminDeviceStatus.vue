<template>
  <div class="admin-device-status fade-in">
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
          <a-select
            v-model:value="searchForm.status"
            placeholder="请选择运行状态"
            style="width: 200px"
            allow-clear
          >
            <a-select-option value="RUNNING">运行中</a-select-option>
            <a-select-option value="GRACE">宽限期</a-select-option>
            <a-select-option value="LOCKED">已锁定</a-select-option>
          </a-select>
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
            <a class="action-link detail" @click="viewDetail(record)">详情</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

const router = useRouter();
const searchForm = reactive({
  agentName: undefined,
  projectName: '',
  status: undefined
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
  { title: '代理商', dataIndex: 'agentName', key: 'agentName', align: 'center' },
  { title: '所属项目', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '设备总数', dataIndex: 'totalCount', key: 'totalCount', align: 'center' },
  { title: '运行中', dataIndex: 'runningCount', key: 'runningCount', align: 'center' },
  { title: '宽限期', dataIndex: 'graceCount', key: 'graceCount', align: 'center' },
  { title: '已锁定', dataIndex: 'lockedCount', key: 'lockedCount', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 120 }
];

const projectList = ref([
  { id: 1, agentName: '智慧能源代理', projectName: '萧山电力园项目', totalCount: 127, runningCount: 120, graceCount: 5, lockedCount: 2 },
  { id: 2, agentName: '宏图科技代理', projectName: '西湖运行中心', totalCount: 87, runningCount: 85, graceCount: 2, lockedCount: 0 },
  { id: 3, agentName: '智慧能源代理', projectName: '静安中心', totalCount: 227, runningCount: 210, graceCount: 12, lockedCount: 5 },
  { id: 4, agentName: '万众云联科技', projectName: '深圳宝安智慧用电', totalCount: 45, runningCount: 45, graceCount: 0, lockedCount: 0 },
  { id: 5, agentName: '贵阳华旭电气', projectName: '贵阳中心大厦', totalCount: 165, runningCount: 156, graceCount: 8, lockedCount: 1 },
  { id: 6, agentName: '华东大区代理', projectName: '苏州工业园项目', totalCount: 95, runningCount: 92, graceCount: 3, lockedCount: 0 },
  { id: 7, agentName: '南方电网伙伴', projectName: '广州珠江新城监测', totalCount: 330, runningCount: 305, graceCount: 15, lockedCount: 10 },
  { id: 8, agentName: '深圳中兴通讯', projectName: '南山科技园项目', totalCount: 186, runningCount: 178, graceCount: 6, lockedCount: 2 },
  { id: 9, agentName: '成都成电自动化', projectName: '高新孵化器项目', totalCount: 65, runningCount: 64, graceCount: 1, lockedCount: 0 },
  { id: 10, agentName: '武汉烽火科技', projectName: '烽火大厦监控', totalCount: 137, runningCount: 132, graceCount: 4, lockedCount: 1 }
]);

const pagination = reactive({ 
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

const onSearch = () => {
  message.info('执行查询');
};

const onReset = () => {
  searchForm.agentName = undefined;
  searchForm.projectName = '';
  searchForm.status = undefined;
  onSearch();
};

const viewDetail = (record) => {
  router.push({
    name: 'MfrProjectDeviceList',
    query: {
      projectName: record.projectName,
      agentName: record.agentName
    }
  });
};
</script>

<style scoped>
.admin-device-status {
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
