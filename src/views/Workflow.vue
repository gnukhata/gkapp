<template>
  <div>
  <title-bar :title-stack="titleStack"/>
  <section class="section">
    <b-loading :is-full-page="isFullPage" v-model="isLoading" :can-cancel="true"></b-loading>
    <b-tabs multiline="true" v-model="tabChoice" class='mt-5' size="is-small" position="is-left" type="is-toggle-rounded">
        <b-tab-item aria-label="Customers Tab Selected" label="Customers">
            <template  #header>
                <b-icon icon="account-group"></b-icon>
                <span> Customers <b-tag rounded>{{customerList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
        <b-tab-item aria-label="Suppliers Tab selected" label="Suppliers" icon="warehouse">
            <template  #header>
                <b-icon icon="warehouse"></b-icon>
                <span> Suppliers <b-tag rounded>{{supplierList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
        <b-tab-item aria-label="Suppliers Tab selected" label="Suppliers" icon="warehouse">
          <template  #header>
              <b-icon icon="warehouse"></b-icon>
              <span> Products <b-tag rounded>{{supplierList.length}}</b-tag> </span>
          </template>
      </b-tab-item>
      <b-tab-item aria-label="Suppliers Tab selected" label="Suppliers" icon="warehouse">
          <template  #header>
              <b-icon icon="warehouse"></b-icon>
              <span> Services <b-tag rounded>{{supplierList.length}}</b-tag> </span>
          </template>
      </b-tab-item>
    </b-tabs>
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
    <div v-else class="list">
        <button class="button mb-5">
            <b-icon icon="warehouse"></b-icon>
            <span>Add Supplier</span>
        </button><br>
        <span v-for="supplier in this.supplierList" :key="supplier.id" class="mx-2 my-2 tag is-medium is-warning">
            <b-icon icon="warehouse" class></b-icon>
            <span>{{supplier.custname}}</span>
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
      multiline: true,
      customerList: null,
      supplierList: null
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
    }
  },
  mounted () {
    this.loadList('custall')
    this.loadList('supall')
  }
}
</script>
