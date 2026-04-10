<template>
  <div class="device-management fade-in">
    <!-- Status Cards -->
    <a-row :gutter="16" class="stats-cards">
      <a-col :span="4.8" v-for="stat in stats" :key="stat.title" class="stat-col">
        <div class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
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

    <!-- Search Form -->
    <div class="search-form-container">
      <a-form layout="inline" :model="searchForm" class="search-form">
        <a-form-item><a-input v-model:value="searchForm.name" placeholder="设备名称" /></a-form-item>
        <a-form-item><a-input v-model:value="searchForm.remark" placeholder="备注名称" /></a-form-item>
        <a-form-item><a-input v-model:value="searchForm.deviceId" placeholder="设备ID" /></a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.type" placeholder="设备类型" style="width: 120px">
            <a-select-option value="网关">网关</a-select-option>
            <a-select-option value="子设备">子设备</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.model" placeholder="设备型号" style="width: 140px">
            <a-select-option value="IoT-GW-Pro">IoT-GW-Pro</a-select-option>
            <a-select-option value="CB-100-Smart">CB-100-Smart</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.enabled" placeholder="是否启用" style="width: 120px">
            <a-select-option :value="true">启用</a-select-option>
            <a-select-option :value="false">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.status" placeholder="设备状态" style="width: 120px">
            <a-select-option value="激活">激活</a-select-option>
            <a-select-option value="未激活">未激活</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-select v-model:value="searchForm.onlineStatus" placeholder="通讯状态" style="width: 120px">
            <a-select-option value="在线">在线</a-select-option>
            <a-select-option value="离线">离线</a-select-option>
          </a-select>
        </a-form-item>
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
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn">查询</a-button>
            <a-button class="action-btn">重置</a-button>
            <a-button class="action-btn">导出</a-button>
            <a-button class="action-btn" @click="importVisible = true">批量导入</a-button>
            <a-button type="primary" class="add-btn" @click="openAddModal">
              <template #icon><plus-outlined /></template>
              新增设备
            </a-button>
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
        :row-selection="{}"
        size="middle"
        :scroll="{ x: 2500 }"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === '网关' ? 'blue' : 'green'">{{ record.type }}</a-tag>
          </template>
          <template v-else-if="column.key === 'enabled'">
            <span :style="{ color: record.enabled ? '#52c41a' : '#f5222d' }">
              {{ record.enabled ? '启用' : '禁用' }}
            </span>
          </template>
          <template v-else-if="column.key === 'status'">
            <span :style="{ color: record.status === '激活' ? '#52c41a' : '#faad14' }">
              {{ record.status }}
            </span>
          </template>
          <template v-else-if="column.key === 'onlineStatus'">
            <a-badge :status="record.onlineStatus === '在线' ? 'success' : 'default'" :text="record.onlineStatus" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="openDetailModal(record)">详情</a>
              <a class="action-link edit" @click="openEditModal(record)">编辑</a>
              <a class="action-link" :style="{ color: record.enabled ? '#ff4d4f' : '#52c41a' }" @click="toggleStatus(record)">
                {{ record.enabled ? '禁用' : '启用' }}
              </a>
              <a-popconfirm title="确定要删除该设备吗？" ok-text="确定" cancel-text="取消" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
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
            <a-form-item label="DeviceName" required v-if="deviceModalType === 'add'">
              <a-input v-model:value="deviceForm.name" placeholder="请输入DeviceName" />
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
            <a-descriptions-item label="DeviceName">{{ currentDevice.deviceName }}</a-descriptions-item>
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
  DatabaseOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  WifiOutlined, 
  DisconnectOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const stats = [
  { title: '设备总数', value: '1,280', icon: DatabaseOutlined, color: '#1890ff', bgColor: '#e6f7ff' },
  { title: '激活设备', value: '1,150', icon: CheckCircleOutlined, color: '#52c41a', bgColor: '#f6ffed' },
  { title: '禁用设备', value: '130', icon: StopOutlined, color: '#faad14', bgColor: '#fff7e6' },
  { title: '在线数', value: '1,080', icon: WifiOutlined, color: '#722ed1', bgColor: '#f9f0ff' },
  { title: '离线数', value: '200', icon: DisconnectOutlined, color: '#ff4d4f', bgColor: '#fff1f0' },
]

const agentTreeData = [
  { title: '万众云联科技', value: 'a1', children: [{ title: '分公司A', value: 'a1-1' }] },
  { title: '贵阳华旭电气', value: 'a2' }
]

const searchForm = reactive({
  name: '', remark: '', deviceId: '', type: undefined, model: undefined, enabled: undefined, status: undefined, onlineStatus: undefined, agent: undefined, project: undefined
})

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 80, fixed: 'left', align: 'center' },
  { title: 'DeviceName', dataIndex: 'deviceName', key: 'deviceName', width: 150, fixed: 'left', align: 'center' },
  { title: '设备名称', dataIndex: 'name', key: 'name', width: 150, fixed: 'left', align: 'center' },
  { title: '备注名称', dataIndex: 'remark', key: 'remark', width: 150, align: 'center' },
  { title: '设备类型', dataIndex: 'type', key: 'type', width: 100, align: 'center' },
  { title: '型号', dataIndex: 'model', key: 'model', width: 120, align: 'center' },
  { title: '设备ID', dataIndex: 'deviceId', key: 'deviceId', width: 120, align: 'center' },
  { title: '实物ID', dataIndex: 'physicalId', key: 'physicalId', width: 120, align: 'center' },
  { title: '是否启用', dataIndex: 'enabled', key: 'enabled', width: 100, align: 'center' },
  { title: '设备状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '通讯状态', dataIndex: 'onlineStatus', key: 'onlineStatus', width: 100, align: 'center' },
  { title: '设备激活时间', dataIndex: 'activeTime', key: 'activeTime', width: 180, align: 'center' },
  { title: '设备运行时间(小时)', dataIndex: 'runTime', key: 'runTime', width: 150, align: 'center' },
  { title: '所属项目', dataIndex: 'project', key: 'project', width: 150, align: 'center' },
  { title: '代理商', dataIndex: 'agent', key: 'agent', width: 150, align: 'center' },
  { title: '安装位置', dataIndex: 'location', key: 'location', width: 150, align: 'center' },
  { title: '制造商', dataIndex: 'manufacturer', key: 'manufacturer', width: 120, align: 'center' },
  { title: '生产日期', dataIndex: 'prodDate', key: 'prodDate', width: 120, align: 'center' },
  { title: '软件版本', dataIndex: 'swVer', key: 'swVer', width: 100, align: 'center' },
  { title: '硬件版本', dataIndex: 'hwVer', key: 'hwVer', width: 100, align: 'center' },
  { title: '工厂代码', dataIndex: 'factoryCode', key: 'factoryCode', width: 120, align: 'center' },
  { title: '操作', key: 'action', fixed: 'right', width: 220, align: 'center' },
]

const dataSource = ref([
  { id: 1, deviceName: 'GW-BA-001', name: '宝安主网关', remark: '1号配电房网关', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW-00128', physicalId: 'PHY-GW-1001', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-05-15 09:30:00', runTime: 18240, project: '宝安人才公寓', agent: '万众云联科技', location: '1F配电箱', manufacturer: '华为科技', prodDate: '2023-01-10', swVer: 'v2.3.1', hwVer: 'v1.0.0', factoryCode: 'FAC-01' },
  { id: 2, deviceName: 'CB-BA-002', name: '照明控制断路器', remark: 'A区走廊灯', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB-20045', physicalId: 'PHY-CB-5002', enabled: true, status: '激活', onlineStatus: '离线', activeTime: '2023-06-20 10:10:00', runTime: 14520, project: '宝安人才公寓', agent: '万众云联科技', location: '1F-A区', manufacturer: '正泰电器', prodDate: '2023-02-15', swVer: 'v1.0.5', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 3, deviceName: 'CB-TH-003', name: '空调支路开关', remark: '201会议室空调', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB-20046', physicalId: 'PHY-CB-5003', enabled: true, status: '未激活', onlineStatus: '离线', activeTime: '-', runTime: 0, project: '天河办公楼', agent: '贵阳华旭电气', location: '2F会议室', manufacturer: '正泰电器', prodDate: '2023-03-20', swVer: 'v1.0.5', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 4, deviceName: 'CB-TH-004', name: '插座回路', remark: '3F办公区', type: '子设备', model: 'CB-100-Smart', deviceId: 'SUB-20047', physicalId: 'PHY-CB-5004', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-06-26 11:20:00', runTime: 13260, project: '天河办公楼', agent: '贵阳华旭电气', location: '3F办公区', manufacturer: '正泰电器', prodDate: '2023-04-10', swVer: 'v1.0.5', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 5, deviceName: 'CB-BA-005', name: '电梯动力', remark: '1号梯电源', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB-20048', physicalId: 'PHY-CB-5005', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-08-25 09:00:00', runTime: 9680, project: '宝安人才公寓', agent: '万众云联科技', location: 'B1机房', manufacturer: '正泰电器', prodDate: '2023-05-12', swVer: 'v1.1.0', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 6, deviceName: 'GW-TH-006', name: '应急照明网关', remark: '公共区域应急', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW-00130', physicalId: 'PHY-GW-1003', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-05-18 14:25:00', runTime: 18030, project: '天河办公楼', agent: '贵阳华旭电气', location: '1F弱电间', manufacturer: '华为科技', prodDate: '2023-01-15', swVer: 'v2.3.1', hwVer: 'v1.0.0', factoryCode: 'FAC-01' },
  { id: 7, deviceName: 'CB-WZ-007', name: '地库排污泵', remark: 'B2集水坑', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB-20049', physicalId: 'PHY-CB-5006', enabled: false, status: '未激活', onlineStatus: '-', activeTime: '2023-09-01 08:40:00', runTime: 9050, project: '万众云联科技', agent: '万众云联科技', location: 'B2车库', manufacturer: '正泰电器', prodDate: '2023-06-20', swVer: 'v1.1.0', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 8, deviceName: 'GW-TH-008', name: '监控网关', remark: '全楼安防', type: '网关', model: 'IoT-GW-Pro', deviceId: 'GW-00131', physicalId: 'PHY-GW-1004', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-05-20 16:50:00', runTime: 17950, project: '天河办公楼', agent: '贵阳华旭电气', location: '1F监控室', manufacturer: '华为科技', prodDate: '2023-01-20', swVer: 'v2.3.1', hwVer: 'v1.0.0', factoryCode: 'FAC-01' },
  { id: 9, deviceName: 'CB-BA-009', name: '消防水泵', remark: '稳压泵电源', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB-20050', physicalId: 'PHY-CB-5007', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-09-03 10:15:00', runTime: 8870, project: '宝安人才公寓', agent: '万众云联科技', location: 'B1水泵房', manufacturer: '正泰电器', prodDate: '2023-07-05', swVer: 'v1.1.0', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
  { id: 10, deviceName: 'CB-TH-010', name: '冷水机组', remark: '空调主机开关', type: '子设备', model: 'CB-200-Smart', deviceId: 'SUB-20051', physicalId: 'PHY-CB-5008', enabled: true, status: '激活', onlineStatus: '在线', activeTime: '2023-09-08 13:05:00', runTime: 8460, project: '天河办公楼', agent: '贵阳华旭电气', location: '顶楼机房', manufacturer: '正泰电器', prodDate: '2023-08-10', swVer: 'v1.1.0', hwVer: 'v1.2.0', factoryCode: 'FAC-02' },
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
.device-management { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

.stats-cards { margin-bottom: 20px; display: flex; flex-wrap: nowrap; }
.stat-col { flex: 1; }
.stat-card {
  background: #fff; padding: 15px; border-radius: 4px; display: flex; align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); transition: all 0.3s;
  height: 100%;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.stat-icon {
  width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; margin-right: 15px;
}
.stat-title { color: #8c8c8c; font-size: 13px; }
.stat-value { font-size: 20px; font-weight: bold; color: #333; }

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
