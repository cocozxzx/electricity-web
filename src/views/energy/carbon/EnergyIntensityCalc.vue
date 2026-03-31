<template>
  <div class="intensity-calc-container fade-in">
    <a-layout class="inner-layout">
      <!-- 左侧层级树 (完全同步 EnergyConsumptionQuery) -->
      <a-layout-sider width="280" class="tree-sider">
        <div class="tree-header">
          <a-input-search
            v-model:value="treeSearchText"
            placeholder="搜索设备、项目或代理商"
            class="tree-search"
            @search="onTreeSearch"
          />
        </div>
        <div class="tree-content custom-scrollbar">
          <a-tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            :tree-data="filteredTreeData"
            :field-names="{ title: 'name', key: 'id' }"
            @select="onNodeSelect"
            @check="refreshData"
            checkable
            check-strictly
            block-node
          >
            <template #title="{ name, type, status, id }">
              <span class="tree-node-title" :class="{ 'is-selected': selectedKeys.includes(id) }">
                <component :is="getNodeIcon(type)" class="node-icon" :class="type" />
                <span class="node-name" :class="getNodeStatusClass(status)">
                  {{ name }}
                </span>
                <a-tooltip v-if="status === 'frozen'" title="设备数据疑似冻结">
                  <WarningFilled class="text-warning" />
                </a-tooltip>
                <a-badge v-if="status === 'offline'" status="default" class="status-dot" />
              </span>
            </template>
          </a-tree>
        </div>
      </a-layout-sider>

      <!-- 右侧主内容区 -->
      <a-layout-content class="main-content">
     

        <!-- 筛选栏 -->
        <div class="filter-bar">
          <div class="filter-item">
            <span class="filter-label">日期范围：</span>
            <a-range-picker 
              v-model:value="dateRange" 
              :picker="granularity === 'month' ? 'month' : (granularity === 'year' ? 'year' : 'date')"
              @change="refreshData"
            />
          </div>
          <div class="filter-item ml-30">
            <span class="filter-label">统计粒度：</span>
            <a-select v-model:value="granularity" style="width: 100px" @change="onGranularityChange">
              <a-select-option value="day">日</a-select-option>
              <a-select-option value="month">月</a-select-option>
              <a-select-option value="year">年</a-select-option>
            </a-select>
          </div>
      

          <div class="filter-spacer"></div>
          <div class="header-right">
            <a-button @click="exportReport">导出统计表</a-button>
            <a-button type="primary" ghost @click="exportReport" class="ml-10">导出 PDF 报告</a-button>
          </div>
        </div>

        <div class="scroll-wrapper custom-scrollbar">
          <!-- 统计概览卡片 -->
      

          <!-- 趋势分析图 -->
          <a-row :gutter="16" class="chart-row">
            <a-col :span="24">
              <div class="chart-container">
                <div class="chart-header">
                  <span class="title">电力折标能耗趋势 (tce)</span>
                </div>
                <div ref="trendChartRef" class="chart-box"></div>
              </div>
            </a-col>
          </a-row>


          <!-- 动态折标明细表 (同步 EnergyConsumptionQuery) -->
          <div class="table-container">
            <a-table
              :columns="currentColumns"
              :data-source="mockTableData"
              :pagination="pagination"
              :scroll="{ x: 'max-content' }"
              size="middle"
              row-key="id"
              bordered
            >
            </a-table>
          </div>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, markRaw, watch } from 'vue';
import { 
  ShopOutlined, 
  BankOutlined, 
  ProjectOutlined, 
  HddOutlined,
  WarningFilled
} from '@ant-design/icons-vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';

// --- 基础配置 ---
const iconsMap = {
  root: markRaw(ShopOutlined),
  agent: markRaw(BankOutlined),
  project: markRaw(ProjectOutlined),
  device: markRaw(HddOutlined)
};
const getNodeIcon = (type) => iconsMap[type] || iconsMap.device;

const getNodeStatusClass = (status) => {
  if (status === 'offline') return 'text-secondary';
  if (status === 'frozen') return 'text-warning';
  return '';
};

// --- 层级树逻辑 (同步 EnergyConsumptionQuery) ---
const treeSearchText = ref('');
const expandedKeys = ref(['root', 'agent_1']);
const selectedKeys = ref(['root']);
const checkedKeys = ref({ checked: ['root'], halfChecked: [] });

const mockTreeData = [
  {
    id: 'root',
    name: '全网汇总',
    type: 'root',
    children: [
      {
        id: 'agent_1',
        name: '华东区代理商',
        type: 'agent',
        children: [
          {
            id: 'proj_1',
            name: '上海静安数据中心',
            type: 'project',
            children: [
              { id: 'dev_1', name: '1号进线主柜', type: 'device', status: 'online' },
              { id: 'dev_2', name: '2号空调机组', type: 'device', status: 'online' },
              { id: 'dev_3', name: '3号照明总控', type: 'device', status: 'offline' },
            ]
          },
          { id: 'proj_2', name: '杭州阿里巴巴西溪园区', type: 'project' }
        ]
      },
      {
        id: 'agent_2',
        name: '华南区代理商',
        type: 'agent',
        children: [
          { id: 'proj_3', name: '广州南沙基地', type: 'project' }
        ]
      }
    ]
  }
];

const filteredTreeData = computed(() => {
  if (!treeSearchText.value) return mockTreeData;
  const search = treeSearchText.value.toLowerCase();
  const filterNodes = (nodes) => {
    return nodes.reduce((acc, node) => {
      const match = node.name.toLowerCase().includes(search);
      const filteredChildren = node.children ? filterNodes(node.children) : [];
      if (match || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : undefined });
      }
      return acc;
    }, []);
  };
  return filterNodes(mockTreeData);
});

const selectedNode = ref(mockTreeData[0]);

const onNodeSelect = (keys, { node }) => {
  if (keys.length > 0) {
    selectedNode.value = node;
    refreshData();
  }
};

const getNodeInfoById = (id, nodes = mockTreeData) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = getNodeInfoById(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

// --- 计算与配置逻辑 ---
const granularity = ref('day');
const dateRange = ref([dayjs().subtract(7, 'day'), dayjs()]);
const coefficientType = ref('equivalent');

const coefficients = {
  equivalent: 0.1229, // kgce/kWh
  equal_value: 0.2850 
};

const currentCoefficient = computed(() => coefficients[coefficientType.value]);
const totalElectricity = ref(45200.5);
const totalStandardCoal = computed(() => (totalElectricity.value * currentCoefficient.value) / 1000);

// --- 图表逻辑 ---
const trendChartRef = ref(null);
let trendChart = null;

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    updateTrendChart();
  }
};

const updateTrendChart = () => {
  const targetKeys = checkedKeys.value?.checked || [];
  
  // 生成 X 轴数据：每 15 分钟一个点，共 24 小时 (96个点)
  const xAxisData = [];
  const start = dateRange.value?.[0]?.startOf('day') || dayjs().startOf('day');
  for (let i = 0; i < 24 * 4; i++) {
    xAxisData.push(start.add(i * 15, 'minute').format('YYYY-MM-DD HH:mm:ss'));
  }

  // 为每个选中的节点生成趋势曲线
  const series = targetKeys.map((id, index) => {
    const node = getNodeInfoById(id);
    const name = node ? node.name : id;
    const type = node ? node.type : 'device';

    const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];
    const color = colors[index % colors.length];

    // 模拟数据：根据层级类型调整量级，并应用折标系数
    let multiplier = 1;
    if (type === 'project') multiplier = 5;
    else if (type === 'agent') multiplier = 15;
    else if (type === 'root') multiplier = 40;

    const data = xAxisData.map(() => {
      const electricity = Math.random() * 100 * multiplier;
      return ((electricity * currentCoefficient.value) / 1000).toFixed(4);
    });

    return {
      name: name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: data,
      itemStyle: { color: color },
      lineStyle: { width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${color}33` },
          { offset: 1, color: `${color}00` }
        ])
      }
    };
  });

  const option = {
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      borderWidth: 0, 
      shadowBlur: 10,
      textStyle: { color: '#333' },
      formatter: (params) => {
        let res = `<div style="margin-bottom: 5px; font-weight: bold;">${params[0].name}</div>`;
        params.forEach(item => {
          res += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ${item.data} tce</div>`;
        });
        return res;
      }
    },
    legend: { 
      data: series.map(s => s.name), 
      bottom: 0, 
      icon: 'circle', 
      type: 'scroll'
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: xAxisData,
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { 
        color: '#8c8c8c',
        formatter: (value) => dayjs(value).format('HH:mm'), // 坐标轴只显示时分
        interval: 7 // 每 2 小时显示一个刻度
      }
    },
    yAxis: { 
      type: 'value', 
      name: 'tce',
      splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } }
    },
    series: series
  };
  trendChart?.setOption(option, true);
};

// --- 表格逻辑 (汇总统计表) ---
const summaryColumns = [
  { title: '统计对象', dataIndex: 'target', key: 'target' },
  { title: '统计周期', dataIndex: 'period', key: 'period' },
  { title: '用电量 (kWh)', dataIndex: 'electricity', key: 'electricity', align: 'right' },
  { title: '电力折标能耗 (tce)', dataIndex: 'tce', key: 'tce', align: 'right' },
  { title: '折标系数类型', dataIndex: 'coeffType', key: 'coeffType' },
  { title: '折标系数值', dataIndex: 'coeffValue', key: 'coeffValue' },
  { title: '数据完整率', dataIndex: 'integrity', key: 'integrity', align: 'center' }
];

const summaryData = ref([
  { id: 1, target: '全网汇总', period: '2024-03-18 ~ 2024-03-25', electricity: '45,200.5', tce: '5.5551', coeffType: '当量值', coeffValue: '0.1229', integrity: 99.8 },
  { id: 2, target: '华东区代理商', period: '2024-03-18 ~ 2024-03-25', electricity: '28,150.2', tce: '3.4597', coeffType: '当量值', coeffValue: '0.1229', integrity: 98.5 }
]);

// --- 动态明细表逻辑 (同步 EnergyConsumptionQuery) ---
const currentColumns = computed(() => {
  const cols = [
    { title: '时间', dataIndex: 'time', key: 'time', width: 170, align: 'center', fixed: 'left' }
  ];
  const targetIds = checkedKeys.value?.checked || [];
  targetIds.forEach(id => {
    const node = getNodeInfoById(id);
    const name = node ? node.name : id;
    cols.push({
      title: `${name}(tce)`,
      dataIndex: `val_${id}`,
      key: `val_${id}`,
      align: 'center',
      minWidth: 150
    });
  });
  return cols;
});

const mockTableData = ref([]);

const generateMockData = () => {
  const data = [];
  const count = 15;
  const startTime = dateRange.value?.[0] || dayjs().subtract(7, 'day');
  const targetIds = checkedKeys.value?.checked || [];

  for (let i = 0; i < count; i++) {
    const row = {
      id: i,
      time: startTime.add(i, granularity.value).format(granularity.value === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM')
    };
    targetIds.forEach(id => {
      // 随机生成电量并实时转换为 tce
      const electricity = Math.random() * 200 + 50;
      row[`val_${id}`] = ((electricity * currentCoefficient.value) / 1000).toFixed(4);
    });
    data.push(row);
  }
  mockTableData.value = data;
};

const pagination = reactive({
  pageSize: 10,
  current: 1,
  total: 15,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100'],
  onChange: (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
    generateMockData();
  }
});

const refreshData = () => {
  const loading = message.loading('正在获取最新数据...', 0);
  setTimeout(() => {
    loading();
    updateTrendChart();
    generateMockData();
  }, 500);
};

const onGranularityChange = () => refreshData();
const onTreeSearch = () => {};
const exportReport = () => message.success('导出成功');

onMounted(() => {
  initCharts();
  generateMockData();
  window.addEventListener('resize', () => trendChart?.resize());
});
onUnmounted(() => trendChart?.dispose());

watch(coefficientType, refreshData);
</script>

<style scoped>
.intensity-calc-container {
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
}

.inner-layout {
  height: 100%;
}

.tree-sider {
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  background: #fff;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-bar {
  background: #fff;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: bold;
  color: #595959;
  font-size: 13px;
  margin-right: 8px;
}

.filter-spacer {
  flex: 1;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.highlight-card {
  border: 1px solid #1890ff;
  background: #e6f7ff;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.stat-main .label {
  display: block;
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 4px;
}

.stat-main .value-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-main .value {
  font-size: 28px;
  font-weight: bold;
  color: #262626;
  font-family: 'Din Alternate', sans-serif;
}

.stat-main .unit {
  font-size: 14px;
  color: #8c8c8c;
}

.stat-side {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.stat-side .sub-label {
  font-size: 12px;
  color: #bfbfbf;
}

/* 图表区 */
.chart-row {
  margin-bottom: 16px;
}

.chart-container {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header .title {
  font-weight: bold;
  color: #262626;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
  font-size: 15px;
}

.chart-box {
  height: 320px;
}

/* 表格区 */
.table-container {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header .title {
  font-weight: bold;
  color: #262626;
  font-size: 15px;
}

.text-primary { color: #1890ff; }
.text-warning { color: #faad14; }
.text-secondary { color: #8c8c8c; }
.ml-10 { margin-left: 10px; }
.ml-30 { margin-left: 30px; }
.mb-16 { margin-bottom: 16px; }

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tree-node-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.node-icon.root { color: #1890ff; }
.node-icon.agent { color: #722ed1; }
.node-icon.project { color: #52c41a; }
.node-icon.device { color: #faad14; }
</style>