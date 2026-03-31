<template>
  <div class="menu-management-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="queryParams" class="search-form">
        <a-form-item label="菜单名称">
          <a-input v-model:value="queryParams.menuName" placeholder="菜单名称" allow-clear />
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
              <template #icon><plus-outlined /></template>新增菜单
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="menuList"
        :pagination="false"
        row-key="menuId"
        size="middle"
        class="ruoyi-table custom-scrollbar"
        :expanded-row-keys="expandedRowKeys"
        @expandedRowsChange="keys => expandedRowKeys = keys"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <component :is="record.icon" v-if="record.icon" style="font-size: 16px" />
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="record.status === '0' ? 'processing' : 'default'" :text="record.status === '0' ? '正常' : '停用'" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a class="action-link detail" @click="handleUpdate(record)">编辑</a>
              <a class="action-link detail" @click="handleAdd(record)">新增下级</a>
              <a-popconfirm title="确定删除该菜单吗？" @confirm="handleDelete(record)">
                <a class="action-link delete">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 添加或修改菜单对话框 -->
    <a-modal v-model:visible="open" :title="title" width="750px" @ok="submitForm" destroy-on-close>
      <div class="detail-content">
        <a-form :model="form" layout="vertical" class="pretty-form">
          <div class="detail-section">
            <div class="section-title">层级关联</div>
            <a-form-item label="上级菜单">
              <a-tree-select
                v-model:value="form.parentId"
                :tree-data="menuOptions"
                placeholder="选择上级菜单"
                allow-clear
                tree-default-expand-all
                style="width: 100%"
              />
            </a-form-item>
            <a-form-item label="菜单类型">
              <a-radio-group v-model:value="form.menuType" button-style="solid">
                <a-radio-button value="M">目录</a-radio-button>
                <a-radio-button value="C">菜单</a-radio-button>
                <a-radio-button value="F">按钮</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </div>

          <div class="detail-section">
            <div class="section-title">基础信息</div>
            <a-row :gutter="24">
              <a-col :span="12">
                <a-form-item label="菜单名称" required>
                  <a-input v-model:value="form.menuName" placeholder="请输入名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="显示排序" required>
                  <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12" v-if="form.menuType !== 'F'">
                <a-form-item label="路由地址">
                  <a-input v-model:value="form.path" placeholder="请输入路由" />
                </a-form-item>
              </a-col>
              <a-col :span="12" v-if="form.menuType === 'C'">
                <a-form-item label="组件路径">
                  <a-input v-model:value="form.component" placeholder="请输入路径" />
                </a-form-item>
              </a-col>
              <a-col :span="12" v-if="form.menuType !== 'M'">
                <a-form-item label="权限标识">
                  <a-input v-model:value="form.perms" placeholder="请输入标识" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="显示状态">
                  <a-radio-group v-model:value="form.visible">
                    <a-radio value="0">显示</a-radio>
                    <a-radio value="1">隐藏</a-radio>
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
import { PlusOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const open = ref(false)
const title = ref('')
const expandedRowKeys = ref([1])

const queryParams = reactive({
  menuName: '',
  status: undefined
})

const menuList = ref([
  {
    menuId: 1, menuName: '系统管理', icon: 'SettingOutlined', orderNum: 1, path: 'system', component: '', status: '0', createTime: '2026-03-13',
    children: [
      { menuId: 2, menuName: '用户管理', icon: 'UserOutlined', orderNum: 1, path: 'user', component: 'system/user/index', status: '0', createTime: '2026-03-13' },
      { menuId: 3, menuName: '角色管理', icon: 'UserOutlined', orderNum: 2, path: 'role', component: 'system/role/index', status: '0', createTime: '2026-03-13' }
    ]
  }
])

const columns = [
  { title: '菜单名称', dataIndex: 'menuName', key: 'menuName', width: 220 },
  { title: '图标', key: 'icon', width: 80, align: 'center' },
  { title: '排序', dataIndex: 'orderNum', key: 'orderNum', width: 80, align: 'center' },
  { title: '权限标识', dataIndex: 'perms', key: 'perms' },
  { title: '组件路径', dataIndex: 'component', key: 'component', ellipsis: true },
  { title: '状态', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 150, align: 'center' },
  { title: '操作', key: 'action', width: 200, align: 'center' }
]

const form = reactive({
  menuId: undefined, parentId: 0, menuType: 'M', menuName: '', orderNum: 0, path: '', component: '', perms: '', visible: '0', status: '0'
})

const menuOptions = ref([{ id: 0, label: '主类目', children: [] }])

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { menuName: '', status: undefined })

const handleAdd = (row) => {
  title.value = '新增菜单'
  Object.assign(form, { menuId: undefined, parentId: row?.menuId || 0, menuType: 'M', status: '0', visible: '0' })
  open.value = true
}

const handleUpdate = (row) => {
  title.value = '修改菜单'
  Object.assign(form, row)
  open.value = true
}

const submitForm = () => {
  message.success('保存成功')
  open.value = false
}

const handleDelete = (row) => {
  message.success(`已删除菜单: ${row.menuName}`)
}
</script>

<style scoped>
.menu-management-container { height: 100%; }
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
