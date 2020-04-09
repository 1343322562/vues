import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue' // 登录页
import Home from '../components/Home.vue' // 侧边栏组件
import Welcome from '../components/Welcome.vue' // 主页
import Users from '../components/user/Users.vue' // 用户列表组件
import Rights from '../components/power/Rights.vue' // 权限列表组件
import Roles from '../components/power/Roles.vue' // 角色列表组件
import Cate from '../components/goods/Cate.vue' // 角色列表组件
import Params from '../components/goods/Params.vue' // 角色列表组件
import GoodsList from '../components/goods/List.vue' // 商品列表组件
import Add from '../components/goods/Add.vue' // 商品列表组件
import Order from '../components/order/Order.vue' // 订单列表组件
import Report from '../components/report/Report.vue' // 数据报表组件
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由守卫设置
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  console.log('token:', Boolean(tokenStr))
  if (!tokenStr) return next('/login')
  next()
})
export default router
