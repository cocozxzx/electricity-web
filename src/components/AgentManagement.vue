<template>
  <div class="agent-management fade-in">
    <a-row :gutter="16">
      <!-- Left Tree Structure -->
      <a-col :span="4">
        <div class="tree-container">
          <div class="tree-header">
            <span>代理商</span>
            <plus-outlined class="add-icon" @click="openAddTreeNodeModal" />
          </div>
          <a-tree
            :tree-data="treeData"
            default-expand-all
            class="custom-tree"
          >
            <template #title="{ title, key }">
              <div class="tree-node-wrapper">
                <span class="tree-node-title">{{ title }}</span>
                <div class="tree-node-actions">
                  <edit-outlined @click.stop="openEditTreeNodeModal(title, key)" />
                  <delete-outlined @click.stop="handleDeleteTreeNode(key)" />
                </div>
              </div>
            </template>
          </a-tree>
        </div>
      </a-col>

      <!-- Right Content Area -->
      <a-col :span="20">
        <!-- Search Bar -->
        <div class="search-form-container">
          <a-form layout="inline" :model="searchForm" class="search-form">
            <a-form-item>
              <a-input v-model:value="searchForm.name" placeholder="代理商名称" class="search-input" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="searchForm.account" placeholder="账号" class="search-input" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="searchForm.contact" placeholder="联系人" class="search-input" />
            </a-form-item>
            <a-form-item>
              <a-input v-model:value="searchForm.phone" placeholder="电话" class="search-input" />
            </a-form-item>
            <a-form-item>
              <a-select
                v-model:value="searchForm.project"
                placeholder="最近项目"
                style="width: 180px"
                class="search-select"
                show-search
                option-filter-prop="label"
              >
                <a-select-option value="p1" label="宝安人才公寓">宝安人才公寓</a-select-option>
                <a-select-option value="p2" label="贵阳中心大厦">贵阳中心大厦</a-select-option>
                <a-select-option value="p3" label="泉山区监测点">泉山区监测点</a-select-option>
                <a-select-option value="p4" label="华东智慧电力园">华东智慧电力园</a-select-option>
                <a-select-option value="p5" label="高新科技孵化器">高新科技孵化器</a-select-option>
                <a-select-option value="p6" label="中兴工业园">中兴工业园</a-select-option>
                <a-select-option value="p7" label="成电科创中心">成电科创中心</a-select-option>
                <a-select-option value="p8" label="烽火大厦">烽火大厦</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-range-picker v-model:value="searchForm.date" class="search-date" />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" class="action-btn">查询</a-button>
                <a-button class="action-btn">重置</a-button>
                <a-button class="action-btn">导出</a-button>
                <a-button type="primary" class="add-btn" @click="openAddModal">新增</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <!-- Table -->
        <div class="table-container">
          <a-table
            :columns="columns"
            :data-source="dataSource"
            :pagination="pagination"
            size="middle"
            row-selection="{}"
            class="ruoyi-table custom-scrollbar"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'recentProject'">
                <a class="project-link" @click="handleJumpToProject(record)">{{ record.recentProject }}</a>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a class="action-link detail" @click="openDetailModal(record)">详情</a>
                  <a class="action-link edit" @click="openEditModal(record)">编辑</a>
                  <a-popconfirm
                    title="确定要删除该代理商吗？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="handleDelete(record)"
                  >
                    <a class="action-link delete">删除</a>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>

    <!-- Add/Edit/Detail Modal -->
    <a-modal
      v-model:visible="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      width="800px"
      :ok-text="isDetail ? null : '保存'"
      :cancel-text="isDetail ? '关闭' : '取消'"
      :footer="isDetail ? null : undefined"
      class="custom-modal"
    >
      <a-form :model="formState" layout="vertical" class="agent-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="代理商名称" :required="!isDetail">
              <a-tree-select
                v-model:value="formState.name"
                style="width: 100%"
                :tree-data="treeData"
                placeholder="搜索或选择代理商..."
                tree-default-expand-all
                :disabled="isDetail"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="登录账号" :required="!isDetail">
              <a-input v-model:value="formState.account" placeholder="请输入登录账号" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="!isDetail">
            <a-form-item label="登录密码" required>
              <a-input-password v-model:value="formState.password" placeholder="请输入登录密码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系人" :required="!isDetail">
              <a-input v-model:value="formState.contact" placeholder="请输入联系人" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="电话" :required="!isDetail">
              <a-input v-model:value="formState.phone" placeholder="请输入电话" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="法定代表人">
              <a-input v-model:value="formState.legalPerson" placeholder="请输入法定代表人" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="通讯地址">
              <a-input v-model:value="formState.address" placeholder="请输入通讯地址" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="公司图标">
              <div class="logo-upload">
                <div class="logo-preview">
                  <picture-outlined v-if="!formState.logo" />
                  <img v-else :src="formState.logo" alt="logo" />
                </div>
                <div class="upload-info" v-if="!isDetail">
                  <a-button size="small">选择图片</a-button>
                  <p class="hint">建议尺寸 200x200，支持 jpg、png 格式</p>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商务联系人">
              <a-input v-model:value="formState.businessContact" placeholder="请输入商务联系人" :disabled="isDetail" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系方式">
              <a-input v-model:value="formState.contactWay" placeholder="请输入联系方式" :disabled="isDetail" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Tree Node Edit Modal -->
    <a-modal
      v-model:visible="treeNodeModalVisible"
      :title="treeNodeModalType === 'add' ? '新增代理商节点' : '编辑代理商节点'"
      @ok="handleTreeNodeModalOk"
      ok-text="确定"
      cancel-text="取消"
      width="500px"
    >
      <a-form layout="vertical">
        <a-form-item label="父级代理商" v-if="treeNodeModalType === 'add'">
          <a-tree-select
            v-model:value="parentTreeNodeKey"
            style="width: 100%"
            :tree-data="treeData"
            placeholder="不选则作为一级节点"
            tree-default-expand-all
            allow-clear
          />
        </a-form-item>
        <a-form-item label="代理商名称" required>
          <a-input v-model:value="treeNodeName" placeholder="请输入名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, PictureOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()
const searchForm = reactive({
  name: '',
  account: '',
  contact: '',
  phone: '',
  project: undefined,
  date: []
})

const handleJumpToProject = (record) => {
  router.push({
    path: '/project/detail',
    query: { id: record.id, name: record.recentProject }
  })
}

const treeData = ref([
  {
    title: '万众云联科技',
    key: '0-0',
    value: '万众云联科技',
    children: [
      { title: '贵阳华旭电气', key: '0-0-0', value: '贵阳华旭电气' },
      { 
        title: '徐州市民宗局监测系统', 
        key: '0-0-1',
        value: '徐州市民宗局监测系统',
        children: [
          { title: '泉山区民宗局监测系统', key: '0-0-1-0', value: '泉山区民宗局监测系统' }
        ]
      },
    ],
  },
])

// Modal logic
const modalVisible = ref(false)
const modalType = ref('add') // 'add' | 'edit' | 'detail'
const formState = reactive({
  name: undefined,
  account: '',
  password: '',
  contact: '',
  phone: '',
  legalPerson: '',
  address: '',
  logo: '',
  businessContact: '',
  contactWay: ''
})

const modalTitle = computed(() => {
  if (modalType.value === 'add') return '新增代理商'
  if (modalType.value === 'edit') return '编辑代理商'
  return '代理商详情'
})

const isDetail = computed(() => modalType.value === 'detail')

const openAddModal = () => {
  modalType.value = 'add'
  Object.keys(formState).forEach(key => formState[key] = '')
  formState.name = undefined
  modalVisible.value = true
}

const openEditModal = (record) => {
  modalType.value = 'edit'
  Object.assign(formState, {
    ...record,
    legalPerson: record.legalPerson || '张法定',
    address: record.address || '某某街道某某大厦',
    businessContact: record.businessContact || '王商务',
    contactWay: record.contactWay || '13812341234'
  })
  modalVisible.value = true
}

const openDetailModal = (record) => {
  modalType.value = 'detail'
  Object.assign(formState, {
    ...record,
    legalPerson: record.legalPerson || '张法定',
    address: record.address || '某某街道某某大厦',
    businessContact: record.businessContact || '王商务',
    contactWay: record.contactWay || '13812341234'
  })
  modalVisible.value = true
}

const handleModalOk = () => {
  if (isDetail.value) {
    modalVisible.value = false
    return
  }
  message.success(`${modalTitle.value}成功`)
  modalVisible.value = false
}

const handleDelete = (record) => {
  message.success(`已删除代理商：${record.name}`)
}

// Tree maintenance logic
const treeNodeModalVisible = ref(false)
const treeNodeModalType = ref('add')
const treeNodeName = ref('')
const parentTreeNodeKey = ref(undefined)
const currentTreeNodeKey = ref('')

const openAddTreeNodeModal = () => {
  treeNodeModalType.value = 'add'
  treeNodeName.value = ''
  parentTreeNodeKey.value = undefined
  treeNodeModalVisible.value = true
}

const openEditTreeNodeModal = (title, key) => {
  treeNodeModalType.value = 'edit'
  treeNodeName.value = title
  currentTreeNodeKey.value = key
  treeNodeModalVisible.value = true
}

const handleTreeNodeModalOk = () => {
  if (!treeNodeName.value) {
    message.warning('请输入名称')
    return
  }
  if (treeNodeModalType.value === 'add') {
    const newNode = {
      title: treeNodeName.value,
      key: `node-${Date.now()}`,
      value: treeNodeName.value
    }
    
    if (parentTreeNodeKey.value) {
      const addToParent = (data) => {
        for (let node of data) {
          if (node.key === parentTreeNodeKey.value) {
            if (!node.children) node.children = []
            node.children.push(newNode)
            return true
          }
          if (node.children && addToParent(node.children)) return true
        }
        return false
      }
      addToParent(treeData.value)
    } else {
      treeData.value.push(newNode)
    }
    message.success('新增成功')
  } else {
    const updateNode = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === currentTreeNodeKey.value) {
          data[i].title = treeNodeName.value
          data[i].value = treeNodeName.value
          return true
        }
        if (data[i].children && updateNode(data[i].children)) return true
      }
      return false
    }
    updateNode(treeData.value)
    message.success('修改成功')
  }
  treeNodeModalVisible.value = false
}

const handleDeleteTreeNode = (key) => {
  const deleteNode = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) {
        data.splice(i, 1)
        return true
      }
      if (data[i].children && deleteNode(data[i].children)) return true
    }
    return false
  }
  deleteNode(treeData.value)
  message.success('删除成功')
}

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '代理商名称', dataIndex: 'name', key: 'name', width: 200, align: 'center', customCell: () => ({ style: { 'white-space': 'nowrap' } }) },
  { title: '账号', dataIndex: 'account', key: 'account', align: 'center' },
  { title: '联系人', dataIndex: 'contact', key: 'contact', align: 'center' },
  { title: '电话', dataIndex: 'phone', key: 'phone', align: 'center' },
  { title: '项目总数', dataIndex: 'projectCount', key: 'projectCount', width: 80, align: 'center' },
  { title: '设备总数', dataIndex: 'deviceCount', key: 'deviceCount', width: 80, align: 'center' },
  { title: '最近项目', dataIndex: 'recentProject', key: 'recentProject', align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', align: 'center' },
  { title: '操作', key: 'action', fixed: 'right', width: 180, align: 'center' },
]

const dataSource = ref([
  { id: 1, name: '万众云联科技', account: 'admin_wz', contact: '王经理', phone: '13800138000', projectCount: 12, deviceCount: 156, recentProject: '宝安人才公寓', createTime: '2023-01-15 10:30:45' },
  { id: 2, name: '贵阳华旭电气', account: 'gyhx_01', contact: '李工', phone: '13912345678', projectCount: 5, deviceCount: 42, recentProject: '贵阳中心大厦', createTime: '2023-03-20 15:20:12' },
  { id: 3, name: '徐州市民宗局监测系统', account: 'xz_mzj', contact: '陈雪', phone: '15335131341', projectCount: 8, deviceCount: 89, recentProject: '泉山区监测点', createTime: '2023-05-10 09:15:30' },
  { id: 4, name: '华东大区代理', account: 'hd_proxy', contact: '张总', phone: '13766554433', projectCount: 25, deviceCount: 450, recentProject: '华东智慧电力园', createTime: '2023-06-01 14:00:00' },
  { id: 5, name: '南方电网合作伙伴', account: 'south_grid', contact: '刘主任', phone: '13500001111', projectCount: 40, deviceCount: 1200, recentProject: '高新科技孵化器', createTime: '2023-08-12 11:20:15' },
  { id: 6, name: '深圳中兴通讯分销', account: 'zte_sz', contact: '赵经理', phone: '13688889999', projectCount: 15, deviceCount: 320, recentProject: '中兴工业园', createTime: '2023-09-05 16:45:22' },
  { id: 7, name: '成都成电自动化', account: 'cd_auto', contact: '曾工', phone: '13322223333', projectCount: 10, deviceCount: 180, recentProject: '成电科创中心', createTime: '2023-10-20 10:10:10' },
  { id: 8, name: '武汉烽火科技代理', account: 'fh_wuhan', contact: '黄经理', phone: '13144445555', projectCount: 18, deviceCount: 260, recentProject: '烽火大厦', createTime: '2023-11-11 11:11:11' },
])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 100,
  showTotal: (total) => `共 ${total} 条记录`,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
})
</script>

<style scoped>
.agent-management {
  height: 100%;
  font-size: 13px;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.tree-container {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
  height: calc(100vh - 250px);
  overflow-y: auto;
}

.tree-header {
  padding: 12px;
  border-bottom: 1px solid #e6ebf1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
}

.add-icon {
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-tree {
  padding: 8px;
}

.tree-node-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.tree-node-actions {
  display: none;
  gap: 8px;
  color: #1890ff;
  font-size: 12px;
}

.tree-node-wrapper:hover .tree-node-actions {
  display: flex;
}

.tree-node-title {
  font-size: 13px;
}

.search-form-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 12px;
  border: 1px solid #e6ebf1;
}

.search-form {
  margin-bottom: 12px;
}

:deep(.ant-input), :deep(.ant-select-selector), :deep(.ant-picker) {
  height: 32px !important;
  font-size: 13px !important;
}

:deep(.ant-form-item-label > label) {
  font-size: 13px !important;
}

.action-btn {
  border-radius: 4px;
  font-size: 13px;
}

.operation-bar {
  display: flex;
  gap: 10px;
}

.add-btn {
  background-color: #1890ff;
  border-radius: 4px;
  font-size: 13px;
}

.table-container {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
}

.project-link {
  color: #1890ff;
  font-size: 13px;
}

.action-link {
  font-size: 13px;
  transition: all 0.2s;
}

.action-link.detail { color: #1890ff; }
.action-link.edit { color: #1890ff; }
.action-link.delete { color: #ff4d4f; }

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
  font-size: 13px !important;
  white-space: nowrap;
}

:deep(.ant-table-tbody > tr > td) {
  white-space: nowrap;
}

/* Modal styles */
.logo-upload {
  display: flex;
  gap: 15px;
  align-items: center;
}

.logo-preview {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #bfbfbf;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-info .hint {
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

:deep(.ant-modal-title) {
  font-size: 16px !important;
  font-weight: bold !important;
}

:deep(.ant-form-item) {
  margin-bottom: 12px !important;
}

:deep(.ant-form-item-label) {
  padding-bottom: 4px !important;
}
</style>
