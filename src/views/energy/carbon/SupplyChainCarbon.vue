<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-tabs v-model:activeKey="activeTab" @change="onTabChange">
        <a-tab-pane key="upstream" tab="上游供应商碳管理" />
        <a-tab-pane key="downstream" tab="下游用户碳服务" />
      </a-tabs>
    </div>

    <!-- 上游 -->
    <div v-if="activeTab === 'upstream'">
      <a-row :gutter="16">
        <a-col :span="14">
          <div class="chart-section">
            <div class="section-title">供应链碳排分布（按供应商）</div>
            <div ref="supplierRef" style="height: 340px;"></div>
          </div>
        </a-col>
        <a-col :span="10">
          <div class="chart-section">
            <div class="section-title">碳排分布（按材料）</div>
            <div ref="materialRef" style="height: 340px;"></div>
          </div>
        </a-col>
      </a-row>

      <div class="table-container">
        <div class="section-title">供应商数据采集与录入
          <a-button type="primary" size="small" class="ml-12" @click="addSupplier">新增供应商</a-button>
        </div>
        <a-table :columns="upColumns" :data-source="upData" size="middle" :pagination="false" row-key="name">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'energy'">
              <a-input-number v-model:value="record.energy" :min="0" size="small" style="width: 120px" @change="updateUpstream" /> MWh
            </template>
            <template v-if="column.key === 'carbon'">
              <b>{{ (record.energy * 0.5366).toFixed(1) }}</b> tCO₂
            </template>
            <template v-if="column.key === 'status'">
              <a-badge :status="record.status === '已同步' ? 'success' : 'warning'" :text="record.status" />
            </template>
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="requestData(record)">请求数据</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 下游 -->
    <div v-else>
      <a-row :gutter="16" class="stats-row">
        <a-col :span="8">
          <div class="stat-card" style="border-left: 4px solid #1890ff">
            <div class="stat-label">已分发产品碳足迹</div>
            <div class="stat-value">12 <small>款</small></div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="stat-card" style="border-left: 4px solid #52c41a">
            <div class="stat-label">服务下游客户</div>
            <div class="stat-value">8 <small>家</small></div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="stat-card" style="border-left: 4px solid #faad14">
            <div class="stat-label">平均产品碳足迹</div>
            <div class="stat-value">4.6 <small>kgCO₂e/件</small></div>
          </div>
        </a-col>
      </a-row>

      <div class="table-container">
        <div class="section-title">下游客户产品碳足迹分发</div>
        <a-table :columns="downColumns" :data-source="downData" size="middle" :pagination="false" row-key="name">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="primary" size="small" @click="provideResult(record)">提供核算结果</a-button>
              <a-button type="link" size="small" @click="exportResult(record)">导出</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const activeTab = ref('upstream');

const upColumns = [
  { title: '供应商名称', dataIndex: 'name' },
  { title: '主要材料', dataIndex: 'material' },
  { title: '用电能耗数据', key: 'energy', width: 200 },
  { title: '折算碳排', key: 'carbon', align: 'center' },
  { title: '采集状态', key: 'status', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
];

const upData = ref([
  { name: '精密电子元件有限公司', material: 'PCB 基板', energy: 320, status: '已同步' },
  { name: '顺风塑料制品厂', material: '外壳', energy: 180, status: '待同步' },
  { name: '华东金属结构件厂', material: '铝合金件', energy: 260, status: '已同步' }
]);

const downColumns = [
  { title: '客户名称', dataIndex: 'name' },
  { title: '采购产品', dataIndex: 'product' },
  { title: '碳足迹结果(kgCO₂e/件)', dataIndex: 'value', align: 'center' },
  { title: '核算边界', dataIndex: 'boundary' },
  { title: '操作', key: 'action', align: 'center' }
];

const downData = ref([
  { name: '国家电网杭州分公司', product: '集中器', value: 4.2, boundary: '摇篮到大门' },
  { name: '南方电网广州分公司', product: '智能终端', value: 5.1, boundary: '摇篮到坟墓' },
  { name: '华东配电设备集团', product: '数字电表', value: 3.8, boundary: '摇篮到大门' }
]);

const supplierRef = ref(null);
const materialRef = ref(null);
let supplierChart = null, materialChart = null;

const updateUpstream = () => {
  supplierChart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: v => v + ' tCO₂' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: upData.value.map(d => d.name), axisLabel: { interval: 0, rotate: 12, fontSize: 11 } },
    yAxis: { type: 'value', name: 'tCO₂' },
    series: [{ type: 'bar', barWidth: '45%', data: upData.value.map(d => Number((d.energy * 0.5366).toFixed(1))),
      itemStyle: { color: '#1890ff', borderRadius: [4, 4, 0, 0] } }]
  }, true);

  materialChart?.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} tCO₂ ({d}%)' },
    legend: { bottom: 0, type: 'scroll' },
    series: [{ type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      data: upData.value.map(d => ({ value: Number((d.energy * 0.5366).toFixed(1)), name: d.material })) }]
  }, true);
};

const initCharts = () => {
  if (!supplierRef.value) return;
  supplierChart = echarts.init(supplierRef.value);
  materialChart = echarts.init(materialRef.value);
  updateUpstream();
};

const onTabChange = () => {
  if (activeTab.value === 'upstream') {
    nextTick(() => { if (!supplierChart) initCharts(); else { supplierChart.resize(); materialChart.resize(); } });
  }
};

const addSupplier = () => {
  upData.value.push({ name: '新供应商', material: '待填写', energy: 100, status: '待同步' });
  updateUpstream();
};
const requestData = (r) => message.info(`已向「${r.name}」发起场地数据采集请求`);
const provideResult = (r) => message.success(`已向「${r.name}」提供 ${r.product} 碳足迹核算结果`);
const exportResult = (r) => message.success(`${r.product} 碳足迹核算报告已导出`);

const handleResize = () => { supplierChart?.resize(); materialChart?.resize(); };

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  supplierChart?.dispose(); materialChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 0 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.stats-row { margin-bottom: 16px; }
.stat-card { background: #fff; padding: 20px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.stat-label { color: #8c8c8c; font-size: 14px; margin-bottom: 8px; }
.stat-value { font-size: 24px; font-weight: bold; color: #333; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.ml-12 { margin-left: 12px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
