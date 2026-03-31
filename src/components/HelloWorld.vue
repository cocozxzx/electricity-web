<template>
  <div class="cockpit-container sci-fi-theme">
    <a-row :gutter="[10, 10]" class="dashboard-row">
      <!-- Left Column -->
      <a-col :span="leftVisible ? 6 : 0" class="col-left" v-show="leftVisible">
        <!-- 1. 全局资产总览 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><project-outlined /> 全局资产总览</span>
            <!-- <left-circle-outlined class="toggle-icon" @click="leftVisible = false" /> -->
            <div class="header-line"></div>
          </div>
          <div class="card-body asset-body">
            <div class="asset-grid">
              <div class="asset-item">
                <div class="asset-icon-wrapper"><bank-outlined /></div>
                <div class="asset-info">
                  <div class="asset-label">接入项目</div>
                  <div class="asset-value">24 <small></small></div>
                  <div class="asset-bar"><div class="bar-inner" style="width: 100%"></div></div>
                </div>
              </div>
              <div class="asset-item">
                <div class="asset-icon-wrapper"><gateway-outlined /></div>
                <div class="asset-info">
                  <div class="asset-label">网关总数</div>
                  <div class="asset-value">156 <small>120 在线</small></div>
                  <div class="asset-bar"><div class="bar-inner success" style="width: 100%"></div></div>
                </div>
              </div>
              <div class="asset-item">
                <div class="asset-icon-wrapper"><hdd-outlined /></div>
                <div class="asset-info">
                  <div class="asset-label">子设备数</div>
                  <div class="asset-value">1,482 <small>1000 在线</small></div>
                  <div class="asset-bar"><div class="bar-inner warning" style="width: 80%"></div></div>
                </div>
              </div>
              <div class="asset-item">
                <div class="asset-icon-wrapper"><alert-outlined /></div>
                <div class="asset-info">
                  <div class="asset-label">今日告警</div>
                  <div class="asset-value">32 <small class="text-error"></small></div>
                  <div class="asset-bar"><div class="bar-inner" style="width: 100%"></div></div>
                </div>
              </div>
            </div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 2. 故障类型占比 (玫瑰图) -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><pie-chart-outlined /> 故障类型占比</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="faultTypeChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 3. 项目能耗规模TOP5 (横向条形图) -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><line-chart-outlined /> 项目能耗规模 TOP5</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="energyTopChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>
      </a-col>

      <!-- Middle Column -->
      <a-col :span="middleSpan" class="col-center">
        <!-- 侧边栏切换按钮 (居中放置) -->
        <div class="side-controls left" :class="{ 'collapsed': !leftVisible }">
          <left-circle-outlined v-if="leftVisible" class="toggle-trigger" @click="leftVisible = false" />
          <right-circle-outlined v-else class="toggle-trigger" @click="leftVisible = true" />
        </div>
        <div class="side-controls right" :class="{ 'collapsed': !rightVisible }">
          <right-circle-outlined v-if="rightVisible" class="toggle-trigger" @click="rightVisible = false" />
          <left-circle-outlined v-else class="toggle-trigger" @click="rightVisible = true" />
        </div>

        <!-- 实时告警跑马灯 -->
        <div class="realtime-alarm-bar" @click="router.push('/alarm-record')">
          <div class="alarm-label"><alert-outlined /> 实时告警监控：</div>
          <div class="alarm-content">
            <div class="alarm-scroll-container">
              <div class="alarm-scroll-content">
                <span class="alarm-text">[14:25] 萧山区电力园：1号配电柜发生A相电流过载(严重)</span>
                <span class="alarm-text">[14:18] 西湖区运行中心：终端网关发生设备离线告警(一般)</span>
                <span class="alarm-text">[14:05] 滨江区物联基地：3号温控器发生通信异常(较大)</span>
                <!-- 重复内容以实现无缝滚动 -->
                <span class="alarm-text">[14:25] 萧山区电力园：1号配电柜发生A相电流过载(严重)</span>
                <span class="alarm-text">[14:18] 西湖区运行中心：终端网关发生设备离线告警(一般)</span>
                <span class="alarm-text">[14:05] 滨江区物联基地：3号温控器发生通信异常(较大)</span>
              </div>
            </div>
          </div>
          <div class="alarm-link">前往处理 <right-outlined /></div>
        </div>

        <div class="sci-fi-card map-card">
          <div class="card-header">
            <div class="header-line"></div>
          </div>
          <div class="card-body no-padding">
            <div class="map-wrapper">
               <MapContainer 
                  :center="[120.15507, 30.274085]" 
                  :zoom="12" 
                  :markers="mapMarkers" 
                  @marker-click="handleMarkerClick"
                />
            </div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>
      </a-col>

      <!-- Right Column -->
      <a-col :span="rightVisible ? 6 : 0" class="col-right" v-show="rightVisible">
        <!-- 1. 高危安全隐患走势 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><alert-outlined /> 高危安全隐患走势</span>
            <!-- <right-circle-outlined class="toggle-icon" @click="rightVisible = false" /> -->
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="hazardTrendChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 2. 高频告警项目TOP5 (横向条形图) -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><thunderbolt-outlined /> 高频告警项目 TOP5</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="alarmTopChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 3. 巡检执行 (全量) -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><file-search-outlined /> 巡检执行 (全量)</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div class="env-grid">
              <div class="env-item">
                <div class="env-label">本月总计划</div>
                <div class="env-val">248 <small>个</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">累计已执行</div>
                <div class="env-val">186 <small>个</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">异常追踪</div>
                <div class="env-val warning">12 <small>起</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">平均完成率</div>
                <div class="env-val success">75.0%</div>
              </div>
            </div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import { 
  ProjectOutlined, PieChartOutlined, LineChartOutlined, EnvironmentOutlined, 
  DesktopOutlined, ThunderboltOutlined, AlertOutlined, BankOutlined, GatewayOutlined, HddOutlined,
  RightOutlined, LeftCircleOutlined, RightCircleOutlined, FileSearchOutlined
} from '@ant-design/icons-vue'
import MapContainer from './MapContainer.vue'

const router = useRouter()

// Panel Visibility Logic
const leftVisible = ref(true)
const rightVisible = ref(true)

const middleSpan = computed(() => {
  let span = 12
  if (!leftVisible.value) span += 6
  if (!rightVisible.value) span += 6
  return span
})

// Refs for ECharts
const faultTypeChartRef = ref(null)
const energyTopChartRef = ref(null)
const hazardTrendChartRef = ref(null)
const alarmTopChartRef = ref(null)

let charts = []

// Map Markers - Distributed with different status colors
const mapMarkers = ref([
  { position: [120.13026, 30.25961], title: '西湖区运行中心', color: 'gray' },
  { position: [120.15132, 30.32015], title: '拱墅区配电站', color: 'yellow' },
  { position: [120.20984, 30.24682], title: '上城区监测点', color: 'orange' },
  { position: [120.21123, 30.20942], title: '滨江区物联基地', color: 'red' },
  { position: [120.26421, 30.18231], title: '萧山区电力园', color: 'red' },
  { position: [120.03821, 30.28123], title: '余杭区云中心', color: 'cyan' },
])

const handleMarkerClick = (marker) => {
  router.push({
    path: '/project-cockpit',
    query: {
      name: marker.title,
      pos: JSON.stringify(marker.position)
    }
  })
}

const initCharts = () => {
  charts.forEach(chart => chart && chart.dispose())
  charts = []

  if (!faultTypeChartRef.value) return

  // 1. Fault Type Rose Chart
  const faultTypeChart = echarts.init(faultTypeChartRef.value)
  faultTypeChart.setOption({
    animationDuration: 2000,
    animationEasing: 'exponentialOut',
    tooltip: { trigger: 'item' },
    legend: { bottom: '0', textStyle: { color: '#8fb0c9', fontSize: 10 } },
    color: ['#00eaff', '#36cbcb', '#4facfe', '#fcd347', '#ff9f7f'],
    series: [
      {
        name: '故障类型',
        type: 'pie',
        radius: ['20%', '70%'],
        center: ['50%', '45%'],
        roseType: 'area',
        itemStyle: { borderRadius: 5 },
        label: { show: true, color: '#8fb0c9', fontSize: 10, formatter: '{b}' },
        data: [
          { value: 40, name: '过载' },
          { value: 32, name: '漏电' },
          { value: 28, name: '超温' },
          { value: 24, name: '过压/欠压' },
          { value: 18, name: '短路/打火' }
        ]
      }
    ]
  })
  charts.push(faultTypeChart)

  // 2. Project Energy TOP5
  const energyTopChart = echarts.init(energyTopChartRef.value)
  energyTopChart.setOption({
    animationDuration: 1500,
    grid: { left: '3%', right: '15%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { 
      type: 'category', 
      data: ['人才公寓', '天河办公', '工业园区', '时代广场', '国际会议'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8fb0c9' }
    },
    series: [{
      data: [420, 580, 720, 850, 960],
      type: 'bar', barWidth: 12,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#00eaff' }, { offset: 1, color: 'rgba(0, 234, 255, 0.1)' }])
      },
      label: { show: true, position: 'right', color: '#00eaff', fontSize: 11, formatter: '{c} kWh' }
    }]
  })
  charts.push(energyTopChart)

  // 4. Hazard Trend
  const hazardTrendChart = echarts.init(hazardTrendChartRef.value)
  hazardTrendChart.setOption({
    animationDuration: 3000,
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(3, 12, 30, 0.8)', 
      borderColor: '#ff4d4f', 
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' }
    },
    legend: { top: '0', textStyle: { color: '#8fb0c9' }, icon: 'circle' },
    grid: { left: '3%', right: '5%', bottom: '5%', top: '20%', containLabel: true },
    xAxis: { type: 'category', data: ['03-07','03-08','03-09','03-10','03-11','03-12','03-13'], axisLabel: { color: '#8fb0c9' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#8fb0c9' } },
    series: [
      {
        name: '严重告警', data: [5, 8, 4, 12, 6, 3, 7], type: 'line', smooth: true,
        itemStyle: { color: '#ff4d4f' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,77,79,0.3)' }, { offset: 1, color: 'transparent' }]) }
      },
      {
        name: '较大告警', data: [12, 15, 10, 22, 18, 14, 16], type: 'line', smooth: true,
        itemStyle: { color: '#faad14' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(250,173,20,0.3)' }, { offset: 1, color: 'transparent' }]) }
      }
    ]
  })
  charts.push(hazardTrendChart)

  // 5. Alarm Top TOP5
  const alarmTopChart = echarts.init(alarmTopChartRef.value)
  alarmTopChart.setOption({
    animationDuration: 2000,
    grid: { left: '3%', right: '15%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
    yAxis: { type: 'category', data: ['宝安写字楼', '国际金融', '海雅广场', '人才公寓', '南方大厦'], axisLine: { show: false }, axisLabel: { color: '#8fb0c9' } },
    series: [{
      data: [12, 18, 25, 32, 45],
      type: 'bar', barWidth: 12,
      itemStyle: {
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#ff4d4f' }, { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }])
      },
      label: { show: true, position: 'right', color: '#ff4d4f', fontSize: 11, formatter: '{c} 次' }
    }]
  })
  charts.push(alarmTopChart)
}

const handleResize = () => {
  charts.forEach(chart => chart && chart.resize())
}

watch([leftVisible, rightVisible], () => {
  nextTick(() => {
    setTimeout(handleResize, 400)
  })
})

onMounted(() => {
  nextTick(() => {
    setTimeout(initCharts, 500)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart && chart.dispose())
})
</script>

<style scoped>
.cockpit-container.sci-fi-theme {
  padding: 10px;
  background-color: #030816;
  height: calc(100vh - 80px);
  color: #fff;
  overflow: hidden;
  animation: contentAppear 1s ease-out;
}
@keyframes contentAppear { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.dashboard-row { 
  height: 100%; 
  margin: 0 !important; 
  position: relative; 
  overflow: hidden;
}

:deep(.ant-col) {
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1) !important;
}

.col-left, .col-right { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
  height: 100%; 
  overflow: hidden;
  transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.col-left[style*="display: none"],
.col-right[style*="display: none"] {
  opacity: 0;
  transform: translateX(-20px);
}

.col-right[style*="display: none"] {
  transform: translateX(20px);
}
.col-center { 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  position: relative;
  overflow: hidden;
}

/* Side Controls Junction Arrows */
.side-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  transition: all 0.4s;
}
.side-controls.left { left: 0; }
.side-controls.right { right: 0; }

.toggle-trigger {
  font-size: 24px;
  color: #00eaff;
  cursor: pointer;
  background: rgba(3, 12, 30, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 234, 255, 0.3);
  transition: all 0.3s;
}
.toggle-trigger:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px #00eaff;
}

/* Toggle Icon in card header */
.toggle-icon { position: absolute; right: 10px; top: 10px; color: #00eaff; cursor: pointer; font-size: 18px; opacity: 0.6; transition: all 0.3s; z-index: 10; }
.toggle-icon:hover { opacity: 1; transform: scale(1.2); filter: drop-shadow(0 0 5px #00eaff); }

/* Realtime Alarm Bar */
.realtime-alarm-bar {
  background: rgba(255, 77, 79, 0.1);
  border: 1px solid rgba(255, 77, 79, 0.3);
  padding: 8px 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: inset 0 0 10px rgba(255, 77, 79, 0.1);
}
.realtime-alarm-bar:hover { background: rgba(255, 77, 79, 0.2); box-shadow: 0 0 15px rgba(255, 77, 79, 0.2); }
.alarm-label { color: #ff4d4f; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 5px; }
.alarm-content { flex: 1; margin: 0 15px; overflow: hidden; height: 20px; position: relative; }

.alarm-scroll-container {
  height: 100%;
}

.alarm-scroll-content {
  display: flex;
  flex-direction: column;
  animation: continuousScroll 12s linear infinite;
}

.alarm-text { 
  height: 20px; 
  line-height: 20px; 
  color: #fff; 
  font-size: 13px; 
  white-space: nowrap; 
}

.alarm-link { color: #8fb0c9; font-size: 12px; }

@keyframes continuousScroll {
  0% { transform: translateY(0); }
  100% { transform: translateY(-60px); }
}

/* Sci-fi Card Style */
.sci-fi-card {
  position: relative;
  background: rgba(16, 24, 48, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 234, 255, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  transition: all 0.3s;
  overflow: hidden;
}

.card-header { padding: 8px 16px; position: relative; }
.card-header .title { font-size: 13px; font-weight: bold; color: #00eaff; text-shadow: 0 0 8px rgba(0, 234, 255, 0.5); display: flex; align-items: center; gap: 8px; }
.header-line { position: absolute; bottom: 0; left: 16px; right: 16px; height: 1px; background: linear-gradient(90deg, #00eaff, transparent); opacity: 0.3; }
.card-body { flex: 1; padding: 10px; display: flex; flex-direction: column; overflow: hidden; }
.card-body.no-padding { padding: 0; }

/* Asset Overview Styles */
.asset-grid { height: 100%; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }
.asset-item { 
  display: flex; align-items: center; gap: 10px; background: rgba(0, 234, 255, 0.03); 
  padding: 8px 12px; border-radius: 4px; border: 1px solid rgba(0, 234, 255, 0.1); 
  position: relative; overflow: hidden; 
  animation: itemSlide 0.8s ease-out both;
}
@keyframes itemSlide { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
.asset-item:nth-child(1) { animation-delay: 0.1s; }
.asset-item:nth-child(2) { animation-delay: 0.2s; }
.asset-item:nth-child(3) { animation-delay: 0.3s; }
.asset-item:nth-child(4) { animation-delay: 0.4s; }

.asset-icon-wrapper { font-size: 20px; color: #00eaff; opacity: 0.8; }
.asset-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.asset-label { font-size: 12px; color: #8fb0c9; margin-bottom: 4px; }
.asset-value { font-size: 22px; font-weight: bold; color: #fff; line-height: 1; display: flex; align-items: baseline; }
.asset-value small { font-size: 11px; color: #52c41a; font-weight: normal; margin-left: 8px; }
.asset-value small.text-error { color: #ff4d4f; }

.asset-bar { width: 100%; height: 2px; background: rgba(255, 255, 255, 0.05); margin-top: 6px; border-radius: 1px; overflow: hidden; }
.bar-inner { 
  height: 100%; background: #00eaff; box-shadow: 0 0 5px #00eaff; 
  animation: barLoad 2s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
  transform-origin: left;
}
@keyframes barLoad { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.bar-inner.warning { background: #faad14; }
.bar-inner.success { background: #52c41a; }

.env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: 100%; align-items: center; }
.env-item { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 4px; text-align: center; }
.env-label { font-size: 11px; color: #8fb0c9; }
.env-val { font-size: 18px; font-weight: bold; color: #00eaff; margin-top: 5px; }
.env-val.warning { color: #faad14; }
.env-val.success { color: #52c41a; }

.chart-container { width: 100%; flex: 1; min-height: 150px; }

/* Corners */
.sci-fi-card [class^="corner-"] { position: absolute; width: 10px; height: 10px; border: 2px solid #00eaff; }
.corner-tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.corner-tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.corner-bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.corner-br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

/* Map & Layout Adjustments */
.map-card { height: 100%; }
.map-wrapper { width: 100%; height: 100%; min-height: 600px; }

/* 修复地图控件文字看不见的问题 */
:deep(.amap-layers-control), :deep(.amap-maptype-list), :deep(.amap-maptype-title), :deep(.amap-maptype-con) { color: #333 !important; }
</style>
