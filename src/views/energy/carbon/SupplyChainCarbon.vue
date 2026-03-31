<template>
  <div class="carbon-page fade-in">
    <div class="search-form-container">
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="upstream" tab="上游供应商碳管理" />
        <a-tab-pane key="downstream" tab="下游用户碳服务" />
      </a-tabs>
    </div>

    <div v-if="activeTab === 'upstream'">
      <div class="table-container">
        <div class="section-title">供应商场地数据采集</div>
        <a-table :columns="upColumns" :data-source="upData" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small">请求数据</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>

    <div v-else>
      <div class="table-container">
        <div class="section-title">下游客户产品碳足迹分发</div>
        <a-table :columns="downColumns" :data-source="downData" size="middle">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="primary" size="small">提供核算结果</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('upstream');

const upColumns = [
  { title: '供应商名称', dataIndex: 'name' },
  { title: '主要材料', dataIndex: 'material' },
  { title: '能源消费数据', dataIndex: 'energy' },
  { title: '采集状态', dataIndex: 'status' },
  { title: '操作', key: 'action' }
];

const upData = [
  { name: '精密电子元件有限公司', material: 'PCB基板', energy: '已同步', status: '正常' },
  { name: '顺风塑料制品厂', material: '外壳', energy: '待同步', status: '待处理' }
];

const downColumns = [
  { title: '客户名称', dataIndex: 'name' },
  { title: '采购产品', dataIndex: 'product' },
  { title: '碳足迹结果 (kgCO2e)', dataIndex: 'value' },
  { title: '操作', key: 'action' }
];

const downData = [
  { name: '国家电网杭州分公司', product: '集中器', value: '4.2' },
  { name: '南方电网广州分公司', product: '智能终端', value: '5.1' }
];
</script>

<style scoped>
.carbon-page { padding: 16px; background: #f0f2f5; min-height: 100%; }
.search-form-container { background: #fff; padding: 0 16px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.table-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
