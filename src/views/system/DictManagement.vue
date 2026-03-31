<template>
  <div class="dict-management-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="queryParams" class="search-form">
        <a-form-item label="字典名称">
          <a-input v-model:value="queryParams.dictName" placeholder="字典名称" allow-clear />
        </a-form-item>
        <a-form-item label="字典类型">
          <a-input v-model:value="queryParams.dictType" placeholder="字典类型" allow-clear />
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
              <template #icon><plus-outlined /></template>新增字典
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="typeList"
        :pagination="pagination"
        row-key="dictId"
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
              <a class="action-link detail" @click="handleRefreshCache">刷新缓存</a>
              <a-popconfirm title="确定删除该字典类型吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加或修改字典对话框 -->
    <a-modal v-model:visible="open" :title="title" width="500px" @ok="submitForm" destroy-on-close>
      <div class="detail-content">
        <a-form :model="form" layout="vertical" class="pretty-form">
          <div class="detail-section">
            <div class="section-title">核心配置</div>
            <a-form-item label="字典名称" required>
              <a-input v-model:value="form.dictName" placeholder="请输入名称" />
            </a-form-item>
            <a-form-item label="字典类型" required>
              <a-input v-model:value="form.dictType" placeholder="请输入类型" />
            </a-form-item>
            <a-form-item label="字典状态">
              <a-radio-group v-model:value="form.status">
                <a-radio value="0">正常</a-radio>
                <a-radio value="1">停用</a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div class="detail-section">
            <div class="section-title">补充说明</div>
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
import { message } from 'ant-design-vue'

const open = ref(false)
const title = ref('')

const queryParams = reactive({
  dictName: '',
  dictType: '',
  status: undefined
})

const typeList = ref([
  { dictId: 1, dictName: '用户性别', dictType: 'sys_user_sex', status: '0', createTime: '2026-03-13 10:00:00', remark: '用户性别列表' },
  { dictId: 2, dictName: '菜单状态', dictType: 'sys_show_hide', status: '0', createTime: '2026-03-13 10:00:00', remark: '菜单状态列表' }
])

const columns = [
  { title: '编号', dataIndex: 'dictId', key: 'dictId', width: 80, align: 'center' },
  { title: '字典名称', dataIndex: 'dictName', key: 'dictName' },
  { title: '字典类型', dataIndex: 'dictType', key: 'dictType' },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 200, align: 'center' }
]

const form = reactive({
  dictId: undefined, dictName: '', dictType: '', status: '0', remark: ''
})

const pagination = reactive({
  total: 2, current: 1, pageSize: 10, showTotal: t => `共 ${t} 条记录`
})

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { dictName: '', dictType: '', status: undefined })

const handleAdd = () => {
  title.value = '新增字典类型'
  Object.assign(form, { dictId: undefined, dictName: '', dictType: '', status: '0', remark: '' })
  open.value = true
}

const handleUpdate = (row) => {
  title.value = '修改字典类型'
  Object.assign(form, row)
  open.value = true
}

const submitForm = () => {
  message.success('保存成功')
  open.value = false
}

const handleDelete = (row) => {
  message.success(`已删除字典: ${row.dictName}`)
}

const handleRefreshCache = () => message.success('缓存已刷新')
</script>

<style scoped>
.dict-management-container { height: 100%; }
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
