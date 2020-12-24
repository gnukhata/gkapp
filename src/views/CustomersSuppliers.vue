<template>
  <section class="section">
    <!-- <h2 class="title is-3 mb-5 has-text-centered">Customers &amp; Suppliers</h2> -->
    <b-tabs  v-model="tabChoice" class='mt-5' size="is-small" position="is-left" type="is-boxed">
        <b-tab-item label="Customers" >
            <template #header>
                <b-icon icon="account-group"></b-icon>
                <span> Customers <b-tag rounded>{{customerList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
        <b-tab-item label="Suppliers" icon="warehouse">
            <template #header>
                <b-icon icon="warehouse"></b-icon>
                <span> Suppliers <b-tag rounded>{{supplierList.length}}</b-tag> </span>
            </template>
        </b-tab-item>
    </b-tabs>
    <div  v-if="this.tabChoice == 0" class="list">
        <span v-for="customer in this.customerList" :key="customer.id" class="mx-1 my-1 tag is-primary is-light is-medium">
            <b-icon icon="account" class></b-icon>
            <span>{{customer.custname}}</span>
        </span>
    </div>
    <div v-else class="list">
        <span v-for="supplier in this.supplierList" :key="supplier.id" class="mx-1 my-1 tag is-medium is-warning">
            <b-icon icon="warehouse" class></b-icon>
            <span>{{supplier.custname}}</span>
        </span>
    </div>
  </section>
</template>

<script>
import Axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'CustomersSuppliers',
  data () {
    return {
      tabChoice: 0,
      customerList: null,
      supplierList: null
    }
  },
  computed: {
    ...mapState([
      'authToken',
      'gkCoreUrl',
      'gkTestUrl'
    ])
  },
  methods: {
    loadList (name) {
      if (name === 'custall') {
        Axios.get(`${this.gkCoreUrl}/customersupplier?qty=${name}`, {
          headers: {
            gktoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmdjb2RlIjoxLCJ1c2VyaWQiOjF9.TMPTw51qwCSp-z3U2LgpVuBKE0aPf12Y2QMnlFVleMo'
          }
        })
          .then((res) => {
            this.customerList = res.data.gkresult
          }).catch((error) => {
            console.log(error)
          })
      }
      if (name === 'supall') {
        Axios.get(`${this.gkCoreUrl}/customersupplier?qty=${name}`, {
          headers: {
            gktoken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmdjb2RlIjoxLCJ1c2VyaWQiOjF9.TMPTw51qwCSp-z3U2LgpVuBKE0aPf12Y2QMnlFVleMo'
          }
        })
          .then((res) => {
            this.supplierList = res.data.gkresult
          }).catch((error) => {
            console.log(error)
          })
      }
    }
  },
  mounted () {
    this.loadList('custall')
    this.loadList('supall')
  }
}
</script>
