import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'
import PublishView from '../views/PublishView.vue'
import FriendsView from '../views/FriendsView.vue'
import ProfileView from '../views/ProfileView.vue'
import CircleView from '../views/CircleView.vue'
import SearchView from '../views/SearchView.vue'
import ChatView from '../views/ChatView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import PaymentView from '../views/PaymentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/product/:id',
      name: 'product',
      component: ProductView,
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentView,
      meta: { requiresAuth: true }
    },
    {
      path: '/publish',
      name: 'publish',
      component: PublishView,
      meta: { requiresAuth: true }
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/circle',
      name: 'circle',
      component: CircleView,
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = localStorage.getItem('user')
    if (!user) {
      next('/login')
      return
    }
  }
  next()
})

export default router 