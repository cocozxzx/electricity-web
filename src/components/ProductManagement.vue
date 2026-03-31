<template>
  <div class="product-management fade-in">
    <!-- List View -->
    <template v-if="viewState === 'list'">
      <!-- Search Form -->
      <div class="search-form-container">
        <a-form layout="inline" :model="searchForm" class="search-form">
          <a-form-item>
            <a-input v-model:value="searchForm.name" placeholder="物模型名称" class="search-input" allow-clear />
          </a-form-item>
          <a-form-item label="产品类型">
            <a-select v-model:value="searchForm.productType" placeholder="请选择" style="width: 150px" allow-clear>
              <a-select-option value="网关">网关</a-select-option>
              <a-select-option value="设备">设备</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" class="action-btn" @click="handleSearch">
                查询
              </a-button>
              <a-button class="action-btn" @click="resetSearch">
                重置
              </a-button>
              <a-button type="primary" class="add-btn" @click="openAddModal">
                新增物模型
              </a-button>
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
          :row-selection="{}"
          :scroll="{ y: 'calc(100vh - 320px)' }"
          class="ruoyi-table custom-scrollbar"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <span v-if="record.configJson && record.configJson !== '{}'">
                 2026-03-17 10:00:00
              </span>
              <span v-else>
                <span style="color: #f5222d">●</span> 未配置
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space :size="4">
                <template v-if="record.configJson && record.configJson !== '{}'">
                  <a-button type="link" size="small" @click="viewDetail(record)">
                    详情
                  </a-button>
                  <!-- <a-button type="link" size="small" @click="openEditModal(record)">
                    编辑
                  </a-button> -->
                </template>
                <template v-else>
                  <a-button type="link" size="small" @click="openEditModal(record)" style="color: #ff4d4f">
                    <template #icon><PlusOutlined /></template>
                    去配置
                  </a-button>
                </template>
                <a-popconfirm
                  title="确定要删除该物模型吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="handleDelete(record)"
                >
                  <a-button type="link" size="small" danger>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </template>

    <!-- Add/Edit "Page" -->
    <template v-else-if="viewState === 'edit'">
      <div class="page-container">
        <div class="page-header-bar">
          <div class="back-btn" @click="viewState = 'list'">
            <ArrowLeftOutlined /> 返回列表
          </div>
          <div class="page-title">{{ modalTitle }}</div>
        </div>

        <div class="page-body">
          <a-row :gutter="24" class="edit-layout-row">
            <!-- Left: Info & Import (Step 1 & 3) -->
            <a-col :span="10" class="edit-layout-col info-col">
              <!-- Step 1 -->
              <div class="step-section">
                <div class="step-title">[ 第一步：产品信息与物模型导入 ]</div>
                <a-form layout="vertical" :model="formState" :rules="rules" ref="formRef" style="margin-top: 16px;">
                  <a-row :gutter="16">
                    <a-col :span="12">
                      <a-form-item label="产品类型" name="productType">
                        <a-radio-group v-model:value="formState.productType">
                          <a-radio value="网关">网关</a-radio>
                          <a-radio value="设备">设备</a-radio>
                        </a-radio-group>
                      </a-form-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-item label="ProductKey" name="productKey">
                        <a-input v-model:value="formState.productKey" placeholder="自动解析" disabled />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>

                <div class="upload-area" style="margin-top: 8px;">
                  <div style="margin-bottom: 8px; font-weight: 500; color: #666;">导入物模型 (JSON):</div>
                  <a-upload-dragger
                    name="file"
                    :multiple="false"
                    accept=".json"
                    :show-upload-list="false"
                    :before-upload="() => false"
                    :custom-request="() => {}"
                    @change="handleFileUpload"
                    class="json-upload-dragger"
                  >
                    <p class="ant-upload-drag-icon">
                      <CloudOutlined style="font-size: 32px; color: #1890ff;" />
                    </p>
                    <p class="ant-upload-text" style="font-size: 13px;">点击或拖拽文件上传</p>
                  </a-upload-dragger>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="step-section" style="margin-top: 24px;">
                <div class="step-header">
                  <div class="step-title">[ 第三步：规则预览 ]</div>
                </div>
                <div class="json-editor-container">
                  <a-textarea
                    v-model:value="formState.configJson"
                    placeholder='{ "properties": [ ... ] }'
                    :rows="12"
                    readonly
                    style="font-family: monospace; background: #f8f9fb; border: 1px solid #e1e4e8; font-size: 12px;"
                  />
                </div>
              </div>
            </a-col>

            <!-- Right: Property Config (Step 2) -->
            <a-col :span="14" class="edit-layout-col property-col custom-scrollbar">
              <div class="step-section full-height-section">
                <div class="step-title">[ 第二步：物模型详细定义 ]</div>
                <div class="property-list-container" style="margin-top: 8px;">
                  <a-tabs v-model:activeKey="activeTab" class="custom-tabs">
                    <a-tab-pane key="property" tab="功能定义">
                      <a-empty v-if="!parsedProperties.length" description="请先在左侧导入物模型" />
                      <div v-else class="event-form-container">
                        <div v-for="(prop, index) in parsedProperties" :key="index" class="event-card-modern">
                          <div class="event-card-header">
                            <div class="header-left">
                              <span class="event-index">#{{ index + 1 }}</span>
                              <span class="event-name-display">{{ prop.name || '未命名功能' }}</span>
                            </div>
                            <div class="header-right">
                              <!-- Removed icon and type tag from header as requested -->
                            </div>
                          </div>
                          <div class="event-card-body">
                            <a-form layout="vertical">
                              <a-row :gutter="20">
                                <a-col :span="6">
                                  <a-form-item label="功能名称">
                                    <template #label>
                                      <span class="custom-label"><EditOutlined /> 功能名称</span>
                                    </template>
                                    <a-input v-model:value="prop.name" placeholder="功能名称" class="custom-input" disabled />
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="标识符">
                                    <template #label>
                                      <span class="custom-label"><TagOutlined /> 标识符</span>
                                    </template>
                                    <a-input v-model:value="prop.identifier" placeholder="标识符" class="custom-input" disabled />
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="数据类型">
                                    <template #label>
                                      <span class="custom-label"><InfoCircleOutlined /> 数据类型</span>
                                    </template>
                                    <a-select v-model:value="prop.dataType.type" class="custom-select" disabled>
                                      <a-select-option value="int">int</a-select-option>
                                      <a-select-option value="float">float</a-select-option>
                                      <a-select-option value="double">double</a-select-option>
                                      <a-select-option value="text">text</a-select-option>
                                      <a-select-option value="enum">enum</a-select-option>
                                      <a-select-option value="bool">bool</a-select-option>
                                      <a-select-option value="array">array</a-select-option>
                                      <a-select-option value="date">date</a-select-option>
                                      <a-select-option value="struct">struct</a-select-option>
                                    </a-select>
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="图片上传">
                                    <template #label>
                                      <span class="custom-label"><PictureOutlined /> 图片上传</span>
                                    </template>
                                    <a-upload :show-upload-list="false" :custom-request="() => {}">
                                      <a-button class="custom-input" style="width: 100%">
                                        <template #icon><CloudOutlined /></template> 上传图片
                                      </a-button>
                                    </a-upload>
                                  </a-form-item>
                                </a-col>
                              </a-row>

                              <div class="output-params-modern">
                                <div class="params-header">
                                  <span class="params-title">配置信息</span>
                                </div>
                                <div class="params-list" style="padding: 10px;">
                                  <!-- int, float, double -->
                                  <template v-if="['int', 'float', 'double'].includes(prop.dataType.type)">
                                    <a-row :gutter="16">
                                      <a-col :span="6"><a-form-item label="最小值"><a-input-number v-model:value="prop.dataType.specs.min" style="width:100%" disabled /></a-form-item></a-col>
                                      <a-col :span="6"><a-form-item label="最大值"><a-input-number v-model:value="prop.dataType.specs.max" style="width:100%" disabled /></a-form-item></a-col>
                                      <a-col :span="6"><a-form-item label="步长"><a-input-number v-model:value="prop.dataType.specs.step" style="width:100%" disabled /></a-form-item></a-col>
                                      <a-col :span="6"><a-form-item label="单位"><a-input v-model:value="prop.dataType.specs.unit" disabled /></a-form-item></a-col>
                                    </a-row>
                                  </template>
                                  <!-- text -->
                                  <template v-else-if="prop.dataType.type === 'text'">
                                    <a-form-item label="最大长度">
                                      <a-input-number v-model:value="prop.dataType.specs.length" style="width:100%" disabled />
                                    </a-form-item>
                                  </template>
                                  <!-- bool -->
                                  <template v-else-if="prop.dataType.type === 'bool'">
                                    <a-row :gutter="16">
                                      <a-col :span="12"><a-form-item label="0的值"><a-input v-model:value="prop.dataType.specs['0']" disabled /></a-form-item></a-col>
                                      <a-col :span="12"><a-form-item label="1的值"><a-input v-model:value="prop.dataType.specs['1']" disabled /></a-form-item></a-col>
                                    </a-row>
                                  </template>
                                  <!-- enum -->
                                  <template v-else-if="prop.dataType.type === 'enum'">
                                    <div class="enum-list">
                                      <div v-for="(val, key) in prop.dataType.specs" :key="key" class="param-row-modern" style="margin-bottom: 8px;">
                                        <div class="param-inputs" style="grid-template-columns: 1fr 2fr;">
                                          <a-input :value="key" size="small" disabled placeholder="值" />
                                          <a-input :value="val" size="small" disabled placeholder="描述" />
                                        </div>
                                      </div>
                                    </div>
                                  </template>
                                  <!-- array -->
                                  <template v-else-if="prop.dataType.type === 'array'">
                                    <a-row :gutter="16">
                                      <a-col :span="12"><a-form-item label="数组元素类型"><a-input v-model:value="prop.dataType.specs.itemType" disabled /></a-form-item></a-col>
                                      <a-col :span="12"><a-form-item label="数组大小"><a-input-number v-model:value="prop.dataType.specs.size" style="width:100%" disabled /></a-form-item></a-col>
                                    </a-row>
                                  </template>
                                  <!-- date, struct -->
                                  <template v-else-if="['date', 'struct'].includes(prop.dataType.type)">
                                    <div class="params-empty">该类型无需额外配置</div>
                                  </template>
                                </div>
                              </div>
                            </a-form>
                          </div>
                        </div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="event" tab="事件定义">
                      <a-empty v-if="!parsedEvents.length" description="暂无事件定义" />
                      <div v-else class="event-form-container">
                        <div v-for="(event, index) in parsedEvents" :key="index" class="event-card-modern">
                          <div class="event-card-header">
                            <div class="header-left">
                              <span class="event-index">#{{ index + 1 }}</span>
                              <span class="event-name-display">{{ event.name || '未命名事件' }}</span>
                            </div>
                            <div class="header-right">
                              <!-- Removed identifier and type tag from header as requested -->
                            </div>
                          </div>
                          
                          <div class="event-card-body">
                            <a-form layout="vertical">
                              <a-row :gutter="20">
                                <a-col :span="6">
                                  <a-form-item label="事件名称">
                                    <template #label>
                                      <span class="custom-label"><EditOutlined /> 事件名称</span>
                                    </template>
                                    <a-input v-model:value="event.name" placeholder="请输入名称" class="custom-input" disabled />
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="标识符">
                                    <template #label>
                                      <span class="custom-label"><TagOutlined /> 标识符</span>
                                    </template>
                                    <a-input v-model:value="event.identifier" placeholder="请输入标识符" class="custom-input" disabled />
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="事件类型">
                                    <template #label>
                                      <span class="custom-label"><InfoCircleOutlined /> 事件类型</span>
                                    </template>
                                    <a-select v-model:value="event.type" class="custom-select" disabled>
                                      <a-select-option value="info">信息</a-select-option>
                                      <a-select-option value="alert">告警</a-select-option>
                                      <a-select-option value="error">故障</a-select-option>
                                    </a-select>
                                  </a-form-item>
                                </a-col>
                                <a-col :span="6">
                                  <a-form-item label="描述">
                                    <template #label>
                                      <span class="custom-label"><FileTextOutlined /> 描述</span>
                                    </template>
                                    <a-input v-model:value="event.desc" placeholder="请输入描述" class="custom-input" disabled />
                                  </a-form-item>
                                </a-col>
                              </a-row>

                              <div class="output-params-modern">
                                <div class="params-header">
                                  <span class="params-title">输出参数</span>
                                  <span class="params-count">{{ event.outputData.length }}</span>
                                </div>
                                
                                <div class="params-list">
                                  <div v-if="event.outputData.length === 0" class="params-empty">
                                    暂无输出参数
                                  </div>
                                  <div v-for="(param, pIdx) in event.outputData" :key="pIdx" class="param-row-modern" style="flex-direction: column; align-items: flex-start;">
                                    <div class="param-inputs" style="width: 100%; margin-bottom: 8px;">
                                      <a-input v-model:value="param.name" size="small" placeholder="参数名称" class="param-input" disabled />
                                      <a-input v-model:value="param.identifier" size="small" placeholder="标识符" class="param-input" disabled />
                                      <a-select v-model:value="param.dataType.type" size="small" class="param-select" disabled>
                                        <a-select-option value="int">int</a-select-option>
                                        <a-select-option value="float">float</a-select-option>
                                        <a-select-option value="double">double</a-select-option>
                                        <a-select-option value="text">text</a-select-option>
                                        <a-select-option value="bool">bool</a-select-option>
                                        <a-select-option value="enum">enum</a-select-option>
                                        <a-select-option value="array">array</a-select-option>
                                      </a-select>
                                    </div>
                                    <!-- Dynamic fields for output parameters -->
                                    <div v-if="param.dataType?.specs" style="width: 100%; background: #f9f9f9; padding: 8px; border-radius: 4px;">
                                      <template v-if="['int', 'float', 'double'].includes(param.dataType.type)">
                                        <a-row :gutter="8">
                                          <a-col :span="6"><a-input-number v-model:value="param.dataType.specs.min" size="small" placeholder="最小" style="width:100%" disabled /></a-col>
                                          <a-col :span="6"><a-input-number v-model:value="param.dataType.specs.max" size="small" placeholder="最大" style="width:100%" disabled /></a-col>
                                          <a-col :span="6"><a-input-number v-model:value="param.dataType.specs.step" size="small" placeholder="步长" style="width:100%" disabled /></a-col>
                                          <a-col :span="6"><a-input v-model:value="param.dataType.specs.unit" size="small" placeholder="单位" disabled /></a-col>
                                        </a-row>
                                      </template>
                                      <template v-else-if="param.dataType.type === 'text'">
                                        <a-input-number v-model:value="param.dataType.specs.length" size="small" placeholder="最大长度" style="width:100%" disabled />
                                      </template>
                                      <template v-else-if="param.dataType.type === 'bool'">
                                        <a-row :gutter="8">
                                          <a-col :span="12"><a-input v-model:value="param.dataType.specs['0']" size="small" placeholder="0的值" disabled /></a-col>
                                          <a-col :span="12"><a-input v-model:value="param.dataType.specs['1']" size="small" placeholder="1的值" disabled /></a-col>
                                        </a-row>
                                      </template>
                                      <template v-else-if="param.dataType.type === 'enum'">
                                        <div v-for="(val, key) in param.dataType.specs" :key="key" style="display: flex; gap: 4px; margin-bottom: 4px;">
                                          <a-input :value="key" size="small" disabled style="flex: 1" />
                                          <a-input :value="val" size="small" disabled style="flex: 2" />
                                        </div>
                                      </template>
                                      <template v-else-if="param.dataType.type === 'array'">
                                        <a-row :gutter="8">
                                          <a-col :span="12"><a-input v-model:value="param.dataType.specs.itemType" size="small" placeholder="类型" disabled /></a-col>
                                          <a-col :span="12"><a-input-number v-model:value="param.dataType.specs.size" size="small" placeholder="大小" style="width:100%" disabled /></a-col>
                                        </a-row>
                                      </template>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </a-form>
                          </div>
                        </div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>

        <!-- New Page Footer -->
        <div class="page-footer">
          <a-space>
            <a-button class="product-footer-btn" @click="viewState = 'list'">取消</a-button>
            <a-button type="primary" class="product-footer-btn" @click="handleModalOk">保存物模型</a-button>
          </a-space>
        </div>
      </div>
    </template>

    <!-- Detail "Page" -->
    <template v-else-if="viewState === 'detail'">
      <div class="page-container">
        <div class="page-header-bar">
          <div class="back-btn" @click="viewState = 'list'">
            <ArrowLeftOutlined /> 返回列表
          </div>
          <div class="page-title">物模型详情</div>
          <!-- <div class="page-actions">
            <a-button type="primary" class="product-footer-btn" @click="viewState = 'list'">确定</a-button>
          </div> -->
        </div>

        <div class="page-body" style="overflow: hidden;">
          <a-row :gutter="24" style="height: 100%;">
            <a-col :span="8" style="height: 100%; overflow-y: auto;">
              <div class="step-section">
                <div class="step-title">基本信息</div>
                <a-descriptions :column="1" size="middle" style="margin-top: 16px;">
                  <a-descriptions-item label="物模型名称">{{ currentProduct.name }}</a-descriptions-item>
                  <a-descriptions-item label="产品类型">{{ currentProduct.productType }}</a-descriptions-item>
                  <a-descriptions-item label="ProductKey">{{ currentProduct.productKey }}</a-descriptions-item>
                  <a-descriptions-item label="创建时间">{{ currentProduct.createTime }}</a-descriptions-item>
                </a-descriptions>
              </div>

              <div class="step-section" style="margin-top: 24px;">
                <div class="step-title">物模型源码</div>
                <div class="json-editor-container" style="margin-top: 16px;">
                  <pre class="json-display-detail">{{ currentProduct.configJson }}</pre>
                </div>
              </div>
            </a-col>

            <a-col :span="16" style="height: 100%;">
              <div class="step-section" style="height: 100%; display: flex; flex-direction: column;">
                <div class="step-title">物模型定义</div>
                <div class="detail-tabs-container" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                  <a-tabs default-active-key="property" class="fixed-detail-tabs">
                    <a-tab-pane key="property" tab="属性">
                      <div class="tab-scroll-viewport">
                        <div class="event-form-container">
                          <div v-for="(prop, index) in detailProperties" :key="index" class="event-card-modern">
                            <div class="event-card-header">
                              <div class="header-left">
                                <span class="event-index">#{{ index + 1 }}</span>
                                <span class="event-name-display">{{ prop.name || '未命名功能' }}</span>
                              </div>
                              <div class="header-right" style="display: flex; align-items: center; gap: 12px;">
                                <div class="icon-preview-mini">
                                  <PictureOutlined v-if="!prop.icon" style="color: #ccc;" />
                                  <img v-else :src="prop.icon" />
                                </div>
                                <a-tag color="blue" class="type-tag">{{ prop.dataType?.type || '-' }}</a-tag>
                              </div>
                            </div>
                            <div class="event-card-body">
                              <a-descriptions :column="2" size="small" bordered>
                                <a-descriptions-item label="功能名称">{{ prop.name }}</a-descriptions-item>
                                <a-descriptions-item label="标识符">{{ prop.identifier }}</a-descriptions-item>
                                <a-descriptions-item label="数据类型" :span="2">{{ prop.dataType?.type }}</a-descriptions-item>
                                
                                <template v-if="prop.dataType?.specs">
                                  <!-- Numeric types -->
                                  <template v-if="['int', 'float', 'double'].includes(prop.dataType.type)">
                                    <a-descriptions-item label="最小值">{{ prop.dataType.specs.min }}</a-descriptions-item>
                                    <a-descriptions-item label="最大值">{{ prop.dataType.specs.max }}</a-descriptions-item>
                                    <a-descriptions-item label="步长">{{ prop.dataType.specs.step || '-' }}</a-descriptions-item>
                                    <a-descriptions-item label="单位">{{ prop.dataType.specs.unit || '-' }}</a-descriptions-item>
                                  </template>
                                  <!-- text -->
                                  <template v-else-if="prop.dataType.type === 'text'">
                                    <a-descriptions-item label="最大长度" :span="2">{{ prop.dataType.specs.length }}</a-descriptions-item>
                                  </template>
                                  <!-- bool -->
                                  <template v-else-if="prop.dataType.type === 'bool'">
                                    <a-descriptions-item label="0的值">{{ prop.dataType.specs['0'] }}</a-descriptions-item>
                                    <a-descriptions-item label="1的值">{{ prop.dataType.specs['1'] }}</a-descriptions-item>
                                  </template>
                                  <!-- enum -->
                                  <template v-else-if="prop.dataType.type === 'enum'">
                                    <a-descriptions-item label="枚举值定义" :span="2">
                                      <div v-for="(val, key) in prop.dataType.specs" :key="key" style="margin-bottom: 4px;">
                                        <a-tag color="orange">{{ key }}</a-tag> : {{ val }}
                                      </div>
                                    </a-descriptions-item>
                                  </template>
                                  <!-- array -->
                                  <template v-else-if="prop.dataType.type === 'array'">
                                    <a-descriptions-item label="元素类型">{{ prop.dataType.specs.itemType }}</a-descriptions-item>
                                    <a-descriptions-item label="数组大小">{{ prop.dataType.specs.size }}</a-descriptions-item>
                                  </template>
                                </template>
                              </a-descriptions>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-tab-pane>
                    <a-tab-pane key="event" tab="事件">
                      <div class="tab-scroll-viewport">
                        <div class="event-form-container">
                          <div v-for="(event, index) in detailEvents" :key="index" class="event-card-modern">
                            <div class="event-card-header">
                              <div class="header-left">
                                <span class="event-index">#{{ index + 1 }}</span>
                                <span class="event-name-display">{{ event.name || '未命名事件' }}</span>
                              </div>
                              <div class="header-right" style="display: flex; align-items: center; gap: 12px;">

                                <!-- <div class="icon-preview-mini">
                                  <PictureOutlined style="color: #ccc;" /> 
                                </div> -->
                                <a-tag :color="event.type === 'error' ? 'red' : (event.type === 'alert' ? 'orange' : 'processing')" class="type-tag">
                                  <!-- {{ event.type === 'error' ? '故障' : (event.type === 'alert' ? '告警' : '信息') }} -->
                                </a-tag>
                              </div>
                            </div>
                            <div class="event-card-body">
                              <a-descriptions :column="2" size="small" bordered>
                                <a-descriptions-item label="事件名称">{{ event.name }}</a-descriptions-item>
                                <a-descriptions-item label="标识符">{{ event.identifier }}</a-descriptions-item>
                                <a-descriptions-item label="事件类型">{{ event.type === 'error' ? '故障' : (event.type === 'alert' ? '告警' : '信息') }}</a-descriptions-item>
                                <a-descriptions-item label="描述">{{ event.desc || '-' }}</a-descriptions-item>
                                
                                <a-descriptions-item label="输出参数" :span="2">
                                  <div v-if="!event.outputData?.length" class="params-empty" style="padding: 10px;">暂无输出参数</div>
                                  <div v-else class="params-list">
                                    <div v-for="(param, pIdx) in event.outputData" :key="pIdx" class="param-row-modern" style="margin-bottom: 8px;">
                                      <div class="param-inputs" style="display: flex; align-items: center; gap: 16px; width: 100%;">
                                        <span>参数标识: <a-tag color="blue" size="small">{{ param.identifier }}</a-tag></span>
                                        <span>参数名称: <strong>{{ param.name }}</strong></span>
                                        <span>数据类型: <a-tag color="cyan" size="small">{{ param.dataType?.type }}</a-tag></span>
                                      </div>
                                    </div>
                                  </div>
                                </a-descriptions-item>
                              </a-descriptions>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FileTextOutlined,
  CloudOutlined,
  LockOutlined,
  UnlockOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  TagOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue';

// Search Form
const searchForm = reactive({
  name: '',
  productType: undefined
});

// Table Data
const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: '物模型名称', dataIndex: 'name', key: 'name', align: 'center' },
  { title: '产品类型', dataIndex: 'productType', key: 'productType', align: 'center' },
  { title: 'ProductKey', dataIndex: 'productKey', key: 'productKey', align: 'center' },
  { title: '更新时间', dataIndex: 'status', key: 'status', align: 'center' },
  { title: '操作', key: 'action', width: 220, fixed: 'right', align: 'center' }
];

const dataSource = ref([
  {
    id: 1,
    key: '1',
    name: '工业级全能控制器',
    productType: '设备',
    productKey: 'PK_FULL_MODEL_001',
    configJson: JSON.stringify({
      properties: [
        { name: '温度', identifier: 'temp', dataType: { type: 'double', specs: { min: -50, max: 150, step: 0.1, unit: '℃' } } },
        { name: '工作电流', identifier: 'current', dataType: { type: 'float', specs: { min: 0, max: 20, step: 0.01, unit: 'A' } } },
        { name: '设备描述', identifier: 'desc', dataType: { type: 'text', specs: { length: 255 } } },
        { name: '运行状态', identifier: 'switch', dataType: { type: 'bool', specs: { '0': '停止', '1': '运行' } } },
        { name: '档位选择', identifier: 'gear', dataType: { type: 'enum', specs: { '1': '低速', '2': '中速', '3': '高速' } } },
        { name: '上报周期', identifier: 'period', dataType: { type: 'int', specs: { min: 1, max: 3600, step: 1, unit: 's' } } },
        { name: '数据序列', identifier: 'data_arr', dataType: { type: 'array', specs: { itemType: 'float', size: 10 } } },
        { name: '系统时间', identifier: 'sys_time', dataType: { type: 'date', specs: {} } },
        { name: '复合数据', identifier: 'complex', dataType: { type: 'struct', specs: {} } }
      ],
      events: [
        {
          name: '过载报警',
          identifier: 'overload_event',
          type: 'alert',
          desc: '当电流超过设定阈值时触发',
          outputData: [
            { name: '实时电流', identifier: 'curr_val', dataType: { type: 'float', specs: { min: 0, max: 100, unit: 'A' } } },
            { name: '是否紧急', identifier: 'is_urgent', dataType: { type: 'bool', specs: { '0': '否', '1': '是' } } }
          ]
        },
        {
          name: '系统故障',
          identifier: 'sys_err',
          type: 'error',
          desc: '硬件检测异常',
          outputData: [
            { name: '错误代码', identifier: 'err_code', dataType: { type: 'int', specs: { min: 0, max: 65535 } } }
          ]
        }
      ]
    }, null, 2),
    createTime: '2026-03-31 10:00:00'
  }
]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 2,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
});

// View State
const viewState = ref('list'); // 'list', 'edit', 'detail'
const modalTitle = ref('新增物模型');
const isEdit = ref(false);
const formRef = ref(null);
const importMethod = ref('upload');
const isAdvancedEdit = ref(false);
const activeTab = ref('property');

const formState = reactive({
  name: '',
  productType: '设备',
  productKey: '',
  configJson: ''
});

const rules = {
  name: [{ required: true, message: '请输入物模型名称', trigger: 'blur' }],
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  productKey: [{ required: true, message: '请输入Product Key', trigger: 'blur' }],
  configJson: [
    { required: true, message: '请输入物模型 JSON', trigger: 'blur' },
    {
      validator: (_, value) => {
        if (!value || value === '{}') return Promise.resolve();
        try {
          JSON.parse(value);
          return Promise.resolve();
        } catch (e) {
          return Promise.reject('JSON格式不正确');
        }
      },
      trigger: 'blur'
    }
  ]
};

// Detail State
const currentProduct = ref({});

// Computed Properties
const parsedProperties = computed(() => {
  if (!formState.configJson || formState.configJson === '{}') return [];
  try {
    const json = JSON.parse(formState.configJson);
    let props = json.properties || (json.thingModel && json.thingModel.properties) || [];
    
    if (!Array.isArray(props) && typeof props === 'object' && props !== null) {
      props = Object.keys(props).map(key => ({
        ...props[key],
        identifier: props[key].identifier || key
      }));
    }

    if (Array.isArray(props)) {
      return props.map(p => {
        const dataType = p.dataType || { type: 'int' };
        if (!dataType.specs) dataType.specs = { min: 0, max: 100, unit: '' };
        return { ...p, dataType };
      });
    }
    return [];
  } catch (e) {
    return [];
  }
});

const parsedEvents = computed(() => {
  if (!formState.configJson || formState.configJson === '{}') return [];
  try {
    const json = JSON.parse(formState.configJson);
    const events = json.events || (json.thingModel && json.thingModel.events) || [];
    if (Array.isArray(events)) {
      return events.map(e => ({
        ...e,
        outputData: e.outputData || []
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
});

const detailProperties = computed(() => {
  if (!currentProduct.value.configJson || currentProduct.value.configJson === '{}') return [];
  try {
    const json = JSON.parse(currentProduct.value.configJson);
    let props = json.properties || (json.thingModel && json.thingModel.properties) || [];
    
    // Handle object structure: { "prop1": { "name": "..." }, "prop2": { ... } }
    if (!Array.isArray(props) && typeof props === 'object' && props !== null) {
      props = Object.keys(props).map(key => ({
        ...props[key],
        identifier: props[key].identifier || key
      }));
    }

    if (Array.isArray(props)) {
      return props.map(p => {
        const dataType = p.dataType || { type: 'int', specs: {} };
        if (!dataType.specs) dataType.specs = {};
        return { ...p, identifier: p.identifier || '', dataType };
      });
    }
    return [];
  } catch (e) { return []; }
});

const detailEvents = computed(() => {
  if (!currentProduct.value.configJson || currentProduct.value.configJson === '{}') return [];
  try {
    const json = JSON.parse(currentProduct.value.configJson);
    let events = json.events || (json.thingModel && json.thingModel.events) || [];

    // Handle object structure
    if (!Array.isArray(events) && typeof events === 'object' && events !== null) {
      events = Object.keys(events).map(key => ({
        ...events[key],
        identifier: events[key].identifier || key
      }));
    }

    if (Array.isArray(events)) {
      return events.map(e => ({
        ...e,
        identifier: e.identifier || '',
        outputData: (e.outputData || []).map(param => ({
          ...param,
          dataType: param.dataType || { type: 'int', specs: {} }
        }))
      }));
    }
    return [];
  } catch (e) { return []; }
});

// Methods
const handleSearch = () => {
  message.success('查询成功');
};

const resetSearch = () => {
  searchForm.name = '';
  searchForm.productType = undefined;
};

const handleFileUpload = (info) => {
  const file = info.file.originFileObj || info.file;
  if (!file || (info.file.status && info.file.status !== 'uploading' && info.file.status !== 'done')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
      // Support nested thingModel structure
      const actualModel = json.thingModel ? json.thingModel : json;
      formState.configJson = JSON.stringify(actualModel, null, 2);
      
      const productKey = actualModel.productKey || (actualModel.info && actualModel.info.productKey) || json.productKey;
      if (productKey) {
        formState.productKey = productKey;
      }
      message.success('文件解析成功');
    } catch (err) {
      if (info.file.status === 'uploading' || !info.file.status) {
        message.error('文件内容不是有效的 JSON 格式');
      }
    }
  };
  reader.readAsText(file);
};

const openAddModal = () => {
  isEdit.value = false;
  modalTitle.value = '新增物模型';
  Object.assign(formState, {
    name: '',
    productType: '设备',
    productKey: '',
    configJson: '{}'
  });
  viewState.value = 'edit';
};

const openEditModal = (record) => {
  isEdit.value = true;
  modalTitle.value = '编辑物模型';
  Object.assign(formState, {
    name: record.name,
    productType: record.productType,
    productKey: record.productKey,
    configJson: record.configJson
  });
  viewState.value = 'edit';
};

const viewDetail = (record) => {
  currentProduct.value = record;
  viewState.value = 'detail';
};

const handleModalOk = () => {
  formRef.value.validate().then(() => {
    try {
      const normalizedJson = JSON.stringify(JSON.parse(formState.configJson), null, 2);
      
      if (isEdit.value) {
        const index = dataSource.value.findIndex(item => item.productKey === formState.productKey);
        if (index !== -1) {
          dataSource.value[index] = {
            ...dataSource.value[index],
            ...formState,
            configJson: normalizedJson
          };
        }
        message.success('编辑成功');
      } else {
        dataSource.value.push({
          id: dataSource.value.length + 1,
          key: Date.now().toString(),
          ...formState,
          configJson: normalizedJson,
          createTime: new Date().toLocaleString()
        });
        message.success('新增成功');
      }
      viewState.value = 'list';
    } catch (e) {
      message.error('JSON 格式错误');
    }
  });
};

const handleDelete = (record) => {
  dataSource.value = dataSource.value.filter(item => item.key !== record.key);
  message.success('删除成功');
};
</script>

<style scoped>
.product-management {
  height: 100%;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.search-form-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 1px solid #e6ebf1;
}

.search-form :deep(.ant-form-item) {
  margin-bottom: 12px;
}

.action-btn {
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 13px;
}

.add-btn {
  background-color: #1890ff;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 13px;
}

.action-btn:hover, .add-btn:hover {
  transform: translateY(-1px);
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e6ebf1;
}

.action-link {
  font-size: 13px;
  transition: all 0.2s;
}

:deep(.ant-table) {
  font-size: 13px;
}

:deep(.ant-table-thead > tr > th) {
  background: #f8f9fb !important;
  font-weight: bold;
  font-size: 13px !important;
}

.json-display {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Page Container Styles */
.page-container {
  background: #f0f2f5;
  height: calc(100vh - 175px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.page-header-bar {
  background: #fff;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6ebf1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  flex-shrink: 0;
}

.back-btn {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.back-btn:hover {
  opacity: 0.8;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
}

.page-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.edit-layout-row {
  height: 100%;
}

.edit-layout-col {
  height: 100%;
}

.info-col {
  overflow-y: auto;
}

.property-col {
  overflow-y: auto;
}

.page-footer {
  background: #fff;
  padding: 12px 24px;
  border-top: 1px solid #e6ebf1;
  text-align: right;
  z-index: 10;
  flex-shrink: 0;
}

.product-footer-btn {
  border-radius: 4px;
}

/* Fix link buttons which are likely white due to App.vue deep styles */
:deep(.ant-btn-link) {
  color: #1890ff !important;
}

:deep(.ant-btn-link.ant-btn-dangerous) {
  color: #ff4d4f !important;
}

/* Custom Scrollbar Styling */
.custom-scrollbar :deep(.ant-table-body),
.custom-scrollbar :deep(.ant-table-content),
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e8e8e8 transparent;
}

.custom-scrollbar :deep(::-webkit-scrollbar),
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.custom-scrollbar :deep(::-webkit-scrollbar-thumb),
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-radius: 4px;
}

.step-section {
  padding: 20px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.step-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.step-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 14px;
  background: #1890ff;
  margin-right: 8px;
  border-radius: 2px;
}

.json-upload-dragger {
  background: #fafafa;
}

.form-hint {
  font-style: italic;
}

.custom-property-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #fff;
  border: 1px solid #f0f0f0;
}

.custom-property-table th,
.custom-property-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.custom-property-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.custom-property-table tr:hover {
  background: #fafafa;
}

.property-table-wrapper {
  border-radius: 4px;
  overflow: hidden;
}

.icon-preview-mini {
  width: 24px;
  height: 24px;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon-preview-mini img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.json-display-detail {
  background: #f8f9fb;
  border: 1px solid #e1e4e8;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  margin: 0;
}

/* Modern Event Card Styles */
.event-form-container {
  padding: 12px 4px;
}

.event-card-modern {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.event-card-modern:hover {
  border-color: #1890ff;
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.08);
  transform: translateY(-2px);
}

.event-card-header {
  padding: 14px 20px;
  background: linear-gradient(to right, #f8faff, #ffffff);
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-index {
  font-family: 'Monaco', monospace;
  font-weight: 700;
  color: #1890ff;
  font-size: 14px;
}

.event-name-display {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.event-identifier-badge {
  font-size: 11px;
  background: #f0f2f5;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

.type-tag {
  border: none;
  font-weight: 500;
  padding: 2px 12px;
}

.event-card-body {
  padding: 20px;
}

.custom-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #475569;
}

.custom-input, .custom-select {
  border-radius: 6px;
}

.output-params-modern {
  margin-top: 16px;
  background: #fcfdfe;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 16px;
}

.params-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.params-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.params-count {
  font-size: 11px;
  background: #1890ff;
  color: #fff;
  padding: 0 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.params-empty {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 20px 0;
  border: 1px dashed #e2e8f0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.param-row-modern {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 8px;
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  transition: all 0.2s;
}

.param-row-modern:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.param-inputs {
  flex: 1;
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr;
  gap: 8px;
}

.param-input, .param-select {
  border-radius: 4px;
}

.add-param-btn {
  border-radius: 6px;
  border-style: dashed;
  color: #64748b;
  height: 36px;
}

.add-param-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}
.fixed-detail-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fixed-detail-tabs :deep(.ant-tabs-content) {
  flex: 1;
  height: 100%;
}

.fixed-detail-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
}

.tab-scroll-viewport {
  height: 100%;
  overflow-y: auto;
  padding-right: 4px; /* Space for scrollbar */
}
</style>