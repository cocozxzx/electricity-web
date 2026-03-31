<template>
  <div class="agent-expiry-warning fade-in">
    <!-- 顶部筛选栏 -->
    <div class="search-form-container">
      <a-form layout="inline" class="search-form" :model="searchForm">
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
  projectName: '',
  status: undefined
});

const projectColumns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '所属项目', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '设备总数', dataIndex: 'totalCount', key: 'totalCount', align: 'center' },
  { title: '运行中', dataIndex: 'runningCount', key: 'runningCount', align: 'center' },
  { title: '宽限期', dataIndex: 'graceCount', key: 'graceCount', align: 'center' },
  { title: '已锁定', dataIndex: 'lockedCount', key: 'lockedCount', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 120 }
];

const projectList = ref([
  { id: 1, projectName: '萧山电力园项目', totalCount: 127, runningCount: 120, graceCount: 5, lockedCount: 2 },
  { id: 2, projectName: '西湖运行中心', totalCount: 87, runningCount: 85, graceCount: 2, lockedCount: 0 },
  { id: 3, projectName: '静安中心', totalCount: 227, runningCount: 210, graceCount: 12, lockedCount: 5 },
  { id: 4, projectName: '深圳宝安智慧用电', totalCount: 45, runningCount: 45, graceCount: 0, lockedCount: 0 },
  { id: 5, projectName: '苏州工业园项目', totalCount: 95, runningCount: 92, graceCount: 3, lockedCount: 0 },
  { id: 1, projectName: '萧山电力园项目', totalCount: 127, runningCount: 120, graceCount: 5, lockedCount: 2 },
  { id: 2, projectName: '西湖运行中心', totalCount: 87, runningCount: 85, graceCount: 2, lockedCount: 0 },
  { id: 3, projectName: '静安中心', totalCount: 227, runningCount: 210, graceCount: 12, lockedCount: 5 },
  { id: 4, projectName: '深圳宝安智慧用电', totalCount: 45, runningCount: 45, graceCount: 0, lockedCount: 0 },
  { id: 5, projectName: '苏州工业园项目', totalCount: 95, runningCount: 92, graceCount: 3, lockedCount: 0 }
]);

const pagination = reactive({ 
  current: 1,
  pageSize: 10,
  total: 5,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
});

const onSearch = () => {
  message.info('执行查询');
};

const onReset = () => {
  searchForm.projectName = '';
  searchForm.status = undefined;
  onSearch();
};

const viewDetail = (record) => {
  router.push({
    path: '/finance/agent/expiry-detail',
    query: { name: record.projectName }
  });
};
</script>

<style scoped>
.agent-expiry-warning {
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
