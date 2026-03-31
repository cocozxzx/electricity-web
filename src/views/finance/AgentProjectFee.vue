<template>
  <div class="agent-project-overview fade-in">
    <!-- 顶部统计卡片 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="6" v-for="stat in statsCards" :key="stat.title" class="stat-col">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ backgroundColor: stat.bgColor, color: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value" :class="{ 'red-text': stat.isUrgent }">{{ stat.value }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 中部图表区 -->
    <a-row :gutter="16" class="middle-section">
      <a-col :span="16">
        <div class="section-container chart-section">
          <div class="section-header">
            <div class="section-title">月度费用趋势</div>
            <a-radio-group v-model:value="chartTimeRange" size="small">
              <a-radio-button value="6m">近6个月</a-radio-button>
              <a-radio-button value="12m">近12个月</a-radio-button>
            </a-radio-group>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="section-container distribution-section">
          <div class="section-header">
            <div class="section-title">设备状态占比</div>
          </div>
          <div ref="pieChartRef" class="chart-container"></div>
        </div>
      </a-col>
    </a-row>

    <!-- 下部表格区 -->
    <a-row :gutter="16" class="bottom-section">
      <!-- 异常项目提醒 -->
      <a-col :span="12">
        <div class="section-container table-section">
          <div class="section-header">
            <div class="section-title">待处理异常</div>
            <a-button type="link" size="small" @click="$router.push('/finance/agent/expiry-warning')">到期预警</a-button>
          </div>
          <a-table 
            :columns="alertColumns" 
            :data-source="alertProjects" 
            :pagination="false"
            size="small"
            class="ruoyi-table"
            :scroll="{ y: 'calc(100% - 40px)' }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'projectName'">
                <span style="font-weight: 500;">{{ record.projectName }}</span>
              </template>
              <template v-if="column.key === 'exceptionCount'">
                <div class="exception-tags">
                  <a-tag v-if="record.lockedCount > 0" color="red">锁定: {{ record.lockedCount }}</a-tag>
                  <a-tag v-if="record.graceCount > 0" color="orange">宽限: {{ record.graceCount }}</a-tag>
                </div>
              </template>
              <template v-if="column.key === 'totalAmount'">
                <span class="debt-amount">¥ {{ record.totalAmount.toLocaleString() }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button type="primary" size="small" @click="viewProject(record)">去付款</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>

      <!-- 最近核销记录 -->
      <a-col :span="12">
        <div class="section-container table-section">
          <div class="section-header">
            <div class="section-title">最近核销记录</div>
            <a-button type="link" size="small" @click="$router.push('/finance/agent/payment-record')">查看全部</a-button>
          </div>
          <a-table 
            :columns="billingColumns" 
            :data-source="billingHistory" 
            :pagination="false"
            size="small"
            class="ruoyi-table"
            :scroll="{ y: 'calc(100% - 40px)' }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-badge :status="record.type === '充值' ? 'success' : 'processing'" :text="record.type" />
              </template>
              <template v-if="column.key === 'amount'">
                <span :style="{ color: record.type === '充值' ? '#52c41a' : '#1890ff', fontWeight: 'bold' }">
                  {{ record.type === '充值' ? '+' : '-' }} ¥ {{ record.amount.toLocaleString() }}
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { 
  ProjectOutlined, 
  SafetyCertificateOutlined, 
  FieldTimeOutlined, 
  LockOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const chartTimeRange = ref('6m');
const chartRef = ref(null);
const pieChartRef = ref(null);
let myChart = null;
let myPieChart = null;

const statsCards = [
  { title: '我的项目总数', value: '12', icon: ProjectOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '运行中设备', value: '156', icon: SafetyCertificateOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '宽限期设备', value: '5', icon: FieldTimeOutlined, color: '#faad14', bgColor: '#fff7e6' },
  { title: '已锁定设备', value: '3', icon: LockOutlined, color: '#ff4d4f', bgColor: '#fff1f0', isUrgent: true },
];

const alertColumns = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '异常设备', key: 'exceptionCount', align: 'center' },
  { title: '待付总额', dataIndex: 'totalAmount', key: 'totalAmount', align: 'center' },
  { title: '操作', key: 'action', align: 'center', width: 90 }
];

const alertProjects = ref([
  { id: 1, projectName: '萧山电力园项目', lockedCount: 2, graceCount: 0, totalAmount: 1000 },
  { id: 2, projectName: '西湖运行中心', lockedCount: 0, graceCount: 1, totalAmount: 120 },
  { id: 3, projectName: '静安中心', lockedCount: 1, graceCount: 1, totalAmount: 240 },
  // { id: 4, projectName: '苏州工业园', lockedCount: 0, graceCount: 0, totalAmount: 0 },
]);

const billingColumns = [
  { title: '核销时间', dataIndex: 'time', key: 'time', align: 'center', width: 100 },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  // { title: '收支类型', dataIndex: 'type', key: 'type', align: 'center', width: 80 },
  { title: '金额', dataIndex: 'amount', key: 'amount', align: 'center', width: 100 }
];

const billingHistory = ref([
  { id: 1, time: '2024-03-24', projectName: '西湖运行中心', type: '充值', amount: 5000 },
  { id: 2, time: '2024-03-23', projectName: '萧山电力园项目', type: '充值', amount: 1500 },
  { id: 3, time: '2024-03-22', projectName: '西湖运行中心', type: '充值', amount: 800 },
  { id: 4, time: '2024-03-20', projectName: '静安中心', type: '充值', amount: 120 },
  { id: 5, time: '2024-03-15', projectName: '西湖运行中心', type: '充值', amount: 2000 },
]);

const viewProject = (record) => {
  router.push({
    path: '/finance/agent/expiry-detail',
    query: { name: record.projectName }
  });
};

const initCharts = () => {
  // Line Chart
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    myChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['10月', '11月', '12月', '1月', '2月', '3月'],
        axisLine: { lineStyle: { color: '#f0f0f0' } }
      },
      yAxis: { type: 'value', name: '金额 (¥)', splitLine: { lineStyle: { color: '#f5f5f5' } } },
      series: [{
        name: '月度费用',
        type: 'line',
        smooth: true,
        data: [2100, 1850, 2400, 3200, 2800, 3500],
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.2)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.02)' }
          ])
        }
      }]
    });
  }

  // Pie Chart
  if (pieChartRef.value) {
    myPieChart = echarts.init(pieChartRef.value);
    myPieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11 } },
      series: [{
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 156, name: '运行中', itemStyle: { color: '#52c41a' } },
          { value: 5, name: '宽限期', itemStyle: { color: '#faad14' } },
          { value: 3, name: '已锁定', itemStyle: { color: '#ff4d4f' } }
        ]
      }]
    });
  }
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', () => {
    myChart?.resize();
    myPieChart?.resize();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    myChart?.resize();
    myPieChart?.resize();
  });
  myChart?.dispose();
  myPieChart?.dispose();
});
</script>

<style scoped>
.agent-project-overview {
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
  background-color: #f0f2f5;
  box-sizing: border-box;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* 统计卡片样式 */
.stats-cards { flex-shrink: 0; }
.stat-col { margin-bottom: 12px; }
.stat-card {
  background: #fff; padding: 12px 15px; border-radius: 4px; display: flex; align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: all 0.3s;
  height: 100%;
}
.stat-icon {
  width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-right: 12px;
}
.stat-title { color: #8c8c8c; font-size: 13px; margin-bottom: 2px; }
.stat-value { font-size: 20px; font-weight: bold; color: #333; }
.stat-value.red-text { color: #ff4d4f; }

/* 区域容器样式 */
.section-container {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
  line-height: 1;
}

/* 中部区域 */
.middle-section {
  flex: 1.1;
  min-height: 0;
  margin-bottom: 12px;
}

.chart-container {
  flex: 1;
  min-height: 0;
}

/* 下部区域 */
.bottom-section {
  flex: 1;
  min-height: 0;
}

.table-section {
  min-height: 0;
}

.exception-tags {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.debt-amount {
  color: #ff4d4f;
  font-weight: bold;
  font-family: monospace;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
  padding: 8px !important;
}

:deep(.ant-table-cell) {
  padding: 8px !important;
}

:deep(.ant-table) {
  font-size: 12px;
}

:deep(.ant-table-wrapper) {
  flex: 1;
  overflow: hidden;
}
</style>
