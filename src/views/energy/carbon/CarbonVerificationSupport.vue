<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-space>
        <a-button type="primary" @click="generateReport">在线自动生成碳排放报告</a-button>
        <a-button @click="onExport">汇集并导出核查材料</a-button>
      </a-space>
    </div>

    <div class="table-container">
      <div class="section-title">核算过程数据与凭证追踪</div>
      <a-table :columns="columns" :data-source="dataList" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'proof'">
            <a-button type="link" size="small">查看原始凭证</a-button>
          </template>
        </template>
      </a-table>
    </div>

    <div class="chart-section">
      <div class="section-title">碳排放核算溯源图</div>
      <div class="placeholder-tip">此处可集成复杂的溯源关系拓扑图</div>
      <a-empty description="溯源拓扑图加载中..." />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';

const columns = [
  { title: '排放源', dataIndex: 'source' },
  { title: '活动数据', dataIndex: 'data' },
  { title: '排放因子', dataIndex: 'factor' },
  { title: '核算结果 (tCO2e)', dataIndex: 'result' },
  { title: '原始凭证', key: 'proof' }
];

const dataList = ref([
  { source: '固定燃烧(天然气)', data: '12500 m³', factor: '2.1622 kgCO2/m³', result: '27.02' },
  { source: '外购电力', data: '150 MWh', factor: '0.5703 tCO2/MWh', result: '85.54' }
]);

const generateReport = () => message.success('年度碳排放报告(2025)已生成');
const onExport = () => message.info('正在打包核查支撑材料...');
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.placeholder-tip { margin-bottom: 20px; color: #999; font-size: 12px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
