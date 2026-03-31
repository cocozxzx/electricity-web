<template>
  <div class="cockpit-container sci-fi-theme">
    <a-row :gutter="[10, 10]" class="dashboard-row">
      <!-- Left Column -->
      <a-col :span="leftVisible ? 6 : 0" class="col-left" v-show="leftVisible">
        <!-- 1. 项目资产总览 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><project-outlined /> 项目资产总览</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body asset-body no-padding">
            <div class="asset-list-header">
              <span class="col-model">设备型号</span>
              <span class="col-online">在线统计</span>
            </div>
            <div class="asset-list-wrapper">
              <div class="asset-list-content">
                <div v-for="(item, index) in infiniteAssetList" :key="index" class="asset-list-row">
                  <span class="col-model">{{ item.model }}</span>
                  <span :class="['col-online', { 'text-success': item.online === item.total, 'text-warning': item.online < item.total }]">
                    {{ item.online }} / {{ item.total }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 2. 用电能耗 (kWh) -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><bar-chart-outlined /> 用电能耗 (kWh)</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="energyBarChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 3. 实时告警 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><alert-outlined /> 实时告警流</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body marquee-body">
            <div class="marquee-header">
              <span class="h-time">时间</span>
              <span class="h-device">设备名称</span>
              <span class="h-content">告警内容</span>
              <span class="h-result">处理结果</span>
              <span class="h-level">级别</span>
            </div>
            <div class="alarm-marquee-wrapper">
              <div class="alarm-marquee-content">
                <div v-for="(item, index) in infiniteAlarmList" :key="index" class="alarm-row" @click="handleAlarmClick">
                  <span class="a-time">{{ item.time }}</span>
                  <span class="a-device">{{ item.device }}</span>
                  <span class="a-content">{{ item.content }}</span>
                  <span :class="['a-result', getResultClass(item.result)]">{{ item.result }}</span>
                  <span :class="['a-level', getLevelClass(item.level)]">{{ item.level }}</span>
                </div>
              </div>
            </div>
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
        <div class="realtime-alarm-bar" @click="handleAlarmClick">
          <div class="alarm-label"><alert-outlined /> 实时动态：</div>
          <div class="alarm-content">
            <div class="alarm-scroll-container">
              <div class="alarm-scroll-content">
                <span class="alarm-text">[14:25] {{ projectName }}：1号配电柜发生A相电流过载(严重)</span>
                <span class="alarm-text">[14:18] {{ projectName }}：终端网关发生设备离线告警(一般)</span>
                <span class="alarm-text">[14:05] {{ projectName }}：3号温控器发生通信异常(较大)</span>
                <span class="alarm-text">[14:25] {{ projectName }}：1号配电柜发生A相电流过载(严重)</span>
                <span class="alarm-text">[14:18] {{ projectName }}：终端网关发生设备离线告警(一般)</span>
                <span class="alarm-text">[14:05] {{ projectName }}：3号温控器发生通信异常(较大)</span>
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
                  :center="projectPosition" 
                  :zoom="18" 
                  :markers="deviceMarkers" 
                />
            </div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 返回主页按钮 (上移，防止遮挡) -->
        <div class="floating-home-btn" @click="router.push('/cockpit')" title="返回主驾驶舱">
          <home-outlined />
        </div>
      </a-col>

      <!-- Right Column -->
      <a-col :span="rightVisible ? 6 : 0" class="col-right" v-show="rightVisible">
        <!-- 1. 告警趋势 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><line-chart-outlined /> 告警趋势 (近7日)</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="alarmTrendChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 2. 维修工单 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><form-outlined /> 维修工单统计</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div ref="workOrderPieChartRef" class="chart-container"></div>
          </div>
          <div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>
        </div>

        <!-- 3. 巡检执行与异常追踪 -->
        <div class="sci-fi-card">
          <div class="card-header">
            <span class="title"><file-search-outlined /> 巡检执行与异常追踪</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <div class="env-grid">
              <div class="env-item">
                <div class="env-label">本月计划</div>
                <div class="env-val">12 <small>个</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">已执行</div>
                <div class="env-val">8 <small>个</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">异常追踪</div>
                <div class="env-val warning">2 <small>起</small></div>
              </div>
              <div class="env-item">
                <div class="env-label">完成率</div>
                <div class="env-val success">66.7%</div>
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
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  ProjectOutlined, LineChartOutlined, PieChartOutlined, EnvironmentOutlined, 
  AlertOutlined, ThunderboltOutlined, RightOutlined, BarChartOutlined,
  FormOutlined, FileSearchOutlined, GatewayOutlined, HddOutlined,
  ClusterOutlined, DeploymentUnitOutlined, HomeOutlined, LeftCircleOutlined, RightCircleOutlined
} from '@ant-design/icons-vue'
import MapContainer from '../components/MapContainer.vue'

const route = useRoute()
const router = useRouter()
const projectName = ref(route.query.name || '默认项目')

const projectPositions = {
  '萧山区电力园项目': [120.25, 30.22],
  '上海静安数据中心': [121.45, 31.23],
  '西湖区运行中心': [120.13, 30.26],
  '拱墅区配电站': [120.15, 30.30]
}

// --- Helper Functions ---
function getLevelClass(level) {
  const map = { '一般': 'level-info', '关注': 'level-cyan', '较大': 'level-warn', '严重': 'level-error' }
  return map[level] || ''
}

function getResultClass(result) {
  const map = { '未恢复': 'res-red', '已恢复': 'res-green', '测试': 'res-blue', '误报': 'res-gray' }
  return map[result] || ''
}

function handleResize() {
  charts.forEach(c => c && c.resize())
}

function handleAlarmClick() {
  router.push('/alarm-record')
}

// Panel Visibility Logic
const leftVisible = ref(true)
const rightVisible = ref(true)

const middleSpan = computed(() => {
  let span = 12
  if (!leftVisible.value) span += 6
  if (!rightVisible.value) span += 6
  return span
})

const getInitialPos = () => {
  if (route.query.name && projectPositions[route.query.name]) {
    return projectPositions[route.query.name]
  }
  try {
    return route.query.pos ? JSON.parse(route.query.pos) : [120.13026, 30.25961]
  } catch (e) {
    return [120.13026, 30.25961]
  }
}
const projectPosition = ref(getInitialPos())

// Charts refs
const energyBarChartRef = ref(null)
const alarmTrendChartRef = ref(null)
const workOrderPieChartRef = ref(null)
let charts = []

// --- 报警滚动逻辑 ---
const baseAlarmList = [
  { time: '14:25', device: '1号柜', content: 'A相电流过载', result: '未恢复', level: '严重' },
  { time: '14:18', device: '网关01', content: '网关离线', result: '已恢复', level: '一般' },
  { time: '14:05', device: '温控03', content: '通信异常', result: '测试', level: '较大' },
  { time: '13:50', device: '断路器02', content: 'A相电压波动', result: '误报', level: '关注' },
]
const infiniteAlarmList = computed(() => [...baseAlarmList, ...baseAlarmList, ...baseAlarmList])

// --- 资产列表滚动逻辑 ---
const assetList = [
  { model: '智能网关 GW-01', total: 4, online: 4 },
  { model: '塑壳重合闸 CB-100', total: 12, online: 10 },
  { model: '单相断路器 CB-S1', total: 64, online: 60 },
  { model: '三相断路器 CB-T3', total: 32, online: 32 },
]
const infiniteAssetList = computed(() => [...assetList, ...assetList, ...assetList])

// 地图点位
const deviceMarkers = ref([
  { position: projectPosition.value, title: `${projectName.value}-1号主柜`, color: 'cyan' },
  { position: [projectPosition.value[0] + 0.0005, projectPosition.value[1] + 0.0005], title: `${projectName.value}-进线网关`, color: 'red' },
  { position: [projectPosition.value[0] - 0.0005, projectPosition.value[1] + 0.0003], title: `${projectName.value}-2号分柜`, color: 'yellow' },
  { position: [projectPosition.value[0] + 0.0003, projectPosition.value[1] - 0.0004], title: `${projectName.value}-温控感应`, color: 'orange' },
  { position: [projectPosition.value[0] - 0.0004, projectPosition.value[1] - 0.0005], title: `${projectName.value}-备用电源`, color: 'gray' },
])

watch(() => route.query.name, (newName) => {
  if (newName) {
    projectName.value = newName
    projectPosition.value = getInitialPos()
    deviceMarkers.value = [
      { position: projectPosition.value, title: `${projectName.value}-1号主柜`, color: 'cyan' },
      { position: [projectPosition.value[0] + 0.0005, projectPosition.value[1] + 0.0005], title: `${projectName.value}-进线网关`, color: 'red' },
      { position: [projectPosition.value[0] - 0.0005, projectPosition.value[1] + 0.0003], title: `${projectName.value}-2号分柜`, color: 'yellow' },
      { position: [projectPosition.value[0] + 0.0003, projectPosition.value[1] - 0.0004], title: `${projectName.value}-温控感应`, color: 'orange' },
      { position: [projectPosition.value[0] - 0.0004, projectPosition.value[1] - 0.0005], title: `${projectName.value}-备用电源`, color: 'gray' },
    ]
  }
})

const initCharts = () => {
  charts.forEach(c => c && c.dispose())
  charts = []

  // 1. Energy Bar Chart
  if (energyBarChartRef.value) {
    const energyChart = echarts.init(energyBarChartRef.value)
    energyChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(3, 12, 30, 0.8)', borderColor: '#00eaff', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '5%', bottom: '5%', top: '20%', containLabel: true },
      xAxis: { type: 'category', data: ['3-7','3-8','3-9','3-10','3-11','3-12','3-13'], axisLabel: { color: '#8fb0c9' } },
      yAxis: { type: 'value', axisLabel: { color: '#8fb0c9' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      series: [{
        data: [450, 520, 480, 610, 590, 430, 550], type: 'bar', barWidth: 15,
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#00eaff' }, { offset: 1, color: 'transparent' }]) }
      }]
    })
    charts.push(energyChart)
  }

  // 2. Alarm Trend
  if (alarmTrendChartRef.value) {
    const alarmChart = echarts.init(alarmTrendChartRef.value)
    alarmChart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(3, 12, 30, 0.8)', borderColor: '#ff4d4f', textStyle: { color: '#fff' } },
      animationDuration: 3000,
      grid: { left: '3%', right: '5%', bottom: '5%', top: '20%', containLabel: true },
      xAxis: { type: 'category', data: ['3-7','3-8','3-9','3-10','3-11','3-12','3-13'], axisLabel: { color: '#8fb0c9' } },
      yAxis: { type: 'value', axisLabel: { color: '#8fb0c9' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
      series: [{
        data: [2, 5, 3, 8, 4, 2, 6], type: 'line', smooth: true,
        lineStyle: { color: '#ff4d4f', width: 3 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,77,79,0.3)' }, { offset: 1, color: 'transparent' }]) }
      }]
    })
    charts.push(alarmChart)
  }

  // 3. Work Order Pie
  if (workOrderPieChartRef.value) {
    const orderChart = echarts.init(workOrderPieChartRef.value)
    orderChart.setOption({
      animationDuration: 2000,
      tooltip: { trigger: 'item' },
      color: ['#1890ff', '#faad14', '#52c41a'],
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        label: { show: true, color: '#8fb0c9', formatter: '{b}\n{c}' },
        data: [{ value: 5, name: '处理中' }, { value: 3, name: '待审核' }, { value: 12, name: '已完成' }]
      }]
    })
    charts.push(orderChart)
  }

  window.addEventListener('resize', handleResize)
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
  charts.forEach(c => c && c.dispose())
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

/* Floating Home Button */
.floating-home-btn {
  position: absolute;
  right: 20px;
  bottom: 100px;
  width: 50px;
  height: 50px;
  background: rgba(0, 234, 255, 0.1);
  border: 1px solid #00eaff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00eaff;
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
  box-shadow: 0 0 15px rgba(0, 234, 255, 0.3);
}
.floating-home-btn:hover {
  background: rgba(0, 234, 255, 0.3);
  transform: scale(1.1) rotate(360deg);
  box-shadow: 0 0 25px rgba(0, 234, 255, 0.6);
}

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
.alarm-scroll-container { height: 100%; }
.alarm-scroll-content { display: flex; flex-direction: column; animation: continuousScroll 12s linear infinite; }
.alarm-text { height: 20px; line-height: 20px; color: #fff; font-size: 13px; white-space: nowrap; }
.alarm-link { color: #8fb0c9; font-size: 12px; }
@keyframes continuousScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-60px); } }

.sci-fi-card {
  position: relative;
  background: rgba(16, 24, 48, 0.6);
  border: 1px solid rgba(0, 234, 255, 0.2);
  box-shadow: inset 0 0 20px rgba(0, 234, 255, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header { padding: 8px 16px; position: relative; }
.card-header .title { font-size: 13px; font-weight: bold; color: #00eaff; text-shadow: 0 0 8px rgba(0, 234, 255, 0.5); display: flex; align-items: center; gap: 8px; }
.header-line { position: absolute; bottom: 0; left: 16px; right: 16px; height: 1px; background: linear-gradient(90deg, #00eaff, transparent); opacity: 0.3; }
.card-body { flex: 1; padding: 10px; display: flex; flex-direction: column; overflow: hidden; }
.card-body.no-padding { padding: 0; }

.asset-list-header {
  display: flex;
  background: rgba(0, 234, 255, 0.1);
  padding: 8px 12px;
  font-size: 11px;
  color: #00eaff;
  font-weight: bold;
  border-bottom: 1px solid rgba(0, 234, 255, 0.2);
}

.asset-list-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.asset-list-content {
  animation: continuousScrollAsset 10s linear infinite;
}

.asset-list-content:hover {
  animation-play-state: paused;
}

@keyframes continuousScrollAsset {
  0% { transform: translateY(0); }
  100% { transform: translateY(-140px); } /* Adjust based on row height and count */
}

.asset-list-row {
  height: 35px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px dashed rgba(0, 234, 255, 0.1);
  font-size: 11px;
  color: #8fb0c9;
  transition: background 0.2s;
}

.asset-list-row:hover {
  background: rgba(0, 234, 255, 0.1);
}

.col-model { flex: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-total { flex: 1; text-align: center; }
.col-online { flex: 1; text-align: center; }

.text-success { color: #52c41a; }
.text-warning { color: #faad14; }

.marquee-body { padding: 0 !important; }
.marquee-header { 
  display: flex; background: rgba(0, 234, 255, 0.1); padding: 8px 10px; 
  font-size: 11px; color: #00eaff; font-weight: bold; border-bottom: 1px solid rgba(0, 234, 255, 0.2);
}
.h-time, .a-time { width: 45px; flex-shrink: 0; }
.h-device, .a-device { width: 70px; flex-shrink: 0; }
.h-content, .a-content { flex: 1; padding: 0 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.h-result, .a-result { width: 60px; flex-shrink: 0; text-align: center; }
.h-level, .a-level { width: 45px; flex-shrink: 0; text-align: center; }

.alarm-marquee-wrapper { height: 100%; overflow: hidden; }
.alarm-marquee-content { animation: continuousScrollVertical 12s linear infinite; cursor: pointer; }
.alarm-marquee-content:hover { animation-play-state: paused; }

@keyframes continuousScrollVertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(-140px); }
}

.alarm-row { height: 35px; display: flex; align-items: center; padding: 0 10px; border-bottom: 1px dashed rgba(0, 234, 255, 0.1); font-size: 11px; color: #8fb0c9; transition: background 0.2s; }
.alarm-row:hover { background: rgba(0, 234, 255, 0.1); }
.a-content { color: #fff; }
.a-level { font-size: 10px; padding: 1px 0; border-radius: 2px; }
.level-info { background: rgba(82, 196, 26, 0.2); color: #52c41a; }
.level-cyan { background: rgba(0, 234, 255, 0.2); color: #00eaff; }
.level-warn { background: rgba(250, 173, 20, 0.2); color: #faad14; }
.level-error { background: rgba(255, 77, 79, 0.2); color: #ff4d4f; }

/* 处理结果颜色 */
.res-red { color: #ff4d4f; }
.res-green { color: #52c41a; }
.res-blue { color: #1890ff; }
.res-gray { color: #999; }

.env-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; height: 100%; align-items: center; }
.env-item { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 4px; text-align: center; }
.env-label { font-size: 11px; color: #8fb0c9; }
.env-val { font-size: 18px; font-weight: bold; color: #00eaff; margin-top: 5px; }
.env-val.warning { color: #faad14; }
.env-val.success { color: #52c41a; }

.chart-container { width: 100%; flex: 1; min-height: 150px; }

.sci-fi-card [class^="corner-"] { position: absolute; width: 10px; height: 10px; border: 2px solid #00eaff; }
.corner-tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
.corner-tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
.corner-bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
.corner-br { bottom: -1px; right: -1px; border-left: none; border-top: none; }

.map-card { height: 100%; }
.map-wrapper { width: 100%; height: 100%; min-height: 600px; }
</style>
