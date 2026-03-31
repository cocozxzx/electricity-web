<template>
  <div class="dept-management-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="queryParams" class="search-form">
        <a-form-item label="部门名称">
          <a-input v-model:value="queryParams.deptName" placeholder="部门名称" allow-clear />
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
              <template #icon><plus-outlined /></template>新增部门
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="deptList"
        :pagination="false"
        row-key="deptId"
        size="middle"
        class="ruoyi-table custom-scrollbar"
        :expanded-row-keys="expandedRowKeys"
        @expandedRowsChange="keys => expandedRowKeys = keys"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === '0' ? 'success' : 'error'" :text="record.status === '0' ? '正常' : '停用'" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="handleUpdate(record)">编辑</a>
              <a class="action-link detail" @click="handleAdd(record)">新增下级</a>
              <a-popconfirm title="确定删除该部门吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加或修改部门对话框 -->
    <a-modal v-model:visible="open" :title="title" width="600px" @ok="submitForm" destroy-on-close>
      <div class="detail-content">
        <a-form :model="form" layout="vertical" class="pretty-form">
          <div class="detail-section">
            <div class="section-title">上级结构</div>
            <a-form-item label="上级部门">
              <a-tree-select
                v-model:value="form.parentId"
                :tree-data="deptOptions"
                placeholder="选择上级部门"
                allow-clear
                tree-default-expand-all
                style="width: 100%"
              />
            </a-form-item>
          </div>

          <div class="detail-section">
            <div class="section-title">基础信息</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="部门名称" required>
                  <a-input v-model:value="form.deptName" placeholder="请输入名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="显示排序" required>
                  <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="负责人">
                  <a-input v-model:value="form.leader" placeholder="请输入负责人" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="联系电话">
                  <a-input v-model:value="form.phone" placeholder="请输入电话" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="电子邮箱">
                  <a-input v-model:value="form.email" placeholder="请输入邮箱" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="部门状态">
                  <a-radio-group v-model:value="form.status">
                    <a-radio value="0">正常</a-radio>
                    <a-radio value="1">停用</a-radio>
                  </a-radio-group>
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
import { PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const open = ref(false)
const title = ref('')
const expandedRowKeys = ref([100])

const queryParams = reactive({
  deptName: '',
  status: undefined
})

const deptList = ref([
  {
    deptId: 100, deptName: 'XXX科技', orderNum: 0, status: '0', createTime: '2026-03-13',
    children: [
      { deptId: 101, deptName: '深圳总公司', orderNum: 1, status: '0', createTime: '2026-03-13' },
      { deptId: 102, deptName: '长沙分公司', orderNum: 2, status: '0', createTime: '2026-03-13' }
    ]
  }
])

const columns = [
  { title: '部门名称', dataIndex: 'deptName', key: 'deptName' },
  { title: '排序', dataIndex: 'orderNum', key: 'orderNum', width: 100, align: 'center' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 200, align: 'center' },
  { title: '操作', key: 'action', width: 200, align: 'center' }
]

const form = reactive({
  deptId: undefined, parentId: 100, deptName: '', orderNum: 0, leader: '', phone: '', email: '', status: '0'
})

const deptOptions = ref([{ id: 100, label: 'XXX科技', children: [] }])

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { deptName: '', status: undefined })

const handleAdd = (row) => {
  title.value = '新增部门'
  Object.assign(form, { deptId: undefined, parentId: row?.deptId || 100, status: '0' })
  open.value = true
}

const handleUpdate = (row) => {
  title.value = '修改部门'
  Object.assign(form, row)
  open.value = true
}

const submitForm = () => {
  message.success('保存成功')
  open.value = false
}

const handleDelete = (row) => {
  message.success(`已删除部门: ${row.deptName}`)
}
</script>

<style scoped>
.dept-management-container { height: 100%; }
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
