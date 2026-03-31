<template>
  <div class="map-picker-container">
    <div class="search-box">
      <a-input-search
        v-model:value="searchText"
        placeholder="搜索地址或选择地图点位"
        enter-button="搜索"
        @search="handleSearch"
        style="width: 100%"
      />
    </div>
    <div id="picker-container" class="picker-map"></div>
    <div class="address-result" v-if="currentAddress">
      <div class="label">当前选择地址：</div>
      <div class="value">{{ currentAddress }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({
  value: String
})

const emit = defineEmits(['update:value', 'select'])

const searchText = ref('')
const currentAddress = ref(props.value || '')
let map = null
let marker = null
let geocoder = null
let placeSearch = null

const initMap = () => {
  AMapLoader.load({
    key: '992460944b03294290d0fb9f4b6e5ddb', // 此处保持与 MapContainer 一致
    version: '2.0',
    plugins: ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.Marker']
  }).then((AMap) => {
    map = new AMap.Map('picker-container', {
      viewMode: '3D',
      zoom: 12,
      center: [120.15507, 30.274085] // 默认杭州
    })

    geocoder = new AMap.Geocoder()
    placeSearch = new AMap.PlaceSearch({
      map: map
    })

    marker = new AMap.Marker({
      map: map
    })

    // 点击地图选点
    map.on('click', (e) => {
      const lnglat = e.lnglat
      marker.setPosition(lnglat)
      regeocoding(lnglat)
    })
  }).catch(e => {
    console.error('AMap Picker Error:', e)
  })
}

// 逆地理编码获取地址
const regeocoding = (lnglat) => {
  geocoder.getAddress(lnglat, (status, result) => {
    if (status === 'complete' && result.regeocode) {
      const address = result.regeocode.formattedAddress
      currentAddress.value = address
      emit('update:value', address)
      emit('select', { address, lnglat: [lnglat.lng, lnglat.lat] })
    }
  })
}

// 搜索地址
const handleSearch = (val) => {
  if (!val) return
  placeSearch.search(val, (status, result) => {
    if (status === 'complete' && result.poiList.pois.length) {
      const poi = result.poiList.pois[0]
      marker.setPosition(poi.location)
      map.setCenter(poi.location)
      currentAddress.value = poi.address + poi.name
      emit('update:value', currentAddress.value)
      emit('select', { address: currentAddress.value, lnglat: [poi.location.lng, poi.location.lat] })
    }
  })
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) map.destroy()
})
</script>

<style scoped>
.map-picker-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.picker-map {
  width: 100%;
  height: 350px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.address-result {
  padding: 8px 12px;
  background: #f0f2f5;
  border-radius: 4px;
  font-size: 13px;
}
.address-result .label { color: #999; margin-bottom: 2px; }
.address-result .value { color: #1890ff; font-weight: bold; }
</style>
