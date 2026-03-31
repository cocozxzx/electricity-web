<template>
  <div class="inspect-record-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item label="所属项目">
          <a-select v-model:value="searchForm.project" placeholder="全部" style="width: 150px" allow-clear>
            <a-select-option value="宝安人才公寓">宝安人才公寓</a-select-option>
            <a-select-option value="天河办公楼">天河办公楼</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="计划名称">
          <a-input v-model:value="searchForm.planName" placeholder="计划名称" />
        </a-form-item>
        <a-form-item label="巡检结果">
          <a-select v-model:value="searchForm.result" placeholder="全部" style="width: 120px" allow-clear>
            <a-select-option value="正常">正常</a-select-option>
            <a-select-option value="异常">异常</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="巡检状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" style="width: 120px" allow-clear>
            <a-select-option value="进行中">进行中</a-select-option>
            <a-select-option value="已结束">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn" @click="handleExport">导出</a-button>
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
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === '进行中' ? 'processing' : 'default'">
              {{ record.status }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'result'">
            <span :style="{ color: record.result === '正常' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }">
              <a-badge :status="record.result === '正常' ? 'success' : 'error'" />
              {{ record.result }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="handleHistory(record)">详情</a>
              <a-popconfirm title="确定删除该巡检记录吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Detail Modal (Historical Timeline View) -->
    <a-modal v-model:visible="historyVisible" :title="`巡检记录详情 - ${currentRecord.planName}`" width="900px" :footer="null" destroy-on-close>
      <div class="history-content">
        <div class="history-stats">
          <a-row :gutter="16">
            <a-col :span="8">
              <div class="stat-card">
                <div class="stat-label">累计巡检</div>
                <div class="stat-value">128 次</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="stat-card">
                <div class="stat-label">本月异常</div>
                <div class="stat-value error">2 次</div>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="stat-card">
                <div class="stat-label">计划完成率</div>
                <div class="stat-value success">100%</div>
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="history-timeline">
          <a-timeline>
            <a-timeline-item v-for="(h, idx) in historyData" :key="idx" :color="h.result === '正常' ? 'green' : 'red'">
              <template #dot v-if="h.result === '异常'">
                <div style="font-size: 16px;">⚠️</div>
              </template>
              <div class="timeline-card" :class="{ 'is-error': h.result === '异常' }">
                <div class="card-header">
                  <span class="time">{{ h.time }}</span>
                  <span class="inspector">执行人：{{ h.inspector }}</span>
                  <span class="res">结果：<span :class="h.result === '正常' ? 'text-success' : 'text-error'">{{ h.result }}</span></span>
                </div>
                
                <!-- Nested Detail Section -->
                <div class="card-body">
                  <div class="detail-sub-section">
                    <div class="sub-title">巡检结果</div>
                    <div class="result-text" :class="{ 'is-error': h.result === '异常' }">
                      {{ h.result === '正常' ? '经现场核查，设备各项运行指标处于正常范围，未发现安全隐患。' : (h.note || '发现异常情况，需进一步处理。') }}
                    </div>
                  </div>
                  
                  <div class="detail-sub-section" v-if="h.images && h.images.length">
                    <div class="sub-title">现场照片</div>
                    <a-space>
                      <a-image v-for="(img, imgIdx) in h.images" :key="imgIdx" :width="80" :src="img" />
                    </a-space>
                  </div>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'

const searchForm = reactive({
  project: undefined,
  planName: '',
  result: undefined,
  status: undefined
})

const columns = [
  { title: '序号', key: 'index', width: 70, align: 'center' },
  { title: '计划编号', dataIndex: 'id', key: 'id', align: 'center' },
  { title: '计划名称', dataIndex: 'planName', key: 'planName', align: 'center' },
  { title: '巡检周期', key: 'period', width: 180, align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '巡检人', dataIndex: 'inspector', key: 'inspector', align: 'center' },
  { title: '巡检状态', key: 'status', align: 'center' },
  // { title: '巡检结果', key: 'result', align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' }
]

const dataSource = ref(Array.from({ length: 15 }).map((_, i) => ({
  id: `REC_20260313_${(i+1).toString().padStart(3, '0')}`,
  planName: i < 5 ? '每日例行巡查' : (i % 3 === 0 ? '月度用电安全检查' : '季度设备性能测试'),
  period: i < 5 ? '每日' : (i % 3 === 0 ? '每月' : '每周'),
  weekDays: i % 3 === 2 ? ['周一', '周三'] : [],
  monthDays: i % 3 === 0 ? [1, 15] : [],
  project: i % 2 === 0 ? '宝安人才公寓' : '天河办公楼',
  inspector: ['张工', '李工', '王工'][i % 3],
  status: i % 2 === 0 ? '进行中' : '已结束',
  result: i === 2 ? '异常' : '正常',
})))

const historyData = ref([
  { 
    time: '2026-03-13 10:30:00', inspector: '张工', result: '正常', note: '', 
    images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
  },
  { 
    time: '2026-03-12 10:15:00', inspector: '李工', result: '异常', note: '发现电表箱温度偏高，最高达78℃，初步判断为过载引起。',
    images: ['https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png', 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'],
  },
  { time: '2026-03-11 09:45:00', inspector: '王工', result: '正常', note: '', images: [] },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})

const historyVisible = ref(false)
const currentRecord = ref({})

const handleHistory = (record) => {
  currentRecord.value = { ...record }
  historyVisible.value = true
}

const handleExport = () => message.info('巡检记录导出中...')

const handleDelete = (record) => {
  dataSource.value = dataSource.value.filter(item => item.id !== record.id)
  message.success('删除成功')
}
</script>

<style scoped>
.inspect-record-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.search-form-container {
  background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1;
}
.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}
.action-btn { border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.action-btn:hover { transform: translateY(-1px); }

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

.history-content { max-height: 700px; overflow-y: auto; padding: 10px; }
.history-stats { margin-bottom: 24px; }
.stat-card { background: #f8f9fb; padding: 16px; border-radius: 8px; border: 1px solid #e6ebf1; text-align: center; }
.stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.stat-value { font-size: 20px; font-weight: bold; color: #333; }
.stat-value.error { color: #ff4d4f; }
.stat-value.success { color: #52c41a; }

.history-timeline { padding: 20px 0; }
.timeline-card { background: #fff; border-radius: 8px; border: 1px solid #e6ebf1; overflow: hidden; margin-bottom: 8px; }
.timeline-card.is-error { border-color: #ffccc7; }
.card-header { padding: 12px 16px; background: #fafafa; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 30px; }
.timeline-card.is-error .card-header { background: #fff2f0; }
.card-header .time { font-weight: bold; font-size: 14px; }
.card-header .inspector, .card-header .res { font-size: 13px; color: #666; }

.card-body { padding: 16px; }
.detail-sub-section { margin-bottom: 16px; }
.detail-sub-section:last-child { margin-bottom: 0; }
.sub-title { font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px; padding-left: 6px; border-left: 3px solid #1890ff; }
.result-text { padding: 12px; background: rgba(82, 196, 26, 0.1); border: 1px solid rgba(82, 196, 26, 0.3); border-radius: 4px; color: #52c41a; font-size: 13px; font-weight: bold; }
.result-text.is-error { background: rgba(255, 77, 79, 0.1); border-color: rgba(255, 77, 79, 0.3); color: #ff4d4f; }

.text-success { color: #52c41a; }
.text-error { color: #ff4d4f; font-weight: bold; }
</style>
