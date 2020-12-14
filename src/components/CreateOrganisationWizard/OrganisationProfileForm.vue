<!--
    To do:
    ======
    1. GSTIN
    2. bankdetails
    3. GST rates
    4. Logo Upload
    5. map the input fields with the vuex state
 -->
<!-- Page 2/3 0f Organisation Creation Wizard -->
<template>
    <div>
      <div class="columns">
          <div class="column">
              <b-field label="Registration Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="FCRA Registration Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Address" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="City" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="State" horizontal>
                  <b-select v-model="stateId">
                      <option
                          v-for="(option, index) in options.indianStates"
                          :value="index"
                          :key="index">
                          {{ option }}
                      </option>
                  </b-select>
              </b-field>
              <b-field label="Country" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Postal Code" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Contact Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Website" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
          </div>
          <div class="column">
              <b-field label="Date Of Registration" horizontal>
                  <b-datepicker
                          placeholder="dd / mm / yyyy"
                          icon="calendar-today"
                          editable>
                  </b-datepicker>
              </b-field>
              <b-field label="Date Of FCRA Registration" horizontal>
                  <b-datepicker
                          placeholder="dd / mm / yyyy"
                          icon="calendar-today"
                          editable>
                  </b-datepicker>
              </b-field>
            <b-field label="Email" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Fax Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="PAN" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="VAT Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Service Tax Number" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
              <b-field label="Bank Details" horizontal>
                  <b-input icon="office-building" placeholder="ABC Organisation"></b-input>
              </b-field>
          </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'OrganisationProfileForm',
  components: {
  },
  data () {
    return {
      options: {
        indianStates: []
      },
      stateId: 0
    }
  },
  computed: {
  },
  methods: {
  },
  mounted () {
    this.$store.commit('initIndianStates')
    this.options.indianStates = this.$store.getters.getIndianStates
  }
}
</script>
