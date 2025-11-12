import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { title: 'Alisa Cake' }
    },
    {
      path: '/menu',
      name: 'Menu',
      component: () => import('../views/Menu.vue'),
      meta: { title: '菜单' }
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue'),
      meta: { title: '购物车' }
    },
    {
      path: '/orders',
      name: 'Orders',
      component: () => import('../views/Orders.vue'),
      meta: { title: '我的订单' }
    },
    {
      path: '/order/:orderNo',
      name: 'OrderDetail',
      component: () => import('../views/OrderDetail.vue'),
      meta: { title: '订单详情' }
    },
    {
      path: '/payment/:orderNo',
      name: 'Payment',
      component: () => import('../views/Payment.vue'),
      meta: { title: '支付' }
    }
  ]
})

export default router
