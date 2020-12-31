import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import CreateOrganisation from '../views/CreateOrganisation.vue'
import Workflow from '../views/Workflow.vue'
import CustomerSupplierProfile from '../views/CustomerSupplierProfile.vue'
import ProductServiceProfile from '../views/ProductServiceProfile.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    },
    path: '/',
    name: 'home',
    component: Home
  },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Login'
    },
    path: '/login',
    name: 'login',
    component: Login
    // component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue')
  },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'About'
    },
    path: '/about',
    name: 'about',
    component: About
  },
  {
    meta: {
      title: 'Workflow'
    },
    path: '/workflow',
    name: 'Workflow',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Workflow
  },
  // {
  //   meta: {
  //     title: 'Forms'
  //   },
  //   path: '/forms',
  //   name: 'forms',
  //   component: () => import(/* webpackChunkName: "forms" */ '../views/Forms.vue')
  // },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true
    },
    path: '/profile',
    name: 'profile',
    component: Profile
    // component: () => import(/* webpackChunkName: "profile" */ '../views/Profile.vue')
  },
  {
    meta: {
      title: 'Create Organisation'
    },
    path: '/createorg',
    name: 'createorg',
    component: CreateOrganisation
    // component: () => import(/* webpackChunkName: "createorg" */ '../views/CreateOrganisation.vue')
  },
  // {
  //   meta: {
  //     title: 'New client',
  //     requiresAuth: true
  //   },
  //   path: '/client/new',
  //   name: 'client.new',
  //   component: () => import(/* webpackChunkName: "client-form" */ '../views/ClientForm.vue')
  // },
  // {
  //   meta: {
  //     title: 'Edit client',
  //     requiresAuth: true
  //   },
  //   path: '/client/:id',
  //   name: 'client.edit',
  //   component: () => import(/* webpackChunkName: "client-form" */ '../views/ClientForm.vue'),
  //   props: true
  // }
  {
    meta: {
      title: 'Customer & Supplier Profile',
      requiresAuth: true
    },
    path: '/customer_supplier_profile/:type/:mode',
    name: 'customer_supplier_profile',
    component: CustomerSupplierProfile,
    props: true
  },
  {
    meta: {
      title: 'Product & Service Profile',
      requiresAuth: true
    },
    path: '/product/:type/:mode',
    name: 'product_service_profile',
    component: ProductServiceProfile,
    props: true
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  // mode: 'history',
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // login required
    if (store.getters.isUserAuthenticated !== true) {
      next({ name: 'login' })
    } else {
      // console.log('Auth succeeded')
      next()
    }
  } else {
    next()
  }
})

export default router
