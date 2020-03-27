import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式
import './assets/css/global.css'

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' // 配置请求根路径
// 配置 axios 请求拦截，添加 Token 验证的 Authorization 字段
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token') // 为每一次请求在请求头中挂载 Authorization 字段，即可在以后的请求中授权，提供 token 令牌。
  console.log('config:', config)
  return config
})
Vue.prototype.$http = axios // 挂载 axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
