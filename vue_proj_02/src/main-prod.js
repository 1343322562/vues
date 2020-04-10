import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js' // 已经在 public/index.html 中导入 CDN 配置， 所以不要在这里再次导入
import TreeTable from 'vue-table-with-tree-grid' // 导入 TreeTable 表格组件 （Cate 组件中使用）
import VueQuillEditor from 'vue-quill-editor' // 导入 富文本编辑器 组件(Add组件用到)

// 以下三个文件为 VueQuillEditor 的样式表，作用是初始化富文本编辑器的样式。
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

// 导入全局样式
import './assets/css/global.css'

// 导入 nprogress 包，使用其 页面顶部加载条 优化页面
import NPorigress from 'nprogress'
// import 'nprogress/nprogress.css'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/' // 配置请求根路径

// 配置 axios 请求拦截，添加 Token 验证的 Authorization 字段。作用是在每一次发送请求时，会先验证该属性。
axios.interceptors.request.use(config => {
  NPorigress.start() // 在 request 拦截器中，展示进度条 NPorigress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token') // 为每一次请求在请求头中挂载 Authorization 字段，即可在以后的请求中授权，提供 token 令牌。
  return config
})

// 在 response 拦截器中，隐藏进度条 NPorigress.done()
axios.interceptors.response.use(config => {
  NPorigress.done()
  return config
})

Vue.prototype.$http = axios // 挂载 axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable) // 挂载 tree-table 组件,在 Cate 组件中按需使用

Vue.use(VueQuillEditor) // 挂载 富文本编辑器

// 定义全局的 时间处理 过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear() // 获取 四位年份
  const m = (dt.getMonth() + 1 + '').padStart(2, '0') // 获取月份（需要 + 1，因为月份从零开始）
  const d = (dt.getDate() + '').padStart(2, '0') // 获取日期
  const hh = (dt.getHours() + '').padStart(2, '0') // 获取 时
  const mm = (dt.getMinutes() + '').padStart(2, '0') // 获取 分
  const ss = (dt.getSeconds() + '').padStart(2, '0') // 获取 秒
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
