<template>
  <div class="carbon-page fade-in">
    <div class="chart-section sankey-section">
      <div class="section-title">全过程能流图 (桑基图)</div>
      <div class="chart-tip">展示能源从“购入”到“转换”再到“分配利用”的全过程流动及损耗。</div>
      <div ref="sankeyRef" style="height: 500px;"></div>
    </div>

    <div class="table-container">
      <div class="section-title">企业能源平衡表</div>
      <a-table :columns="balanceColumns" :data-source="balanceData" size="middle" :pagination="false" bordered>
        <template #headerCell="{ column }">
          <span style="font-weight: bold">{{ column.title }}</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const balanceColumns = [
  { title: '能源种类', dataIndex: 'type', key: 'type', width: 120 },
  { title: '购入贮存', children: [
    { title: '期初', dataIndex: 'start' },
    { title: '购入', dataIndex: 'buy' },
    { title: '期末', dataIndex: 'end' }
  ]},
  { title: '加工转换', children: [
    { title: '投入', dataIndex: 'input' },
    { title: '产出', dataIndex: 'output' }
  ]},
  { title: '最终消费', dataIndex: 'consume' },
  { title: '损耗', dataIndex: 'loss' }
];

const balanceData = [
  { type: '电力 (MWh)', start: 0, buy: 1500, end: 0, input: 200, output: 180, consume: 1280, loss: 20 },
  { type: '天然气 (kNm³)', start: 10, buy: 500, end: 15, input: 400, output: 350, consume: 95, loss: 10 },
  { type: '原煤 (t)', start: 500, buy: 0, end: 420, input: 80, output: 0, consume: 0, loss: 0 }
];

const sankeyRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(sankeyRef.value);
  myChart.setOption({
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
      type: 'sankey',
      data: [
        { name: '购入电力' }, { name: '购入燃气' }, { name: '自产光伏' },
        { name: '变配电' }, { name: '锅炉房' },
        { name: '生产线A' }, { name: '生产线B' }, { name: '空压站' }, { name: '办公生活' },
        { name: '能效损耗' }
      ],
      links: [
        { source: '购入电力', target: '变配电', value: 1000 },
        { source: '自产光伏', target: '变配电', value: 200 },
        { source: '购入燃气', target: '锅炉房', value: 500 },
        { source: '变配电', target: '生产线A', value: 600 },
        { source: '变配电', target: '生产线B', value: 400 },
        { source: '变配电', target: '办公生活', value: 100 },
        { source: '变配电', target: '能效损耗', value: 100 },
        { source: '锅炉房', target: '生产线A', value: 300 },
        { source: '锅炉房', target: '能效损耗', value: 200 }
      ],
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'gradient', curveness: 0.5 }
    }]
  });
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => myChart?.resize());
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.chart-tip { font-size: 13px; color: #8c8c8c; margin-bottom: 20px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
