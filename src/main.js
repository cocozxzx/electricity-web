import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import router from './router'

dayjs.locale('zh-cn')

const app = createApp(App)

app.use(Antd)
app.use(router)
app.mount('#app')
