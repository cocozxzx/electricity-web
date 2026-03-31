<template>
  <div class="user-management-container fade-in">
    <a-row :gutter="16">
      <!-- 部门树 -->
      <a-col :span="5">
        <div class="table-container tree-card custom-scrollbar">
          <div class="section-title">组织架构</div>
          <a-input-search v-model:value="deptName" placeholder="搜索部门" style="margin-bottom: 16px" @search="handleDeptSearch" />
          <a-tree
            :tree-data="deptOptions"
            :field-names="{ title: 'label', key: 'id' }"
            default-expand-all
            @select="handleNodeClick"
            class="custom-tree"
          />
        </div>
      </a-col>
      <!-- 用户数据 -->
      <a-col :span="19">
        <div class="search-form-container">
          <a-form layout="inline" :model="queryParams" class="search-form">
            <a-form-item label="用户名称">
              <a-input v-model:value="queryParams.userName" placeholder="用户名称" allow-clear />
            </a-form-item>
            <a-form-item label="手机号码">
              <a-input v-model:value="queryParams.phonenumber" placeholder="手机号码" allow-clear />
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
                  <template #icon><plus-outlined /></template>新增用户
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>

        <div class="table-container">
          <a-table
            :columns="columns"
            :data-source="userList"
            :pagination="pagination"
            row-key="userId"
            size="middle"
            class="ruoyi-table custom-scrollbar"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-badge :status="record.status === '0' ? 'success' : 'error'" :text="record.status === '0' ? '正常' : '停用'" />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a class="action-link detail" @click="handleUpdate(record)">编辑</a>
                  <a-dropdown>
                    <a class="action-link detail">更多 <down-outlined /></a>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="handleResetPwd(record)">重置密码</a-menu-item>
                        <a-menu-item @click="handleAuthRole(record)">分配角色</a-menu-item>
                        <a-menu-item danger @click="handleDelete(record)">删除用户</a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>

    <!-- 添加或修改用户配置对话框 -->
    <a-modal v-model:visible="open" :title="title" width="700px" @ok="submitForm" ok-text="确 定" cancel-text="取 消" destroy-on-close>
      <div class="detail-content">
        <a-form :model="form" layout="vertical" class="pretty-form">
          <div class="detail-section">
            <div class="section-title">基础信息</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="用户名称" required>
                  <a-input v-model:value="form.userName" placeholder="请输入用户名称" :disabled="!!form.userId" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="用户昵称" required>
                  <a-input v-model:value="form.nickName" placeholder="请输入用户昵称" />
                </a-form-item>
              </a-col>
              <a-col :span="12" v-if="!form.userId">
                <a-form-item label="初始密码" required>
                  <a-input-password v-model:value="form.password" placeholder="请输入密码" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="归属部门">
                  <a-tree-select
                    v-model:value="form.deptId"
                    :tree-data="deptOptions"
                    placeholder="请选择部门"
                    allow-clear
                    tree-default-expand-all
                    style="width: 100%"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <div class="detail-section">
            <div class="section-title">联系方式</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="手机号码">
                  <a-input v-model:value="form.phonenumber" placeholder="请输入手机号码" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="电子邮箱">
                  <a-input v-model:value="form.email" placeholder="请输入邮箱" />
                </a-form-item>
              </a-col>
            </a-row>
          </div>

          <div class="detail-section">
            <div class="section-title">其他设置</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="用户性别">
                  <a-radio-group v-model:value="form.sex">
                    <a-radio value="0">男</a-radio>
                    <a-radio value="1">女</a-radio>
                    <a-radio value="2">未知</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="帐号状态">
                  <a-switch 
                    :checked="form.status === '0'" 
                    checked-children="正常" 
                    un-checked-children="停用"
                    @change="val => form.status = val ? '0' : '1'" 
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { PlusOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

const deptName = ref('')
const open = ref(false)
const title = ref('')
const selectedRowKeys = ref([])

const queryParams = reactive({
  userName: '',
  phonenumber: '',
  status: undefined,
  deptId: undefined
})

const deptOptions = ref([
  { id: 100, label: 'XXX科技', children: [
    { id: 101, label: '深圳总公司', children: [
      { id: 103, label: '研发部门' },
      { id: 104, label: '市场部门' }
    ]},
    { id: 102, label: '长沙分公司', children: [
      { id: 105, label: '测试部门' },
      { id: 106, label: '财务部门' }
    ]}
  ]}
])

const userList = ref([
  { userId: 1, userName: 'admin', nickName: '管理员', deptName: '研发部门', phonenumber: '15888888888', status: '0', createTime: '2026-03-13 14:00:00' },
  { userId: 2, userName: 'ry', nickName: '若依', deptName: '测试部门', phonenumber: '15666666666', status: '0', createTime: '2026-03-13 14:00:00' }
])

const columns = [
  { title: '编号', dataIndex: 'userId', key: 'userId', width: 80, align: 'center' },
  { title: '用户名称', dataIndex: 'userName', key: 'userName' },
  { title: '用户昵称', dataIndex: 'nickName', key: 'nickName' },
  { title: '归属部门', dataIndex: 'deptName', key: 'deptName' },
  { title: '手机号码', dataIndex: 'phonenumber', key: 'phonenumber' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 150, align: 'center' }
]

const form = reactive({
  userId: undefined,
  deptId: undefined,
  userName: '',
  nickName: '',
  password: '',
  phonenumber: '',
  email: '',
  sex: '0',
  status: '0'
})

const pagination = reactive({
  total: 2, current: 1, pageSize: 10, showTotal: t => `共 ${t} 条记录`
})

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { userName: '', phonenumber: '', status: undefined })

const handleAdd = () => {
  title.value = '新增用户'
  Object.assign(form, { userId: undefined, userName: '', nickName: '', password: '', status: '0', sex: '0' })
  open.value = true
}

const handleUpdate = (row) => {
  title.value = '修改用户'
  Object.assign(form, row)
  open.value = true
}

const submitForm = () => {
  message.success('保存成功')
  open.value = false
}

const handleDelete = (row) => {
  Modal.confirm({
    title: '系统提示',
    content: `是否确认删除用户 "${row.userName}"？`,
    onOk() { message.success('删除成功') }
  })
}

const handleResetPwd = (row) => {
  Modal.info({ title: '重置密码', content: `确定要重置用户 "${row.userName}" 的密码吗？` })
}

const handleAuthRole = () => message.info('正在跳转角色分配...')
const handleDeptSearch = () => {}
const handleNodeClick = (keys) => { queryParams.deptId = keys[0] }
</script>

<style scoped>
.user-management-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.search-form-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }
.tree-card { height: calc(100vh - 120px); overflow-y: auto; }

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
