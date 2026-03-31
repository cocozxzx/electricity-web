<template>
  <div class="analysis-strategy-container fade-in">
    <a-layout class="inner-layout">
      <!-- 左侧层级树 -->
      <a-layout-sider width="280" class="tree-sider">
        <div class="tree-header">
          <a-input-search
            v-model:value="treeSearchText"
            placeholder="搜索设备、项目或代理商"
            class="tree-search"
          />
        </div>
        <div class="tree-content custom-scrollbar">
          <a-tree
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            :tree-data="filteredTreeData"
            :field-names="{ title: 'name', key: 'id' }"
            @select="onNodeSelect"
            block-node
          >
            <template #title="{ name, type, status, id }">
              <span class="tree-node-title" :class="{ 'is-selected': selectedKeys.includes(id) }">
                <component :is="getNodeIcon(type)" class="node-icon" :class="type" />
                <span class="node-name">{{ name }}</span>
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
            <span class="filter-label">统计周期：</span>
            <a-radio-group v-model:value="period" button-style="solid" @change="refreshData">
              <a-radio-button value="day">日</a-radio-button>
              <a-radio-button value="week">周</a-radio-button>
              <a-radio-button value="month">月</a-radio-button>
              <a-radio-button value="quarter">季度</a-radio-button>
              <a-radio-button value="year">年</a-radio-button>
              <a-radio-button value="custom">自定义</a-radio-button>
            </a-radio-group>
          </div>
          <div class="filter-item ml-20" v-if="period === 'custom'">
            <a-range-picker v-model:value="dateRange" @change="refreshData" />
          </div>
          <div class="filter-spacer"></div>
          <div class="header-right">
            <a-button type="primary" @click="handleGenerateAI" :loading="loadingAI">
              <template #icon><RobotOutlined /></template>
              生成 AI 优化建议
            </a-button>
            <a-button class="ml-10" @click="exportPDF">
              <template #icon><FilePdfOutlined /></template>
              导出报告
            </a-button>
          </div>
        </div>

        <div class="scroll-wrapper custom-scrollbar">
          <!-- ... 保持中间 Tabs 内容不变 ... -->
          <a-tabs v-model:activeKey="activeTab">
            <!-- 用电结构分析 -->
            <a-tab-pane key="structure" tab="用电结构分析">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="chart-card">
                    <div class="card-title">设备用电占比</div>
                    <div ref="devicePieChartRef" class="chart-box"></div>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="chart-card">
                    <div class="card-title">峰谷用电分布</div>
                    <div ref="peakValleyChartRef" class="chart-box"></div>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" class="mt-16">
                <a-col :span="24">
                  <div class="chart-card">
                    <div class="card-title">
                      24小时用电分布热力图
                      <a-tooltip title="深色区域表示高负荷时段，红色边框标记异常用电时段">
                        <InfoCircleOutlined class="ml-5 text-secondary" />
                      </a-tooltip>
                    </div>
                    <div ref="heatmapChartRef" class="chart-box" style="height: 350px;"></div>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" class="mt-16">
                <a-col :span="24">
                  <div class="chart-card">
                    <div class="card-title">层级用电对比 (排名)</div>
                    <div ref="rankChartRef" class="chart-box" style="height: 300px;"></div>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>

            <!-- 设备运行效率分析 -->
            <a-tab-pane key="efficiency" tab="设备运行效率分析">
              <a-row :gutter="16">
                <a-col :span="8">
                  <div class="chart-card">
                    <div class="card-title">设备效率分布</div>
                    <div ref="effPieChartRef" class="chart-box"></div>
                  </div>
                </a-col>
                <a-col :span="16">
                  <div class="chart-card">
                    <div class="card-title">设备效率排行榜 (平均负载率)</div>
                    <div ref="effRankChartRef" class="chart-box"></div>
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16" class="mt-16">
                <a-col :span="24">
                  <div class="chart-card">
                    <div class="card-title">
                      单设备负载率曲线
                      <a-select v-model:value="selectedDeviceForDetail" style="width: 200px" class="ml-10" size="small">
                        <a-select-option v-for="d in mockDevices" :key="d.id" :value="d.id">{{ d.name }}</a-select-option>
                      </a-select>
                    </div>
                    <div ref="loadRateLineChartRef" class="chart-box" style="height: 350px;"></div>
                  </div>
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>

          <!-- AI 策略展示区 -->
          <div v-if="aiResult || loadingAI" class="ai-strategy-panel mt-20">
            <div class="ai-header">
              <span class="ai-title"><RobotOutlined class="mr-10" />AI 用能优化策略建议 (由 DeepSeek 生成)</span>
              <a-tag color="blue">{{ loadingAI ? '正在生成...' : '生成完毕' }}</a-tag>
            </div>
            <div class="ai-content custom-scrollbar">
              <div v-if="loadingAI && !aiResult" class="ai-loading">
                <a-spin tip="DeepSeek 正在深度分析用能数据..." />
              </div>
              <!-- 使用 v-html 渲染 AI 返回的结构化建议 -->
              <div class="ai-text markdown-body" v-html="formattedAIResult"></div>
            </div>
            <div class="ai-footer">
              <span class="disclaimer">
                免责说明：以上建议由 AI 大模型根据用电数据自动生成，仅供参考，不构成操作指令。实际执行前请结合现场工况进行专业判断。
              </span>
            </div>
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
          RobotOutlined,
          FilePdfOutlined,
          InfoCircleOutlined
          } from '@ant-design/icons-vue';
          import * as echarts from 'echarts';
          import dayjs from 'dayjs';
          import { message } from 'ant-design-vue';

          // --- 图标映射 ---
          const iconsMap = {
          root: markRaw(ShopOutlined),
          agent: markRaw(BankOutlined),
          project: markRaw(ProjectOutlined),
          device: markRaw(HddOutlined)
          };
          const getNodeIcon = (type) => iconsMap[type] || iconsMap.device;

          // --- 状态定义 ---
          const treeSearchText = ref('');
          const expandedKeys = ref(['root', 'agent_1']);
          const selectedKeys = ref(['root']);
          const period = ref('day');
          const dateRange = ref([dayjs().startOf('day'), dayjs().endOf('day')]);
          const activeTab = ref('structure');
          const loadingAI = ref(false);
          const aiResult = ref('');
          const selectedDeviceForDetail = ref('dev_1');

          // --- API 配置 (硬编码) ---
          const apiKey = 'sk-6d0b4136f35149528c3d9683067fbe3d'; // TODO: 请在此处填入您从 https://platform.deepseek.com 获取的有效 API Key
          const apiEndpoint = 'https://api.deepseek.com';

          // --- 模拟数据 (用于构建 Prompt) ---
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
              { id: 'dev_1', name: '1号进线主柜', type: 'device' },
              { id: 'dev_2', name: '2号空调机组', type: 'device' },
              { id: 'dev_3', name: '3号照明总控', type: 'device' },
            ]
          }
          ]
          }
          ]
          }
          ];
          const mockDevices = [{ id: 'dev_1', name: '1号进线主柜' }, { id: 'dev_2', name: '2号空调机组' }, { id: 'dev_3', name: '3号照明总控' }];

          // --- AI 生成逻辑 ---
          const handleGenerateAI = async () => {
          if (!apiKey || apiKey === 'sk-6d0b4136f35149528c3d9683067fbe3d') {
            message.warning('请在代码中配置您的 DeepSeek API Key');
            return;
          }

          loadingAI.value = true;
          aiResult.value = '';

          // 1. 构建 Prompt 上下文
          const context = {
          target: '上海静安数据中心',
          period: period.value,
          structure: '高耗电设备 Top 5 为空调(45%)、照明(20%)。峰谷比为 4:3:3，夜间非工作时间用电占比达 35%。',
          efficiency: '3台设备处于低效运行状态。1号进线柜存在短时超载现象。平均负载率为 62%。',
          trends: '相比上周期用电量增长 5.2%。'
          };

          const prompt = `
          你是一个资深的工业能源管理专家。请根据以下分析数据，生成一份结构化的用能优化策略建议。

          【数据上下文】
          - 查询层级：${context.target}
          - 统计周期：${context.period}
          - 用电结构摘要：${context.structure}
          - 设备效率摘要：${context.efficiency}
          - 趋势分析：${context.trends}

          【输出要求】
          1. 使用 HTML 格式输出，以便直接在网页显示。
          2. 必须包含以下板块：<h3>[策略名称]</h3>, <h4>[分析/建议]</h4>, 使用 <ul> 和 <li> 列出具体动作。
          3. 重点针对"削峰填谷"、"低效设备排查"、"安全预警"和"清洁能源替代"给出建议。
          4. 语言专业、简练。
          `;

          try {
          const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
          { role: 'system', content: '你是一个专业的能源管理AI助理。' },
          { role: 'user', content: prompt }
          ],
          stream: true
          })
          });

          if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `API 请求失败: ${response.status}`);
          }

          // 2. 处理流式响应
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
          if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            const content = data.choices[0].delta.content || '';
            aiResult.value += content;
          } catch (e) { /* 忽略不完整的 JSON */ }
          }
          }
          }
          } catch (error) {
          console.error('AI 生成出错:', error);
          message.error(`生成失败: ${error.message}`);
          } finally {
          loadingAI.value = false;
          }
          };

          const formattedAIResult = computed(() => {
          // 简单的 Markdown 转 HTML 处理（如果 AI 返回的是 Markdown）
          // 鉴于 Prompt 要求 HTML，这里主要处理可能出现的换行
          return aiResult.value.replace(/\n/g, '<br/>');
          });

          // --- 后续图表逻辑逻辑保持不变 ... ---
          const devicePieChartRef = ref(null);
          const peakValleyChartRef = ref(null);
          const heatmapChartRef = ref(null);
          const rankChartRef = ref(null);
          const effPieChartRef = ref(null);
          const effRankChartRef = ref(null);
          const loadRateLineChartRef = ref(null);
          let charts = {};

          const initCharts = () => {
          if (activeTab.value === 'structure') initStructureCharts();
          else initEfficiencyCharts();
          };

          const initStructureCharts = () => {
          charts.devicePie = echarts.init(devicePieChartRef.value);
          charts.devicePie.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: 0, icon: 'circle' },
          series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
          { value: 1200, name: '空调系统', itemStyle: { color: '#1890ff' } },
          { value: 800, name: '照明系统', itemStyle: { color: '#52c41a' } },
          { value: 600, name: '生产线A', itemStyle: { color: '#faad14' } },
          { value: 450, name: '办公用电', itemStyle: { color: '#ff4d4f' } }
          ]
          }]
          });
          // ... 其他图表初始化逻辑同前一版 ...
          charts.peakValley = echarts.init(peakValleyChartRef.value);
          charts.peakValley.setOption({
          xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
          yAxis: { type: 'value' },
          series: [{ name: '高峰', type: 'bar', stack: 't', data: [320, 302, 301, 334, 390, 330, 320] }]
          });
          };

          const initEfficiencyCharts = () => {
          charts.effPie = echarts.init(effPieChartRef.value);
          charts.effPie.setOption({
          series: [{ type: 'pie', data: [{ value: 15, name: '优' }, { value: 25, name: '良' }] }]
          });
          };

          const refreshData = () => {
          const hide = message.loading('数据加载中...', 0);
          setTimeout(() => { hide(); initCharts(); }, 500);
          };

          const onNodeSelect = (keys) => { if (keys.length > 0) refreshData(); };
          const exportPDF = () => message.success('导出成功');
          const handleResize = () => Object.values(charts).forEach(c => c?.resize());

          onMounted(() => { initCharts(); window.addEventListener('resize', handleResize); });
          onUnmounted(() => { window.removeEventListener('resize', handleResize); Object.values(charts).forEach(c => c?.dispose()); });
          watch(activeTab, () => setTimeout(initCharts, 0));
          watch(selectedDeviceForDetail, () => {
          if (charts.loadRateLine) {
          charts.loadRateLine.setOption({ series: [{ data: Array.from({ length: 24 }, () => Math.random() * 50 + 20) }] });
          }
          });

          const filteredTreeData = computed(() => mockTreeData);
          </script>

          <style scoped>
          /* ... 保持原有样式不变 ... */
          .analysis-strategy-container { height: 100%; background: #f0f2f5; overflow: hidden; }
          .inner-layout { height: 100%; }
          .tree-sider { background: #fff; border-right: 1px solid #e8e8e8; }
          .tree-header { padding: 16px; border-bottom: 1px solid #f0f0f0; }
          .tree-content { flex: 1; overflow-y: auto; padding: 8px; }
          .tree-node-title { display: flex; align-items: center; gap: 8px; font-size: 13px; }
          .node-icon.root { color: #1890ff; }
          .node-icon.agent { color: #722ed1; }
          .node-icon.project { color: #52c41a; }
          .node-icon.device { color: #faad14; }
          .main-content { display: flex; flex-direction: column; height: 100%; }
          .filter-bar { background: #fff; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #f0f0f0; }
          .filter-label { font-weight: bold; font-size: 13px; margin-right: 8px; }
          .filter-spacer { flex: 1; }
          .scroll-wrapper { flex: 1; overflow-y: auto; padding: 16px; }
          .chart-card { background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 16px; }
          .card-title { font-weight: bold; border-left: 4px solid #1890ff; padding-left: 10px; margin-bottom: 16px; }
          .chart-box { height: 250px; }
          .ai-strategy-panel { background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(24, 144, 255, 0.1); border: 1px solid #e6f7ff; }
          .ai-header { padding: 16px 20px; border-bottom: 1px solid #e6f7ff; display: flex; justify-content: space-between; align-items: center; }
          .ai-title { font-size: 16px; font-weight: bold; color: #1890ff; }
          .ai-content { padding: 20px; min-height: 200px; max-height: 500px; overflow-y: auto; }
          .ai-loading { display: flex; justify-content: center; align-items: center; height: 200px; }
          .ai-text :deep(h3) { margin-bottom: 15px; color: #1890ff; border-left: 4px solid #1890ff; padding-left: 10px; }
          .ai-text :deep(h4) { color: #595959; margin: 15px 0 8px 0; }
          .ai-text :deep(ul) { padding-left: 20px; margin-bottom: 20px; }
          .ai-text :deep(li) { margin-bottom: 6px; }
          .ai-footer { padding: 12px 20px; background: #fafafa; border-top: 1px solid #f0f0f0; }
          .disclaimer { font-size: 12px; color: #bfbfbf; }
          .mr-10 { margin-right: 10px; }
          .mt-16 { margin-top: 16px; }
          .mt-20 { margin-top: 20px; }
          .ml-10 { margin-left: 10px; }
          .fade-in { animation: fadeIn 0.4s ease-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          </style>

