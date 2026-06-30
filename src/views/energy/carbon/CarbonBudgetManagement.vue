<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16">
      <a-col :span="18">
        <div class="chart-section">
          <div class="section-title">实际 vs 预算 与预测趋势</div>
          <div class="chart-tip">柱状为实际/预算用能，虚线为模型预测值，红线为预算上限。</div>
          <div ref="chartRef" style="height: 380px;"></div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="chart-section budget-summary">
          <div class="section-title">预算执行率</div>
          <div class="progress-wrap">
            <div class="label">能源消费预算 (1500 tce)</div>
            <a-progress type="dashboard" :percent="78" :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }" />
          </div>
          <div class="progress-wrap">
            <div class="label">碳排放预算 (3200 tCO₂)</div>
            <a-progress type="dashboard" :percent="85" :stroke-color="{ '0%': '#faad14', '100%': '#f5222d' }" />
          </div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="8">
        <div class="table-container">
          <div class="section-title">预算录入</div>
          <a-form layout="vertical">
            <a-form-item label="预算单元">
              <a-select v-model:value="form.unit" style="width: 100%">
                <a-select-option value="全厂">全厂</a-select-option>
                <a-select-option value="生产中心">生产中心</a-select-option>
                <a-select-option value="公辅中心">公辅中心</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="预算周期">
              <a-select v-model:value="form.period" style="width: 100%">
                <a-select-option value="2026年Q1">2026年Q1</a-select-option>
                <a-select-option value="2026年Q2">2026年Q2</a-select-option>
                <a-select-option value="2026年度">2026年度</a-select-option>
              </a-select>
            </a-form-item>
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="能源预算 (tce)">
                  <a-input-number v-model:value="form.energyBudget" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="碳排放预算 (tCO₂)">
                  <a-input-number v-model:value="form.carbonBudget" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary" block @click="saveBudget">保存预算并启动预测预警</a-button>
          </a-form>
        </div>
      </a-col>
      <a-col :span="16">
        <div class="table-container">
          <div class="section-title">预算管理与超预算预警</div>
          <a-table :columns="columns" :data-source="dataList" size="middle" :pagination="false" row-key="unit">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'energyRate'">
                <a-progress :percent="rate(record.energyUsed, record.energyBudget)" size="small"
                  :status="rate(record.energyUsed, record.energyBudget) >= 100 ? 'exception' : 'normal'" />
              </template>
              <template v-if="column.key === 'status'">
                <a-badge :status="lampStatus(record)" :text="lampText(record)" />
              </template>
              <template v-if="column.key === 'action'">
                <a @click="adjust(record)">调整预算</a>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const form = reactive({ unit: '全厂', period: '2026年Q1', energyBudget: 1500, carbonBudget: 3200 });

const columns = [
  { title: '预算单元', dataIndex: 'unit' },
  { title: '周期', dataIndex: 'period' },
  { title: '能源预算(tce)', dataIndex: 'energyBudget', align: 'center' },
  { title: '已用', dataIndex: 'energyUsed', align: 'center' },
  { title: '执行率', key: 'energyRate', width: 160 },
  { title: '预警灯', key: 'status', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
];

const dataList = ref([
  { unit: '全厂', period: '2026年Q1', energyBudget: 1500, energyUsed: 1170, carbonBudget: 3200, carbonUsed: 2720 },
  { unit: '生产中心', period: '2026年Q1', energyBudget: 1200, energyUsed: 1150, carbonBudget: 2500, carbonUsed: 2480 },
  { unit: '公辅中心', period: '2026年Q1', energyBudget: 300, energyUsed: 120, carbonBudget: 700, carbonUsed: 420 }
]);

const rate = (used, budget) => Math.round((used / budget) * 100);
const lampStatus = (r) => {
  const p = rate(r.energyUsed, r.energyBudget);
  if (p >= 100) return 'error';
  if (p >= 90) return 'warning';
  return 'success';
};
const lampText = (r) => {
  const p = rate(r.energyUsed, r.energyBudget);
  if (p >= 100) return '红灯·已超预算';
  if (p >= 90) return '黄灯·临近预算';
  return '绿灯·正常';
};

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['实际用能', '预算用能', '预测值', '预算上限'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月(预)', '5月(预)', '6月(预)'] },
    yAxis: { type: 'value', name: 'tce', splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
    series: [
      { name: '实际用能', type: 'bar', data: [820, 932, 901, null, null, null], itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] } },
      { name: '预算用能', type: 'bar', data: [900, 900, 900, 900, 900, 900], itemStyle: { color: '#d9d9d9', borderRadius: [4, 4, 0, 0] } },
      { name: '预测值', type: 'line', smooth: true, data: [null, null, 901, 934, 1090, 1130], lineStyle: { type: 'dashed' }, itemStyle: { color: '#faad14' } },
      { name: '预算上限', type: 'line', symbol: 'none', data: [1100, 1100, 1100, 1100, 1100, 1100], itemStyle: { color: '#ff4d4f' } }
    ]
  });
};

const saveBudget = () => message.success(`已保存 ${form.unit} ${form.period} 预算并启动预警`);
const adjust = (record) => message.info(`正在为 ${record.unit} 动态调整预算`);
const handleResize = () => myChart?.resize();

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.chart-tip { font-size: 12px; color: #8c8c8c; margin-bottom: 12px; padding-left: 14px; }
.budget-summary { text-align: center; }
.progress-wrap { margin-bottom: 24px; margin-top: 10px; }
.progress-wrap .label { margin-bottom: 10px; font-size: 13px; color: #666; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
