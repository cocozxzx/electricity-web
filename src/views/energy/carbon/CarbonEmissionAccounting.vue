<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6" v-for="stat in stats" :key="stat.title">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-label">{{ stat.title }}</div>
          <div class="stat-value">{{ stat.value }} <small>{{ stat.unit }}</small></div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </a-col>
    </a-row>

    <div class="chart-section">
      <div class="section-title">碳排放来源追踪 (Scope 1/2/3)</div>
      <div ref="chartRef" style="height: 400px;"></div>
    </div>

    <div class="table-container">
      <div class="section-title">企业/园区碳排放核算明细</div>
      <a-table :columns="columns" :data-source="dataList" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'intensity'">
            <span :style="{ color: record.intensity > 1.5 ? '#ff4d4f' : '#333' }">{{ record.intensity }}</span>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === '正常' ? 'green' : 'red'">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const stats = [
  { title: '年度碳排放总量', value: '4280', unit: 'tCO2e', color: '#1890ff', trend: -5.2 },
  { title: 'Scope 1 (直排)', value: '1250', unit: 'tCO2e', color: '#faad14', trend: 2.1 },
  { title: 'Scope 2 (间排)', value: '2830', unit: 'tCO2e', color: '#52c41a', trend: -8.4 },
  { title: 'Scope 3 (价值链)', value: '200', unit: 'tCO2e', color: '#13c2c2', trend: 0.0 },
];

const columns = [
  { title: '核算周期', dataIndex: 'period' },
  { title: '核算对象', dataIndex: 'target' },
  { title: '排放总量 (tCO2e)', dataIndex: 'total' },
  { title: '排放强度 (t/万元)', key: 'intensity', dataIndex: 'intensity' },
  { title: '核算标准', dataIndex: 'standard' },
  { title: '预警状态', key: 'status', dataIndex: 'status' }
];

const dataList = ref([
  { period: '2026-03', target: '全厂', total: 380, intensity: 1.2, standard: 'ISO 14064-1', status: '正常' },
  { period: '2026-03', target: '生产A区', total: 210, intensity: 1.8, standard: '工业企业核算指南', status: '超排预警' },
  { period: '2026-03', target: '办公生活区', total: 45, intensity: 0.5, standard: '公共建筑标准', status: '正常' }
]);

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {},
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value', name: 'tCO2e' },
    series: [
      { name: 'Scope 1', type: 'bar', stack: 'total', data: [120, 132, 101, 134, 90, 230] },
      { name: 'Scope 2', type: 'bar', stack: 'total', data: [220, 182, 191, 234, 290, 330] },
      { name: 'Scope 3', type: 'bar', stack: 'total', data: [50, 40, 45, 60, 55, 70] }
    ]
  });
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => myChart?.resize());
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.stats-row { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 20px; border-radius: 4px; border-left: 4px solid #1890ff; }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.stat-trend { font-size: 12px; }
.stat-trend.up { color: #ff4d4f; }
.stat-trend.down { color: #52c41a; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
