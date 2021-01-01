<!--
  ToDo
  * Add Create Godown form
  * Add Create Product catergory form
  * Add Pre GST features
  * Add features based on gkwebapp mode config
-->
<template>
  <div>
    <title-bar :title-stack="titleStack"/>
    <section class="section">
      <div class="columns is-centered">
        <div class="column is-11-tablet is-8-desktop is-8-widescreen">
          <product-service-profile-form :mode="mode" :type="type" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ProductServiceProfileForm from '@/components/ProductServiceProfileForm'
import TitleBar from '@/components/TitleBar'
import { mapState } from 'vuex'
export default {
  name: 'ProductServiceProfile',
  components: { ProductServiceProfileForm, TitleBar },
  props: {
    type: {
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ['product', 'service'].indexOf(value) !== -1
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
    }
  },
  computed: {
    ...mapState(['userName']),
    titleStack: (self) => [self.userName, 'Product & Service Profile']
  },
  methods: {
  },
  created () {
  }
}
</script>
