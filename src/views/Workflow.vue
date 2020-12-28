<template>
  <div>
  <title-bar :title-stack="titleStack"/>
  <section class="section">
    <b-loading :is-full-page="isFullPage" v-model="isLoading" :can-cancel="true"></b-loading>
    <b-tabs multiline=true v-model="tabChoice" class='mt-5' size="is-medium" position="is-centered" expanded type="is-toggle">
        <b-tab-item aria-label="Customers Tab Selected" label="Customers">
            <template  #header>
                <b-icon icon="account-group"></b-icon>
                <span> Customers <b-tag rounded>{{customerList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
        <b-tab-item aria-label="Suppliers Tab selected" label="Suppliers" icon="warehouse">
            <template  #header>
                <b-icon icon="briefcase-account"></b-icon>
                <span> Suppliers <b-tag rounded>{{supplierList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
        <b-tab-item aria-label="Suppliers Tab selected" label="Products" icon="cart-variant">
          <template  #header>
              <b-icon icon="cart-variant"></b-icon>
              <span> Products <b-tag rounded>{{products.length}}</b-tag> </span>
          </template>
      </b-tab-item>
      <b-tab-item aria-label="Suppliers Tab selected" label="Services" icon="face-agent">
          <template  #header>
              <b-icon icon="face-agent"></b-icon>
              <span> Services <b-tag rounded>{{services.length}}</b-tag> </span>
          </template>
      </b-tab-item>
    </b-tabs>
    <!--
      Categories list
    -->
    <div  v-if="this.tabChoice == 0" class="list">
        <button class="button mb-5">
            <b-icon icon="account-plus"></b-icon>
            <span>Add Customer</span>
        </button><br>
        <span v-for="customer in this.customerList" :key="customer.id" class="mx-2 my-2 tag is-primary is-light is-medium">
            <b-icon icon="account" class></b-icon>
            <span>{{customer.custname}}</span>
        </span>
    </div>
    <div v-else-if="this.tabChoice == 1" class="list">
        <button class="button mb-5">
            <b-icon icon="briefcase-plus"></b-icon>
            <span>Add Supplier</span>
        </button><br>
        <span v-for="supplier in this.supplierList" :key="supplier.id" class="mx-2 my-2 tag is-medium is-warning">
            <b-icon icon="briefcase-account" class></b-icon>
            <span>{{supplier.custname}}</span>
        </span>
    </div>
    <div v-else-if="this.tabChoice == 2" class="list">
        <button class="button mb-5">
            <b-icon icon="cart-plus"></b-icon>
            <span>Add Product</span>
        </button><br>
        <span v-for="product in this.products" :key="product.srno" class="mx-2 my-2 tag is-medium is-link">
            <b-icon icon="cart-variant" class></b-icon>
            <span>{{product.productdesc}}</span>
        </span>
    </div>
    <div v-else-if="this.tabChoice == 3" class="list">
        <button class="button mb-5">
            <b-icon icon="face-agent"></b-icon>
            <span>Add Service</span>
        </button><br>
        <span v-for="service in this.services" :key="service.srno" class="mx-2 my-2 tag is-medium is-danger">
            <b-icon icon="face-agent" class></b-icon>
            <span>{{service.productdesc}}</span>
        </span>
    </div>
  </section>
  </div>
</template>

<script>
import Axios from 'axios'
import { mapState } from 'vuex'
import TitleBar from '@/components/TitleBar'
// import HeroBar from '@/components/HeroBar'

export default {
  name: 'CustomersSuppliers',
  components: {
    TitleBar
  },
  data () {
    return {
      tabChoice: 0,
      isLoading: true,
      customerList: [],
      supplierList: [],
      products: [],
      services: []
    }
  },
  computed: {
    ...mapState([
      'authToken',
      'gkCoreUrl',
      'userName'
    ]),
    titleStack () {
      return [
        this.userName,
        'Workflow'
      ]
    }
  },
  methods: {
    // fetch customers & suppliers list
    loadList (name) {
      Axios.get(`${this.gkCoreUrl}/customersupplier?qty=${name}`, {
        headers: {
          gktoken: this.authToken
        }
      })
        .then((res) => {
          if (name === 'custall') {
            this.customerList = res.data.gkresult
          } else {
            this.supplierList = res.data.gkresult
          }
          this.isLoading = false
        }).catch((error) => {
          console.log(error)
        })
    },
    // fetch products & services list
    psList () {
      this.isLoading = true
      Axios.get(`${this.gkCoreUrl}/products`, {
        headers: {
          gktoken: this.authToken
        }
      })
        .then((res) => {
          this.filterProducts(res.data.gkresult)
          this.isLoading = false
        }).catch((error) => {
          console.log(error)
        })
    },
    // filter products & services list & store them seperately
    filterProducts (allProducts) {
      for (const i in allProducts) {
        if (allProducts[i].gsflag === 7) {
          this.products.push(allProducts[i])
        } else {
          this.services.push(allProducts[i])
        }
      }
    }
  },
  mounted () {
    this.loadList('custall')
    this.loadList('supall')
    this.psList()
  }
}
</script>
