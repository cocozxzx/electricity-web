<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-space>
        <a-select v-model:value="taskId" style="width: 240px">
          <a-select-option v-for="t in tasks" :key="t.id" :value="t.id">{{ t.name }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="generateReport">在线自动生成碳排放报告</a-button>
        <a-button @click="onExport">汇集并导出核查材料</a-button>
      </a-space>
    </div>

    <div class="table-container">
      <div class="section-title">核查任务列表</div>
      <a-table :columns="taskColumns" :data-source="tasks" size="middle" :pagination="false" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'progress'">
            <a-progress :percent="record.progress" size="small" :status="record.progress === 100 ? 'success' : 'active'" />
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a @click="taskId = record.id">查看溯源</a>
          </template>
        </template>
      </a-table>
    </div>

    <div class="table-container">
      <div class="section-title">数据溯源 · 核算过程数据 ↔ 原始凭证</div>
      <a-table :columns="columns" :data-source="dataList" size="middle" :pagination="false" row-key="source"
        :expand-column-width="40">
        <template #expandedRowRender="{ record }">
          <div class="proof-detail">
            <div class="proof-title">关联原始凭证（{{ record.proofs.length }}）</div>
            <a-list :data-source="record.proofs" size="small">
              <template #renderItem="{ item }">
                <a-list-item>
                  <FileTextOutlined class="proof-icon" />
                  <span class="proof-name">{{ item.name }}</span>
                  <span class="proof-meta">{{ item.date }} · {{ item.no }}</span>
                  <a-button type="link" size="small">查看</a-button>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'proof'">
            <a-badge :count="record.proofs.length" :number-style="{ backgroundColor: '#1890ff' }" />
            <span class="ml-8">份凭证</span>
          </template>
        </template>
      </a-table>
    </div>

    <div class="chart-section">
      <div class="section-title">核查报告在线生成（模板预览）</div>
      <div class="report-preview">
        <div class="report-head">
          <h3>2025 年度温室气体排放核查报告（节选）</h3>
          <a-tag color="blue">范围二·外购电力</a-tag>
        </div>
        <p>受核查方：示范智能制造有限公司 · 核查周期：2025-01-01 至 2025-12-31</p>
        <p>核算边界内排放源仅含<b>外购电力</b>（范围二）。报告期外购电量 5,280,000 kWh，
          采用电网排放因子 0.5366 kgCO₂/kWh 折算，核算碳排放量约 <b>2,833.2 tCO₂</b>。</p>
        <p>活动数据来源：电网计量电费结算单、关口表抄表记录、企业用电分项计量平台，已逐月交叉核对，数据质量满足核查要求。</p>
        <a-button type="primary" ghost @click="generateReport" class="mt-12">预览完整报告</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { FileTextOutlined } from '@ant-design/icons-vue';

const taskId = ref('T2025');

const tasks = ref([
  { id: 'T2025', name: '2025年度碳排放核查', verifier: '中碳认证中心', deadline: '2026-03-31', progress: 80, status: '进行中' },
  { id: 'T2024', name: '2024年度碳排放核查', verifier: '中碳认证中心', deadline: '2025-03-31', progress: 100, status: '已完成' },
  { id: 'TQ1', name: '2026 Q1 内部自查', verifier: '企业能管中心', deadline: '2026-04-15', progress: 35, status: '待提交' }
]);

const taskColumns = [
  { title: '核查任务', dataIndex: 'name' },
  { title: '核查机构', dataIndex: 'verifier' },
  { title: '截止日期', dataIndex: 'deadline', align: 'center' },
  { title: '进度', key: 'progress', width: 180 },
  { title: '状态', key: 'status', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
];

const statusColor = (s) => ({ '进行中': 'blue', '已完成': 'green', '待提交': 'orange' }[s] || 'default');

const columns = [
  { title: '排放源', dataIndex: 'source' },
  { title: '活动数据', dataIndex: 'data', align: 'center' },
  { title: '排放因子', dataIndex: 'factor', align: 'center' },
  { title: '核算结果(tCO₂)', dataIndex: 'result', align: 'center' },
  { title: '凭证关联', key: 'proof', align: 'center' }
];

const dataList = ref([
  { source: '外购电力（范围二）', data: '5,280 MWh', factor: '0.5366 tCO₂/MWh', result: '2,833.2',
    proofs: [
      { name: '电网电费结算单·全年汇总', date: '2025-12-31', no: 'INV-2025-1287' },
      { name: '关口表抄表记录', date: '2025-12-31', no: 'MTR-2025-008' },
      { name: '分项计量平台导出', date: '2025-12-31', no: 'SYS-2025-EXP' }
    ] },
  { source: '外购电力·生产A区', data: '2,700 MWh', factor: '0.5366 tCO₂/MWh', result: '1,448.8',
    proofs: [
      { name: 'A区子表抄表记录', date: '2025-12-31', no: 'MTR-A-031' }
    ] }
]);

const generateReport = () => message.success('年度碳排放核查报告（2025）已生成');
const onExport = () => message.info('正在打包核查支撑材料（活动数据 + 原始凭证 + 报告）...');
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.chart-section, .table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.proof-detail { padding: 8px 16px; background: #fafafa; border-radius: 4px; }
.proof-title { font-weight: bold; color: #595959; margin-bottom: 6px; }
.proof-icon { color: #1890ff; margin-right: 8px; }
.proof-name { font-weight: 500; }
.proof-meta { color: #8c8c8c; font-size: 12px; margin-left: 12px; }
.report-preview { background: #fafafa; border: 1px dashed #d9d9d9; border-radius: 6px; padding: 20px 24px; line-height: 1.9; color: #595959; }
.report-head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.report-head h3 { margin: 0; color: #262626; }
.ml-8 { margin-left: 8px; }
.mt-12 { margin-top: 12px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
