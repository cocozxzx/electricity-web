<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-form layout="inline">
        <a-form-item label="对标维度">
          <a-select v-model:value="benchType" style="width: 150px">
            <a-select-option value="process">工序对标</a-select-option>
            <a-select-option value="product">重点产品对标</a-select-option>
            <a-select-option value="device">重点设备对标</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary">开始对标分析</a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="chart-section">
      <div class="section-title">单位产品能效对标图 (实测 vs 标杆)</div>
      <div ref="chartRef" style="height: 400px;"></div>
    </div>

    <a-row :gutter="16">
      <a-col :span="12">
        <div class="table-container">
          <div class="section-title">节能目标责任评价考核</div>
          <a-table :columns="evalColumns" :data-source="evalData" size="small" :pagination="false" />
        </div>
      </a-col>
      <a-col :span="12">
        <div class="table-container">
          <div class="section-title">重点设备能效等级</div>
          <a-table :columns="deviceColumns" :data-source="deviceData" size="small" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'level'">
                <a-tag :color="record.level === '一级' ? 'green' : (record.level === '二级' ? 'blue' : 'orange')">
                  {{ record.level }}
                </a-tag>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const benchType = ref('process');

const evalColumns = [
  { title: '用能单元', dataIndex: 'unit' },
  { title: '节能目标 (tce)', dataIndex: 'target' },
  { title: '当前进度', dataIndex: 'actual' },
  { title: '考核状态', dataIndex: 'status' }
];

const evalData = [
  { unit: '生产一科', target: 500, actual: '420', status: '进行中' },
  { unit: '生产二科', target: 800, actual: '850', status: '超标' },
  { unit: '动力车间', target: 200, actual: '150', status: '良好' }
];

const deviceColumns = [
  { title: '设备名称', dataIndex: 'name' },
  { title: '实测能效', dataIndex: 'value' },
  { title: '行业标杆', dataIndex: 'benchmark' },
  { title: '能效等级', key: 'level', dataIndex: 'level' }
];

const deviceData = [
  { name: '空压机-01', value: '82%', benchmark: '85%', level: '二级' },
  { name: '冷水机组-A', value: '5.2 COP', benchmark: '5.5 COP', level: '二级' },
  { name: '变压器-T1', value: '98.5%', benchmark: '98%', level: '一级' }
];

const chartRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['本厂实测', '行业先进水平', '行业平均水平'] },
    xAxis: { type: 'category', data: ['工序1', '工序2', '工序3', '工序4', '工序5'] },
    yAxis: { type: 'value', name: 'kWh/t' },
    series: [
      { name: '本厂实测', type: 'bar', data: [45, 52, 38, 65, 42] },
      { name: '行业先进水平', type: 'line', data: [40, 45, 35, 55, 38], lineStyle: { type: 'dashed' } },
      { name: '行业平均水平', type: 'line', data: [50, 55, 45, 70, 50], lineStyle: { type: 'dotted' } }
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
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
