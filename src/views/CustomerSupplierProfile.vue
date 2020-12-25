<!-- 
    ToDo
    * Add accessibility support
    * Upgrade the GSTIN field to include multiple GSTIN
    * Add delete feature
    * Enquire about Tin field in the params to  API
 -->
<template>
  <div>
    <title-bar :title-stack="titleStack"/>
    <section class="section">
      <div class="columns is-centered">
        <div class="column is-11-tablet is-10-desktop is-8-widescreen">
          <customer-supplier-profile-form :mode="mode" :type="type" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import CustomerSupplierProfileForm from '@/components/CustomerSupplierProfileForm'
import TitleBar from '@/components/TitleBar'
export default {
  name: 'CreateCustomerSupplier',
  components: { CustomerSupplierProfileForm, TitleBar },
  props: {
    type: {
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ['customer', 'supplier'].indexOf(value) !== -1
      },
      required: true
    },
    mode: {
      type: String,
      validator: function (value) {
        return ['create', 'edit'].indexOf(value) !== -1
      },
      required: true
    }
  },
  data () {
    return {
      titleStack: ['', 'Customer & Supplier Profile']
    }
  },
  computed: {},
  methods: {
  },
  created () {
  }
}
</script>
