import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
const Login = () => import('@/components/content/Login/Login')
const Home = () => import('@/views/Home/Home')
const Welcome = () => import( '@/components/content/Welcome/Welcome')
const User = () => import('@/views/User/User')
const Rights = () => import('@/views/Power/Rights')
const Roles = () => import('@/views/Power/Roles')
const Category = () => import('@/views/Goods/Category')
const CateParams = () => import('@/views/Goods/CateParams')
const GoodsList = () => import('@/views/Goods/GoodsList')
const AddGoods = () => import('@/views/Goods/AddGoods')
const Orders = () => import( '@/views/Orders/Orders')
const Reports = () => import( '@/views/Reports/Reports')
const NotFound = () => import( '@/views/NotFound/NotFound')


Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', component: Login },
  {
    path: '/Home', component: Home, redirect: '/Welcome',
    children: [
      { path: '/Welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Category },
      { path: '/params', component: CateParams },
      { path: '/goods', component: GoodsList },
      { path: '/addGoods', component: AddGoods },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports },
    ]
  },
  { path: '*', component: NotFound }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log(to);
  console.log(from);
  // 当token不存在时，不能进行跳转
  if (to.path == '/Login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next({ path: '/Login' })
  NProgress.start()
  next()
})

router.afterEach(route => {
  NProgress.done()
})

export default router
