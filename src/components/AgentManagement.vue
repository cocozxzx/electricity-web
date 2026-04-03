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
            :tree-data="treeDataWithCounts"
            default-expand-all
            class="custom-tree"
            v-model:selected-keys="selectedTreeKeys"
            @select="onTreeSelect"
          >
            <template #title="{ title, key, value, inScope }">
              <div class="tree-node-wrapper" :class="{ 'out-of-scope': !inScope }">
                <span class="tree-node-title">{{ title }}</span>
                <div class="tree-node-actions" v-if="inScope">
                  <edit-outlined v-if="canEditNode(key)" @click.stop="openEditTreeNodeModal(value, key)" />
                  <a-popconfirm
                    v-if="canDeleteNode(key)"
                    title="确定要删除该代理商及其所有子代理商吗？"
                    @confirm="handleDeleteTreeNode(key)"
                  >
                    <delete-outlined @click.stop />
                  </a-popconfirm>
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
            <a-form-item label="">
              <a-tree-select
                v-model:value="searchForm.name"
                style="width: 220px"
                :tree-data="treeDataWithCounts"
                placeholder="搜索代理商..."
                allow-clear
                tree-default-expand-all
                show-search
                tree-node-filter-prop="title"
              />
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
            <a-form-item class="search-actions">
              <a-space :size="12">
                <a-button type="primary" class="action-btn">查询</a-button>
                <a-button class="action-btn" @click="resetSearch">重置</a-button>
                <a-button type="primary" class="add-btn" @click="openAddAccountModal">新增账号</a-button>
                <div class="simulation-role">
                  <!-- <span style="font-size: 12px; color: #999; margin-right: 8px;">切换模拟账号:</span> -->
                  <a-select v-model:value="currentUserId" style="width: 220px" :options="simulationAccounts" :field-names="{ label: 'name', value: 'id' }">
                    <template #option="{ name, agentName, roleName }">
                      <div style="display: flex; flex-direction: column;">
                        <span style="font-weight: bold; font-size: 13px;">{{ name }} ({{ roleName }})</span>
                        <span style="font-size: 11px; color: #999;">所属: {{ agentName }}</span>
                      </div>
                    </template>
                  </a-select>
                </div>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <!-- Table -->
        <div class="table-container">
          <a-table
            :columns="columns"
            :data-source="filteredDataSource"
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
                  <a class="action-link edit" @click="openEditAgentAccountModal(record)">编辑</a>
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

    <!-- Account Add/Edit Modal (Standardized for both Add Account and Row Edit) -->
    <a-modal
      v-model:visible="accountModalVisible"
      :title="accountModalType === 'add' ? '新增代理商账号' : '编辑代理商账号'"
      @ok="handleAccountModalOk"
      width="600px"
      ok-text="保存"
      cancel-text="取消"
      class="custom-modal"
    >
      <a-form :model="accountFormState" layout="vertical" class="agent-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="所属代理商" required>
              <a-tree-select
                v-model:value="accountFormState.agentTreeKey"
                style="width: 100%"
                :tree-data="treeDataWithCounts"
                placeholder="请选择代理商..."
                tree-default-expand-all
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="姓名" required>
              <a-input v-model:value="accountFormState.name" placeholder="请输入姓名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="用户名" required>
              <a-input v-model:value="accountFormState.username" placeholder="请输入用户名" :disabled="accountModalType === 'edit'" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="登录密码" :required="accountModalType === 'add'">
              <a-input-password v-model:value="accountFormState.password" placeholder="请输入密码" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分配角色" required>
              <a-select v-model:value="accountFormState.role" placeholder="请选择角色">
                <a-select-option v-for="role in accountRoles" :key="role.value" :value="role.value">
                  {{ role.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" required>
              <a-input v-model:value="accountFormState.phone" placeholder="请输入手机号" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- Fused Detail Modal -->
    <a-modal
      v-model:visible="detailModalVisible"
      title="代理商详情"
      width="1000px"
      :footer="null"
      class="custom-modal"
    >
      <div class="detail-section">
        <h3 class="section-title">基础信息</h3>
        <a-descriptions bordered :column="2" size="small">
          <a-descriptions-item label="代理商名称">{{ selectedAgent?.name }}</a-descriptions-item>
          <a-descriptions-item label="法定代表人">{{ selectedAgent?.legalPerson || '张法定' }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ selectedAgent?.phone }}</a-descriptions-item>
          <a-descriptions-item label="商务联系人">{{ selectedAgent?.businessContact || '王商务' }}</a-descriptions-item>
          <a-descriptions-item label="联系方式">{{ selectedAgent?.contactWay || '13812341234' }}</a-descriptions-item>
          <a-descriptions-item label="通讯地址">{{ selectedAgent?.address || '某某省某某市某某街道' }}</a-descriptions-item>
          <a-descriptions-item label="公司图标" :span="2">
            <div class="logo-preview-box">
              <img v-if="selectedAgent?.logo" :src="selectedAgent.logo" alt="logo" />
              <div v-else class="no-logo">暂无图标</div>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="detail-section" style="margin-top: 24px;">
        <h3 class="section-title">所属账号</h3>
        <a-table
          :columns="accountColumnsCentered"
          :data-source="detailAccounts"
          size="small"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'roleName'">
              <a-tag :color="getRoleColor(record.role)">{{ record.roleName }}</a-tag>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>

    <!-- Tree Node Modal -->
    <a-modal
      v-model:visible="treeNodeModalVisible"
      :title="treeNodeModalType === 'add' ? '新增代理商' : '编辑代理商'"
      @ok="handleTreeNodeModalOk"
      ok-text="确定"
      cancel-text="取消"
      width="800px"
      class="custom-modal"
    >
      <a-form layout="vertical" class="agent-form">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="父级代理商" v-if="treeNodeModalType === 'add'">
              <a-tree-select
                v-model:value="parentTreeNodeKey"
                style="width: 100%"
                :tree-data="treeDataWithCounts"
                placeholder="不选则作为一级节点"
                tree-default-expand-all
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="代理商名称" required>
              <a-input v-model:value="treeNodeForm.name" placeholder="请输入名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="法定代表人">
              <a-input v-model:value="treeNodeForm.legalPerson" placeholder="请输入法定代表人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系电话" required>
              <a-input v-model:value="treeNodeForm.phone" placeholder="请输入联系电话" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="通讯地址">
              <a-input v-model:value="treeNodeForm.address" placeholder="请输入通讯地址" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="公司图标">
              <div class="logo-upload">
                <div class="logo-preview">
                  <picture-outlined v-if="!treeNodeForm.logo" />
                  <img v-else :src="treeNodeForm.logo" alt="logo" />
                </div>
                <div class="upload-info">
                  <a-button size="small">选择图片</a-button>
                  <p class="hint">建议尺寸 200x200</p>
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商务联系人">
              <a-input v-model:value="treeNodeForm.businessContact" placeholder="请输入商务联系人" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="联系方式">
              <a-input v-model:value="treeNodeForm.contactWay" placeholder="请输入联系方式" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, PictureOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()
const searchForm = reactive({
  name: undefined,
  account: '',
  contact: '',
  phone: '',
  project: undefined
})

const resetSearch = () => {
  searchForm.name = undefined
  searchForm.account = ''
  searchForm.contact = ''
  searchForm.phone = ''
  searchForm.project = undefined
}

const handleJumpToProject = (record) => {
  router.push({
    path: '/project/detail',
    query: { id: record.id, name: record.recentProject }
  })
}

const treeData = ref([
  {
    title: '德菱控股',
    key: 'root-0',
    value: '德菱控股',
    children: [
      {
        title: '万众云联科技',
        key: '0-0',
        value: '万众云联科技',
        children: [
          { 
            title: '贵阳华旭电气', 
            key: '0-0-0', 
            value: '贵阳华旭电气',
            children: [
              { title: '黔南州运维中心', key: '0-0-0-0', value: '黔南州运维中心' },
              { title: '遵义分中心', key: '0-0-0-1', value: '遵义分中心' }
            ]
          },
          { 
            title: '徐州市民宗局监测系统', 
            key: '0-0-1',
            value: '徐州市民宗局监测系统',
            children: [
              { title: '泉山区监测点', key: '0-0-1-0', value: '泉山区监测点' },
              { title: '云龙区监测点', key: '0-0-1-1', value: '云龙区监测点' }
            ]
          },
        ],
      },
      {
        title: '华东大区代理',
        key: '0-1',
        value: '华东大区代理',
        children: [
          { 
            title: '上海众兴自动化', 
            key: '0-1-0', 
            value: '上海众兴自动化',
            children: [
              { title: '浦东办事处', key: '0-1-0-0', value: '浦东办事处' },
              { title: '嘉定联络处', key: '0-1-0-1', value: '嘉定联络处' }
            ]
          },
          { title: '苏州工业园分拨', key: '0-1-1', value: '苏州工业园分拨' }
        ]
      },
      {
        title: '南方电网合作伙伴',
        key: '0-2',
        value: '南方电网合作伙伴',
        children: [
          { 
            title: '深圳中兴通讯分销', 
            key: '0-2-0', 
            value: '深圳中兴通讯分销',
            children: [
              { title: '南山分销点', key: '0-2-0-0', value: '南山分销点' },
              { title: '宝安分销点', key: '0-2-0-1', value: '宝安分销点' }
            ]
          }
        ]
      }
    ],
  }
])

const handleDelete = (record) => {
  message.success(`已删除代理商：${record.name}`)
}

// Fusion Detail Logic
const detailModalVisible = ref(false)
const selectedAgent = ref(null)
const detailAccounts = computed(() => {
  if (!selectedAgent.value) return []
  return mockAccounts.value.filter(acc => acc.agentId === selectedAgent.value.id)
})

const openDetailModal = (record) => {
  selectedAgent.value = record
  detailModalVisible.value = true
}

// Simulation Accounts
const simulationAccounts = [
  { id: 1000, name: '厂家管理员', role: 'admin', roleName: '系统管理员', username: 'dl_admin', agentName: '德菱控股', agentLevel: '厂家' },
  { id: 1001, name: '万众云联主管', role: 'admin', roleName: '代理商管理员', username: 'wz_boss', agentName: '万众云联科技', agentLevel: '一级' },
  { id: 1005, name: '上海众兴主管', role: 'admin', roleName: '代理商管理员', username: 'shzx_boss', agentName: '上海众兴自动化', agentLevel: '二级' },
  { id: 1006, name: '南山分销主管', role: 'admin', roleName: '代理商管理员', username: 'ns_boss', agentName: '南山分销点', agentLevel: '三级' }
]

const currentUserId = ref(simulationAccounts[0].id)
const currentUser = computed(() => simulationAccounts.find(acc => acc.id === currentUserId.value) || simulationAccounts[0])

watch(currentUserId, () => {
  selectedTreeKeys.value = []
})

// Mock Accounts Data
const mockAccounts = ref([
  { id: 101, agentId: 1, name: '王管理员', role: 'admin', roleName: '代理商管理员', username: 'admin_wz', phone: '13800138000', email: 'wz@example.com', createTime: '2023-01-15 10:30:45' },
  { id: 102, agentId: 1, name: '张操作员', role: 'operator', roleName: '操作员', username: 'op_wz', phone: '13800138001', email: 'op_wz@example.com', createTime: '2023-02-15 11:30:45' },
  { id: 103, agentId: 2, name: '李工', role: 'admin', roleName: '代理商管理员', username: 'gyhx_01', phone: '13912345678', email: 'gyhx@example.com', createTime: '2023-03-20 15:20:12' },
  { id: 104, agentId: 3, name: '陈雪', role: 'admin', roleName: '代理商管理员', username: 'xz_mzj', phone: '15335131341', email: 'xz@example.com', createTime: '2023-05-10 09:15:30' },
  { id: 105, agentId: 4, name: '张总', role: 'admin', roleName: '代理商管理员', username: 'hd_proxy', phone: '13766554433', email: 'hd@example.com', createTime: '2023-06-01 14:00:00' },
  { id: 106, agentId: 6, name: '赵经理', role: 'admin', roleName: '代理商管理员', username: 'zte_sz', phone: '13688889999', email: 'zte@example.com', createTime: '2023-09-05 16:45:22' },
  { id: 107, agentId: 9, name: '众兴管理', role: 'admin', roleName: '代理商管理员', username: 'shzx_admin', phone: '13511223344', email: 'shzx@example.com', createTime: '2023-07-20 10:00:00' },
  { id: 108, agentId: 10, name: '南山负责人', role: 'admin', roleName: '代理商管理员', username: 'ns_admin', phone: '13699887766', email: 'ns@example.com', createTime: '2023-11-05 09:30:00' },
])

const treeDataWithCounts = computed(() => {
  const isManufacturer = currentUser.value.agentLevel === '厂家'
  const targetName = currentUser.value.agentName
  const processNode = (data, isPathOrUnder) => {
    const result = []
    for (const node of data) {
      const isTarget = node.value === targetName
      const hasTargetInDescendants = (n, t) => {
        if (n.value === t) return true
        if (n.children) return n.children.some(child => hasTargetInDescendants(child, t))
        return false
      }
      const onPath = hasTargetInDescendants(node, targetName)
      if (isManufacturer || isPathOrUnder || onPath) {
        const inScope = isManufacturer || isPathOrUnder || isTarget
        const newNode = { ...node, selectable: inScope, disabled: !inScope, inScope: inScope }
        if (node.children) {
          const processedChildren = processNode(node.children, inScope)
          if (processedChildren.length > 0) newNode.children = processedChildren
          else delete newNode.children
        }
        newNode.title = node.value // No numbers anymore
        result.push(newNode)
      }
    }
    return result
  }
  return processNode(treeData.value, false)
})

const findNodeTitle = (data, key) => {
  for (const node of data) {
    if (node.key === key) return node.value
    if (node.children) {
      const res = findNodeTitle(node.children, key)
      if (res) return res
    }
  }
  return null
}

const findKeyByName = (data, name) => {
  for (const node of data) {
    if (node.value === name) return node.key
    if (node.children) {
      const k = findKeyByName(node.children, name)
      if (k) return k
    }
  }
  return null
}

const canEditNode = (key) => true
const canDeleteNode = (key) => {
  const nodeTitle = findNodeTitle(treeData.value, key)
  const isManufacturer = currentUser.value.agentLevel === '厂家'
  return isManufacturer ? nodeTitle !== '德菱控股' : nodeTitle !== currentUser.value.agentName
}

// Tree maintenance logic
const treeNodeModalVisible = ref(false)
const treeNodeModalType = ref('add')
const parentTreeNodeKey = ref(undefined)
const currentTreeNodeKey = ref('')
const treeNodeForm = reactive({
  name: '', legalPerson: '', address: '', logo: '', businessContact: '', contactWay: '', phone: ''
})

const openAddTreeNodeModal = () => {
  treeNodeModalType.value = 'add'; Object.keys(treeNodeForm).forEach(k => treeNodeForm[k] = '')
  if (currentUser.value.agentLevel !== '厂家') parentTreeNodeKey.value = findKeyByName(treeData.value, currentUser.value.agentName)
  else parentTreeNodeKey.value = undefined
  treeNodeModalVisible.value = true
}

const openEditTreeNodeModal = (title, key) => {
  treeNodeModalType.value = 'edit'; currentTreeNodeKey.value = key
  const record = dataSource.value.find(a => a.name === title)
  if (record) Object.assign(treeNodeForm, { ...record })
  else { Object.keys(treeNodeForm).forEach(k => treeNodeForm[k] = ''); treeNodeForm.name = title }
  treeNodeModalVisible.value = true
}

const handleTreeNodeModalOk = () => {
  if (!treeNodeForm.name) { message.warning('请输入名称'); return }
  if (treeNodeModalType.value === 'add') {
    const newNode = { title: treeNodeForm.name, key: `node-${Date.now()}`, value: treeNodeForm.name }
    if (parentTreeNodeKey.value) {
      const addToParent = (data) => {
        for (let node of data) {
          if (node.key === parentTreeNodeKey.value) {
            if (!node.children) node.children = []
            node.children.push(newNode); return true
          }
          if (node.children && addToParent(node.children)) return true
        }
        return false
      }
      addToParent(treeData.value)
    } else treeData.value.push(newNode)
    message.success('新增节点成功')
  } else {
    const updateNode = (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === currentTreeNodeKey.value) {
          data[i].title = treeNodeForm.name; data[i].value = treeNodeForm.name; return true
        }
        if (data[i].children && updateNode(data[i].children)) return true
      }
      return false
    }
    updateNode(treeData.value); message.success('修改节点成功')
  }
  treeNodeModalVisible.value = false
}

const handleDeleteTreeNode = (key) => {
  const deleteNode = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].key === key) { data.splice(i, 1); return true }
      if (data[i].children && deleteNode(data[i].children)) return true
    }
    return false
  }
  deleteNode(treeData.value); message.success('删除成功')
}

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
  { title: '代理商名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '账号', dataIndex: 'account', key: 'account', align: 'center' },
  { title: '姓名', dataIndex: 'contact', key: 'contact', align: 'center' },
  { title: '电话', dataIndex: 'phone', key: 'phone', align: 'center' },
  { title: '项目总数', dataIndex: 'projectCount', key: 'projectCount', width: 80, align: 'center' },
  { title: '设备总数', dataIndex: 'deviceCount', key: 'deviceCount', width: 80, align: 'center' },
  { title: '最近项目', dataIndex: 'recentProject', key: 'recentProject', align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', align: 'center' },
  { title: '操作', key: 'action', fixed: 'right', width: 180, align: 'center' },
]

const dataSource = ref([
  { id: 1, name: '万众云联科技', level: '一级', parentName: '--', account: 'admin_wz', contact: '王经理', phone: '13800138000', projectCount: 12, deviceCount: 156, recentProject: '宝安人才公寓', createTime: '2023-01-15 10:30:45', businessContact: '王商务', contactWay: '13811112222', address: '深圳市宝安区某某大厦' },
  { id: 2, name: '贵阳华旭电气', level: '二级', parentName: '万众云联科技', account: 'gyhx_01', contact: '李工', phone: '13912345678', projectCount: 5, deviceCount: 42, recentProject: '贵阳中心大厦', createTime: '2023-03-20 15:20:12', businessContact: '李商务', contactWay: '13933334444', address: '贵阳市南明区某某中心' },
  { id: 3, name: '徐州市民宗局监测系统', level: '二级', parentName: '万众云联科技', account: 'xz_mzj', contact: '陈雪', phone: '15335131341', projectCount: 8, deviceCount: 89, recentProject: '泉山区监测点', createTime: '2023-05-10 09:15:30' },
  { id: 4, name: '华东大区代理', level: '一级', parentName: '--', account: 'hd_proxy', contact: '张总', phone: '13766554433', projectCount: 25, deviceCount: 450, recentProject: '华东智慧电力园', createTime: '2023-06-01 14:00:00' },
  { id: 5, name: '南方电网合作伙伴', level: '一级', parentName: '--', account: 'south_grid', contact: '刘主任', phone: '13500001111', projectCount: 40, deviceCount: 1200, recentProject: '高新科技孵化器', createTime: '2023-08-12 11:20:15' },
  { id: 6, name: '深圳中兴通讯分销', level: '二级', parentName: '南方电网合作伙伴', account: 'zte_sz', contact: '赵经理', phone: '13688889999', projectCount: 15, deviceCount: 320, recentProject: '中兴工业园', createTime: '2023-09-05 16:45:22' },
  { id: 7, name: '成都成电自动化', level: '三级', parentName: '深圳中兴通讯分销', account: 'cd_auto', contact: '曾工', phone: '13322223333', projectCount: 10, deviceCount: 180, recentProject: '成电科创中心', createTime: '2023-10-20 10:10:10' },
  { id: 8, name: '武汉烽火科技代理', level: '一级', parentName: '--', account: 'fh_wuhan', contact: '黄经理', phone: '13144445555', projectCount: 18, deviceCount: 260, recentProject: '烽火大厦', createTime: '2023-11-11 11:11:11' },
  { id: 9, name: '上海众兴自动化', level: '二级', parentName: '华东大区代理', account: 'shzx_admin', contact: '周经理', phone: '13511223344', projectCount: 22, deviceCount: 380, recentProject: '浦东办事处', createTime: '2023-07-20 10:00:00' },
  { id: 10, name: '南山分销点', level: '三级', parentName: '深圳中兴通讯分销', account: 'ns_admin', contact: '刘工', phone: '13699887766', projectCount: 6, deviceCount: 95, recentProject: '南山工业园', createTime: '2023-11-05 09:30:00' },
  { id: 11, name: '黔南州运维中心', level: '三级', parentName: '贵阳华旭电气', account: 'qn_ops', contact: '王工', phone: '13700001111', projectCount: 3, deviceCount: 28, recentProject: '黔南监测点', createTime: '2023-12-01 10:00:00' },
])

// Account Logic
const accountModalVisible = ref(false)
const accountModalType = ref('add')
const selectedAgentForAccounts = ref(null)
const accountFormState = reactive({
  id: null, agentTreeKey: undefined, name: '', role: undefined, username: '', password: '', phone: '', email: ''
})
const accountRoles = [
  { value: 'admin', label: '代理商管理员' }, { value: 'operator', label: '操作员' }, { value: 'viewer', label: '查看者' }
]
const accountColumnsCentered = [
  { title: '姓名', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '用户名', dataIndex: 'username', key: 'username', align: 'center' },
  { title: '角色', dataIndex: 'roleName', key: 'roleName', align: 'center' },
  { title: '电话', dataIndex: 'phone', key: 'phone', align: 'center' }
]

const getRoleColor = (role) => ({ admin: 'blue', operator: 'orange', viewer: 'green' }[role] || 'default')

const openAddAccountModal = () => {
  accountModalType.value = 'add'; accountFormState.id = null
  Object.keys(accountFormState).forEach(k => { if(k !== 'id') accountFormState[k] = '' })
  accountModalVisible.value = true
}

const openEditAgentAccountModal = (record) => {
  accountModalType.value = 'edit'
  // Find the account associated with this agent to edit it
  const acc = mockAccounts.value.find(a => a.agentId === record.id)
  if (acc) {
    accountFormState.id = acc.id
    Object.assign(accountFormState, { ...acc, password: '' }) // Hide password for security during edit
    accountFormState.agentTreeKey = findKeyByName(treeData.value, record.name)
  } else {
    // If no account exists yet, act as add for this agent
    accountModalType.value = 'add'
    Object.keys(accountFormState).forEach(k => accountFormState[k] = '')
    accountFormState.agentTreeKey = findKeyByName(treeData.value, record.name)
  }
  accountModalVisible.value = true
}

const handleAccountModalOk = () => {
  if (!accountFormState.agentTreeKey || !accountFormState.name || !accountFormState.role || !accountFormState.username || !accountFormState.phone || (accountModalType.value==='add' && !accountFormState.password)) {
    message.error('请填写必填项'); return
  }
  const agentTitle = findNodeTitle(treeData.value, accountFormState.agentTreeKey)
  const agentRecord = dataSource.value.find(a => a.name === agentTitle)
  const roleObj = accountRoles.find(r => r.value === accountFormState.role)
  if (accountModalType.value === 'add') {
    mockAccounts.value.push({ id: Date.now(), agentId: agentRecord?.id || 0, name: accountFormState.name, role: accountFormState.role, roleName: roleObj?.label, username: accountFormState.username, phone: accountFormState.phone, email: accountFormState.email, createTime: new Date().toLocaleString() })
    message.success('保存成功')
  } else {
    const idx = mockAccounts.value.findIndex(a => a.id === accountFormState.id)
    if (idx !== -1) Object.assign(mockAccounts.value[idx], { name: accountFormState.name, role: accountFormState.role, roleName: roleObj?.label, phone: accountFormState.phone, email: accountFormState.email, agentId: agentRecord?.id || 0 })
    message.success('更新成功')
  }
  accountModalVisible.value = false
}

const pagination = reactive({ current: 1, pageSize: 10, total: 100, showTotal: (t) => `共 ${t} 条`, showSizeChanger: true })
const selectedTreeKeys = ref([])
const onTreeSelect = (keys) => { selectedTreeKeys.value = keys }

const filteredDataSource = computed(() => {
  const currentAgentName = currentUser.value.agentName
  const isManufacturer = currentUser.value.agentLevel === '厂家'
  const getDescendantNames = (target) => {
    const names = []
    const findAndCollect = (data, t, found) => {
      for (const node of data) {
        const isT = node.value === t
        if (found || isT) { names.push(node.value); if (node.children) findAndCollect(node.children, t, true) }
        else if (node.children) findAndCollect(node.children, t, false)
      }
    }
    findAndCollect(treeData.value, target, false); return names
  }
  const permissionNames = isManufacturer ? dataSource.value.map(a => a.name) : getDescendantNames(currentAgentName)
  let resultNames = permissionNames
  if (searchForm.name) {
    const searchTarget = findNodeTitle(treeData.value, searchForm.name)
    const searchDescendants = getDescendantNames(searchTarget)
    resultNames = resultNames.filter(n => searchDescendants.includes(n))
  }
  if (selectedTreeKeys.value.length > 0) {
    const selectedTitle = findNodeTitle(treeData.value, selectedTreeKeys.value[0])
    const treeDescendants = getDescendantNames(selectedTitle)
    resultNames = resultNames.filter(n => treeDescendants.includes(n))
  }
  return dataSource.value.filter(item => {
    const matchName = resultNames.includes(item.name)
    const matchAccount = !searchForm.account || item.account.includes(searchForm.account)
    const matchContact = !searchForm.contact || item.contact.includes(searchForm.contact)
    const matchPhone = !searchForm.phone || item.phone.includes(searchForm.phone)
    return matchName && matchAccount && matchContact && matchPhone
  })
})

const allowedCreateLevels = computed(() => {
  const level = currentUser.value.agentLevel
  return level === '厂家' ? ['一级'] : (level === '一级' ? ['一级', '二级', '三级'] : (level === '二级' ? ['二级', '三级'] : ['三级']))
})
</script>

<style scoped>
.agent-management { height: 100%; font-size: 13px; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.tree-container { background: #fff; border-radius: 4px; border: 1px solid #e6ebf1; height: calc(100vh - 250px); overflow-y: auto; }
.tree-header { padding: 12px; border-bottom: 1px solid #e6ebf1; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 14px; }
.add-icon { color: #1890ff; cursor: pointer; transition: all 0.3s; }
.custom-tree { padding: 8px; }
.tree-node-wrapper { display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: 8px; }
.out-of-scope { color: #bfbfbf; }
:deep(.ant-select-tree-node-disabled) { color: #bfbfbf !important; cursor: not-allowed !important; }
.tree-node-actions { display: none; gap: 8px; color: #1890ff; font-size: 12px; }
.tree-node-wrapper:hover .tree-node-actions { display: flex; }
.search-form-container { background: #fff; padding: 16px; border-radius: 4px; margin-bottom: 12px; border: 1px solid #e6ebf1; }
.search-form { margin-bottom: 12px; display: flex; flex-wrap: nowrap; align-items: center; }
.search-input { width: 120px; }
.search-select { width: 150px; }
.search-form :deep(.ant-form-item) { margin-right: 8px; margin-bottom: 0; }
.search-actions { margin-left: auto !important; margin-right: 0 !important; }
:deep(.ant-input), :deep(.ant-select-selector), :deep(.ant-picker) { height: 32px !important; font-size: 13px !important; }
.add-btn { background-color: #1890ff; border-radius: 4px; font-size: 13px; border-color: #1890ff; }
.table-container { background: #fff; padding: 16px; border-radius: 4px; border: 1px solid #e6ebf1; }
.project-link { color: #1890ff; cursor: pointer; }
.action-link { font-size: 13px; cursor: pointer; }
.action-link.delete { color: #ff4d4f; }
.simulation-role { display: flex; align-items: center; margin-left: 16px; padding-left: 16px; border-left: 1px solid #eee; }
.logo-upload { display: flex; gap: 15px; align-items: center; }
.logo-preview { width: 80px; height: 80px; background: #f5f5f5; border: 1px solid #d9d9d9; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #bfbfbf; }
.logo-preview img { width: 100%; height: 100%; object-fit: cover; }
.logo-preview-box { width: 120px; height: 60px; background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
.no-logo { color: #ccc; font-size: 12px; }
.detail-section .section-title { font-size: 15px; font-weight: bold; border-left: 4px solid #1890ff; padding-left: 8px; margin-bottom: 12px; }
</style>
