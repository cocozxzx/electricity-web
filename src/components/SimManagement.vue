<template>
  <div class="sim-management fade-in">
    <!-- Search Form -->
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item>
          <a-tree-select 
            v-model:value="searchForm.agent" 
            placeholder="代理商" 
            style="width: 200px" 
            :tree-data="agentTreeData"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-select 
            v-model:value="searchForm.project" 
            placeholder="所属项目" 
            style="width: 180px" 
            show-search 
            option-filter-prop="label"
          >
            <a-select-option value="p1" label="宝安人才公寓">宝安人才公寓</a-select-option>
            <a-select-option value="p2" label="天河办公楼">天河办公楼</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item><a-input v-model:value="searchForm.deviceName" placeholder="设备名称" /></a-form-item>
        <a-form-item><a-input v-model:value="searchForm.cardNumber" placeholder="卡号" /></a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.status" placeholder="卡状态" style="width: 120px">
            <a-select-option value="待激活">待激活</a-select-option>
            <a-select-option value="已激活">已激活</a-select-option>
            <a-select-option value="已停机">已停机</a-select-option>
            <a-select-option value="可测试">可测试</a-select-option>
            <a-select-option value="库存">库存</a-select-option>
            <a-select-option value="预销户">预销户</a-select-option>
            <a-select-option value="已销户">已销户</a-select-option>
            <a-select-option value="已过期">已过期</a-select-option>
            <a-select-option value="超流量">超流量</a-select-option>
            <a-select-option value="非法卡">非法卡</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.operator" placeholder="运营商" style="width: 120px">
            <a-select-option value="移动">移动</a-select-option>
            <a-select-option value="联通">联通</a-select-option>
            <a-select-option value="电信">电信</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.network" placeholder="网络" style="width: 120px">
            <a-select-option value="2G">2G</a-select-option>
            <a-select-option value="4G">4G</a-select-option>
            <a-select-option value="2G/3G/4G">2G/3G/4G</a-select-option>
            <a-select-option value="5G">5G</a-select-option>
            <a-select-option value="NB">NB</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.specification" placeholder="卡规格" style="width: 160px">
            <a-select-option value="三切卡 12.3×8.8mm">三切卡 12.3×8.8mm</a-select-option>
            <a-select-option value="二切卡 15×12mm">二切卡 15×12mm</a-select-option>
            <a-select-option value="贴片卡">贴片卡</a-select-option>
            <a-select-option value="大卡 15×25mm">大卡 15×25mm</a-select-option>
            <a-select-option value="中卡 15x12mm">中卡 15x12mm</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.material" placeholder="卡材质" style="width: 140px">
            <a-select-option value="消费级">消费级</a-select-option>
            <a-select-option value="工业级">工业级</a-select-option>
            <a-select-option value="NB工业级">NB工业级</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.cardType" placeholder="卡类型" style="width: 160px">
            <a-select-option value="Nano sim卡（三切）">Nano sim卡（三切）</a-select-option>
            <a-select-option value="Nano sim卡（二切）">Nano sim卡（二切）</a-select-option>
            <a-select-option value="贴片卡">贴片卡</a-select-option>
            <a-select-option value="标准sim卡（大卡）">标准sim卡（大卡）</a-select-option>
            <a-select-option value="陶瓷中卡">陶瓷中卡</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.package" placeholder="卡套餐" style="width: 140px">
            <a-select-option value="月套餐">月套餐</a-select-option>
            <a-select-option value="季套餐">季套餐</a-select-option>
            <a-select-option value="半年套餐">半年套餐</a-select-option>
            <a-select-option value="年套餐">年套餐</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>
      <div class="operation-bar" style="display: none;">
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-selection="{ fixed: true }"
        size="middle"
        :scroll="{ x: 2500 }"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Batch Import Modal -->
    <a-modal v-model:visible="importVisible" title="Excel批量导入" width="600px" @ok="importVisible = false" ok-text="开始导入" cancel-text="取消">
      <div class="import-content">
        <a-button type="primary" class="download-btn">
          <template #icon><download-outlined /></template>
          下载标准导入模板
        </a-button>
        <a-upload-dragger name="file" :multiple="false" class="upload-dragger">
          <p class="ant-upload-drag-icon"><cloud-upload-outlined /></p>
          <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p class="ant-upload-hint">支持 .xlsx / .xls 格式</p>
        </a-upload-dragger>
      </div>
    </a-modal>

    <!-- Add/Edit Modal -->
    <a-modal v-model:visible="deviceModalVisible" :title="deviceModalTitle" width="600px" @ok="handleDeviceSubmit" ok-text="保存" cancel-text="取消">
      <a-form :model="deviceForm" layout="vertical" class="pretty-form">
        <a-row :gutter="24">
          <a-col :span="deviceModalType === 'add' ? 12 : 24">
            <a-form-item label="设备名称" required v-if="deviceModalType === 'add'">
              <a-input v-model:value="deviceForm.name" placeholder="请输入设备名称" />
            </a-form-item>
            <a-form-item label="备注名称" v-else>
              <a-input v-model:value="deviceForm.remark" placeholder="请输入新的备注名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="deviceModalType === 'add'">
            <a-form-item label="备注名称">
              <a-input v-model:value="deviceForm.remark" placeholder="请输入备注名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="deviceModalType === 'add'">
            <a-form-item label="设备型号" required>
              <a-select v-model:value="deviceForm.model" placeholder="请选择型号">
                <a-select-option value="IoT-GW-Pro">IoT-GW-Pro</a-select-option>
                <a-select-option value="CB-100-Smart">CB-100-Smart</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Detail Modal -->
    <a-modal v-model:visible="detailVisible" title="设备详情" width="1000px" :footer="null">
      <div class="detail-content">
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <a-descriptions bordered :column="3" size="small">
            <a-descriptions-item label="设备名称">{{ currentDevice.name }}</a-descriptions-item>
            <a-descriptions-item label="备注名称">{{ currentDevice.remark }}</a-descriptions-item>
            <a-descriptions-item label="设备型号">{{ currentDevice.model }}</a-descriptions-item>
            <a-descriptions-item label="设备类型">{{ currentDevice.type }}</a-descriptions-item>
            <a-descriptions-item label="子设备数量" v-if="currentDevice.type === '网关'">24</a-descriptions-item>
          </a-descriptions>
        </div>
        <div class="detail-section">
          <div class="section-title">技术参数</div>
          <a-descriptions bordered :column="3" size="small">
            <a-descriptions-item label="制造商">{{ currentDevice.manufacturer }}</a-descriptions-item>
            <a-descriptions-item label="设备ID">{{ currentDevice.deviceId }}</a-descriptions-item>
            <a-descriptions-item label="实物ID">{{ currentDevice.physicalId }}</a-descriptions-item>
            <a-descriptions-item label="生产日期">{{ currentDevice.prodDate }}</a-descriptions-item>
            <a-descriptions-item label="工厂代码">{{ currentDevice.factoryCode }}</a-descriptions-item>
            <a-descriptions-item label="软件版本">{{ currentDevice.swVer }}</a-descriptions-item>
            <a-descriptions-item label="硬件版本">{{ currentDevice.hwVer }}</a-descriptions-item>
            <a-descriptions-item label="额定电压">220V</a-descriptions-item>
            <a-descriptions-item label="额定电流">10A</a-descriptions-item>
            <template v-if="currentDevice.type === '网关'">
              <a-descriptions-item label="模组IMEI号">865432109876543</a-descriptions-item>
              <a-descriptions-item label="SIM卡卡号">8986041234567890</a-descriptions-item>
            </template>
            <template v-else>
              <a-descriptions-item label="断路器极数">3P</a-descriptions-item>
            </template>
          </a-descriptions>
        </div>
        <div class="detail-section">
          <div class="section-title">设备图片</div>
          <div class="device-images">
            <a-image-preview-group>
              <a-image :width="120" src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png" />
              <a-image :width="120" src="https://gw.alipayobjects.com/zos/antfincdn/LlvErsbS7m/tOCL99DCat7ax97.png" />
              <a-image :width="120" src="https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/KybiNn9pWK0PGp.png" />
            </a-image-preview-group>
          </div>
        </div>
      </div>
      <div class="modal-footer-btn">
        <a-button @click="detailVisible = false">取消</a-button>
      </div>
    </a-modal>

    <!-- Enable/Disable Confirmation -->
    <a-modal v-model:visible="statusVisible" :title="statusModalTitle" @ok="handleStatusConfirm" ok-text="确认" cancel-text="取消" :ok-button-props="{ danger: currentDevice.enabled }">
      <div class="status-confirm-content">
        <exclamation-circle-outlined :style="{ color: currentDevice.enabled ? '#ff4d4f' : '#faad14', fontSize: '24px' }" />
        <span class="status-text">确定要{{ currentDevice.enabled ? '禁用' : '启用' }}该设备吗？</span>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { 
  DownloadOutlined,
  CloudUploadOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const agentTreeData = [
  { title: '万众云联科技', value: 'a1', children: [{ title: '分公司A', value: 'a1-1' }] },
  { title: '贵阳华旭电气', value: 'a2' }
]

const searchForm = reactive({
  agent: undefined,
  project: undefined,
  deviceName: '',
  cardNumber: '',
  operator: undefined,
  network: undefined,
  specification: undefined,
  material: undefined,
  cardType: undefined,
  package: undefined,
  status: undefined
})

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 80, fixed: 'left', align: 'center' },
  { title: '代理商', dataIndex: 'agent', key: 'agent', width: 150, align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', width: 150, align: 'center' },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 150, align: 'center' },
  { title: 'ICCID', dataIndex: 'iccid', key: 'iccid', width: 200, align: 'center' },
  { title: '卡号', dataIndex: 'cardNumber', key: 'cardNumber', width: 150, align: 'center' },
  { title: '卡状态', dataIndex: 'status', key: 'status', width: 120, align: 'center' },
  { title: '运营商', dataIndex: 'operator', key: 'operator', width: 100, align: 'center' },
  { title: '网络', dataIndex: 'network', key: 'network', width: 100, align: 'center' },
  { title: '卡规格', dataIndex: 'specification', key: 'specification', width: 150, align: 'center' },
  { title: '卡材质', dataIndex: 'material', key: 'material', width: 120, align: 'center' },
  { title: '卡类型', dataIndex: 'cardType', key: 'cardType', width: 150, align: 'center' },
  { title: '卡套餐', dataIndex: 'package', key: 'package', width: 120, align: 'center' },
  { title: '总流量', dataIndex: 'totalTraffic', key: 'totalTraffic', width: 120, align: 'center' },
  { title: '本期已用', dataIndex: 'usedTraffic', key: 'usedTraffic', width: 120, align: 'center' },
  { title: '开卡时间', dataIndex: 'openTime', key: 'openTime', width: 180, align: 'center' },
  { title: '激活时间', dataIndex: 'activeTime', key: 'activeTime', width: 180, align: 'center' },
  { title: '过期时间', dataIndex: 'expiryTime', key: 'expiryTime', width: 180, align: 'center' },
]

const getStatusColor = (status) => {
  const map = {
    '待激活': 'blue',
    '已激活': 'green',
    '已停机': 'red',
    '可测试': 'cyan',
    '库存': 'orange',
    '预销户': 'purple',
    '已销户': 'default',
    '已过期': 'default',
    '超流量': 'error',
    '非法卡': 'error'
  }
  return map[status] || 'blue'
}

const dataSource = ref([
  { id: 1, agent: '万众云联科技', project: '宝安人才公寓', name: '宝安主网关', iccid: '89860412345678901234', cardNumber: '1064812345678', operator: '移动', network: '4G', specification: '三切卡 12.3×8.8mm', material: '工业级', cardType: 'Nano sim卡（三切）', package: '年套餐', status: '已激活', totalTraffic: '1024MB', usedTraffic: '156MB', openTime: '2023-01-10', activeTime: '2023-01-15', expiryTime: '2024-01-15' },
  { id: 2, agent: '万众云联科技', project: '宝安人才公寓', name: '照明控制断路器', iccid: '89860412345678901235', cardNumber: '1064812345679', operator: '联通', network: 'NB', specification: '贴片卡', material: 'NB工业级', cardType: '贴片卡', package: '年套餐', status: '已激活', totalTraffic: '500MB', usedTraffic: '12MB', openTime: '2023-02-15', activeTime: '2023-02-20', expiryTime: '2024-02-20' },
  { id: 3, agent: '贵阳华旭电气', project: '天河办公楼', name: '空调支路开关', iccid: '89860412345678901236', cardNumber: '1064812345680', operator: '电信', network: '4G', specification: '二切卡 15×12mm', material: '消费级', cardType: 'Nano sim卡（二切）', package: '季套餐', status: '待激活', totalTraffic: '2GB', usedTraffic: '0MB', openTime: '2023-03-20', activeTime: '-', expiryTime: '2023-06-20' },
  { id: 4, agent: '贵阳华旭电气', project: '天河办公楼', name: '插座回路', iccid: '89860412345678901237', cardNumber: '1064812345681', operator: '移动', network: '5G', specification: '三切卡 12.3×8.8mm', material: '工业级', cardType: 'Nano sim卡（三切）', package: '年套餐', status: '已激活', totalTraffic: '10GB', usedTraffic: '1.2GB', openTime: '2023-04-10', activeTime: '2023-04-15', expiryTime: '2024-04-15' },
  { id: 5, agent: '万众云联科技', project: '宝安人才公寓', name: '电梯动力', iccid: '89860412345678901238', cardNumber: '1064812345682', operator: '移动', network: '4G', specification: '大卡 15×25mm', material: '工业级', cardType: '标准sim卡（大卡）', package: '半年套餐', status: '已停机', totalTraffic: '5GB', usedTraffic: '4.9GB', openTime: '2023-05-12', activeTime: '2023-05-15', expiryTime: '2023-11-15' },
  { id: 6, agent: '万众云联科技', project: '宝安人才公寓', name: '应急照明网关', iccid: '89860412345678901239', cardNumber: '1064812345683', operator: '电信', network: '4G', specification: '三切卡 12.3×8.8mm', material: '工业级', cardType: 'Nano sim卡（三切）', package: '年套餐', status: '库存', totalTraffic: '1GB', usedTraffic: '0MB', openTime: '2023-06-20', activeTime: '-', expiryTime: '2024-06-20' },
  { id: 7, agent: '贵阳华旭电气', project: '天河办公楼', name: '新风机组控制', iccid: '89860412345678901240', cardNumber: '1064812345684', operator: '移动', network: '4G', specification: '中卡 15x12mm', material: '工业级', cardType: '陶瓷中卡', package: '年套餐', status: '已激活', totalTraffic: '2GB', usedTraffic: '450MB', openTime: '2023-07-05', activeTime: '2023-07-10', expiryTime: '2024-07-10' },
  { id: 8, agent: '万众云联科技', project: '宝安人才公寓', name: '地库排污泵', iccid: '89860412345678901241', cardNumber: '1064812345685', operator: '联通', network: '4G', specification: '三切卡 12.3×8.8mm', material: '工业级', cardType: 'Nano sim卡（三切）', package: '月套餐', status: '可测试', totalTraffic: '500MB', usedTraffic: '50MB', openTime: '2023-08-10', activeTime: '2023-08-12', expiryTime: '2023-09-12' },
  { id: 9, agent: '贵阳华旭电气', project: '天河办公楼', name: '消防稳压泵', iccid: '89860412345678901242', cardNumber: '1064812345686', operator: '电信', network: 'NB', specification: '贴片卡', material: 'NB工业级', cardType: '贴片卡', package: '年套餐', status: '已激活', totalTraffic: '200MB', usedTraffic: '8MB', openTime: '2023-09-08', activeTime: '2023-09-15', expiryTime: '2024-09-15' },
  { id: 10, agent: '万众云联科技', project: '宝安人才公寓', name: '景观照明网关', iccid: '89860412345678901243', cardNumber: '1064812345687', operator: '移动', network: '5G', specification: '三切卡 12.3×8.8mm', material: '工业级', cardType: 'Nano sim卡（三切）', package: '年套餐', status: '已激活', totalTraffic: '20GB', usedTraffic: '2.5GB', openTime: '2023-10-15', activeTime: '2023-10-20', expiryTime: '2024-10-20' },
])

const pagination = reactive({
  current: 1, pageSize: 10, total: 1280, showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100']
})

// Modals state
const importVisible = ref(false)
const deviceModalVisible = ref(false)
const deviceModalType = ref('add')
const deviceForm = reactive({ name: '', remark: '', model: undefined })
const detailVisible = ref(false)
const currentDevice = ref({})
const statusVisible = ref(false)

const deviceModalTitle = computed(() => deviceModalType.value === 'add' ? '新增设备' : '编辑设备')
const statusModalTitle = computed(() => currentDevice.value.enabled ? '确认禁用' : '确认启用')

const openAddModal = () => {
  deviceModalType.value = 'add'
  deviceForm.name = ''
  deviceForm.remark = ''
  deviceForm.model = undefined
  deviceModalVisible.value = true
}

const openEditModal = (record) => {
  deviceModalType.value = 'edit'
  deviceForm.remark = record.remark
  deviceModalVisible.value = true
}

const handleDeviceSubmit = () => {
  message.success(`${deviceModalTitle.value}成功`)
  deviceModalVisible.value = false
}

const openDetailModal = (record) => {
  currentDevice.value = record
  detailVisible.value = true
}

const toggleStatus = (record) => {
  currentDevice.value = record
  statusVisible.value = true
}

const handleStatusConfirm = () => {
  currentDevice.value.enabled = !currentDevice.value.enabled
  message.success(`${currentDevice.value.enabled ? '启用' : '禁用'}成功`)
  statusVisible.value = false
}

const handleDelete = (record) => {
  message.success(`已删除设备：${record.name}`)
}
</script>

<style scoped>
.sim-management { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.search-form-container {
  background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1;
}
.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}
.action-btn { border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.operation-bar { display: flex; gap: 10px; }
.add-btn { background-color: #1890ff; border-radius: 4px; transition: all 0.2s; font-size: 13px; }
.action-btn:hover, .add-btn:hover { transform: translateY(-1px); }

.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }
.action-link { font-size: 13px; transition: all 0.2s; }
.action-link:hover { opacity: 0.8; text-decoration: underline; }
.action-link.detail { color: #1890ff; }
.action-link.edit { color: #1890ff; }
.action-link.delete { color: #ff4d4f; }

:deep(.ant-table-thead > tr > th) { background: #f8f9fb !important; font-weight: bold; }

/* Custom Scrollbar Styling */
.custom-scrollbar :deep(.ant-table-body),
.custom-scrollbar :deep(.ant-table-content) {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}

.custom-scrollbar :deep(::-webkit-scrollbar) {
  height: 8px;
  width: 8px;
}

.custom-scrollbar :deep(::-webkit-scrollbar-thumb) {
  background: #e8e8e8;
  border-radius: 4px;
}

.custom-scrollbar :deep(::-webkit-scrollbar-thumb:hover) {
  background: #d9d9d9;
}

.custom-scrollbar :deep(::-webkit-scrollbar-track) {
  background: transparent;
}

/* Modal Content Styles */
.import-content { text-align: center; padding: 20px 0; }
.download-btn { margin-bottom: 20px; }
.upload-dragger { margin-top: 10px; }

.detail-content { max-height: 600px; overflow-y: auto; padding-right: 10px; }
.detail-section { margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; padding-left: 8px; border-left: 4px solid #1890ff; }
.device-images { display: flex; gap: 16px; margin-top: 10px; }

.pretty-form :deep(.ant-form-item-label) { font-weight: bold; }

.status-confirm-content { display: flex; align-items: center; gap: 16px; padding: 10px 0; }
.status-text { font-size: 16px; }

.modal-footer-btn { text-align: right; margin-top: 20px; }
</style>
