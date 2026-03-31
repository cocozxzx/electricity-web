<template>
  <div class="admin-project-overview fade-in">
    <!-- 顶部统计卡片 -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="6" v-for="stat in statsCards" :key="stat.title" class="stat-col">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }" @click="stat.link ? $router.push(stat.link) : null" :class="{ clickable: stat.link }">
          <div class="stat-icon" :style="{ backgroundColor: stat.bgColor, color: stat.color }">
            <component :is="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">{{ stat.value }}</div>
          </div>
        </div>
      </a-col>
    </a-row>

    <!-- 中部图表区 -->
    <a-row :gutter="16" class="middle-section">
      <a-col :span="16">
        <div class="section-container chart-section">
          <div class="section-header">
            <div class="section-title">激活设备趋势</div>
            <a-radio-group v-model:value="chartTimeRange" size="small">
              <a-radio-button value="7d">近7天</a-radio-button>
              <a-radio-button value="30d">近30天</a-radio-button>
            </a-radio-group>
          </div>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="section-container distribution-section">
          <div class="section-header">
            <div class="section-title">设备类型占比</div>
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
            <div class="section-title">异常项目提醒</div>
            <a-button type="link" size="small" @click="$router.push('/finance/mfr/device-status')">查看全部</a-button>
          </div>
          <a-table 
            :columns="alertColumns" 
            :data-source="alertProjects" 
            :pagination="false"
            size="small"
            class="ruoyi-table"
            :scroll="{ y: 180 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="record.type === 'LOCKED' ? 'red' : 'orange'">
                  {{ record.type === 'LOCKED' ? '已锁定' : '宽限期' }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a @click="viewDetail(record)">详情</a>
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
            <a-button type="link" size="small" @click="$router.push('/finance/mfr/billing')">查看更多</a-button>
          </div>
          <a-table 
            :columns="paymentColumns" 
            :data-source="recentPayments" 
            :pagination="false"
            size="small"
            class="ruoyi-table"
            :scroll="{ y: 180 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'amount'">
                <span class="payment-amount">¥ {{ record.amount.toLocaleString() }}</span>
              </template>
              <template v-if="column.key === 'status'">
                <span style="color: #52c41a">● 已核销</span>
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
  DatabaseOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  LockOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const chartTimeRange = ref('7d');
const chartRef = ref(null);
const pieChartRef = ref(null);
let myChart = null;
let myPieChart = null;

const statsCards = [
  { title: '激活设备总数', value: '1,250', icon: DatabaseOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '本月新增激活', value: '+45', icon: CheckCircleOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '待处理核销', value: '12', icon: ClockCircleOutlined, color: '#faad14', bgColor: '#fff7e6', link: '/finance/mfr/billing' },
  { title: '已锁定设备', value: '3', icon: LockOutlined, color: '#ff4d4f', bgColor: '#fff1f0', link: '/finance/mfr/device-status' },
];

const alertColumns = [
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
  { title: '异常类型', dataIndex: 'type', key: 'type', align: 'center' },
  { title: '涉及数量', dataIndex: 'count', key: 'count', align: 'center' },
  { title: '更新时间', dataIndex: 'time', key: 'time', align: 'center' },
  { title: '操作', key: 'action', align: 'center' }
];

const alertProjects = ref([
  { id: 1, projectName: '萧山区电力园项目', type: 'LOCKED', count: 2, time: '2024-03-24 10:00' },
  { id: 2, projectName: '上海静安数据中心', type: 'GRACE', count: 5, time: '2024-03-24 09:30' },
  { id: 3, projectName: '西湖区运行中心', type: 'LOCKED', count: 1, time: '2024-03-23 16:45' },
  { id: 4, projectName: '泉山区民宗局监测', type: 'GRACE', count: 3, time: '2024-03-23 14:20' },
  { id: 5, projectName: '苏州工业园项目', type: 'LOCKED', count: 1, time: '2024-03-22 11:30' }
]);

const paymentColumns = [
  { title: '核销时间', dataIndex: 'time', key: 'time', align: 'center' },
  { title: '代理商', dataIndex: 'agent', key: 'agent', align: 'center' },
  { title: '项目', dataIndex: 'project', key: 'project', align: 'center' },
  { title: '金额', dataIndex: 'amount', key: 'amount', align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center' }
];

const recentPayments = ref([
  { id: 1, time: '2024-03-24 11:20', agent: '智慧能源代理', project: '萧山电力园', amount: 5600 },
  { id: 2, time: '2024-03-24 10:45', agent: '宏图科技', project: '上海数据中心', amount: 3200 },
  { id: 3, time: '2024-03-23 15:30', agent: '万众云联', project: '宝安智慧用电', amount: 1500 },
  { id: 4, time: '2024-03-23 09:15', agent: '华东大区总代', project: '苏州工业园', amount: 8900 },
  { id: 5, time: '2024-03-22 16:40', agent: '成都成电', project: '高新孵化器', amount: 2100 }
]);

const viewDetail = (record) => {
  router.push({
    name: 'MfrProjectDeviceList',
    query: { projectName: record.projectName }
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
        data: ['03-18', '03-19', '03-20', '03-21', '03-22', '03-23', '03-24'],
        axisLine: { lineStyle: { color: '#f0f0f0' } }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f5f5f5' } } },
      series: [{
        name: '激活设备',
        type: 'line',
        smooth: true,
        data: [1200, 1215, 1228, 1235, 1242, 1248, 1250],
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
        name: '设备类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 320, name: '网关', itemStyle: { color: '#1890ff' } },
          { value: 930, name: '子设备', itemStyle: { color: '#52c41a' } }
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
.admin-project-overview {
  height: calc(100vh - 170px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

/* 统计卡片样式 */
.stats-cards { flex-shrink: 0; }
.stat-col { margin-bottom: 16px; }
.stat-card {
  background: #fff; padding: 15px; border-radius: 4px; display: flex; align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s;
  height: 100%;
}
.stat-card.clickable { cursor: pointer; }
.stat-card.clickable:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-right: 15px;
}
.stat-title { color: #8c8c8c; font-size: 13px; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: bold; color: #333; }

/* 区域容器样式 */
.section-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  padding-left: 10px;
  border-left: 4px solid #1890ff;
}

/* 中部区域 */
.middle-section {
  flex: 1.2;
  min-height: 0;
  margin-bottom: 16px;
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
  overflow: hidden;
}

.payment-amount {
  color: #52c41a;
  font-weight: bold;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
}

:deep(.ant-table) {
  font-size: 12px;
}

:deep(.ant-table-wrapper) {
  flex: 1;
  overflow: hidden;
}
</style>
