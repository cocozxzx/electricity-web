<template>
  <div class="carbon-page fade-in">
    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #1890ff">
          <div class="stat-label">当前碳配额 (CEA)</div>
          <div class="stat-value">5,200 <small>tCO2e</small></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #52c41a">
          <div class="stat-label">自愿减排量 (CCER)</div>
          <div class="stat-value">1,200 <small>tCO2e</small></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stat-card" style="border-left: 4px solid #faad14">
          <div class="stat-label">履约缺口预测</div>
          <div class="stat-value">-450 <small>tCO2e</small></div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="chart-section">
          <div class="section-title">碳资产价值与配额使用预测</div>
          <div ref="chartRef" style="height: 400px;"></div>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="table-container">
          <div class="section-title">配额录入与测算</div>
          <a-form layout="vertical">
            <a-form-item label="履约周期">
              <a-select defaultValue="2025">
                <a-select-option value="2025">2025年度</a-select-option>
                <a-select-option value="2026">2026年度(测算)</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="初始核发配额 (tCO2e)">
              <a-input-number style="width: 100%" />
            </a-form-item>
            <a-button type="primary" block>保存并开始预测预警</a-button>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['累计排放量', '配额上限'] },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] },
    yAxis: { type: 'value', name: 'tCO2e' },
    series: [
      { name: '累计排放量', type: 'line', data: [400, 850, 1300, 1750, 2200, 2600, 3100, 3550, 4000, 4450, 4900, 5350], smooth: true },
      { name: '配额上限', type: 'line', data: [5200, 5200, 5200, 5200, 5200, 5200, 5200, 5200, 5200, 5200, 5200, 5200], itemStyle: { color: 'red' }, symbol: 'none' }
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
.stat-card { background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
