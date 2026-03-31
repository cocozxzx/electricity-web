<template>
  <div class="device-detail fade-in">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-left">
        <a-button @click="$router.back()" class="back-btn" shape="circle">
          <template #icon><left-outlined /></template>
        </a-button>
        <div class="title-info">
          <h2 class="title">测试设备001</h2>
          <div class="status-tags">
            <span class="status-dot online"></span>
            <span class="status-text">在线</span>
            <span class="status-dot online" style="margin-left: 10px;"></span>
            <span class="status-text">合闸</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Tabs -->
    <div class="detail-content">
      <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
        <!-- 1. Real-time Monitoring -->
        <a-tab-pane key="realtime" tab="实时监控">
          <div class="monitor-dashboard">
            <div class="monitor-actions">
              <a-button @click="showMetricSelect = true">
                <template #icon><unordered-list-outlined /></template>
                监测数据项选择
              </a-button>
            </div>
            <div class="top-cards">
              <div class="metric-card" v-for="metric in visibleTopMetrics" :key="metric.id">
                <div class="card-header">
                  <span class="label">{{ metric.label }}</span>
                  <component :is="metric.icon" :style="{ color: metric.iconColor }" />
                </div>
                <div class="card-body">
                  <span class="value">{{ metric.value }}</span>
                  <span class="unit">{{ metric.unit }}</span>
                </div>
                <div class="card-footer">
                  <span class="threshold">{{ metric.footerLabel || '阈值' }}</span>
                  <span class="limit">{{ metric.threshold }}</span>
                </div>
              </div>
            </div>

            <div class="phase-container">
              <div class="phase-card" v-for="phase in visiblePhases" :key="phase.key" :class="phase.key">
                <div class="phase-header">{{ phase.name }}</div>
                <div class="phase-grid">
                  <div class="phase-item" v-for="(item, idx) in phase.filteredData" :key="idx">
                    <span class="label">{{ item.label }}</span>
                    <span class="value">{{ item.value }}</span>
                    <span class="threshold">阈值 {{ item.threshold }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 2. Remote Control -->
        <a-tab-pane key="remote" tab="远程控制">
          <div class="remote-control-panel">
            <div class="control-actions">
              <div class="section-title">远程开关控制</div>
              <a-space :size="16" class="btn-group">
                <a-button type="primary" style="background-color: #67c23a; border-color: #67c23a;" @click="openAuthModal('远程合闸')">
                  <template #icon><poweroff-outlined /></template>远程合闸
                </a-button>
                <a-button type="primary" danger @click="openAuthModal('远程分闸')">
                  <template #icon><poweroff-outlined /></template>远程分闸
                </a-button>
                <a-button @click="openAuthModal('清除电能')">
                  <template #icon><clear-outlined /></template>清除电能
                </a-button>
                <a-button @click="openAuthModal('清除历史数据')">
                  <template #icon><delete-outlined /></template>清除历史数据
                </a-button>
              </a-space>
            </div>

            <div class="data-tables">
              <div class="table-section">
                <div class="section-title" style="color: #1890ff; margin-bottom: 12px; font-weight: bold;">冻结数据</div>
                <div class="search-bar">
                  <a-form layout="inline">
                    <a-form-item label="冻结次数">
                      <a-input-number placeholder="最小" style="width: 100px" />
                      <span style="margin: 0 8px;">-</span>
                      <a-input-number placeholder="最大" style="width: 100px" />
                    </a-form-item>
                    <a-form-item label="冻结类型">
                      <a-select placeholder="全部" style="width: 120px">
                        <a-select-option value="all">全部</a-select-option>
                        <a-select-option value="all">瞬时冻结</a-select-option>
                        <a-select-option value="all">日冻结</a-select-option>
                        <a-select-option value="all">月冻结</a-select-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item>
                      <a-space><a-button type="primary">冻结查询</a-button><a-button>重置</a-button><a-button>导出</a-button></a-space>
                    </a-form-item>
                  </a-form>
                </div>
                <a-table :columns="freezeColumns" :data-source="freezeData" size="middle" :pagination="pagination" :row-selection="{}" :scroll="{ x: 2000 }" />
              </div>

              <div class="table-section" style="margin-top: 24px;">
                <div class="section-title" style="color: #1890ff; margin-bottom: 12px; font-weight: bold;">历史数据</div>
                <div class="search-bar">
                  <a-form layout="inline">
                    <a-form-item label="事件类型">
                      <a-select placeholder="全部" style="width: 150px">
                        <a-select-option value="all">全部</a-select-option>
                        <a-select-option value="all">闸位变化</a-select-option>
                        <a-select-option value="all">设备报警</a-select-option>
                        <a-select-option value="all">失复电</a-select-option>
                      </a-select>
                    </a-form-item>
                    <a-form-item label="时间范围">
                      <a-range-picker style="width: 240px" />
                    </a-form-item>
                    <a-form-item>
                      <a-space><a-button type="primary">历史查询</a-button><a-button>重置</a-button><a-button>导出</a-button></a-space>
                    </a-form-item>
                  </a-form>
                </div>
                <a-table :columns="historyTableColumns" :data-source="historyTableData" size="middle" :pagination="pagination" :row-selection="{}" />
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- 3. Threshold Setting -->
        <a-tab-pane key="threshold" tab="阈值设置">
          <div class="threshold-panel">
            <div class="search-bar">
              <a-form layout="inline">
                <a-form-item><a-input placeholder="标识符" style="width: 160px" /></a-form-item>
                <a-form-item><a-input placeholder="参数描述" style="width: 160px" /></a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button type="primary">查询</a-button>
                    <a-button>重置</a-button>
                    <a-button>导出</a-button>
                    <a-button type="primary" danger @click="openRestoreModal">恢复默认设置</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </div>
            <a-table :columns="thresholdColumns" :data-source="thresholdData" size="middle" :pagination="pagination" :row-selection="{}" row-key="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'type'">
                  <a-tag color="blue" plain>{{ record.type }}</a-tag>
                </template>
                <template v-else-if="column.key === 'value'">
                  <span style="color: #1890ff; font-weight: bold;">{{ record.value }}</span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a class="action-link" style="display: flex; align-items: center; gap: 4px;" @click="openConfigModal(record)">
                    <setting-outlined /> 配置
                  </a>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 4. Operation Logs -->
        <a-tab-pane key="oplog" tab="操作日志">
          <div class="log-panel">
            <div class="search-bar">
              <a-form layout="inline">
                <a-form-item label="指令名称">
                  <a-select placeholder="全部" style="width: 120px">
                    <a-select-option value="远程分闸">远程分闸</a-select-option>
                    <a-select-option value="远程合闸">远程合闸</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="执行结果">
                  <a-select placeholder="全部" style="width: 120px">
                    <a-select-option value="成功">成功</a-select-option>
                    <a-select-option value="失败">失败</a-select-option>
                    <a-select-option value="超时">超时</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="时间"><a-range-picker style="width: 240px" /></a-form-item>
                <a-form-item><a-space><a-button type="primary">查询</a-button><a-button>重置</a-button><a-button>导出</a-button></a-space></a-form-item>
              </a-form>
            </div>
            <a-table :columns="opLogColumns" :data-source="opLogData" size="middle" :pagination="pagination" :row-selection="{}" row-key="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'result'">
                  <span :style="{ color: record.result === '成功' ? '#52c41a' : (record.result === '失败' ? '#ff4d4f' : '#faad14') }">
                    {{ record.result }}
                  </span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a class="action-link" @click="opDetailVisible = true">详情</a>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 5. History Data (Chart) -->
        <a-tab-pane key="history" tab="历史数据">
          <div class="history-chart-panel">
            <div class="filter-bar">
              <a-radio-group v-model:value="timeRange" button-style="solid">
                <a-radio-button value="today">今日数据</a-radio-button>
                <a-radio-button value="1m">一个月</a-radio-button>
                <a-radio-button value="2m">二个月</a-radio-button>
                <a-radio-button value="3m">三个月</a-radio-button>
              </a-radio-group>
              <a-range-picker show-time style="margin-left: 16px; width: 380px;" />
              <a-button type="primary" style="margin-left: 16px;">查询</a-button>
            </div>
            <div class="chart-container">
              <div class="metric-checkboxes-wrapper">
                <div class="metric-checkboxes-scroll">
                  <a-checkbox-group v-model:value="selectedChartMetrics" @change="updateChart">
                    <a-checkbox v-for="m in chartMetrics" :key="m.value" :value="m.value">{{ m.label }}</a-checkbox>
                  </a-checkbox-group>
                </div>
                <a-button type="text" shape="circle" @click="exportChart" title="导出图表">
                  <template #icon><picture-outlined /></template>
                </a-button>
              </div>
              <div ref="chartRef" class="echarts-container" style="height: 350px; width: 100%;"></div>
            </div>
            <div class="data-list-section">
              <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="title" style="color: #1890ff; font-weight: bold;">数据列表</span>
                <a-button>导出</a-button>
              </div>
              <a-table 
                :columns="historyDataColumns" 
                :data-source="historyDataList" 
                size="small" 
                bordered 
                :pagination="{ pageSize: 5 }" 
                :scroll="{ x: 'max-content' }"
                class="history-table-centered"
              />
            </div>
          </div>
        </a-tab-pane>

        <!-- 6. Alarm Records -->
        <a-tab-pane key="alarm" tab="告警记录">
          <div class="log-panel">
            <div class="search-bar">
              <a-form layout="inline">
                <a-form-item label="时间"><a-range-picker style="width: 240px" /></a-form-item>
                <a-form-item label="名称">
                  <a-select placeholder="全部" style="width: 120px">
                    <a-select-option value="过压告警">过压告警</a-select-option>
                    <a-select-option value="漏电告警">漏电告警</a-select-option>
                    <a-select-option value="跳闸告警">跳闸告警</a-select-option>
                    <a-select-option value="信号微弱">信号微弱</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="告警等级">
                  <a-select placeholder="全部" style="width: 100px">
                    <a-select-option value="严重">严重</a-select-option>
                    <a-select-option value="较大">较大</a-select-option>
                    <a-select-option value="一般">一般</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="状态">
                  <a-select placeholder="全部" style="width: 100px">
                    <a-select-option value="已恢复">已恢复</a-select-option>
                    <a-select-option value="未恢复">未恢复</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-space><a-button type="primary">查询</a-button><a-button>重置</a-button><a-button>导出</a-button></a-space>
                </a-form-item>
              </a-form>
            </div>
            <a-table :columns="alarmColumns" :data-source="alarmData" size="middle" :pagination="pagination" :row-selection="{}" row-key="id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <span :style="{ color: record.status === '已恢复' ? '#52c41a' : '#ff4d4f' }">{{ record.status }}</span>
                </template>
                <template v-else-if="column.key === 'level'">
                  <span :style="{ color: record.level === '严重' ? '#ff4d4f' : (record.level === '较大' ? '#faad14' : '#1890ff') }">
                    {{ record.level }}
                  </span>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a class="action-link" @click="alarmDetailVisible = true">详情</a>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 7. Running Logs -->
        <a-tab-pane key="runlog" tab="运行日志">
          <div class="log-panel">
            <div class="search-bar">
              <a-form layout="inline">
                <a-form-item label="日志类型">
                  <a-select placeholder="全部" style="width: 150px">
                    <a-select-option value="设备上线">设备上线</a-select-option>
                    <a-select-option value="状态变更">状态变更</a-select-option>
                    <a-select-option value="系统自检">系统自检</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="发生时间"><a-range-picker style="width: 240px" /></a-form-item>
                <a-form-item>
                  <a-space><a-button type="primary">查询</a-button><a-button>重置</a-button></a-space>
                </a-form-item>
              </a-form>
            </div>
            <a-table :columns="runLogColumns" :data-source="runLogData" size="middle" :pagination="pagination" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- Modals -->
    <!-- Metric Select -->
    <a-modal v-model:visible="showMetricSelect" title="监测数据项选择" @ok="showMetricSelect = false" width="700px">
      <div class="metric-select-container">
        <div class="select-section">
          <div class="section-title">公共指标</div>
          <a-row :gutter="[0, 12]">
            <a-col :span="8" v-for="m in publicMetricOptions" :key="m.value">
              <a-checkbox 
                :checked="selectedMetrics.includes(m.value)"
                @update:checked="(val) => toggleMetric(m.value, val)"
              >{{ m.label }}</a-checkbox>
            </a-col>
          </a-row>
        </div>
        <div class="select-section" v-for="p in phaseMetricOptions" :key="p.key" style="margin-top: 20px;">
          <div class="section-title">{{ p.name }}指标</div>
          <a-row :gutter="[0, 12]">
            <a-col :span="8" v-for="m in p.options" :key="m.value">
              <a-checkbox 
                :checked="selectedMetrics.includes(m.value)"
                @update:checked="(val) => toggleMetric(m.value, val)"
              >{{ m.label }}</a-checkbox>
            </a-col>
          </a-row>
        </div>
      </div>
    </a-modal>

    <!-- Auth Modal (Remote Control) -->
    <a-modal v-model:visible="authModalVisible" width="500px" :footer="null">
      <template #title><span style="display: flex; align-items: center; gap: 8px;"><thunderbolt-filled style="color: #faad14;" /> {{ authAction }}鉴权</span></template>
      <div style="padding: 10px 0;">
        <a-alert message="远程控制存在物理安全风险，请确认现场无人员违规作业！" type="error" show-icon style="margin-bottom: 20px;" />
        <div v-if="authStatus === 'idle'">
          <div style="margin-bottom: 8px;">请输入密码验证 <span style="color: #ff4d4f;">*</span></div>
          <a-input-password v-model:value="authPassword" style="height: 36px;" />
          <div style="text-align: right; margin-top: 30px;">
            <a-space><a-button @click="authModalVisible = false">取消</a-button><a-button type="primary" danger @click="handleAuthSubmit">确认下发</a-button></a-space>
          </div>
        </div>
        <div v-else style="padding: 20px 0;">
          <a-steps :current="authCurrentStep" size="small" label-placement="vertical"><a-step title="验证" /><a-step title="下发" /><a-step title="成功" /></a-steps>
          <div style="text-align: center; margin-top: 30px;"><a-spin v-if="authStatus !== 'success'" size="small" style="margin-right: 8px;" />{{ authStatusText }}</div>
        </div>
      </div>
    </a-modal>

    <!-- Config Modal -->
    <a-modal v-model:visible="configModalVisible" title="参数配置" @ok="handleConfigSubmit" width="500px">
      <div v-if="currentConfigRecord" style="padding: 10px 0;">
        <div style="margin-bottom: 8px;">{{ currentConfigRecord.desc }} ({{ currentConfigRecord.id }})</div>
        <a-input v-model:value="configValue" style="height: 36px; margin-bottom: 12px;" />
        <div style="color: #999;">取值范围: {{ currentConfigRecord.range }}</div>
      </div>
    </a-modal>

    <!-- Restore Default Modal -->
    <a-modal v-model:visible="restoreModalVisible" width="500px" :footer="null">
      <template #title><span style="display: flex; align-items: center; gap: 8px;"><thunderbolt-filled style="color: #faad14;" /> 恢复默认鉴权</span></template>
      <div style="padding: 10px 0;">
        <a-alert message="此操作将重置所有阈值为出厂设置！" type="error" show-icon style="margin-bottom: 20px;" />
        <div v-if="restoreStatus === 'idle'">
          <div style="margin-bottom: 8px;">请输入密码验证 <span style="color: #ff4d4f;">*</span></div>
          <a-input-password v-model:value="restorePassword" style="height: 36px;" />
          <div style="text-align: right; margin-top: 30px;">
            <a-space><a-button @click="restoreModalVisible = false">取消</a-button><a-button type="primary" danger @click="handleRestoreSubmit">确认下发</a-button></a-space>
          </div>
        </div>
        <div v-else style="padding: 20px 0;">
          <a-steps :current="restoreCurrentStep" size="small" label-placement="vertical"><a-step title="验证" /><a-step title="指令" /><a-step title="完成" /></a-steps>
          <div style="text-align: center; margin-top: 30px;"><a-spin v-if="restoreStatus !== 'success'" size="small" /> {{ restoreStatusText }}</div>
        </div>
      </div>
    </a-modal>

    <!-- Op Detail -->
    <a-modal v-model:visible="opDetailVisible" title="详情" width="600px" :footer="null">
      <div style="padding: 10px 0;">
        <div style="margin-bottom: 8px; color: #999; font-size: 13px;">MQTT Topic</div>
        <div style="margin-bottom: 20px;">/sys/a1f1zSPcENU/10002345/thing/service/Control</div>
        <div style="margin-bottom: 8px; color: #999; font-size: 13px;">下发指令报文</div>
        <div class="code-block" style="margin-bottom: 20px;">{ "id": "1716710405001", "params": { "cmd": 1 } }</div>
        <div style="margin-bottom: 8px; color: #999; font-size: 13px;">设备响应报文</div>
        <div class="code-block" style="margin-bottom: 24px;">{ "code": 200, "message": "success" }</div>
        <div style="text-align: right;"><a-button @click="opDetailVisible = false">关闭</a-button></div>
      </div>
    </a-modal>

    <!-- Alarm Detail -->
    <a-modal v-model:visible="alarmDetailVisible" title="详情" width="700px" :footer="null">
      <div class="alarm-detail-content">
        <div class="detail-section">
          <div class="section-mark">故障原因</div>
          <div class="fault-cards">
            <div class="fault-card"><div class="fc-label">A相</div><div class="fc-value danger">275.5 V</div></div>
            <div class="fault-card"><div class="fc-label">开关状态</div><div class="fc-value danger">已分闸</div></div>
            <div class="fault-card"><div class="fc-label">等级</div><div class="fc-value danger">严重</div></div>
          </div>
        </div>
        <div class="detail-section"><div class="section-mark">设备信息</div><div class="fault-info-row"><span>名称 &nbsp; 测试设备001</span><span style="margin-left: 40px;">位置 &nbsp; 浙江省杭州市余杭区</span></div></div>
        <div class="detail-section"><div class="section-mark">告警发生前实时值</div><div class="fault-info-row"><span>电压 &nbsp; 225.5 V</span><span style="margin-left: 40px;">电流 &nbsp; 15.2 A</span><span style="margin-left: 40px;">漏电 &nbsp; 12.5 mA</span></div></div>
        <div class="detail-section"><div class="section-mark">原始报文</div><div class="code-block">{ "VoltageA": 275.5, "Status": 1 }</div></div>
        <div style="text-align: right;"><a-button @click="alarmDetailVisible = false">关闭</a-button></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import { 
  LeftOutlined, WarningOutlined, InfoCircleOutlined, CloudOutlined, SignalFilled,
  ThunderboltOutlined, DashboardOutlined, ClockCircleOutlined, UnorderedListOutlined,
  PoweroffOutlined, ClearOutlined, DeleteOutlined, SettingOutlined, FileOutlined,
  ThunderboltFilled, CheckCircleFilled, PictureOutlined
} from '@ant-design/icons-vue'

const activeTab = ref('realtime')
const showMetricSelect = ref(false)
const opDetailVisible = ref(false)
const alarmDetailVisible = ref(false)
const timeRange = ref('today')
const selectedChartMetrics = ref(['voltage'])
const chartRef = ref(null)
let chartInstance = null

// Mock data generator for 24 hours
const generateHourlyData = () => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(`${i.toString().padStart(2, '0')}:00`)
  }
  return hours
}

const getMockDataSeries = (metricValue) => {
  const baseValue = {
    'voltage': 220, 'current': 10, 'back_v': 220, 'p_p': 5, 'tp': 15,
    'trq': 10, 'pf': 0.9, 'freq': 50, 'leak': 20, 'temp_in': 40,
    'temp_out': 42, 'board_temp': 35, 'board_humi': 50, 'signal': 80,
    'ap': 100, 'rp': 10
  }[metricValue] || 50

  return Array.from({ length: 24 }).map(() => +(baseValue + (Math.random() * baseValue * 0.1) - baseValue * 0.05).toFixed(2))
}

const updateChart = () => {
  if (!chartInstance) return

  const hours = generateHourlyData()
  const series = selectedChartMetrics.value.map(metricValue => {
    const metric = chartMetrics.find(m => m.value === metricValue)
    return {
      name: metric ? metric.label : metricValue,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: getMockDataSeries(metricValue)
    }
  })

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { 
      data: series.map(s => s.name),
      bottom: 0
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLabel: { color: '#909399', fontSize: 12 },
      axisLine: { lineStyle: { color: '#dcdfe6' } }
    },
    yAxis: {
      type: 'value',
      name: '监测值',
      nameTextStyle: { color: '#909399', padding: [0, 0, 0, -30] },
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { type: 'dashed', color: '#ebeef5' } }
    },
    series: series
  }

  chartInstance.setOption(option, true)
}

const exportChart = () => {
  if (chartInstance) {
    const url = chartInstance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
    const link = document.createElement('a')
    link.href = url
    link.download = `设备历史数据_${new Date().getTime()}.png`
    link.click()
    message.success('图表导出成功')
  }
}

// Monitor tab switch to handle ECharts initialization
watch(activeTab, (newVal) => {
  if (newVal === 'history') {
    nextTick(() => {
      if (!chartInstance && chartRef.value) {
        chartInstance = echarts.init(chartRef.value)
      }
      updateChart()
      chartInstance?.resize()
    })
  }
})

onMounted(() => {
  if (activeTab.value === 'history' && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    updateChart()
  }
  
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', () => {})
})

// 监测数据项选择逻辑
const selectedMetrics = ref([
  'leak', 'temp', 'humi', 'signal', 'freq', 'run', 'power', 'pf', 'repower', 'apower', 'reapower', 'report',
  'a-voltage', 'a-current', 'a-back-v', 'a-power', 'a-temp',
  'b-voltage', 'b-current', 'b-back-v', 'b-power', 'b-temp',
  'c-voltage', 'c-current', 'c-back-v', 'c-power', 'c-temp'
])

const toggleMetric = (val, isChecked) => {
  if (isChecked) {
    if (!selectedMetrics.value.includes(val)) {
      selectedMetrics.value.push(val)
    }
  } else {
    selectedMetrics.value = selectedMetrics.value.filter(m => m !== val)
  }
}

const publicMetricOptions = [
  { label: '剩余电流(漏电)', value: 'leak' }, { label: '载板温度', value: 'temp' }, { label: '载板湿度', value: 'humi' },
  { label: '信号强度', value: 'signal' }, { label: '电网频率', value: 'freq' }, { label: '累计运行', value: 'run' },
  { label: '总有功功率', value: 'power' }, { label: '总功率因数', value: 'pf' }, { label: '总无功功率', value: 'repower' },
  { label: '正向有功电能', value: 'apower' }, { label: '反向有功电能', value: 'reapower' }, { label: '数据上报', value: 'report' }
]

const phaseMetricOptions = [
  { name: 'A相', key: 'phase-a', options: [
    { label: 'A相电压', value: 'a-voltage' }, { label: 'A相电流', value: 'a-current' }, { label: 'A相后端电压', value: 'a-back-v' }, { label: 'A相有功功率', value: 'a-power' }, { label: 'A相端子温度', value: 'a-temp' }
  ]},
  { name: 'B相', key: 'phase-b', options: [
    { label: 'B相电压', value: 'b-voltage' }, { label: 'B相电流', value: 'b-current' }, { label: 'B相后端电压', value: 'b-back-v' }, { label: 'B相有功功率', value: 'b-power' }, { label: 'B相端子温度', value: 'b-temp' }
  ]},
  { name: 'C相', key: 'phase-c', options: [
    { label: 'C相电压', value: 'c-voltage' }, { label: 'C相电流', value: 'c-current' }, { label: 'C相后端电压', value: 'c-back-v' }, { label: 'C相有功功率', value: 'c-power' }, { label: 'C相端子温度', value: 'c-temp' }
  ]}
]

const allTopMetrics = [
  { id: 'leak', label: '剩余电流(漏电)', value: '25.5', unit: 'mA', threshold: '30mA', icon: WarningOutlined, iconColor: '#faad14' },
  { id: 'temp', label: '载板温度', value: '45.5', unit: '℃', threshold: '75℃', icon: InfoCircleOutlined, iconColor: '#1890ff' },
  { id: 'humi', label: '载板湿度', value: '55', unit: '%', threshold: '90%', icon: CloudOutlined, iconColor: '#1890ff' },
  { id: 'signal', label: '信号强度', value: '32', unit: '', threshold: '10', icon: SignalFilled, iconColor: '#1890ff' },
  { id: 'freq', label: '电网频率', value: '15', unit: 'Hz', threshold: '45-55', icon: ThunderboltOutlined, iconColor: '#1890ff', footerLabel: '范围' },
  { id: 'run', label: '累计运行', value: '1,245', unit: 'h', threshold: '-', icon: ClockCircleOutlined, iconColor: '#faad14' },
  { id: 'power', label: '总有功功率', value: '25.5', unit: 'kW', threshold: '50kW', icon: ThunderboltOutlined, iconColor: '#faad14' },
  { id: 'pf', label: '总功率因数', value: '25.5', unit: 'PF', threshold: '>0.8', icon: ThunderboltOutlined, iconColor: '#faad14', footerLabel: '范围' },
  { id: 'repower', label: '总无功功率', value: '25.5', unit: 'Kvar', threshold: '-', icon: DashboardOutlined, iconColor: '#67c23a' },
  { id: 'apower', label: '正向有功电能', value: '25.5', unit: 'kwh', threshold: '-', icon: DashboardOutlined, iconColor: '#1890ff' },
  { id: 'reapower', label: '反向有功电能', value: '25.5', unit: 'kwh', threshold: '-', icon: DashboardOutlined, iconColor: '#1890ff' },
  { id: 'report', label: '数据上报', value: '2026-02-02 14:25:33', unit: '', threshold: '-', icon: ClockCircleOutlined, iconColor: '#faad14' }
]
const visibleTopMetrics = computed(() => allTopMetrics.filter(m => selectedMetrics.value.includes(m.id)))

const allPhases = [
  { name: 'A相', key: 'phase-a', data: [
    { id: 'a-voltage', label: '电压', value: '222.1V', threshold: '198-242V' }, { id: 'a-current', label: '电流', value: '68.5A', threshold: '80A' },
    { id: 'a-back-v', label: '后端电压', value: '222.1V', threshold: '-' }, { id: 'a-power', label: '有功功率', value: '15.1kW', threshold: '20kW' },
    { id: 'a-temp', label: '端子温度(进/出)', value: '45.2℃ / 43.1℃', threshold: '70℃' }
  ]},
  { name: 'B相', key: 'phase-b', data: [
    { id: 'b-voltage', label: '电压', value: '222.1V', threshold: '198-242V' }, { id: 'b-current', label: '电流', value: '68.5A', threshold: '80A' },
    { id: 'b-back-v', label: '后端电压', value: '222.1V', threshold: '-' }, { id: 'b-power', label: '有功功率', value: '15.1kW', threshold: '20kW' },
    { id: 'b-temp', label: '端子温度(进/出)', value: '45.2℃ / 43.1℃', threshold: '70℃' }
  ]},
  { name: 'C相', key: 'phase-c', data: [
    { id: 'c-voltage', label: '电压', value: '222.1V', threshold: '198-242V' }, { id: 'c-current', label: '电流', value: '68.5A', threshold: '80A' },
    { id: 'c-back-v', label: '后端电压', value: '222.1V', threshold: '-' }, { id: 'c-power', label: '有功功率', value: '15.1kW', threshold: '20kW' },
    { id: 'c-temp', label: '端子温度(进/出)', value: '45.2℃ / 43.1℃', threshold: '70℃' }
  ]}
]
const visiblePhases = computed(() => {
  return allPhases.map(p => {
    const filtered = p.data.filter(d => selectedMetrics.value.includes(d.id))
    return { ...p, filteredData: filtered }
  }).filter(p => p.filteredData.length > 0)
})

// 鉴权逻辑
const authModalVisible = ref(false)
const authAction = ref('')
const authPassword = ref('')
const authStatus = ref('idle')
const openAuthModal = (action) => { authAction.value = action; authPassword.value = ''; authStatus.value = 'idle'; authModalVisible.value = true; }
const authStatusText = computed(() => ({'verifying':'验证中...','issuing':'下发中...','success':'执行成功'}[authStatus.value] || ''))
const authCurrentStep = computed(() => ({'verifying':0, 'issuing':1, 'success':2}[authStatus.value] || 0))
const handleAuthSubmit = () => {
  authStatus.value = 'verifying'
  setTimeout(() => { authStatus.value = 'issuing'; setTimeout(() => { authStatus.value = 'success'; setTimeout(() => { authModalVisible.value = false; message.success(`${authAction.value}执行成功`); }, 1000); }, 1500); }, 1000)
}

// 阈值配置逻辑
const configModalVisible = ref(false)
const currentConfigRecord = ref(null)
const configValue = ref('')
const openConfigModal = (record) => { currentConfigRecord.value = record; configValue.value = record.value; configModalVisible.value = true; }
const handleConfigSubmit = () => { message.success('配置成功'); configModalVisible.value = false; }

const restoreModalVisible = ref(false)
const restorePassword = ref('')
const restoreStatus = ref('idle')
const restoreStatusText = computed(() => ({'verifying':'验证中','issuing':'下发中','success':'已完成'}[restoreStatus.value] || ''))
const restoreCurrentStep = computed(() => ({'verifying':0, 'issuing':1, 'success':2}[restoreStatus.value] || 0))
const openRestoreModal = () => { restorePassword.value = ''; restoreStatus.value = 'idle'; restoreModalVisible.value = true; }
const handleRestoreSubmit = () => { restoreStatus.value = 'verifying'; setTimeout(() => { restoreStatus.value = 'issuing'; setTimeout(() => { restoreStatus.value = 'success'; setTimeout(() => { restoreModalVisible.value = false; message.success('重置成功'); }, 1000); }, 1500); }, 1000) }

// 表格数据
const pagination = reactive({ current: 1, pageSize: 10, total: 100, showTotal: t => `共 ${t} 条记录`, showSizeChanger: true })

const freezeColumns = [ 
  { title: '序号', dataIndex: 'id', width: 60, align: 'center', fixed: 'left' }, 
  { title: '冻结时间', dataIndex: 'time', align: 'center', width: 160 }, 
  { title: '正向有功电能(KWH)', dataIndex: 'p_ap', align: 'center', width: 160 }, 
  { title: '反向有功电能(KWH)', dataIndex: 'p_rp', align: 'center', width: 160 }, 
  { title: '组合无功1电能(KVARH)', dataIndex: 'c_rp1', align: 'center', width: 180 }, 
  { title: '组合无功2电能(KVARH)', dataIndex: 'c_rp2', align: 'center', width: 180 },
  { title: '第一象限无功电能(kvarh)', dataIndex: 'q1', align: 'center', width: 190 },
  { title: '第二象限无功电能(kvarh)', dataIndex: 'q2', align: 'center', width: 190 },
  { title: '第三象限无功电能(kvarh)', dataIndex: 'q3', align: 'center', width: 190 },
  { title: '第四象限无功电能(kvarh)', dataIndex: 'q4', align: 'center', width: 190 },
  { title: '最大正向有功需量(kW)', dataIndex: 'max_p', align: 'center', width: 180 },
  { title: '最大正向有功需量发生时间', dataIndex: 'max_p_time', align: 'center', width: 200 },
  { title: '最大反向有功需量(kW)', dataIndex: 'max_np', align: 'center', width: 180 },
  { title: '最大反向有功需量发生时间', dataIndex: 'max_np_time', align: 'center', width: 200 },
  { title: '总有功功率(kW)', dataIndex: 'tp', align: 'center', width: 140 },
  { title: 'A相有功功率(kW)', dataIndex: 'ap', align: 'center', width: 140 },
  { title: 'B相有功功率(kW)', dataIndex: 'bp', align: 'center', width: 140 },
  { title: 'C相有功功率(kW)', dataIndex: 'cp', align: 'center', width: 140 },
  { title: '总无功功率(kvar)', dataIndex: 'trq', align: 'center', width: 150 },
  { title: 'A相无功功率(kvar)', dataIndex: 'arq', align: 'center', width: 150 },
  { title: 'B相无功功率(kvar)', dataIndex: 'brq', align: 'center', width: 150 },
  { title: 'C相无功功率(kvar)', dataIndex: 'crq', align: 'center', width: 150 }
]
const freezeData = Array.from({length: 1}).map((_, i) => ({ 
  id: i+1, time: '2026-03-03 00:00:00', p_ap: '1245.67', p_rp: '28.31', c_rp1: '63.28', c_rp2: '15.62',
  q1: '22.46', q2: '18.93', q3: '14.80', q4: '12.71', max_p: '120.5', max_p_time: '2026-03-03 08:30:00',
  max_np: '10.2', max_np_time: '2026-03-03 14:15:00', tp: '85.4', ap: '30.1', bp: '28.2', cp: '27.1',
  trq: '45.6', arq: '15.2', brq: '15.1', crq: '15.3'
}))

const historyTableColumns = [ 
  { title: '序号', dataIndex: 'id', width: 60, align: 'center' }, 
  { title: '事件类型', dataIndex: 'type', align: 'center' }, 
  { title: '发生时间', dataIndex: 'startTime', align: 'center' }, 
  { title: '恢复时间', dataIndex: 'endTime', align: 'center' }, 
  { title: '原因', dataIndex: 'reason', align: 'center' }, 
  { title: '状态', dataIndex: 'status', align: 'center' }, 
  { title: '相位', dataIndex: 'phase', align: 'center' }, 
  { title: '电压', dataIndex: 'voltage', align: 'center' }, 
  { title: '电流', dataIndex: 'current', align: 'center' }, 
  { title: '漏电', dataIndex: 'leak', align: 'center' } 
]
const historyTableData = [ 
  { id: 1, type: '闸位变化', startTime: '2026-03-31 15:15:25', endTime: '', reason: '这是变化原因', status: '分闸', phase: 'A相', voltage: '10V', current: '10A', leak: '10mA' },
  { id: 2, type: '闸位变化', startTime: '2026-03-31 15:15:25', endTime: '', reason: '这是变化原因', status: '合闸', phase: 'B相/C相', voltage: '10V', current: '10A', leak: '10mA' },
  { id: 3, type: '设备报警', startTime: '2026-03-31 15:15:25', endTime: '2026-03-31 15:15:25', reason: '这是告警原因', status: '恢复', phase: 'A相', voltage: '10V', current: '10A', leak: '10mA' },
  { id: 4, type: '设备报警', startTime: '2026-03-31 15:15:25', endTime: '2026-03-31 15:15:25', reason: '这是告警原因', status: '告警', phase: 'B相/C相', voltage: '10V', current: '10A', leak: '10mA' },
  { id: 5, type: '失复电', startTime: '2026-03-31 15:15:25', endTime: '2026-03-31 15:15:25', reason: '', status: '', phase: '', voltage: '', current: '', leak: '' },
  { id: 6, type: '失复电', startTime: '2026-03-31 15:15:25', endTime: '2026-03-31 15:15:25', reason: '', status: '', phase: '', voltage: '', current: '', leak: '' }
]

const thresholdColumns = [ 
  { title: '序号', dataIndex: 'index', width: 60, align: 'center' },
  { title: '关键字', dataIndex: 'id' }, 
  { title: '描述', dataIndex: 'desc' }, 
  { title: '类型', dataIndex: 'type', key: 'type' }, 
  { title: '单位', dataIndex: 'unit', key: 'unit' },
  { title: '范围', dataIndex: 'range' }, 
  { title: '阈值', dataIndex: 'value', key: 'value' }, 
  { title: '操作', key: 'action', width: 100 } 
]
const thresholdData = Array.from({length: 10}).map((_, i) => ({ 
  index: i+1, id: `Param_${i+1}`, desc: `参数描述文字_${i+1}`, type: 'Float', unit: 'V', range: '0-100', value: '50' 
}))

const opLogColumns = [ { title: '序号', dataIndex: 'id', width: 60, align: 'center' }, { title: '指令名称', dataIndex: 'name', align: 'center' }, { title: '执行结果', dataIndex: 'result', key: 'result', align: 'center' }, { title: '执行人', dataIndex: 'user', align: 'center' }, { title: '执行时间', dataIndex: 'time', align: 'center' }, { title: '操作', key: 'action', width: 120, align: 'center' } ]
const opLogData = Array.from({length: 10}).map((_, i) => {
  const actions = ['远程分闸', '远程合闸']
  const results = ['成功', '失败', '超时']
  const users = ['管理员', '系统']
  return {
    id: i + 1,
    name: actions[i % 2],
    result: results[i % 3],
    user: users[i % 2],
    time: `2026-01-0${Math.floor(i/4) + 1} ${15 + (i%3)}:${10 + (i*5)}:${10 + i}`
  }
})

const alarmColumns = [ 
  { title: '序号', dataIndex: 'id', width: 60, align: 'center' }, 
  { title: '时间', dataIndex: 'time', align: 'center' }, 
  { title: '名称', dataIndex: 'name', align: 'center' }, 
  { title: '相位', dataIndex: 'phase', align: 'center' }, 
  { title: '告警等级', dataIndex: 'level', key: 'level', align: 'center' }, 
  { title: '状态', dataIndex: 'status', key: 'status', align: 'center' }, 
  { title: '告警内容', dataIndex: 'content', align: 'center' }, 
  { title: '操作', key: 'action', align: 'center' } 
]
const alarmData = Array.from({length: 10}).map((_, i) => {
  const names = ['过压告警', '漏电告警', '跳闸告警', '信号微弱']
  const phases = ['A相', 'N线', 'ABC相', '-']
  const levels = ['严重', '较大', '一般']
  const statuses = ['已恢复', '未恢复']
  return {
    id: i + 1,
    time: `2026-01-0${Math.floor(i/4) + 1} ${10 + (i%5)}:${15 + (i*4)}:00`,
    name: names[i % 4],
    phase: phases[i % 4],
    level: levels[i % 3],
    status: statuses[i % 2],
    content: `${names[i % 4]}触发，详细参数检查...`
  }
})

const runLogColumns = [ { title: '序号', dataIndex: 'id', width: 60, align: 'center' }, { title: '日志类型', dataIndex: 'type', align: 'center' }, { title: '描述', dataIndex: 'desc', align: 'center' }, { title: '发生时间', dataIndex: 'time', align: 'center' } ]
const runLogData = Array.from({length: 10}).map((_, i) => {
  const types = ['系统自检', '设备上线', '状态变更']
  const descs = ['检测到重合闸正常闭锁', '网络连接建立成功', '开关状态发生变化', '系统心跳正常']
  return {
    id: i + 1,
    type: types[i % 3],
    desc: descs[i % 4],
    time: `2026-01-0${Math.floor(i/5) + 1} ${i % 24}:00:00`
  }
})

// Chart Metrics
const chartMetrics = [
  { label: '三相电压(V)', value: 'voltage' },
  { label: '三相电流(A)', value: 'current' },
  { label: '后端电压(V)', value: 'back_v' },
  { label: '分相有功(kW)', value: 'p_p' },
  { label: '总有功功率(kW)', value: 'tp' },
  { label: '总无功功率(kW)', value: 'trq' },
  { label: '功率因数(PF)', value: 'pf' },
  { label: '电网频率(Hz)', value: 'freq' },
  { label: '剩余电流(mA)', value: 'leak' },
  { label: '端子温度-进线(°C)', value: 'temp_in' },
  { label: '端子温度-出线(°C)', value: 'temp_out' },
  { label: '载板温度(°C)', value: 'board_temp' },
  { label: '载板湿度(%)', value: 'board_humi' },
  { label: '信号强度', value: 'signal' },
  { label: '正向有功电能(kWh)', value: 'ap' },
  { label: '反向有功电能(kWh)', value: 'rp' },
]

// History Data List
const historyDataColumns = [
  { title: '上报时间', dataIndex: 'time', key: 'time', width: 160, fixed: 'left' },
  {
    title: '公共',
    children: [
      { title: '剩余电流', dataIndex: 'leak', key: 'leak', width: 100 },
      { title: '载板温度', dataIndex: 'temp', key: 'temp', width: 100 },
      { title: '载板湿度', dataIndex: 'humi', key: 'humi', width: 100 },
      { title: '信号强度', dataIndex: 'signal', key: 'signal', width: 100 },
      { title: '电网频率', dataIndex: 'freq', key: 'freq', width: 100 },
    ]
  },
  {
    title: '电能',
    children: [
      { title: '总有功功率', dataIndex: 'tp', key: 'tp', width: 120 },
      { title: '总无功功率', dataIndex: 'trq', key: 'trq', width: 120 },
      { title: '功率因数', dataIndex: 'pf', key: 'pf', width: 100 },
      { title: '正向有功电能', dataIndex: 'ap', key: 'ap', width: 130 },
      { title: '反向有功电能', dataIndex: 'rp', key: 'rp', width: 130 },
    ]
  },
  {
    title: 'A相',
    children: [
      { title: '电压', dataIndex: 'av', key: 'av', width: 90 },
      { title: '后端电压', dataIndex: 'abv', key: 'abv', width: 100 },
      { title: '电流', dataIndex: 'ai', key: 'ai', width: 90 },
      { title: '总有功功率', dataIndex: 'apower', key: 'apower', width: 120 },
      { title: '端子温度-进线', dataIndex: 'ati', key: 'ati', width: 130 },
      { title: '端子温度-出线', dataIndex: 'ato', key: 'ato', width: 130 },
    ]
  },
  {
    title: 'B相',
    children: [
      { title: '电压', dataIndex: 'bv', key: 'bv', width: 90 },
      { title: '后端电压', dataIndex: 'bbv', key: 'bbv', width: 100 },
      { title: '电流', dataIndex: 'bi', key: 'bi', width: 90 },
      { title: '总有功功率', dataIndex: 'bpower', key: 'bpower', width: 120 },
      { title: '端子温度-进线', dataIndex: 'bti', key: 'bti', width: 130 },
      { title: '端子温度-出线', dataIndex: 'bto', key: 'bto', width: 130 },
    ]
  },
  {
    title: 'C相',
    children: [
      { title: '电压', dataIndex: 'cv', key: 'cv', width: 90 },
      { title: '后端电压', dataIndex: 'cbv', key: 'cbv', width: 100 },
      { title: '电流', dataIndex: 'ci', key: 'ci', width: 90 },
      { title: '总有功功率', dataIndex: 'cpower', key: 'cpower', width: 120 },
      { title: '端子温度-进线', dataIndex: 'cti', key: 'cti', width: 130 },
      { title: '端子温度-出线', dataIndex: 'cto', key: 'cto', width: 130 },
    ]
  }
]
const historyDataList = Array.from({ length: 10 }).map((_, i) => ({
  key: i,
  time: '2026-01-01 15:54:14',
  leak: 20, temp: 20, humi: 20, signal: 20, freq: 20,
  tp: 20, trq: 20, pf: 20, ap: 20, rp: 20,
  av: 220, abv: 220, ai: 5, apower: 1.1, ati: 20, ato: 20,
  bv: 220, bbv: 220, bi: 5, bpower: 1.1, bti: 20, bto: 20,
  cv: 220, cbv: 220, ci: 5, cpower: 1.1, cti: 20, cto: 20
}))
</script>

<style scoped>
.device-detail { height: 100%; display: flex; flex-direction: column; }
.detail-header { margin-bottom: 20px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.title-info .title { margin: 0; font-size: 18px; font-weight: bold; }
.status-tags { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.online { background-color: #52c41a; }
.status-text { font-size: 12px; color: #52c41a; }
.detail-content { flex: 1; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.monitor-actions { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.top-cards { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; margin-bottom: 24px; }
.metric-card { background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #eef1f6; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.card-header .label { color: #909399; font-size: 13px; }
.card-body { margin-bottom: 12px; }
.card-body .value { font-size: 24px; font-weight: bold; color: #303133; }
.card-body .unit { font-size: 13px; color: #909399; margin-left: 4px; }
.card-footer { display: flex; justify-content: space-between; font-size: 12px; border-top: 1px dashed #ebeef5; padding-top: 10px; }
.card-footer .threshold { color: #909399; }
.card-footer .limit { color: #f56c6c; font-weight: 500; }
.phase-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.phase-card { background: #fff; border-radius: 8px; border-top: 4px solid #1890ff; border: 1px solid #eef1f6; }
.phase-card.phase-a { border-top-color: #faad14; }
.phase-card.phase-b { border-top-color: #67c23a; }
.phase-card.phase-c { border-top-color: #f56c6c; }
.phase-header { padding: 12px 16px; background: #fcfcfd; font-weight: bold; font-size: 15px; border-bottom: 1px solid #f0f2f5; }
.phase-item { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 12px 16px; border-bottom: 1px solid #fcfcfd; font-size: 13px; }
.phase-item:last-child { border-bottom: none; }
.phase-item .label { color: #909399; }
.phase-item .value { color: #303133; font-weight: bold; text-align: right; }
.phase-item .threshold { color: #f56c6c; text-align: right; }
.control-actions { background: #f8f9fb; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
.section-title { font-size: 14px; color: #1890ff; margin-bottom: 16px; font-weight: 500; }
.chart-container { border: 1px solid #eef1f6; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
.metric-checkboxes-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.metric-checkboxes-scroll {
  flex: 1;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 8px;
  margin-right: 16px;
}
/* Scrollbar styling for horizontal scroll */
.metric-checkboxes-scroll::-webkit-scrollbar {
  height: 6px;
}
.metric-checkboxes-scroll::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
.echarts-container {
  margin-top: 10px;
}
.history-table-centered :deep(td),
.history-table-centered :deep(th) {
  text-align: center !important;
  white-space: nowrap !important;
}
.search-bar { margin-bottom: 20px; background: #f8f9fb; padding: 16px; border-radius: 8px; }
.action-link { color: #1890ff; cursor: pointer; }
.alarm-detail-content { padding: 10px 0; }
.detail-section { margin-bottom: 24px; }
.section-mark { border-left: 4px solid #1890ff; padding-left: 8px; font-size: 15px; font-weight: bold; color: #1890ff; margin-bottom: 16px; }
.fault-cards { display: flex; gap: 16px; margin-bottom: 16px; }
.fault-card { flex: 1; background: #fcfcfd; border: 1px solid #eef1f6; border-radius: 8px; padding: 16px; text-align: center; }
.fc-label { color: #909399; font-size: 13px; margin-bottom: 8px; }
.fc-value { font-size: 18px; font-weight: bold; }
.fc-value.danger { color: #ff4d4f; }
.fault-info-row { color: #606266; font-size: 13px; margin-bottom: 12px; }
.code-block { background: #2b2f3a; color: #cfd3dc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6; overflow-x: auto; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.select-section .section-title { font-weight: bold; margin-bottom: 10px; color: #333; }
</style>
