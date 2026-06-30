<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-form layout="inline">
        <a-form-item label="分析对象">
          <a-select v-model:value="projectId" style="width: 200px" @change="refresh">
            <a-select-option value="p1">上海静安数据中心</a-select-option>
            <a-select-option value="p2">杭州西溪园区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="统计周期">
          <a-select v-model:value="period" style="width: 120px" @change="refresh">
            <a-select-option value="month">本月</a-select-option>
            <a-select-option value="year">本年度</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <div class="chart-section sankey-section">
      <div class="section-title">电能流向桑基图</div>
      <div class="chart-tip">展示电能从「电网 / 厂家」→「项目」→「工序」→「设备」的逐级流向（单位 MWh）。</div>
      <div ref="sankeyRef" style="height: 500px;"></div>
    </div>

    <a-row :gutter="16">
      <a-col :span="14">
        <div class="table-container">
          <div class="section-title">电力平衡表（输入 / 分配 / 利用 / 损失）</div>
          <a-table :columns="balanceColumns" :data-source="balanceData" size="middle" :pagination="false" bordered row-key="link">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'ratio'">
                <a-progress :percent="record.ratio" size="small" :show-info="false" />
                <span class="ratio-text">{{ record.ratio }}%</span>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
      <a-col :span="10">
        <div class="table-container">
          <div class="section-title">重点能耗环节识别</div>
          <div class="key-list">
            <div class="key-item" v-for="(k, i) in keyNodes" :key="k.name" :class="{ hot: i === 0 }">
              <div class="key-rank">{{ i + 1 }}</div>
              <div class="key-info">
                <div class="key-name">{{ k.name }}<a-tag v-if="i === 0" color="red" class="ml-8">重点关注</a-tag></div>
                <div class="key-sub">占总用电 {{ k.ratio }}% · {{ k.value }} MWh</div>
              </div>
              <div class="key-bar"><a-progress :percent="k.ratio" :show-info="false" :stroke-color="i === 0 ? '#ff4d4f' : '#1890ff'" size="small" /></div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const projectId = ref('p1');
const period = ref('month');

const balanceColumns = [
  { title: '环节', dataIndex: 'link', key: 'link', width: 130 },
  { title: '电量 (MWh)', dataIndex: 'value', align: 'center', width: 110 },
  { title: '占输入比例', key: 'ratio', width: 200 },
  { title: '说明', dataIndex: 'remark' }
];

const balanceData = [
  { link: '输入·外购电网', value: 1180, ratio: 89, remark: '范围二外购电力' },
  { link: '输入·自发光伏', value: 145, ratio: 11, remark: '绿色电力' },
  { link: '分配·生产用电', value: 920, ratio: 69, remark: '注塑/装配/焊接等工序' },
  { link: '分配·公辅用电', value: 285, ratio: 22, remark: '空压/暖通/照明' },
  { link: '分配·办公生活', value: 90, ratio: 7, remark: '办公区' },
  { link: '损失·线损配电', value: 30, ratio: 2, remark: '变配电及线路损耗' }
];

const keyNodes = ref([
  { name: '注塑工序', value: 420, ratio: 32 },
  { name: '空压站', value: 210, ratio: 16 },
  { name: '焊接工序', value: 180, ratio: 14 },
  { name: '暖通空调', value: 150, ratio: 11 }
]);

const sankeyRef = ref(null);
let myChart = null;

const initChart = () => {
  myChart = echarts.init(sankeyRef.value);
  updateChart();
};

const updateChart = () => {
  myChart?.setOption({
    tooltip: { trigger: 'item', triggerOn: 'mousemove', valueFormatter: v => v + ' MWh' },
    series: [{
      type: 'sankey',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'left',
      data: [
        { name: '国家电网', itemStyle: { color: '#1890ff' } },
        { name: '厂家自发光伏', itemStyle: { color: '#52c41a' } },
        { name: '项目·静安中心', itemStyle: { color: '#722ed1' } },
        { name: '生产工序', itemStyle: { color: '#faad14' } },
        { name: '公辅工序', itemStyle: { color: '#13c2c2' } },
        { name: '注塑设备' }, { name: '焊接设备' }, { name: '空压机' }, { name: '暖通机组' }, { name: '照明系统' }
      ],
      links: [
        { source: '国家电网', target: '项目·静安中心', value: 1180 },
        { source: '厂家自发光伏', target: '项目·静安中心', value: 145 },
        { source: '项目·静安中心', target: '生产工序', value: 920 },
        { source: '项目·静安中心', target: '公辅工序', value: 405 },
        { source: '生产工序', target: '注塑设备', value: 540 },
        { source: '生产工序', target: '焊接设备', value: 380 },
        { source: '公辅工序', target: '空压机', value: 210 },
        { source: '公辅工序', target: '暖通机组', value: 150 },
        { source: '公辅工序', target: '照明系统', value: 45 }
      ],
      lineStyle: { color: 'gradient', curveness: 0.5 },
      label: { fontSize: 12 }
    }]
  }, true);
};

const refresh = () => updateChart();
const handleResize = () => myChart?.resize();

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  myChart?.dispose();
});
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.chart-tip { font-size: 12px; color: #8c8c8c; margin-bottom: 16px; padding-left: 14px; }
.ratio-text { margin-left: 8px; font-size: 12px; color: #8c8c8c; }
.key-list { display: flex; flex-direction: column; gap: 14px; }
.key-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; background: #fafafa; }
.key-item.hot { background: #fff1f0; }
.key-rank { width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 50%; background: #1890ff; color: #fff; font-weight: bold; flex-shrink: 0; }
.key-item.hot .key-rank { background: #ff4d4f; }
.key-info { flex: 1; }
.key-name { font-weight: bold; color: #262626; font-size: 14px; }
.key-sub { font-size: 12px; color: #8c8c8c; margin-top: 2px; }
.key-bar { width: 90px; }
.ml-8 { margin-left: 8px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
