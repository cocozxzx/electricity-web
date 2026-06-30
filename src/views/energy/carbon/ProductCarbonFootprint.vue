<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-form layout="inline">
        <a-form-item label="选择产品">
          <a-select v-model:value="selectedProduct" style="width: 200px" @change="recalc">
            <a-select-option value="p1">智能网关 IoT-GW-Pro</a-select-option>
            <a-select-option value="p2">三相数字电表</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="核算边界">
          <a-select v-model:value="boundary" style="width: 160px">
            <a-select-option value="cradle">摇篮到大门</a-select-option>
            <a-select-option value="grave">摇篮到坟墓</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="recalc">核算足迹</a-button>
          <a-button style="margin-left: 8px" @click="generateReport">生成碳足迹报告</a-button>
          <a-tag color="purple" style="margin-left: 8px">碳标识认证（占位）</a-tag>
        </a-form-item>
      </a-form>
    </div>

    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #1890ff">
          <div class="stat-label">生命周期总碳足迹</div>
          <div class="stat-value">{{ totalFootprint.toFixed(2) }} <small>kgCO₂e/件</small></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #52c41a">
          <div class="stat-label">绿电绿证抵扣</div>
          <div class="stat-value">-{{ greenDeduction.toFixed(2) }} <small>kgCO₂e/件</small></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #faad14">
          <div class="stat-label">抵扣后净碳足迹</div>
          <div class="stat-value hl">{{ netFootprint.toFixed(2) }} <small>kgCO₂e/件</small></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="chart-section">
          <div class="section-title">各阶段碳足迹瀑布图</div>
          <div ref="waterfallRef" style="height: 380px;"></div>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="chart-section">
          <div class="section-title">生命周期阶段占比</div>
          <div ref="pieRef" style="height: 380px;"></div>
        </div>
      </a-col>
    </a-row>

    <div class="table-container">
      <div class="section-title">生命周期阶段数据录入</div>
      <a-table :columns="columns" :data-source="stages" size="middle" :pagination="false" row-key="stage" bordered>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'value'">
            <a-input-number v-model:value="record.value" :min="0" :step="0.1" size="small" style="width: 120px" @change="recalc" />
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.value > 0 ? 'success' : 'default'">{{ record.value > 0 ? '已采集' : '待录入' }}</a-tag>
          </template>
        </template>
      </a-table>

      <div class="green-row">
        <span class="green-title">绿电 / 绿证抵扣录入</span>
        <span class="green-item">绿电用量
          <a-input-number v-model:value="green.kwh" :min="0" style="width: 110px" @change="recalc" /> kWh
        </span>
        <span class="green-item">绿证抵扣
          <a-input-number v-model:value="green.certCO2" :min="0" :step="0.1" style="width: 110px" @change="recalc" /> kgCO₂e
        </span>
        <span class="green-hint">绿电按电网因子 0.5366 kgCO₂/kWh 折算抵扣量</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const GRID_FACTOR = 0.5366;
const selectedProduct = ref('p1');
const boundary = ref('grave');

const columns = [
  { title: '生命周期阶段', dataIndex: 'stage' },
  { title: '主要活动', dataIndex: 'activity' },
  { title: '碳排放(kgCO₂e/件)', key: 'value', width: 160, align: 'center' },
  { title: '数据来源', dataIndex: 'source' },
  { title: '采集状态', key: 'status', align: 'center' }
];

const stages = reactive([
  { stage: '原材料获取', activity: '铝合金外壳、PCB 基板', value: 2.6, source: '供应商提供' },
  { stage: '生产制造', activity: 'SMT 贴片、组装用电', value: 1.8, source: '本厂电表实测' },
  { stage: '运输', activity: '入厂物流、成品配送', value: 0.6, source: '物流测算' },
  { stage: '销售', activity: '仓储、门店用电', value: 0.3, source: '估算' },
  { stage: '使用', activity: '产品全生命周期耗电', value: 0.9, source: '产品功率测算' },
  { stage: '回收处理', activity: '废电子回收处置', value: 0.4, source: '行业系数' }
]);

const green = reactive({ kwh: 1.5, certCO2: 0.2 });

const totalFootprint = computed(() => stages.reduce((s, r) => s + (Number(r.value) || 0), 0));
const greenDeduction = computed(() => (green.kwh * GRID_FACTOR / 1000 * 1000) + Number(green.certCO2 || 0));
const netFootprint = computed(() => Math.max(0, totalFootprint.value - greenDeduction.value));

const waterfallRef = ref(null);
const pieRef = ref(null);
let waterfallChart = null, pieChart = null;

const initCharts = () => {
  waterfallChart = echarts.init(waterfallRef.value);
  pieChart = echarts.init(pieRef.value);
  recalc();
};

const recalc = () => {
  const names = stages.map(s => s.stage);
  // 瀑布图：透明占位 + 实际增量
  let acc = 0;
  const base = [];
  const inc = stages.map(s => {
    base.push(acc);
    acc += Number(s.value) || 0;
    return Number(s.value) || 0;
  });
  waterfallChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => `${p[1].name}<br/>本阶段: ${p[1].value} kgCO₂e<br/>累计: ${(p[0].value + p[1].value).toFixed(2)}` },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: [...names, '绿电抵扣', '净足迹'] },
    yAxis: { type: 'value', name: 'kgCO₂e', splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
    series: [
      { name: '占位', type: 'bar', stack: 'all', itemStyle: { color: 'transparent' },
        data: [...base, Math.max(0, totalFootprint.value - greenDeduction.value), 0] },
      { name: '碳排放', type: 'bar', stack: 'all', barWidth: '50%',
        label: { show: true, position: 'top', formatter: '{c}' },
        data: [
          ...inc.map(v => ({ value: v, itemStyle: { color: '#1890ff' } })),
          { value: greenDeduction.value, itemStyle: { color: '#52c41a' } },
          { value: netFootprint.value, itemStyle: { color: '#faad14' } }
        ] }
    ]
  }, true);

  pieChart?.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} kgCO₂e ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      data: stages.map(s => ({ value: Number(s.value) || 0, name: s.stage }))
    }]
  }, true);
};

const generateReport = () => message.success('产品碳足迹报告（PDF）已生成，可预览/导出');
const handleResize = () => { waterfallChart?.resize(); pieChart?.resize(); };

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  waterfallChart?.dispose(); pieChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.stats-row { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.stat-value.hl { color: #faad14; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.green-row { margin-top: 16px; padding: 14px 16px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; display: flex; align-items: center; flex-wrap: wrap; gap: 18px; }
.green-title { font-weight: bold; color: #389e0d; }
.green-item { font-size: 13px; color: #595959; display: flex; align-items: center; gap: 6px; }
.green-hint { font-size: 12px; color: #8c8c8c; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
