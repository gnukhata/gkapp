<template>
  <section class="container-fluid mt-2">
    <b-card no-body>
        <b-overlay :show="isLoading" blur no-wrap rounded="lg"></b-overlay>
        <b-tabs pills card fill>
            <b-tab title="Customers" active>
                <template #title>
                    <b-icon icon="people-fill"></b-icon> Customers
                    <b-badge variant="light">{{customerList.length}}</b-badge>
                </template>
                <b-card-text>
                    <!-- Add customer -->
                    <div class="row mb-2">
                      <b-button 
                        :to="{ name: 'Customer_Supplier', params: { type: 'customer', mode:'create' } }"
                        variant="primary"
                        class="m-1">
                        <b-icon icon="person-plus-fill"></b-icon> Add Customer
                      </b-button>
                    </div>
                    <!--Load customers list-->
                    <b-row>
                      <b-button v-for="customer in this.customerList" :key="customer.id" 
                      pill 
                      variant="primary"
                      class="m-1">
                      <b-icon icon="person-fill"></b-icon> {{customer.custname}}
                      </b-button>
                    </b-row>
                </b-card-text>
            </b-tab>
            <b-tab title="Suppliers">
                <template #title>
                    <b-icon icon="briefcase-fill"></b-icon> Suppliers
                    <b-badge variant="light">{{supplierList.length}}</b-badge>
                </template>
                <b-card-text>
                    <!-- Add Supplier button -->
                    <div class="row mb-2">
                      <b-button 
                        :to="{ name: 'Customer_Supplier', params: { type: 'supplier', mode:'create' } }"
                        variant="secondary"
                        class="m-1">
                        <b-icon icon="briefcase-fill"></b-icon> Add Supplier
                      </b-button>
                    </div>
                    <!--Load suppliers list-->
                    <b-row>
                    <b-button v-for="supplier in this.supplierList" :key="supplier.id" 
                    pill 
                    variant="secondary"
                    class="m-1">
                    <b-icon icon="briefcase-fill"></b-icon> {{supplier.custname}}
                    </b-button>
                    </b-row>
                </b-card-text>
            </b-tab>
            <b-tab title="Products">
                <template #title>
                    <b-icon icon="box"></b-icon> Products
                    <b-badge variant="light">{{products.length}}</b-badge>
                </template>
                <b-card-text>
                    <!-- Add Product button -->
                    <div class="row mb-2">
                        <router-link to="/workflow">
                            <b-button 
                            variant="info"
                            class="m-1">
                            <b-icon icon="box-seam"></b-icon> Add Product
                            </b-button>
                        </router-link>
                    </div>
                    <!-- Load product list -->
                    <b-row>
                    <b-button v-for="product in this.products" :key="product.srno" 
                    pill 
                    variant="info"
                    class="m-1">
                    <b-icon icon="box"></b-icon> {{product.productdesc}}
                    </b-button>
                    </b-row>
                </b-card-text>
            </b-tab>
            <b-tab title="Services">
                 <template #title>
                    <b-icon icon="headset"></b-icon> Services
                    <b-badge variant="light">{{services.length}}</b-badge>
                </template>
                <b-card-text>
                    <!-- Add Service button -->
                    <div class="row mb-2">
                        <router-link to="/workflow">
                            <b-button 
                            variant="warning"
                            class="m-1">
                            <b-icon icon="headset"></b-icon> Add Service
                            </b-button>
                        </router-link>
                    </div>
                    <!-- load services list -->
                    <b-row>
                    <b-button v-for="service in this.services" :key="service.srno" 
                    pill 
                    variant="warning"
                    class="m-1">
                    <b-icon icon="headset"></b-icon> {{service.productdesc}}
                    </b-button>
                    </b-row>
                </b-card-text>
            </b-tab>
        </b-tabs>
    </b-card>
  </section>
</template>

<script>
import Axios from 'axios'
import { mapState } from 'vuex'
// import HeroBar from '@/components/HeroBar'

export default {
  name: 'Workflow',
  data () {
    return {
      tabChoice: 0,
      isLoading: true,
      customerList: [],
      supplierList: [],
      products: [],
      services: [],
      isFullPage: true
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
