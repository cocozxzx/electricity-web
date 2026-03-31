<template>
  <div class="role-management-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="queryParams" class="search-form">
        <a-form-item label="角色名称">
          <a-input v-model:value="queryParams.roleName" placeholder="角色名称" allow-clear />
        </a-form-item>
        <a-form-item label="权限字符">
          <a-input v-model:value="queryParams.roleKey" placeholder="权限字符" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="全部" style="width: 120px" allow-clear>
            <a-select-option value="0">正常</a-select-option>
            <a-select-option value="1">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn" @click="handleQuery">查询</a-button>
            <a-button class="action-btn" @click="resetQuery">重置</a-button>
            <a-button type="primary" class="add-btn" @click="handleAdd">
              <template #icon><plus-outlined /></template>新增角色
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="roleList"
        :pagination="pagination"
        row-key="roleId"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-switch :checked="record.status === '0'" @change="handleStatusChange(record)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="handleUpdate(record)">编辑</a>
              <a class="action-link detail" @click="handleDataScope(record)">数据权限</a>
              <a-popconfirm title="确定删除该角色吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加或修改角色配置对话框 -->
    <a-modal v-model:visible="open" :title="title" width="600px" @ok="submitForm" destroy-on-close>
      <div class="detail-content">
        <a-form :model="form" layout="vertical" class="pretty-form">
          <div class="detail-section">
            <div class="section-title">基础配置</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="角色名称" required>
                  <a-input v-model:value="form.roleName" placeholder="请输入角色名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="权限字符" required>
                  <a-input v-model:value="form.roleKey" placeholder="请输入权限字符" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="显示顺序" required>
                  <a-input-number v-model:value="form.roleSort" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="角色状态">
                  <a-radio-group v-model:value="form.status">
                    <a-radio value="0">正常</a-radio>
                    <a-radio value="1">停用</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <div class="detail-section">
            <div class="section-title">菜单权限</div>
            <div style="border: 1px solid #f0f0f0; border-radius: 4px; padding: 12px; max-height: 250px; overflow-y: auto;">
              <a-tree
                v-model:checkedKeys="menuCheckKeys"
                checkable
                :tree-data="menuOptions"
                :field-names="{ title: 'label', key: 'id' }"
                default-expand-all
              />
            </div>
          </div>

          <div class="detail-section">
            <div class="section-title">备注说明</div>
            <a-textarea v-model:value="form.remark" placeholder="请输入内容" :rows="3" />
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

const open = ref(false)
const title = ref('')
const menuCheckKeys = ref([])

const queryParams = reactive({
  roleName: '',
  roleKey: '',
  status: undefined
})

const roleList = ref([
  { roleId: 1, roleName: '超级管理员', roleKey: 'admin', roleSort: 1, status: '0', createTime: '2026-03-13 14:00:00' },
  { roleId: 2, roleName: '普通角色', roleKey: 'common', roleSort: 2, status: '0', createTime: '2026-03-13 14:00:00' }
])

const menuOptions = ref([
  { id: 1, label: '系统管理', children: [
    { id: 2, label: '用户管理' },
    { id: 3, label: '角色管理' },
    { id: 4, label: '菜单管理' }
  ]},
  { id: 5, label: '资产中心', children: [
    { id: 6, label: '设备管理' }
  ]}
])

const columns = [
  { title: '编号', dataIndex: 'roleId', key: 'roleId', width: 80, align: 'center' },
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '权限字符', dataIndex: 'roleKey', key: 'roleKey' },
  { title: '显示顺序', dataIndex: 'roleSort', key: 'roleSort', width: 100, align: 'center' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 220, align: 'center' }
]

const form = reactive({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  remark: ''
})

const pagination = reactive({
  total: 2, current: 1, pageSize: 10, showTotal: t => `共 ${t} 条记录`
})

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { roleName: '', roleKey: '', status: undefined })

const handleAdd = () => {
  title.value = '新增角色'
  Object.assign(form, { roleId: undefined, roleName: '', roleKey: '', roleSort: 0, status: '0', remark: '' })
  menuCheckKeys.value = []
  open.value = true
}

const handleUpdate = (row) => {
  title.value = '修改角色'
  Object.assign(form, row)
  menuCheckKeys.value = [2, 3]
  open.value = true
}

const submitForm = () => {
  message.success('保存成功')
  open.value = false
}

const handleDelete = (row) => {
  message.success(`已删除角色: ${row.roleName}`)
}

const handleStatusChange = (row) => {
  row.status = row.status === '0' ? '1' : '0'
  message.success('更新成功')
}

const handleDataScope = () => message.info('正在打开数据权限配置...')
</script>

<style scoped>
.role-management-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.search-form-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }

.action-btn { border-radius: 4px; font-size: 13px; }
.add-btn { background: #1890ff; border-radius: 4px; }

.action-link { font-size: 13px; transition: all 0.2s; cursor: pointer; }
.action-link.detail { color: #1890ff; }
.action-link.delete { color: #ff4d4f; }

.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; padding-left: 8px; border-left: 4px solid #1890ff; line-height: 1; }

.detail-content { max-height: 600px; overflow-y: auto; padding-right: 10px; }
.detail-section { margin-bottom: 24px; }
.pretty-form :deep(.ant-form-item-label > label) { font-weight: bold; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 3px; }
</style>
