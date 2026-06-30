<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <div class="stat-card" style="border-left: 4px solid #1890ff">
          <div class="stat-label">当前碳配额 (CEA)</div>
          <div class="stat-value">5,200 <small>tCO₂e</small></div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card" style="border-left: 4px solid #52c41a">
          <div class="stat-label">自愿减排量 (CCER)</div>
          <div class="stat-value">1,200 <small>tCO₂e</small></div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card" style="border-left: 4px solid #13c2c2">
          <div class="stat-label">已履约 / 已使用</div>
          <div class="stat-value">5,650 <small>tCO₂e</small></div>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${gap < 0 ? '#ff4d4f' : '#faad14'}` }">
          <div class="stat-label">履约缺口预测</div>
          <div class="stat-value" :class="{ danger: gap < 0 }">{{ gap }} <small>tCO₂e</small></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="9">
        <div class="chart-section">
          <div class="section-title">碳资产构成</div>
          <div ref="pieRef" style="height: 300px;"></div>
        </div>
      </a-col>
      <a-col :span="15">
        <div class="chart-section">
          <div class="section-title">配额使用与预测预警</div>
          <div ref="chartRef" style="height: 300px;"></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="12">
        <div class="table-container">
          <div class="section-title">配额录入</div>
          <a-form layout="vertical">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="履约周期">
                  <a-select v-model:value="entry.period" style="width: 100%">
                    <a-select-option value="2025">2025 年度</a-select-option>
                    <a-select-option value="2026">2026 年度</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="初始核发配额 (tCO₂e)">
                  <a-input-number v-model:value="entry.quota" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-button type="primary" block @click="saveQuota">保存配额并启动预警</a-button>
          </a-form>

          <div class="usage-block">
            <div class="usage-label">本周期配额使用率</div>
            <a-progress :percent="usageRate" :status="usageRate >= 100 ? 'exception' : 'active'"
              :stroke-color="usageRate >= 100 ? '#ff4d4f' : { '0%': '#108ee9', '100%': '#87d068' }" />
            <div class="usage-warn" v-if="usageRate >= 100">
              <ExclamationCircleFilled style="color:#ff4d4f" /> 预测年末配额缺口 {{ Math.abs(gap) }} tCO₂e，建议提前购买 CCER 抵扣
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="table-container">
          <div class="section-title">新周期配额测算</div>
          <a-form layout="vertical">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="预计用电量 (万kWh)">
                  <a-input-number v-model:value="calc.kwh" :min="0" style="width: 100%" @change="recalc" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="基准线法配额系数">
                  <a-input-number v-model:value="calc.coef" :min="0" :step="0.01" style="width: 100%" @change="recalc" />
                </a-form-item>
              </a-col>
            </a-row>
            <div class="calc-result">
              <span>测算可获配额</span>
              <b class="calc-value">{{ calcQuota }}</b>
              <span>tCO₂e</span>
            </div>
            <div class="calc-tip">测算 = 预计用电量(万kWh) × 电网因子 0.5366 × 配额系数</div>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';

const totalAsset = 6400; // CEA + CCER
const used = 5650;
const gap = computed(() => totalAsset - 5850); // 预测年末
const usageRate = computed(() => Math.round((used / totalAsset) * 100));

const entry = reactive({ period: '2025', quota: 5200 });
const calc = reactive({ kwh: 600, coef: 1.05 });
const calcQuota = computed(() => Math.round(calc.kwh * 0.5366 * calc.coef));

const pieRef = ref(null);
const chartRef = ref(null);
let pieChart = null, myChart = null;

const initCharts = () => {
  pieChart = echarts.init(pieRef.value);
  myChart = echarts.init(chartRef.value);

  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂e ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 5200, name: '碳配额 CEA', itemStyle: { color: '#1890ff' } },
        { value: 1200, name: '减排量 CCER', itemStyle: { color: '#52c41a' } }
      ]
    }]
  });

  recalc();
};

const recalc = () => {
  myChart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['累计排放(实际)', '累计排放(预测)', '配额上限'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '14%', containLabel: true },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    yAxis: { type: 'value', name: 'tCO₂e', splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } } },
    series: [
      { name: '累计排放(实际)', type: 'line', smooth: true, data: [400, 850, 1300, 1750, 2200, 2600, null, null, null, null, null, null], itemStyle: { color: '#1890ff' } },
      { name: '累计排放(预测)', type: 'line', smooth: true, lineStyle: { type: 'dashed' },
        data: [null, null, null, null, null, 2600, 3100, 3550, 4050, 4600, 5200, 5850], itemStyle: { color: '#faad14' } },
      { name: '配额上限', type: 'line', symbol: 'none', data: new Array(12).fill(5200), itemStyle: { color: '#ff4d4f' },
        markArea: { itemStyle: { color: 'rgba(255,77,79,0.06)' }, data: [[{ yAxis: 5200 }, { yAxis: 6000 }]] } }
    ]
  }, true);
};

const saveQuota = () => message.success(`已保存 ${entry.period} 年度配额 ${entry.quota} tCO₂e`);
const handleResize = () => { pieChart?.resize(); myChart?.resize(); };

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  pieChart?.dispose(); myChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.stats-row { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.stat-value.danger { color: #ff4d4f; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.usage-block { margin-top: 20px; padding-top: 16px; border-top: 1px dashed #f0f0f0; }
.usage-label { font-size: 13px; color: #595959; margin-bottom: 8px; }
.usage-warn { margin-top: 10px; font-size: 13px; color: #ff4d4f; background: #fff1f0; padding: 8px 12px; border-radius: 4px; }
.calc-result { margin-top: 8px; padding: 14px; background: #e6f7ff; border-radius: 6px; text-align: center; color: #595959; }
.calc-value { font-size: 26px; color: #1890ff; margin: 0 8px; }
.calc-tip { margin-top: 10px; font-size: 12px; color: #8c8c8c; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
