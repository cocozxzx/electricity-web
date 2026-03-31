<template>
  <div class="warning-rule-config fade-in">
    <div class="config-container">
      <div class="header-section">
        <div class="section-title">预警规则配置 (全局)</div>
        <div class="section-desc">此配置为全局规则，所有项目共用。用于设定授权到期前的提醒机制。</div>
      </div>

      <a-form :model="formState" layout="vertical" class="config-form">
        <a-row :gutter="48">
          <a-col :span="12">
            <a-form-item label="提前预警天数" required>
              <a-input-number v-model:value="formState.days" :min="1" :max="180" style="width: 100%" />
              <div class="form-tip">项目将在到期前 {{ formState.days }} 天进入「即将到期」状态并开始推送预警。</div>
            </a-form-item>

            <a-form-item label="预警通知方式" required>
              <a-checkbox-group v-model:value="formState.methods">
                <a-checkbox value="site">站内消息</a-checkbox>
                <a-checkbox value="sms">短信</a-checkbox>
                <a-checkbox value="email">邮件</a-checkbox>
              </a-checkbox-group>
            </a-form-item>

            <a-form-item label="通知频率" required>
              <a-radio-group v-model:value="formState.frequency">
                <a-radio value="daily">每天一次</a-radio>
                <a-radio value="first">仅首日通知</a-radio>
                <a-radio value="custom">自定义间隔 (每3天)</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="通知接收方">
              <div class="recipient-list">
                <div class="recipient-item fixed">
                  <a-tag color="blue">代理商主联系人</a-tag>
                  <span class="desc">(系统自动推送，不可更改)</span>
                </div>
                <div style="margin-top: 16px; margin-bottom: 8px;">抄送厂家内部人员：</div>
                <a-select
                  v-model:value="formState.ccUsers"
                  mode="multiple"
                  placeholder="请选择厂家内部指定人员"
                  style="width: 100%"
                >
                  <a-select-option value="admin">系统管理员</a-select-option>
                  <a-select-option value="finance">财务负责人</a-select-option>
                  <a-select-option value="sales">大客户经理</a-select-option>
                </a-select>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <div class="footer-actions" style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 24px; text-align: center;">
          <a-button type="primary" size="large" style="width: 200px" @click="handleSave">
            保存配置
          </a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { message } from 'ant-design-vue';

const formState = reactive({
  days: 15,
  methods: ['site', 'sms'],
  frequency: 'daily',
  ccUsers: ['finance']
});

const handleSave = () => {
  message.loading('正在保存全局配置...', 1).then(() => {
    message.success('全局预警规则已更新，立即生效');
  });
};
</script>

<style scoped>
.warning-rule-config { padding: 24px; }
.config-container {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #e6ebf1;
  max-width: 1000px;
  margin: 0 auto;
}
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #333; }
.section-desc { font-size: 13px; color: #8c8c8c; margin-bottom: 32px; }
.form-tip { font-size: 12px; color: #faad14; margin-top: 4px; }
.recipient-item.fixed { display: flex; align-items: center; gap: 8px; }
.recipient-item .desc { color: #8c8c8c; font-size: 12px; }

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
