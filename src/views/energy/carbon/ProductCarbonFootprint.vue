<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-form layout="inline">
        <a-form-item label="选择产品">
          <a-select v-model:value="selectedProduct" style="width: 200px">
            <a-select-option value="p1">智能网关 IoT-GW-Pro</a-select-option>
            <a-select-option value="p2">三相数字电表</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary">核算足迹</a-button>
          <a-button style="margin-left: 8px" @click="generateReport">生成碳足迹报告</a-button>
        </a-form-item>
      </a-form>
    </div>

    <a-row :gutter="16">
      <a-col :span="12">
        <div class="chart-section">
          <div class="section-title">产品生命周期碳足迹占比</div>
          <div ref="pieChartRef" style="height: 350px;"></div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="chart-section">
          <div class="section-title">单位产品碳足迹趋势</div>
          <div ref="lineChartRef" style="height: 350px;"></div>
        </div>
      </a-col>
    </a-row>

    <div class="table-container">
      <div class="section-title">生命周期数据采集清单</div>
      <a-table :columns="columns" :data-source="dataList" size="middle" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag color="success">已采集</a-tag>
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

const selectedProduct = ref('p1');

const columns = [
  { title: '阶段', dataIndex: 'stage' },
  { title: '数据项', dataIndex: 'item' },
  { title: '数值', dataIndex: 'value' },
  { title: '单位', dataIndex: 'unit' },
  { title: '状态', key: 'status' }
];

const dataList = ref([
  { stage: '原材料获取', item: '铝合金外壳', value: '1.2', unit: 'kg', status: 'OK' },
  { stage: '生产制造', item: 'SMT贴片能耗', value: '0.8', unit: 'kWh', status: 'OK' },
  { stage: '分销运输', item: '快递运输', value: '150', unit: 'km', status: 'OK' },
  { stage: '回收处理', item: '废电子处理', value: '0.1', unit: 'kg', status: 'OK' }
]);

const pieChartRef = ref(null);
const lineChartRef = ref(null);
let pieChart = null;
let lineChart = null;

const initCharts = () => {
  pieChart = echarts.init(pieChartRef.value);
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: [
        { value: 45, name: '原材料获取' },
        { value: 30, name: '生产制造' },
        { value: 15, name: '分销运输' },
        { value: 10, name: '回收处理' }
      ]
    }]
  });

  lineChart = echarts.init(lineChartRef.value);
  lineChart.setOption({
    xAxis: { type: 'category', data: ['V1.0', 'V1.1', 'V2.0'] },
    yAxis: { type: 'value', name: 'kgCO2e/pcs' },
    series: [{ type: 'line', data: [5.8, 5.2, 4.5], smooth: true }]
  });
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', () => {
    pieChart?.resize();
    lineChart?.resize();
  });
});

const generateReport = () => message.success('产品碳足迹报告(PDF)已生成');
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
