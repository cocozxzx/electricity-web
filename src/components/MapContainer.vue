<template>
  <div class="map-wrapper">
    <div id="container" class="map-container"></div>
    <div v-if="loading" class="map-loading">
      <a-spin size="large" tip="地图加载中..." />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({
  // 中心点 [经度, 纬度]
  center: {
    type: Array,
    default: () => [116.397428, 39.90923]
  },
  // 缩放级别
  zoom: {
    type: Number,
    default: 11
  },
  // 点标记数据 [{ position: [lng, lat], title: '', content: '' }]
  markers: {
    type: Array,
    default: () => []
  },
  // 是否显示工具栏
  showToolBar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['map-load', 'marker-click'])

let map = null
const loading = ref(true)

// 安全密钥（JS API 2.0 必须）
// 注意：在实际生产环境中，建议通过环境变量或后端接口获取
window._AMapSecurityConfig = {
  securityJsCode: '99deb6f9134b30e15fcf39248df79f1c' // 请替换为实际的安全密钥
}

const initMap = () => {
  AMapLoader.load({
    key: '992460944b03294290d0fb9f4b6e5ddb', // 请替换为实际的 Key
    version: '2.0',
    plugins: ['AMap.ToolBar', 'AMap.Scale', 'AMap.HawkEye', 'AMap.MapType', 'AMap.Geolocation']
  }).then((AMap) => {
    map = new AMap.Map('container', {
      viewMode: '3D',
      zoom: props.zoom,
      center: props.center,
      mapStyle: 'amap://styles/dark' // 可选: dark, light, normal 等
    })

    if (props.showToolBar) {
      map.addControl(new AMap.ToolBar())
      map.addControl(new AMap.Scale())
      
      const mapType = new AMap.MapType({
        defaultType: 0, // 0: Standard, 1: Satellite
        showRoad: false, // 核心配置：隐藏路网
        showTraffic: false // 核心配置：隐藏路况
      })
      map.addControl(mapType)
    }

    // 强力补丁：在地图加载完成后，手动扫描并移除可能残留的“路网”和“路况”UI元素
    map.on('complete', () => {
      const hideRoadAndTraffic = () => {
        const items = document.querySelectorAll('.amap-maptype-item');
        items.forEach(item => {
          const text = item.innerText || item.textContent || '';
          if (text.includes('路网') || text.includes('路况')) {
            item.style.setProperty('display', 'none', 'important');
          }
        });
      };
      // 执行多次以确保捕获动态渲染的元素
      hideRoadAndTraffic();
      setTimeout(hideRoadAndTraffic, 500);
      setTimeout(hideRoadAndTraffic, 2000);
    });

    renderMarkers(AMap)
    
    loading.value = false
    emit('map-load', map)
  }).catch(e => {
    console.error('AMap Error:', e)
    loading.value = false
  })
}

const renderMarkers = (AMap) => {
  if (!map || !props.markers.length) return

  props.markers.forEach(item => {
    const colorClass = item.color || 'cyan';
    // 创建自定义 HTML 内容，传入颜色类名
    const content = `
      <div class="custom-marker marker-color-${colorClass}">
        <div class="marker-label">${item.title}</div>
        <div class="marker-dot">
          <div class="dot-inner"></div>
          <div class="dot-pulse"></div>
        </div>
      </div>
    `

    const marker = new AMap.Marker({
      position: item.position,
      content: content,
      offset: new AMap.Pixel(-50, -40), 
      map: map
    })

    marker.on('click', () => {
      emit('marker-click', item)
    })
  })
}

// 监听数据变化更新地图
watch(() => props.center, (newVal) => {
  if (map) map.setCenter(newVal)
})

watch(() => props.markers, () => {
  if (map) {
    map.clearMap()
    renderMarkers(window.AMap)
  }
}, { deep: true })

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
})
</script>

<style>
/* 全局样式：强制修正高德地图原生控件的文字颜色 */
.amap-layers-control,
.amap-maptype-list,
.amap-maptype-title,
.amap-maptype-con,
.amap-maptype-item,
.amap-maptype-win,
.amap-scale-text,
.amap-toolbar,
.amap-maptype-con *,
.amap-layers-control * {
  color: #333 !important;
}

/* 强制隐藏路网和路况选项（针对 2.0 版本的地毯式拦截） */
.amap-maptype-list > .amap-maptype-item:nth-child(n+3),
.amap-maptype-con > .amap-maptype-item:nth-child(n+3),
.amap-maptype-win > .amap-maptype-item:nth-child(n+3),
.amap-maptype-item input[type="checkbox"],
.amap-maptype-item input[type="checkbox"] + span,
.amap-maptype-item[title*="路"],
.amap-maptype-item[title*="况"],
.amap-layers-control-road,
.amap-layers-control-traffic {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  pointer-events: none !important;
}

/* 自定义科幻标记点样式 - 多色支持 */
.custom-marker { position: relative; display: flex; flex-direction: column; align-items: center; width: 100px; }
.marker-label { color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; margin-bottom: 8px; border: 1px solid #fff; pointer-events: none; }
.marker-dot { position: relative; width: 12px; height: 12px; }
.dot-inner { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff; z-index: 2; position: relative; }
.dot-pulse { position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; border-radius: 50%; transform: translate(-50%, -50%); animation: marker-pulse 2s infinite ease-out; z-index: 1; }

/* 颜色变体：青色 (默认/正常) */
.marker-color-cyan .marker-label { background: rgba(0, 234, 255, 0.8); box-shadow: 0 0 10px rgba(0, 234, 255, 0.5); }
.marker-color-cyan .dot-inner { background: #00eaff; box-shadow: 0 0 10px #00eaff; }
.marker-color-cyan .dot-pulse { background: rgba(0, 234, 255, 0.4); }

/* 颜色变体：灰色 (离线) */
.marker-color-gray .marker-label { background: rgba(140, 140, 140, 0.8); box-shadow: 0 0 10px rgba(140, 140, 140, 0.5); }
.marker-color-gray .dot-inner { background: #8c8c8c; box-shadow: 0 0 10px #8c8c8c; }
.marker-color-gray .dot-pulse { background: rgba(140, 140, 140, 0.4); }

/* 颜色变体：黄色 (一般告警) */
.marker-color-yellow .marker-label { background: rgba(255, 215, 0, 0.8); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
.marker-color-yellow .dot-inner { background: #ffd700; box-shadow: 0 0 10px #ffd700; }
.marker-color-yellow .dot-pulse { background: rgba(255, 215, 0, 0.4); }

/* 颜色变体：橙色 (较大告警) */
.marker-color-orange .marker-label { background: rgba(255, 165, 0, 0.8); box-shadow: 0 0 10px rgba(255, 165, 0, 0.5); }
.marker-color-orange .dot-inner { background: #ffa500; box-shadow: 0 0 10px #ffa500; }
.marker-color-orange .dot-pulse { background: rgba(255, 165, 0, 0.4); }

/* 颜色变体：红色 (严重告警) */
.marker-color-red .marker-label { background: rgba(255, 77, 79, 0.8); box-shadow: 0 0 10px rgba(255, 77, 79, 0.5); }
.marker-color-red .dot-inner { background: #ff4d4f; box-shadow: 0 0 10px #ff4d4f; }
.marker-color-red .dot-pulse { background: rgba(255, 77, 79, 0.4); }

@keyframes marker-pulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}
</style>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

/* 强制重置高德地图控件文字颜色，防止被外部科幻主题的白色继承 */
:deep(.amap-logo),
:deep(.amap-copyright),
:deep(.amap-controls),
:deep(.amap-layers-control),
:deep(.amap-maptype-list),
:deep(.amap-maptype-title),
:deep(.amap-maptype-con),
:deep(.amap-maptype-item),
:deep(.amap-maptype-win),
:deep(.amap-scale-text),
:deep(.amap-toolbar) {
  color: #333 !important;
}

:deep(.amap-maptype-con *) {
  color: #333 !important;
}
</style>
