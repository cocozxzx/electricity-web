<template>
  <div class="log-management-container fade-in">
    <div class="search-form-container">
      <a-form layout="inline" :model="queryParams" class="search-form">
        <a-form-item label="系统模块">
          <a-input v-model:value="queryParams.title" placeholder="请输入模块" allow-clear />
        </a-form-item>
        <a-form-item label="操作人员">
          <a-input v-model:value="queryParams.operName" placeholder="请输入人员" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="全部" style="width: 120px" allow-clear>
            <a-select-option value="0">成功</a-select-option>
            <a-select-option value="1">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" class="action-btn" @click="handleQuery">查询</a-button>
            <a-button class="action-btn" @click="resetQuery">重置</a-button>
            <a-button type="danger" ghost class="action-btn" @click="handleClean">
              <template #icon><delete-outlined /></template>清空日志
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="table-container">
      <a-table
        :columns="columns"
        :data-source="list"
        :pagination="pagination"
        row-key="operId"
        size="middle"
        class="ruoyi-table custom-scrollbar"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge :status="record.status === '0' ? 'success' : 'error'" :text="record.status === '0' ? '成功' : '失败'" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a class="action-link detail" @click="handleDetail(record)">查看详情</a>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 操作日志详细 -->
    <a-modal v-model:visible="open" title="操作日志详细" width="800px" :footer="null" destroy-on-close>
      <div class="detail-content">
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <a-descriptions bordered :column="2" size="small">
            <a-descriptions-item label="操作模块">{{ form.title }} / {{ form.businessType }}</a-descriptions-item>
            <a-descriptions-item label="操作人员">{{ form.operName }} ({{ form.operIp }})</a-descriptions-item>
            <a-descriptions-item label="操作地点">{{ form.operLocation }}</a-descriptions-item>
            <a-descriptions-item label="请求方式">{{ form.requestMethod }}</a-descriptions-item>
            <a-descriptions-item label="请求地址" :span="2">{{ form.operUrl }}</a-descriptions-item>
            <a-descriptions-item label="执行状态">
              <a-tag :color="form.status === '0' ? 'green' : 'red'">{{ form.status === '0' ? '成功' : '失败' }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="执行时长">{{ form.costTime }} 毫秒</a-descriptions-item>
          </a-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">请求详情</div>
          <div style="background: #f8f9fb; padding: 12px; border-radius: 4px; border: 1px solid #e6ebf1; font-family: monospace; font-size: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px;">请求方法：</div>
            <div style="margin-bottom: 12px; color: #666;">{{ form.method }}</div>
            <div style="font-weight: bold; margin-bottom: 4px;">请求参数：</div>
            <div style="margin-bottom: 12px; color: #1890ff;">{{ form.operParam }}</div>
            <div style="font-weight: bold; margin-bottom: 4px;">返回结果：</div>
            <div style="color: #52c41a;">{{ form.jsonResult }}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer-btn" style="text-align: right; margin-top: 20px;">
        <a-button @click="open = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'

const list = ref([
  { operId: 1, title: '用户管理', businessType: '修改', operName: 'admin', operIp: '127.0.0.1', operLocation: '内网IP', status: '0', operTime: '2026-03-13 14:00:00', costTime: 50 },
  { operId: 2, title: '菜单管理', businessType: '新增', operName: 'admin', operIp: '127.0.0.1', operLocation: '内网IP', status: '0', operTime: '2026-03-13 14:05:00', costTime: 30 }
])

const columns = [
  { title: '编号', dataIndex: 'operId', key: 'operId', width: 80, align: 'center' },
  { title: '系统模块', dataIndex: 'title', key: 'title' },
  { title: '操作类型', dataIndex: 'businessType', key: 'businessType', align: 'center' },
  { title: '操作人员', dataIndex: 'operName', key: 'operName' },
  { title: '主机地址', dataIndex: 'operIp', key: 'operIp' },
  { title: '操作状态', key: 'status', align: 'center' },
  { title: '操作时间', dataIndex: 'operTime', key: 'operTime', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 100, align: 'center' }
]

const queryParams = reactive({ title: '', operName: '', status: undefined })
const open = ref(false)
const form = ref({})

const pagination = reactive({ total: 2, current: 1, pageSize: 10, showTotal: t => `共 ${t} 条记录` })

const handleQuery = () => message.success('查询成功')
const resetQuery = () => Object.assign(queryParams, { title: '', operName: '', status: undefined })

const handleDetail = (row) => {
  form.value = { ...row, operUrl: '/system/user', method: 'com.ruoyi.web.controller.system.SysUserController.edit()', requestMethod: 'PUT', operParam: '{"userId":1,"userName":"admin"}', jsonResult: '{"code":200,"msg":"操作成功"}' }
  open.value = true
}

const handleClean = () => Modal.confirm({ title: '确认清空所有日志？', onOk: () => message.success('清空成功') })
</script>

<style scoped>
.log-management-container { height: 100%; }
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.search-form-container { background: #fff; padding: 20px; border-radius: 4px; margin-bottom: 16px; border: 1px solid #e6ebf1; }
.table-container { background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #e6ebf1; }

.action-btn { border-radius: 4px; font-size: 13px; }
.action-link { font-size: 13px; transition: all 0.2s; cursor: pointer; }
.action-link.detail { color: #1890ff; }

.section-title { font-size: 16px; font-weight: bold; margin-bottom: 16px; padding-left: 8px; border-left: 4px solid #1890ff; line-height: 1; }

.detail-content { max-height: 600px; overflow-y: auto; padding-right: 10px; }
.detail-section { margin-bottom: 24px; }

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 3px; }
</style>
