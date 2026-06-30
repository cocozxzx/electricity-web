<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6" v-for="stat in stats" :key="stat.title">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-label">{{ stat.title }}<a-tag v-if="stat.tag" color="blue" class="scope-tag">{{ stat.tag }}</a-tag></div>
          <div class="stat-value">{{ stat.value }} <small>{{ stat.unit }}</small></div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            同比 {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </a-col>
    </a-row>

    <div class="factor-bar">
      <span class="factor-title">排放因子配置</span>
      <span class="factor-item">电网碳排放因子
        <a-input-number v-model:value="gridFactor" :min="0" :step="0.0001" :precision="4" style="width: 130px" @change="refresh" />
        <span class="factor-unit">kgCO₂/kWh</span>
      </span>
      <a-tooltip title="占位默认值 0.5366，需按生态环境部最新公布值校准">
        <span class="factor-hint">默认 0.5366（需按生态环境部最新值校准）</span>
      </a-tooltip>
      <span class="factor-item">周期用电量 <b>{{ totalKWh.toLocaleString() }}</b> kWh</span>
      <span class="factor-item">→ 碳排放 <b class="hl">{{ totalCO2 }}</b> tCO₂（范围二·外购电力）</span>
    </div>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="chart-section">
          <div class="section-title">碳排放趋势与同环比</div>
          <div ref="trendRef" style="height: 360px;"></div>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="chart-section">
          <div class="section-title">来源下钻（项目 / 工序 / 设备）</div>
          <div ref="sunburstRef" style="height: 360px;"></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="table-container">
          <div class="section-title">碳排放核算明细</div>
          <a-table :columns="columns" :data-source="dataList" size="middle" :pagination="false" row-key="target">
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
      </a-col>
      <a-col :span="10">
        <div class="table-container">
          <div class="section-title">超排放预警
            <a-tag color="orange" class="ml-8">阈值 {{ threshold }} tCO₂</a-tag>
          </div>
          <div class="warn-config">
            <span>月度排放阈值</span>
            <a-input-number v-model:value="threshold" :min="0" style="width: 120px" />
            <span class="factor-unit">tCO₂</span>
          </div>
          <a-list :data-source="warnings" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-badge :status="item.level === 'red' ? 'error' : 'warning'" />
                <span class="warn-target">{{ item.target }}</span>
                <span class="warn-text">{{ item.text }}</span>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const gridFactor = ref(0.5366);
const totalKWh = ref(5280000);
const threshold = ref(280);

const totalCO2 = computed(() => (totalKWh.value * gridFactor.value / 1000).toFixed(1));

const stats = computed(() => [
  { title: '年度碳排放总量', value: totalCO2.value, unit: 'tCO₂', color: '#1890ff', trend: -5.2, tag: '范围二' },
  { title: '碳排放强度', value: (Number(totalCO2.value) / 3200).toFixed(2), unit: 'tCO₂/万元', color: '#52c41a', trend: -8.4 },
  { title: '外购电力占比', value: '100', unit: '%', color: '#13c2c2', trend: 0 },
  { title: '本月碳排放', value: '262', unit: 'tCO₂', color: '#faad14', trend: 3.1 }
]);

const columns = [
  { title: '核算周期', dataIndex: 'period' },
  { title: '核算对象', dataIndex: 'target' },
  { title: '用电量(MWh)', dataIndex: 'kwh', align: 'center' },
  { title: '碳排放(tCO₂)', dataIndex: 'total', align: 'center' },
  { title: '强度(t/万元)', key: 'intensity', dataIndex: 'intensity', align: 'center' },
  { title: '预警状态', key: 'status', dataIndex: 'status', align: 'center' }
];

const dataList = ref([
  { period: '2026-03', target: '全厂', kwh: 488, total: 261.9, intensity: 1.2, status: '正常' },
  { period: '2026-03', target: '生产A区', kwh: 270, total: 144.9, intensity: 1.8, status: '超排预警' },
  { period: '2026-03', target: '公辅中心', kwh: 130, total: 69.8, intensity: 0.9, status: '正常' },
  { period: '2026-03', target: '办公生活区', kwh: 58, total: 31.1, intensity: 0.5, status: '正常' }
]);

const warnings = ref([
  { target: '生产A区', text: '本月碳排 144.9 tCO₂，强度超目标 20%', level: 'red' },
  { target: '注塑工序', text: '近 7 日碳排环比上升 12%，建议核查', level: 'orange' }
]);

const trendRef = ref(null);
const sunburstRef = ref(null);
let trendChart = null, sunburstChart = null;

const initCharts = () => {
  trendChart = echarts.init(trendRef.value);
  sunburstChart = echarts.init(sunburstRef.value);
  updateCharts();
};

const updateCharts = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const cur = [220, 182, 191, 234, 290, 262];
  const last = [240, 210, 205, 250, 270, 255];
  trendChart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['本期碳排放', '上年同期', '环比'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', data: months },
    yAxis: [
      { type: 'value', name: 'tCO₂', splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
      { type: 'value', name: '环比%', axisLabel: { formatter: '{value}%' } }
    ],
    series: [
      { name: '本期碳排放', type: 'bar', data: cur, itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] } },
      { name: '上年同期', type: 'bar', data: last, itemStyle: { color: '#bfbfbf', borderRadius: [4, 4, 0, 0] } },
      { name: '环比', type: 'line', yAxisIndex: 1, smooth: true, data: [-8, -17, 5, 22, 24, -10], itemStyle: { color: '#faad14' } }
    ]
  }, true);

  sunburstChart?.setOption({
    tooltip: { formatter: '{b}: {c} tCO₂' },
    series: [{
      type: 'sunburst', radius: ['15%', '95%'],
      label: { minAngle: 12 },
      data: [
        { name: '生产A区', value: 145, itemStyle: { color: '#1890ff' }, children: [
          { name: '注塑工序', value: 80, children: [{ name: '注塑机', value: 50 }, { name: '辅机', value: 30 }] },
          { name: '焊接工序', value: 65 }
        ]},
        { name: '公辅中心', value: 70, itemStyle: { color: '#13c2c2' }, children: [
          { name: '空压站', value: 40 }, { name: '暖通', value: 30 }
        ]},
        { name: '办公生活', value: 31, itemStyle: { color: '#faad14' } }
      ]
    }]
  }, true);
};

const refresh = () => updateCharts();
const handleResize = () => { trendChart?.resize(); sunburstChart?.resize(); };

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose(); sunburstChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.stats-row { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 20px; border-radius: 4px; border-left: 4px solid #1890ff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.scope-tag { margin-left: 6px; transform: scale(0.85); }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.stat-trend { font-size: 12px; margin-top: 4px; }
.stat-trend.up { color: #ff4d4f; }
.stat-trend.down { color: #52c41a; }
.factor-bar { background: #fff; padding: 14px 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; display: flex; align-items: center; flex-wrap: wrap; gap: 18px; }
.factor-title { font-weight: bold; color: #262626; border-left: 4px solid #1890ff; padding-left: 10px; }
.factor-item { font-size: 13px; color: #595959; display: flex; align-items: center; gap: 6px; }
.factor-unit { color: #8c8c8c; font-size: 12px; }
.factor-hint { font-size: 12px; color: #bfbfbf; }
.hl { color: #ff4d4f; font-size: 16px; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.warn-config { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 13px; color: #595959; }
.warn-target { font-weight: bold; margin: 0 8px; }
.warn-text { color: #8c8c8c; font-size: 13px; }
.ml-8 { margin-left: 8px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
