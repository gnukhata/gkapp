<template>
  <section class="container-fluid mt-2">
    <b-container fluid v-if="activeWorkflow.index === null">
      <hr>
      <b-card-group deck>
        <b-card  v-for="(tab, tabName, index) in options.tabs" :key="index"
          @click.prevent="setActiveWorkflow(index, tabName, tab.icon)"
          class="text-center"
          footer-text-variant="white"
          footer-tag="footer"
          :footer-bg-variant="tab.color"
          :border-variant="tab.color"
          style="width: 20em;">
          <b-card-text>
            <b-icon scale="4" :variant="tab.color" class="mt-4" :icon="tab.icon"></b-icon>
          </b-card-text>
          <b-card-text class="mt-4">{{tabName}}</b-card-text>
        </b-card>
      </b-card-group>
      <!-- <b-button :variant="tab.color" class="m-2" :class="[`btn-${tab.color}`]" v-for="(tab, tabName, index) in options.tabs" :key="index" size="lg" @click.prevent="setActiveWorkflow(index, tabName, tab.icon)">
        <b-icon :icon="tab.icon"></b-icon> {{tabName}}
      </b-button> -->
    </b-container>
    <b-row v-else no-gutters>
      <b-col cols="12" md="4" lg="3" ref="col-left" class="d-none d-md-block d-block">
        <b-card no-body>
            <b-overlay :show="isLoading" blur no-wrap rounded="lg"></b-overlay>
            <b-card-header>
               <b-dropdown :variant="activeWorkflow.color" class="mr-3" dropright>
                 <template #button-content>
                   <b-icon :icon="activeWorkflow.icon"></b-icon> {{activeWorkflow.name}}
                 </template>
                <b-dropdown-item v-for="(tab, tabName, index1) in options.tabs" :key="index1" @click.prevent="setActiveWorkflow(index1, tabName, tab.icon)">
                  <b-icon :icon="tab.icon"></b-icon> {{tabName}}
                </b-dropdown-item>
              </b-dropdown>
            </b-card-header>
            <div v-for="(tab, tabName, index1) in options.tabs" :key="index1" :class="{'d-none' : (activeWorkflow.index !== index1)}">
              <b-tabs small card fill>
                <b-tab no-body v-for="(cat, catName, index2) in tab.categories" :key="index2"> 
                  <template #title>
                    <b-icon :icon="cat.icon"></b-icon> {{catName}}
                    <!-- <b-badge variant="warning">{{supplierList.length}}</b-badge> -->
                  </template>
                  <b-list-group :style="{height: listHeight + 'px', overflowY: 'auto'}">
                    <b-list-group-item @click.prevent="setSelectedEntity(item[cat.key])" button v-for="(item, index3) in cat.data" :key="index3">{{item[cat.key]}}</b-list-group-item>
                  </b-list-group>
                  <b-button :to="cat.to" class="btn shadow position-absolute" :style="{ bottom: '30px', right: '30px', zIndex: 2}">
                    <b-icon icon="plus-circle"></b-icon>
                  </b-button>
                </b-tab>
              </b-tabs>
            </div>
        </b-card>
      </b-col>
      <b-col cols="12" md="8" lg="9" ref="col-right" class="d-none d-md-block">
        <b-card no-body :style="{height: '100%', overflowY: 'auto'}">
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"><b-icon icon="arrow-left"></b-icon></b-button>
            <h6 class="m-2 d-inline-block">{{selectedEntity}}</h6>
          </template>
          <div :style="{height: (listHeight + 50) + 'px', overflowY: 'auto'}">
          </div>
        </b-card>
      </b-col>
    </b-row>
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
      activeWorkflow: {
        index: null, icon: '', name: ''
      },
      customerList: [],
      supplierList: [],
      products: [],
      services: [],
      isFullPage: true,
      selectedEntity: null,
      options: {
        tabs: {
          'Contacts': { 
            icon: 'person-lines-fill',
            color: 'primary',
            categories: {
              'Customers': {
                icon: 'people-fill',
                data: [],
                key: 'custname',
                to: { name: 'Customer_Supplier', params: { type: 'customer', mode:'create' } }
              },
              'Suppliers': {
                icon: 'briefcase-fill',
                data: this.supplierList,
                key: 'custname',
                to: { name: 'Customer_Supplier', params: { type: 'supplier', mode:'create' } }
              }
            } 
          },
          'Goods & Services': {
            icon: 'box-seam',
            color: 'warning',
            categories: {
              'Goods': {
                icon: 'box',
                data: this.products,
                key: 'productdesc',
                to: { name: 'Product_Service', params: { type: 'product', mode:'create' } }
              },
              'Services': {
                icon: 'headset',
                data: this.services,
                key: 'productdesc',
                to: { name: 'Product_Service', params: { type: 'service', mode:'create' } }
              }
            }
          },
          'Transactions': {
            'icon': 'receipt',
            'color': 'success',
            categories: {}
          },
          'Reports': {
            'icon': 'journals',
            'color': 'danger',
            categories: {}
          }
        }
      }
    }
  },
  computed: {
    isMobileView: () => (window.innerWidth < 768),
    headerHeight: () => document.getElementById('app-header').offsetHeight,
    listHeight: (self) => window.innerHeight - (self.headerHeight + 150),
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
  watch: {
    customerList: function(newList) {
      this.options.tabs.Contacts.categories.Customers.data = newList
    },
    supplierList: function(newList) {
      this.options.tabs.Contacts.categories.Suppliers.data = newList
    },
    products: function(newList) {
      this.options.tabs['Goods & Services'].categories.Goods.data = newList
    },
    services: function(newList) {
      this.options.tabs['Goods & Services'].categories.Services.data = newList
    }
  },
  methods: {
    // fetch customers & suppliers list
    setActiveWorkflow (index, name, icon) {
      this.activeWorkflow = {index, name, icon, color: this.options.tabs[name].color}
    },
    setSelectedEntity (entity) {
      this.selectedEntity = entity
      this.$refs['col-left'].classList.remove('d-block')
      this.$refs['col-right'].classList.add('d-block')
    },
    unsetSelectedEntity () {
      this.selectedEntity = null
      this.$refs['col-left'].classList.add('d-block')
      this.$refs['col-right'].classList.remove('d-block')
    },
    loadList (name) {
      Axios.get(`${this.gkCoreUrl}/customersupplier?qty=${name}`, {
        headers: {
          gktoken: this.authToken
        }
      })
        .then((res) => {
          if (name === 'custall') {
            this.customerList = res.data.gkresult.reverse()
          } else {
            this.supplierList = res.data.gkresult.reverse()
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
    
    // // init workflow
    // let activeWorkflow = Object.keys(this.options.tabs)[0]
    // this.setActiveWorkflow(0, activeWorkflow, this.options.tabs[activeWorkflow].icon)
  }
}
</script>
