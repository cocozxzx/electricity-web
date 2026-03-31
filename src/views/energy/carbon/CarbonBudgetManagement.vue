<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16">
      <a-col :span="18">
        <div class="chart-section">
          <div class="section-title">用能与碳排放预算预测趋势</div>
          <div ref="chartRef" style="height: 400px;"></div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="chart-section budget-summary">
          <div class="section-title">当前预算执行率</div>
          <div class="progress-wrap">
            <div class="label">能源消费预算 (1500 tce)</div>
            <a-progress type="dashboard" :percent="78" :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }" />
          </div>
          <div class="progress-wrap">
            <div class="label">碳排放预算 (3200 tCO2e)</div>
            <a-progress type="dashboard" :percent="85" :stroke-color="{ '0%': '#f5222d', '100%': '#faad14' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <div class="table-container">
      <div class="section-title">预算管理与动态调整列表</div>
      <a-table :columns="columns" :data-source="dataList" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === '正常' ? 'success' : 'warning'" :text="record.status" />
          </template>
          <template v-if="column.key === 'action'">
            <a @click="adjust(record)">调整预算</a>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const columns = [
  { title: '预算单元', dataIndex: 'unit' },
  { title: '预算周期', dataIndex: 'period' },
  { title: '能源预算 (tce)', dataIndex: 'energyBudget' },
  { title: '已用能源', dataIndex: 'energyUsed' },
  { title: '碳排放预算 (t)', dataIndex: 'carbonBudget' },
  { title: '已用碳排放', dataIndex: 'carbonUsed' },
  { title: '预警状态', key: 'status' },
  { title: '操作', key: 'action' }
];

const dataList = ref([
  { unit: '全厂', period: '2026年Q1', energyBudget: 1500, energyUsed: 1170, carbonBudget: 3200, carbonUsed: 2720, status: '正常' },
  { unit: '生产中心', period: '2026年Q1', energyBudget: 1200, energyUsed: 1050, carbonBudget: 2500, carbonUsed: 2300, status: '紧平衡' },
  { unit: '公辅中心', period: '2026年Q1', energyBudget: 300, energyUsed: 120, carbonBudget: 700, carbonUsed: 420, status: '正常' }
]);

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['历史值', '预测值', '预算上限'] },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月(预)', '5月(预)', '6月(预)'] },
    yAxis: { type: 'value' },
    series: [
      { name: '历史值', type: 'line', data: [820, 932, 901, null, null, null], smooth: true },
      { name: '预测值', type: 'line', data: [null, null, 901, 934, 1290, 1330], lineStyle: { type: 'dashed' }, smooth: true },
      { name: '预算上限', type: 'line', data: [1100, 1100, 1100, 1100, 1100, 1100], itemStyle: { color: '#ff4d4f' }, symbol: 'none' }
    ]
  });
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => myChart?.resize());
});

const adjust = (record) => message.info(`正在为 ${record.unit} 调整预算`);
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.budget-summary { text-align: center; }
.progress-wrap { margin-bottom: 30px; }
.progress-wrap .label { margin-bottom: 10px; font-size: 13px; color: #666; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
