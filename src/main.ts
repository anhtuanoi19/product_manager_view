import './assets/main.css'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'

import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import en from "element-plus/es/locale/lang/en";

const app = createApp(App)

// Hàm để thay đổi ngôn ngữ
const setLocale = (locale: any) => {
  app.use(ElementPlus, {locale})
}

setLocale(en)

app.use(router)
app.mount('#app')