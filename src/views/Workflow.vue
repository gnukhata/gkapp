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
    </b-container>
    <b-row v-else no-gutters>
      <!-- Left Pane: Workflow Selection & Corresponding Data list -->
      <b-col cols="12" md="4" lg="3" ref="col-left" class="d-none d-md-block d-block">
        <b-card no-body>
            <b-overlay :show="isLoading" blur no-wrap rounded="lg"></b-overlay>
            <!-- Workflow Selection & Filter -->
            <b-card-header>
              <!-- Drop down 1: Worflow selection -->
               <b-dropdown :variant="activeWorkflow.color" class="mr-3" dropright>
                 <template #button-content>
                   <b-icon :icon="activeWorkflow.icon"></b-icon> {{activeWorkflow.name}}
                 </template>
                <b-dropdown-item v-for="(tab, tabName, index1) in options.tabs" :key="index1" @click.prevent="setActiveWorkflow(index1, tabName, tab.icon)">
                  <b-icon :icon="tab.icon"></b-icon> {{tabName}}
                </b-dropdown-item>
              </b-dropdown>
              <!-- Drop down 2: Filter -->
              <b-dropdown class="float-right" variant="link" toggle-class="text-decoration-none" dropleft no-caret>
                <template #button-content>
                  <b-icon icon="funnel"></b-icon><span class="sr-only">Filter</span>
                </template>
                <b-dropdown-form form-class="px-2">
                  <b-form-checkbox v-model="filter.isActive" name="filter-apply-button" switch size="sm">
                    Apply Filters
                  </b-form-checkbox>
                  <hr>
                  <b-form-group label="Items" label-for="filter-form-item" @submit.stop.prevent>
                    <b-form-select
                      v-model="filter.item"
                      :options="activeTabOptions.filters.items"
                      id="filter-form-item"
                      value-field="props"
                      size="sm">
                    </b-form-select>
                  </b-form-group>
                  <b-form-group label="Property" label-for="filter-form-property" @submit.stop.prevent>
                    <b-form-select
                      v-model="filter.property"
                      :options="activeTabOptions.filters.properties"
                      id="filter-form-property"
                      value-field="props"
                      size="sm">
                    </b-form-select>
                  </b-form-group>
                  <b-form-group label="Sort">
                    <b-form-radio-group
                      size="sm"
                      button-variant="outline-primary"
                      buttons
                      v-model="filter.isAscending"
                      aria-describedby="Sort by Ascending or Descending"
                      name="filter-form-sort">
                      <b-form-radio :value="true">ASC</b-form-radio>
                      <b-form-radio :value="false">DES</b-form-radio>
                    </b-form-radio-group>
                  </b-form-group>
                </b-dropdown-form>
              </b-dropdown>
            </b-card-header>
            <!-- Worflow Data List -->
            <div v-for="(tab, tabName, index1) in options.tabs" :key="index1" :class="{'d-none' : (activeWorkflow.index !== index1)}">
              <b-list-group :style="{height: listHeight + 'px', overflowY: 'auto'}">
                <b-list-group-item @click.prevent="setSelectedEntity(item[tab.key])" button v-for="(item, index3) in filteredData" :key="index3">{{item[tab.key]}}</b-list-group-item>
              </b-list-group>
              <b-button :to="tab.to" class="btn shadow position-absolute" :style="{ bottom: '30px', right: '30px', zIndex: 2}">
                <b-icon icon="plus-circle"></b-icon>
              </b-button>
            </div>
        </b-card>
      </b-col>
      <!-- Right Pane: Selected Workflow item's Data  -->
      <b-col cols="12" md="8" lg="9" ref="col-right" class="d-none d-md-block">
        <b-card no-body :style="{height: '100%', overflowY: 'auto'}" :class="{'ml-1': (!isMobileView)}">
          <template #header v-if="selectedEntity !== null">
            <b-button @click.prevent="unsetSelectedEntity" class="d-md-none"><b-icon icon="arrow-left"></b-icon></b-button>
            <h6 class="m-2 d-inline-block">{{selectedEntity}}</h6>
          </template>
          <!-- Body -->
          <div :style="{height: (listHeight) + 'px', overflowY: 'auto'}">
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
      filter: {
        item: {},
        property: {},
        isAscending: true,
        isActive: false
      },
      options: {
        tabs: {
          'Contacts': { 
            icon: 'person-lines-fill',
            color: 'primary',
            data: [],
            key: 'custname',
            to: { name: 'Contact_Details', params: { mode: 'create' } },
            filters: {
              items: [
                {
                  text: 'All',
                  props: {}
                },
                {
                  text: 'Customers',
                  props: { key: 'csflag', value: true }
                },
                {
                  text: 'Suppliers',
                  props: { key: 'csflag', value: false }
                }
              ],
              properties: [
                {
                  text: 'None',
                  props: {}
                },
                {
                  text: 'Name',
                  props: { key: 'custname' }
                }
              ]
            }
          },
          'Business': {
            icon: 'box-seam',
            color: 'warning',
            data: [],
            key: 'productdesc',
            to: { name: 'Business_Details', params: { mode: 'create' } },
            filters: {
              items: [
                {
                  text: 'All',
                  props: {}
                },
                {
                  text: 'Product',
                  props: { key: 'gsflag', value: 7 }
                },
                { 
                  text: 'Service',
                  props: { key: 'gsflag', value: 19 }
                },
              ],
              properties: [
                {
                  text: 'None',
                  props: {}
                },
                {
                  text: 'Name',
                  props: { key: 'productdesc' }
                }
              ]
            }
          },
          'Transactions': {
            icon: 'receipt',
            color: 'success',
            data: [],
            filters: {
              items: [],
              properties: []
            }
          },
          'Reports': {
            icon: 'journals',
            color: 'danger',
            data: [],
            filters: {
              items: [],
              properties: []
            }
          }
        }
      }
    }
  },
  computed: {
    activeTabOptions: (self) => self.options.tabs[self.activeWorkflow.name],
    isMobileView: () => (window.innerWidth < 768),
    headerHeight: () => document.getElementById('app-header').offsetHeight,
    listHeight: (self) => window.innerHeight - (self.headerHeight + 100),
    filteredData: function () {
      let data = this.options.tabs[this.activeWorkflow.name].data
      if(this.filter.isActive === true) {
        // console.log(this.filter)
        if(this.filter.item.key !== undefined) {
          data = this.showByFilter(data, this.filter.item.key, this.filter.item.value)
        }

        if(this.filter.property.key !== undefined) {
          data = this.orderByFilter(data, this.filter.isAscending, this.filter.property.key)
        }
      }
      return data
    },
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
    orderByFilter (data, isAscending, orderBy) {
      let filteredData = []
      if(data.length) {
        let isString = isNaN(data[0][orderBy])
        let min = (isAscending) ? -1 : 1
        let max = (min === 1) ? -1 : 1
        if(isString) {
          filteredData = data.sort((A, B) => {
            let a = A[orderBy].toLowerCase(), b = B[orderBy].toLowerCase()
            if(a < b) {
              return min
            }
            if(a > b) {
              return max
            }
            return 0
          })
        } else {
          filteredData = data.sort((A, B) => {
            return max * (A[orderBy] - B[orderBy])
          })
        }
      }
      return filteredData.slice()
    },
    showByFilter (data, showBy, value) {
      return data.filter((item) => item[showBy] === value)
    },
    setActiveWorkflow (index, name, icon) {
      this.activeWorkflow = { index, name, icon, color: this.options.tabs[name].color }
      this.filter = {
        item: {},
        property: {},
        isAscending: true,
        isActive: false
      }

      if(this.activeTabOptions.filters) {
        if(this.activeTabOptions.filters.items.length) {
          this.filter.item = this.activeTabOptions.filters.items[0].props
        }
        if(this.activeTabOptions.filters.properties.length) {
          this.filter.property = this.activeTabOptions.filters.properties[0].props
        }
      }
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
    // fetch customers, suppliers, products, services list
    loadList () {
      let config = {
        headers: {
          gktoken: this.authToken
        }
      }
      const requests = [
        Axios.get(`${this.gkCoreUrl}/customersupplier?qty=custall`, config).catch(error => { return error }),
        Axios.get(`${this.gkCoreUrl}/customersupplier?qty=supall`, config).catch(error => { return error }),
        Axios.get(`${this.gkCoreUrl}/products`, config).catch(error => { return error })
      ]

      const self = this
      Promise.all([...requests]).then(([resp1, resp2, resp3]) => {
        self.isLoading = false
        
        let contacts = []

        // Customer List
        if(resp1.status === 200) {
          contacts = resp1.data.gkresult.map((item) => Object.assign({ csflag: true }, item))
        } else {
          console.log(resp1.message)
        }

        // Supplier List
        if(resp2.status === 200) {
          contacts.push(...resp2.data.gkresult.map((item) => Object.assign({ csflag: false }, item)))
          self.options.tabs['Contacts'].data = self.orderByFilter(contacts, 'asc', 'custid')
        } else {
          console.log(resp2.message)
        }

        // Products & Services List
        if(resp3.status === 200) {
          self.options.tabs['Business'].data = resp3.data.gkresult
        } else {
          console.log(resp3.message)
        }
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
    // this.loadList('custall')
    // this.loadList('supall')
    // this.psList()
    this.loadList()
  }
}
</script>
