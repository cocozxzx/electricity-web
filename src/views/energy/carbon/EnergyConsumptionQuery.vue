<template>
  <div class="consumption-query-container fade-in">
    <a-layout class="inner-layout">
      <!-- 左侧层级树 -->
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
              :show-time="granularity === 'minute' || granularity === 'hour'"
              :picker="granularity === 'month' ? 'month' : (granularity === 'year' ? 'year' : 'date')"
              @change="refreshData"
            />
          </div>
          <div class="filter-item ml-30">
            <span class="filter-label">统计粒度：</span>
            <a-select v-model:value="granularity" style="width: 100px" @change="onGranularityChange">
              <a-select-option  value="minute">分钟</a-select-option>
              <a-select-option value="hour">小时</a-select-option>
              <a-select-option value="day">日</a-select-option>
              <a-select-option value="month">月</a-select-option>
              <a-select-option value="year">年</a-select-option>
            </a-select>
          </div>
          <div class="filter-spacer"></div>
          <div class="header-right">
            <a-button @click="exportData('excel')">
              导出 Excel
            </a-button>
            <a-button type="primary" ghost @click="exportData('pdf')" class="ml-10">
              导出 PDF 报告
            </a-button>
          </div>
        </div>

        <div class="scroll-wrapper custom-scrollbar">
          <!-- 图表展示区 -->
          <a-row :gutter="16" class="chart-row">
            <a-col :span="24">
              <div class="chart-container">
                <div class="chart-header">
                  <span class="title">用电趋势</span>
                </div>
                <div ref="trendChartRef" class="chart-box"></div>
              </div>
            </a-col>
          </a-row>

          <!-- 数据明细表 -->
          <div class="table-container">
            <div class="table-header">
              <span class="title">{{ tableTitle }}</span>
            </div>
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
import { ref, reactive, computed, onMounted, watch, onUnmounted, markRaw } from 'vue';
import { 
  ShopOutlined, 
  BankOutlined, 
  ProjectOutlined, 
  HddOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  InfoCircleOutlined,
  InfoCircleFilled,
  WarningFilled,
  DownloadOutlined,
  FilePdfOutlined,
  SearchOutlined
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

// --- 层级树逻辑 ---
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

// --- 筛选栏逻辑 ---
const granularity = ref('minute');
const dateRange = ref([dayjs().startOf('day'), dayjs().endOf('day')]);
const activeMetric = ref('energy');

const onGranularityChange = () => {
  // 当粒度改变时，调整日期范围的显示精度
  if (granularity.value === 'minute' || granularity.value === 'hour') {
    dateRange.value = [dayjs().startOf('day'), dayjs().endOf('day')];
  } else if (granularity.value === 'month') {
    dateRange.value = [dayjs().startOf('year'), dayjs().endOf('year')];
  }
  refreshData();
};

// --- 统计概览数据 ---
const stats = reactive({
  currentPower: 125.8,
  powerTrend: 5.2,
  totalEnergy: 4520.5,
  energyYoY: -2.1,
  onlineCount: 42,
  totalCount: 45
});

// --- 图表逻辑 ---
const trendChartRef = ref(null);
const breakdownChartRef = ref(null);
let trendChart = null;
let breakdownChart = null;

const breakdownTitle = computed(() => {
  if (!selectedNode.value) return '层级占比';
  const titles = {
    root: '各代理商用电占比',
    agent: '各项目用电占比',
    project: '各设备用电占比',
    device: '今日分时用电柱状图'
  };
  return titles[selectedNode.value.type] || '层级占比';
});

const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    updateTrendChart();
  }
  if (breakdownChartRef.value) {
    breakdownChart = echarts.init(breakdownChartRef.value);
    updateBreakdownChart();
  }
};

const updateTrendChart = () => {
  const isEnergy = activeMetric.value === 'energy';
  const unit = isEnergy ? 'kWh' : 'kW';

  // Extract checked keys from the object structure used by check-strictly
  const targetKeys = checkedKeys.value?.checked || [];

  // 生成 X 轴数据：每 15 分钟一个点
  const xAxisData = [];
  const start = dayjs().startOf('day');
  for (let i = 0; i < 24 * 4; i++) {
    xAxisData.push(start.add(i * 15, 'minute').format('HH:mm'));
  }

  // 生成多条曲线
  const series = targetKeys.map((id, index) => {
    const node = getNodeInfoById(id);
    const name = node ? node.name : id;
    const type = node ? node.type : 'device';

    const colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];
    const color = colors[index % colors.length];

    let multiplier = 1;
    if (type === 'project') multiplier = 5;
    else if (type === 'agent') multiplier = 15;
    else if (type === 'root') multiplier = 40;

    const data = xAxisData.map(() => Math.round(Math.random() * 100 * multiplier));

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
        let res = `<div style="margin-bottom: 5px; font-weight: bold;">${dayjs().format('YYYY-MM-DD')} ${params[0].name}:00</div>`;
        params.forEach(item => {
          res += `<div><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>${item.seriesName}: ${item.data} ${unit}</div>`;
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
        interval: 7 // 每 2 小时显示一个刻度
      }
    },
    yAxis: { 
      type: 'value', 
      name: unit,
      splitLine: { lineStyle: { type: 'dashed', color: '#f5f5f5' } }
    },
    series: series
  };
  trendChart?.setOption(option, true);
};

const updateBreakdownChart = () => {
  if (!selectedNode.value) return;
  if (selectedNode.value.type === 'device') {
    breakdownChart?.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' },
      xAxis: { type: 'category', data: ['0-4h', '4-8h', '8-12h', '12-16h', '16-20h', '20-24h'] },
      yAxis: { type: 'value' },
      series: [{ 
        type: 'bar', 
        data: [15, 22, 45, 38, 52, 30], 
        itemStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#52c41a' },
            { offset: 1, color: '#b7eb8f' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }]
    }, true);
  } else {
    breakdownChart?.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10 },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold' } },
        data: [
          { value: 1048, name: '华东区域', itemStyle: { color: '#1890ff' } },
          { value: 735, name: '华南区域', itemStyle: { color: '#52c41a' } },
          { value: 580, name: '华北区域', itemStyle: { color: '#faad14' } },
          { value: 484, name: '西部区域', itemStyle: { color: '#ff4d4f' } }
        ]
      }]
    }, true);
  }
};

const currentColumns = computed(() => {
  const cols = [
    { 
      title: '时间', 
      dataIndex: 'time', 
      key: 'time', 
      width: 170,
      align: 'center',
      fixed: 'left'
    }
  ];

  const targetIds = checkedKeys.value?.checked || [];
  targetIds.forEach(id => {
    const node = getNodeInfoById(id);
    const name = node ? node.name : id;
    cols.push({
      title: `${name}(kWh)`,
      dataIndex: `val_${id}`,
      key: `val_${id}`,
      align: 'center',
      minWidth: 180
    });
  });

  return cols;
});

const mockTableData = ref([]);

const generateMockData = () => {
  const data = [];
  const count = 55; // Generate enough for multiple pages
  
  const startTime = dateRange.value?.[0] || dayjs().startOf('day');
  const targetIds = checkedKeys.value?.checked || [];

  for (let i = 0; i < count; i++) {
    // Generate time based on granularity
    let timeStr;
    if (granularity.value === 'minute') {
      timeStr = startTime.add(i * 15, 'minute').format('YYYY-MM-DD HH:mm');
    } else if (granularity.value === 'hour') {
      timeStr = startTime.add(i, 'hour').format('YYYY-MM-DD HH:00');
    } else if (granularity.value === 'day') {
      timeStr = startTime.add(i, 'day').format('YYYY-MM-DD');
    } else if (granularity.value === 'month') {
      timeStr = startTime.add(i, 'month').format('YYYY-MM');
    } else {
      timeStr = startTime.add(i, 'year').format('YYYY');
    }
    
    const row = {
      id: i,
      time: timeStr
    };

    targetIds.forEach(id => {
      // Use a consistent but randomized value for each node
      row[`val_${id}`] = (Math.random() * 200 + 50).toFixed(2);
    });

    data.push(row);
  }
  mockTableData.value = data;
  pagination.total = count;
};

const pagination = reactive({ 
  pageSize: 10, 
  current: 1, 
  total: 55,
  showSizeChanger: true,
  onChange: (page, pageSize) => {
    pagination.current = page;
    pagination.pageSize = pageSize;
  }
});

const getStatusColor = (status) => {
  const colors = { online: 'success', offline: 'default', frozen: 'warning' };
  return colors[status];
};

const getStatusText = (status) => {
  const texts = { online: '在线', offline: '离线', frozen: '疑似冻结' };
  return texts[status];
};

// --- 通用动作 ---
const refreshData = () => {
  const loading = message.loading('正在获取最新数据...', 0);
  setTimeout(() => {
    loading();
    updateTrendChart();
    updateBreakdownChart();
    generateMockData();
    // 模拟数据变动
    stats.currentPower = 120 + Math.random() * 20;
    stats.powerTrend = (Math.random() * 10 - 5).toFixed(1);
  }, 500);
};

const exportData = (type) => {
  message.loading(`正在生成${type.toUpperCase()}报表...`, 1.5).then(() => {
    message.success(`导出成功，文件已准备就绪`);
  });
};

const onTreeSearch = () => {
  // 树过滤逻辑由 computed 处理
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  breakdownChart?.dispose();
});

const handleResize = () => {
  trendChart?.resize();
  breakdownChart?.resize();
};

watch(activeMetric, updateTrendChart);
watch(granularity, refreshData);
</script>

<style scoped>
.consumption-query-container {
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
}

.inner-layout {
  height: 100%;
}

/* 层级树样式 */
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



.platform-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
}

.tree-search {
  margin-bottom: 8px;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tree-node-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 0;
}

.node-icon {
  font-size: 14px;
}
.node-icon.root { color: #1890ff; }
.node-icon.agent { color: #722ed1; }
.node-icon.project { color: #52c41a; }
.node-icon.device { color: #faad14; }

.status-dot {
  margin-left: 4px;
}

/* 主内容区样式 */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.page-header {
  background: #fff;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.role-tag {
  margin-right: 12px;
  font-weight: bold;
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

.auto-hint {
  font-size: 12px;
  color: #bfbfbf;
  margin-left: 10px;
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

.stat-main .separator {
  margin: 0 4px;
  color: #d9d9d9;
}

.stat-main .total {
  font-size: 18px;
  color: #bfbfbf;
}

.stat-side {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.stat-side .trend {
  font-weight: bold;
  font-size: 14px;
}

.stat-side .trend.up { color: #ff4d4f; }
.stat-side .trend.down { color: #52c41a; }

.stat-side .sub-label {
  font-size: 12px;
  color: #bfbfbf;
}

.offline-count {
  color: #faad14;
  font-weight: bold;
  font-size: 14px;
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


.table-name-cell {
  display: flex;
  align-items: center;
}

.val-empty {
  color: #bfbfbf;
}

.val-anomaly {
  color: #ff4d4f;
  font-weight: bold;
}

.text-primary { color: #1890ff; }
.text-success { color: #52c41a; }
.text-danger { color: #ff4d4f; }
.text-warning { color: #faad14; }
.text-secondary { color: #8c8c8c; }
.ml-5 { margin-left: 5px; }
.ml-10 { margin-left: 10px; }
.ml-30 { margin-left: 30px; }
.mr-5 { margin-right: 5px; }
.font-bold { font-weight: bold; }

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>