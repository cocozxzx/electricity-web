<template>
  <div class="inspect-plan-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="计划名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入计划名称" />
        </a-form-item>
        <a-form-item label="计划状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" style="width: 150px" allow-clear>
            <a-select-option value="未开始">未开始</a-select-option>
            <a-select-option value="进行中">进行中</a-select-option>
            <a-select-option value="已完成">已完成</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn" @click="handleExport">导出</a-button>
            <a-button type="primary" class="add-btn" @click="handleAdd">
              制定计划
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table 
        :columns="columns" 
        :data-source="dataSource" 
        :pagination="pagination"
        :row-selection="{}"
        row-key="id"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.key === 'period'">
            <div style="line-height: 1.5;">
              <div style="font-weight: bold; color: #1890ff;">{{ record.period }}</div>
              <div v-if="record.period === '每周' && record.weekDays" style="font-size: 12px; color: #666;">
                执行日：{{ record.weekDays.join('、') }}
              </div>
              <div v-if="record.period === '每月' && record.monthDays" style="font-size: 12px; color: #666;">
                执行日：{{ record.monthDays.map(d => d + '号').join('、') }}
              </div>
              <div v-if="record.period === '自定义日期' && record.customDates" style="font-size: 12px; color: #666;">
                共 {{ record.customDates.length }} 天
              </div>
              <div style="font-size: 11px; color: #999; margin-top: 2px;">
                <!-- 有效期：{{ record.dateRange ? record.dateRange.join(' ~ ') : '长期有效' }} -->
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '进行中' ? 'green' : (record.status === '未开始' ? 'cyan' : 'blue')">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a 
                class="action-link detail" 
                :class="{ disabled: record.status === '进行中' || record.status === '已完成' }"
                @click="record.status === '未开始' ? handleEdit(record) : null"
                :style="{ cursor: (record.status === '进行中' || record.status === '已完成') ? 'not-allowed' : 'pointer', opacity: (record.status === '进行中' || record.status === '已完成') ? 0.5 : 1 }"
              >编辑</a>
              <a-popconfirm v-if="record.status === '未开始'" title="确定开始该巡检计划吗？" @confirm="handleStart(record)">
                <a class="action-link detail">开始</a>
              </a-popconfirm>
              <a-popconfirm v-if="record.status === '进行中'" title="确定结束该巡检计划吗？" @confirm="handleEnd(record)">
                <a class="action-link delete">结束</a>
              </a-popconfirm>
              <a-popconfirm title="确定删除该计划吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Add/Edit Plan Modal -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" width="700px" @ok="handleModalOk" ok-text="保存计划" cancel-text="取消" destroy-on-close>
      <a-form :model="planForm" layout="vertical" class="pretty-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="计划名称" required>
              <a-input v-model:value="planForm.name" placeholder="如：旺季每月深度巡检" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目标项目" required>
              <a-select v-model:value="planForm.project" placeholder="请选择">
                <a-select-option value="p1">宝安人才公寓</a-select-option>
                <a-select-option value="p2">天河办公楼</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          
          <a-col :span="12">
            <a-form-item label="周期类型" required>
              <a-select v-model:value="planForm.period" placeholder="请选择" @change="handlePeriodChange">
                <a-select-option value="每日">每日</a-select-option>
                <a-select-option value="每周">每周</a-select-option>
                <a-select-option value="每月">每月</a-select-option>
                <a-select-option value="自定义日期">自定义日期</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24" v-if="planForm.period === '每周'">
            <a-form-item label="执行日 (每周)" required>
              <a-checkbox-group v-model:value="planForm.weekDays" :options="['周一', '周二', '周三', '周四', '周五', '周六', '周日']" />
            </a-form-item>
          </a-col>

          <a-col :span="24" v-if="planForm.period === '每月'">
            <a-form-item label="执行日 (每月)" required>
              <a-select v-model:value="planForm.monthDays" mode="multiple" placeholder="请选择日期" style="width: 100%">
                <a-select-option v-for="n in 31" :key="n" :value="n">{{ n }}号</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="24" v-if="planForm.period === '自定义日期'">
            <a-form-item label="具体执行日期" required>
              <a-date-picker v-model:value="planForm.customDates" multiple value-format="YYYY-MM-DD" placeholder="点击选择日期 (支持多选)" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="指派执行人" required>
              <a-select v-model:value="planForm.manager" placeholder="请选择">
                <a-select-option value="张工">张工</a-select-option>
                <a-select-option value="李工">李工</a-select-option>
                <a-select-option value="陈工">陈工</a-select-option>
                <a-select-option value="王工">王工</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const searchForm = reactive({
  name: '',
  status: undefined
})

const columns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '计划编号', dataIndex: 'id', key: 'id', align: 'center' },
  { title: '计划名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '巡检周期', key: 'period', width: 280, align: 'left' },
  { title: '执行人', dataIndex: 'manager', key: 'manager', align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' }
]

const dataSource = ref(Array.from({ length: 10 }).map((_, i) => ({
  id: `PLN_2026_${(i + 1).toString().padStart(3, '0')}`,
  name: ['月度用电安全检查', '季度设备性能测试', '年度配电房维护', '日常巡查'][i % 4],
  project: i % 2 === 0 ? '宝安人才公寓' : '天河办公楼',
  period: ['每月', '每周', '自定义日期', '每日'][i % 4],
  dateRange: ['2026-03-01', '2026-06-30'],
  weekDays: i % 4 === 1 ? ['周一', '周三', '周五'] : [],
  monthDays: i % 4 === 0 ? [1, 15] : [],
  customDates: i % 4 === 2 ? ['2026-04-05', '2026-05-01'] : [],
  manager: ['张工', '李工', '陈工', '王工'][i % 4],
  status: i % 3 === 0 ? '进行中' : (i % 3 === 1 ? '未开始' : '已完成')
})))

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

// Modal logic
const modalVisible = ref(false)
const modalTitle = ref('新建巡检计划')
const planForm = reactive({
  id: '',
  name: '',
  project: undefined,
  dateRange: undefined,
  period: '每日',
  weekDays: [],
  monthDays: [],
  customDates: [],
  manager: undefined
})

const handlePeriodChange = () => {
  planForm.weekDays = []
  planForm.monthDays = []
  planForm.customDates = []
}

const handleExport = () => message.success('导出成功')

const handleAdd = () => {
  modalTitle.value = '新建巡检计划'
  Object.assign(planForm, { 
    id: '', name: '', project: undefined, dateRange: undefined, 
    period: '每日', weekDays: [], monthDays: [], customDates: [], manager: undefined 
  })
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalTitle.value = '编辑巡检计划'
  Object.assign(planForm, { ...record })
  modalVisible.value = true
}

const handleStart = (record) => {
  record.status = '进行中'
  message.success('计划已开始')
}

const handleEnd = (record) => {
  record.status = '已完成'
  message.success('计划已结束')
}

const handleModalOk = () => {
  if (!planForm.name || !planForm.project || !planForm.period || !planForm.manager) {
    message.warning('请填写必填项')
    return
  }
  message.success('计划保存成功')
  modalVisible.value = false
}

const handleDelete = (record) => {
  dataSource.value = dataSource.value.filter(item => item.id !== record.id)
  message.success('删除成功')
}
</script>

<style scoped>
.inspect-plan-container { height: 100%; }
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
.action-link { font-size: 13px; transition: all 0.2s; }
.action-link:hover { opacity: 0.8; text-decoration: underline; }
.action-link.detail { color: #1890ff; }
.action-link.delete { color: #ff4d4f; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }

.custom-scrollbar :deep(.ant-table-body),
.custom-scrollbar :deep(.ant-table-content) {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}
.custom-scrollbar :deep(::-webkit-scrollbar) { height: 8px; width: 8px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb) { background: #e8e8e8; border-radius: 4px; }
.custom-scrollbar :deep(::-webkit-scrollbar-thumb:hover) { background: #d9d9d9; }
.custom-scrollbar :deep(::-webkit-scrollbar-track) { background: transparent; }

.pretty-form :deep(.ant-form-item-label) { font-weight: bold; }
</style>
