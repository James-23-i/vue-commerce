import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('@/components/content/Login/Login')
const Home = () => import('@/views/Home/Home')
const Welcome = () => import('@/components/content/Welcome/Welcome')
const User = () => import('@/views/User/User')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', component: Login },
  { path: '/Home', component: Home, redirect: '/Welcome',
    children: [
      { path: '/Welcome', component: Welcome },
      { path: '/users', component: User },
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 当token不存在时，不能进行跳转
  if (to.path == '/Login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next({ path: '/Login' })
  next()
})

export default router
