import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login.vue'
import OrgProfile from '@/views/OrgProfile.vue'
import Logs from '@/views/Logs.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/orgprofile',
    name: 'Organisation Profile',
    component: OrgProfile
  },
  {
    path: '/logs',
    name: 'Organisation Logs',
    component: Logs
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/Home.vue')
  },
  {
    path: '/createorg',
    name: 'Create_Organisation',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "createorg" */ '../views/CreateOrganisation.vue')
  },
  {
    path: '/workflow',
    name: 'Workflow',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "workflow" */ '../views/Workflow.vue')
  },
  {
    path: '/contact_details/:mode',
    name: 'Contact_Details',
    component: () => import(/* webpackChunkName: "contact_details" */ '../views/ContactDetails.vue'),
    props: true
  },
  {
    path: '/business_details/:mode',
    name: 'Business_Details',
    component: () => import(/* webpackChunkName: "business_details" */ '../views/BusinessDetails.vue'),
    props: true
  },
  {
    path: '/invoice',
    name: 'Invoice',
    component: () => import(/* webpackChunkName: "invoice" */ '../views/Invoice.vue'),
    props: true
  }
]

const router = new VueRouter({
  routes
})

export default router
