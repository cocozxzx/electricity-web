<template>
  <div class="carbon-page fade-in">
    <!-- 顶部 AI 状态看板 -->
    <div class="ai-status-banner">
      <div class="ai-logo">
        <robot-outlined />
        <span class="ai-text">AI 能源大模型在线</span>
      </div>
      <div class="ai-info">
        当前分析进度: <a-progress :percent="100" size="small" status="active" style="width: 150px" />
        <span class="ai-update-time">最后分析时间: 2026-03-24 17:30:00</span>
      </div>
      <a-button type="primary" size="small" ghost @click="reAnalyze">重新扫描全局能效</a-button>
    </div>

    <a-row :gutter="16">
      <!-- 左侧：能源平衡与优化调度 -->
      <a-col :span="16">
        <div class="chart-section">
          <div class="section-header">
            <div class="section-title">能源综合平衡与优化调度 (24h 预测)</div>
            <a-radio-group v-model:value="scheduleView" size="small">
              <a-radio-button value="power">电力负荷</a-radio-button>
              <a-radio-button value="valley">谷电调度</a-radio-button>
            </a-radio-group>
          </div>
          <div ref="scheduleChartRef" style="height: 400px;"></div>
        </div>

        <div class="table-container">
          <div class="section-title">设备/工艺运行参数 AI 优化建议</div>
          <a-table :columns="optColumns" :data-source="optData" size="middle" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'current'">
                <span class="val-current">{{ record.current }}</span>
              </template>
              <template v-if="column.key === 'optimized'">
                <span class="val-optimized">{{ record.optimized }}</span>
                <span class="arrow-up">↓</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="link" size="small" @click="applyOpt(record)">下发参数</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>

      <!-- 右侧：能效对标结合分析 -->
      <a-col :span="8">
        <div class="chart-section side-card">
          <div class="section-title">大数据能效关联分析</div>
          <div class="analysis-tag-cloud">
            <a-tag color="blue">温湿度耦合: 0.82</a-tag>
            <a-tag color="cyan">负载率影响: 0.75</a-tag>
            <a-tag color="purple">维护周期偏离: 15%</a-tag>
            <a-tag color="orange">工艺压力冗余: 0.2MPa</a-tag>
          </div>
          <div ref="radarChartRef" style="height: 300px;"></div>
          <div class="analysis-conclusion">
            <info-circle-outlined /> 
            通过大模型分析发现，当前<b>1#空压站</b>存在明显的压力超供现象，建议将排气压力下调 0.05MPa，预计可降低 4% 功耗。
          </div>
        </div>

        <div class="chart-section side-card">
          <div class="section-title">预期优化收益</div>
          <div class="benefit-list">
            <div class="benefit-item">
              <div class="label">综合能耗下降</div>
              <div class="value">5.2%</div>
            </div>
            <div class="benefit-item">
              <div class="label">成本节约估算</div>
              <div class="value">¥ 12,500/月</div>
            </div>
            <div class="benefit-item">
              <div class="label">碳减排贡献</div>
              <div class="value">18.5 tCO2e</div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RobotOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import * as echarts from 'echarts';
import { message } from 'ant-design-vue';

const scheduleView = ref('power');

const optColumns = [
  { title: '控制单元', dataIndex: 'unit' },
  { title: '关键参数', dataIndex: 'param' },
  { title: '当前运行值', key: 'current', dataIndex: 'current' },
  { title: 'AI 优化建议值', key: 'optimized', dataIndex: 'optimized' },
  { title: '预计节能量', dataIndex: 'saving' },
  { title: '操作', key: 'action' }
];

const optData = [
  { unit: '1#冷水机组', param: '出水温度设置', current: '7.0 ℃', optimized: '8.5 ℃', saving: '120 kWh/d' },
  { unit: '锅炉房系统', param: '空燃比(氧含量)', current: '4.2%', optimized: '3.5%', saving: '15 m³/h' },
  { unit: '2#涂装线', param: '烘干炉风机频率', current: '45.0 Hz', optimized: '41.5 Hz', saving: '85 kWh/d' },
];

const scheduleChartRef = ref(null);
const radarChartRef = ref(null);
let scheduleChart = null;
let radarChart = null;

const initCharts = () => {
  scheduleChart = echarts.init(scheduleChartRef.value);
  scheduleChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['原始负荷预测', '优化调度后负荷', '光伏发电出力'] },
    xAxis: { type: 'category', data: Array.from({length: 24}, (_, i) => `${i}:00`) },
    yAxis: { type: 'value', name: 'kW' },
    series: [
      { name: '原始负荷预测', type: 'line', smooth: true, data: [200, 180, 190, 210, 250, 400, 800, 1200, 1500, 1450, 1400, 1350, 1400, 1500, 1600, 1550, 1400, 1000, 800, 600, 400, 300, 250, 220] },
      { name: '优化调度后负荷', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, data: [250, 240, 260, 280, 300, 350, 600, 900, 1100, 1100, 1050, 1050, 1100, 1200, 1250, 1200, 1100, 900, 700, 500, 400, 350, 300, 280] },
      { name: '光伏发电出力', type: 'line', step: 'middle', itemStyle: { color: '#faad14' }, data: [0, 0, 0, 0, 0, 20, 150, 400, 700, 900, 1000, 1100, 1050, 950, 800, 500, 200, 50, 0, 0, 0, 0, 0, 0] }
    ]
  });

  radarChart = echarts.init(radarChartRef.value);
  radarChart.setOption({
    radar: {
      indicator: [
        { name: '能效利用率', max: 100 },
        { name: '设备健康度', max: 100 },
        { name: '参数稳定性', max: 100 },
        { name: '负荷匹配度', max: 100 },
        { name: '清洁能源比', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [
        { value: [75, 85, 90, 60, 40], name: '优化前' },
        { value: [92, 88, 95, 95, 65], name: '优化后(预期)' }
      ]
    }]
  });
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', () => {
    scheduleChart?.resize();
    radarChart?.resize();
  });
});

const reAnalyze = () => message.loading('AI 大模型正在深度扫描能流链路...', 2).then(() => message.success('扫描完成，已更新优化建议'));
const applyOpt = (record) => message.success(`优化参数已成功下发至 ${record.unit}`);
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.ai-status-banner {
  background: linear-gradient(90deg, #1890ff 0%, #00eaff 100%);
  padding: 12px 20px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}
.ai-logo { display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 16px; }
.ai-info { flex: 1; display: flex; align-items: center; justify-content: center; gap: 20px; }
.ai-update-time { font-size: 12px; opacity: 0.8; }

.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: bold; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; line-height: 1; }

.side-card { height: auto; }
.analysis-tag-cloud { margin-bottom: 15px; display: flex; flex-wrap: wrap; gap: 8px; }
.analysis-conclusion {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #52c41a;
  margin-top: 10px;
}
.analysis-conclusion b { color: #389e0d; }

.benefit-list { display: flex; flex-direction: column; gap: 15px; }
.benefit-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f9f9f9; border-radius: 4px; }
.benefit-item .label { color: #666; font-size: 13px; }
.benefit-item .value { font-size: 18px; font-weight: bold; color: #1890ff; }

.val-current { color: #8c8c8c; text-decoration: line-through; }
.val-optimized { color: #52c41a; font-weight: bold; margin-left: 8px; }
.arrow-up { color: #52c41a; margin-left: 4px; font-weight: bold; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
