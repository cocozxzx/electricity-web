<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-form layout="inline">
        <a-form-item label="对标对象">
          <a-select v-model:value="benchType" style="width: 150px" @change="refresh">
            <a-select-option value="process">按工序</a-select-option>
            <a-select-option value="product">按重点产品</a-select-option>
            <a-select-option value="device">按重点设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="对标周期">
          <a-select v-model:value="period" style="width: 120px" @change="refresh">
            <a-select-option value="month">本月</a-select-option>
            <a-select-option value="quarter">本季度</a-select-option>
            <a-select-option value="year">本年度</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="refresh">开始对标分析</a-button>
        </a-form-item>
      </a-form>
    </div>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="chart-section">
          <div class="section-title">电耗强度对标（实测 vs 标杆）</div>
          <div class="chart-tip">单位产值电耗（kWh/万元），数值越低越优。</div>
          <div ref="barRef" style="height: 360px;"></div>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="chart-section">
          <div class="section-title">多维能效雷达</div>
          <div class="chart-tip">综合用电效率、负载率、谷电利用率等维度。</div>
          <div ref="radarRef" style="height: 360px;"></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="table-container">
          <div class="section-title">同类{{ benchTypeText }}能效横向排名</div>
          <a-table :columns="rankColumns" :data-source="rankData" size="small" :pagination="false" row-key="name">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'rank'">
                <a-tag :color="index === 0 ? 'green' : (index < 3 ? 'blue' : 'default')">第 {{ index + 1 }} 名</a-tag>
              </template>
              <template v-if="column.key === 'gap'">
                <span :style="{ color: record.gap <= 0 ? '#52c41a' : '#ff4d4f' }">
                  {{ record.gap > 0 ? '+' : '' }}{{ record.gap }}%
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="chart-section">
          <div class="section-title">节能目标完成度</div>
          <div ref="gaugeRef" style="height: 240px;"></div>
          <div class="target-list">
            <div class="target-item" v-for="t in targets" :key="t.unit">
              <span class="t-name">{{ t.unit }}</span>
              <a-progress :percent="t.percent" :status="t.percent >= 100 ? 'exception' : 'active'" size="small" />
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const benchType = ref('process');
const period = ref('month');

const benchTypeText = computed(() => ({ process: '工序', product: '重点产品', device: '设备' }[benchType.value]));

const rankColumns = [
  { title: '排名', key: 'rank', width: 90, align: 'center' },
  { title: '名称', dataIndex: 'name' },
  { title: '实测电耗强度(kWh/万元)', dataIndex: 'value', align: 'center' },
  { title: '行业标杆', dataIndex: 'benchmark', align: 'center' },
  { title: '与标杆差距', key: 'gap', dataIndex: 'gap', align: 'center' }
];

const rankData = ref([
  { name: '注塑工序', value: 86, benchmark: 90, gap: -4.4 },
  { name: '装配工序', value: 95, benchmark: 92, gap: 3.3 },
  { name: '焊接工序', value: 102, benchmark: 95, gap: 7.4 },
  { name: '喷涂工序', value: 78, benchmark: 80, gap: -2.5 },
  { name: '检测工序', value: 65, benchmark: 70, gap: -7.1 }
]);

const targets = ref([
  { unit: '生产一科', percent: 84 },
  { unit: '生产二科', percent: 106 },
  { unit: '动力车间', percent: 72 }
]);

const barRef = ref(null);
const radarRef = ref(null);
const gaugeRef = ref(null);
let barChart = null, radarChart = null, gaugeChart = null;

const initCharts = () => {
  barChart = echarts.init(barRef.value);
  radarChart = echarts.init(radarRef.value);
  gaugeChart = echarts.init(gaugeRef.value);
  updateCharts();
};

const updateCharts = () => {
  const names = rankData.value.map(d => d.name);
  barChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['本厂实测', '行业先进水平', '行业平均水平'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: names },
    yAxis: { type: 'value', name: 'kWh/万元', splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
    series: [
      { name: '本厂实测', type: 'bar', data: rankData.value.map(d => d.value),
        itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] } },
      { name: '行业先进水平', type: 'line', smooth: true, data: rankData.value.map(d => Math.round(d.benchmark * 0.92)),
        lineStyle: { type: 'dashed', color: '#52c41a' }, itemStyle: { color: '#52c41a' } },
      { name: '行业平均水平', type: 'line', smooth: true, data: rankData.value.map(d => Math.round(d.benchmark * 1.1)),
        lineStyle: { type: 'dotted', color: '#faad14' }, itemStyle: { color: '#faad14' } }
    ]
  }, true);

  radarChart?.setOption({
    tooltip: {},
    legend: { data: ['本厂实测', '行业标杆'], bottom: 0 },
    radar: {
      indicator: [
        { name: '用电效率', max: 100 },
        { name: '负载率', max: 100 },
        { name: '功率因数', max: 100 },
        { name: '谷电利用率', max: 100 },
        { name: '设备完好率', max: 100 }
      ],
      radius: '62%'
    },
    series: [{
      type: 'radar',
      data: [
        { value: [82, 75, 88, 60, 90], name: '本厂实测', areaStyle: { color: 'rgba(24,144,255,0.25)' }, itemStyle: { color: '#1890ff' } },
        { value: [90, 85, 92, 80, 95], name: '行业标杆', areaStyle: { color: 'rgba(82,196,26,0.15)' }, itemStyle: { color: '#52c41a' } }
      ]
    }]
  }, true);

  gaugeChart?.setOption({
    series: [{
      type: 'gauge', radius: '90%', center: ['50%', '60%'],
      progress: { show: true, width: 14 },
      axisLine: { lineStyle: { width: 14 } },
      axisLabel: { distance: 18, fontSize: 10 },
      pointer: { width: 5 },
      detail: { valueAnimation: true, formatter: '{value}%', fontSize: 22, offsetCenter: [0, '70%'] },
      data: [{ value: 87, name: '总体目标完成', title: { offsetCenter: [0, '92%'], fontSize: 12 } }]
    }]
  }, true);
};

const refresh = () => updateCharts();

const handleResize = () => { barChart?.resize(); radarChart?.resize(); gaugeChart?.resize(); };

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  barChart?.dispose(); radarChart?.dispose(); gaugeChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.chart-tip { font-size: 12px; color: #8c8c8c; margin-bottom: 12px; padding-left: 14px; }
.target-list { margin-top: 12px; }
.target-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.target-item .t-name { width: 80px; font-size: 13px; color: #595959; }
.target-item :deep(.ant-progress) { flex: 1; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
