<template>
  <section class="m-2">
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="gkcard mx-auto shadow"
    >
      <template #header>
        <gk-cardheader
          name="Organisation"
          help-body="Select your organisation & financial year. You can also create an organisation by clicking on the <b>create organisation</b> button"
        ></gk-cardheader>
      </template>
      <b-alert show variant="dark" class="mb-2">
        <u>Demo Account Details:</u><br />
        Organisation: <b>WALLMART</b><br />
      </b-alert>
      <b-form @submit.prevent="save">
        <!--Select company area-->
        <b-form-group
          label="Organisation"
          label-align="right"
          label-size="sm"
          label-cols="4"
          label-class="required"
        >
          <b-overlay :show="isDisabled">
            <b-form-select
              v-model="orgIndex"
              v-on:change="getOrgYears"
              required
              size="sm"
            >
              <template #first>
                <b-form-select-option :value="null" disabled
                  >-- Select Organisation --</b-form-select-option
                >
              </template>
              <b-form-select-option
                v-for="(org, index) in orgList"
                :key="index"
                :value="index"
                >{{ org.orgname }} ({{ org.orgtype }})
              </b-form-select-option>
            </b-form-select>
          </b-overlay>
        </b-form-group>

        <!-- Financial Year-->
        <b-form-group
          label="Financial Year"
          label-class="required"
          label-cols="4"
          label-align="right"
          label-size="sm"
        >
          <b-overlay :show="isDisabled">
            <b-form-select v-model="orgCode" size="sm" required>
              <template #first>
                <b-form-select-option :value="null" disabled
                  >-- Select Year --</b-form-select-option
                >
              </template>
              <b-form-select-option
                v-for="(org, index) in orgYears"
                :key="index"
                :value="org.orgcode"
              >
                {{ org.yearstart }} to {{ org.yearend }}
              </b-form-select-option>
            </b-form-select>
          </b-overlay>
        </b-form-group>
        <b-button-group size="sm" class="w-100">
          <b-button
            variant="dark"
            class="pl-0 pr-0 m-1"
            size="sm"
            @click="switchServer"
          >
            <b-icon icon="cloud"></b-icon>
            Change Server
          </b-button>
          <b-button
            class="m-1 -r-0 pl-0"
            variant="dark"
            size="sm"
            :to="{ name: 'Create_Organisation' }"
          >
            <b-icon icon="person-plus"></b-icon>
            Create Organisation
          </b-button>
          <b-button
            size="sm"
            class="m-1 pr-0 pl-0"
            variant="success"
            type="submit"
            ><b-icon icon="arrow-right-circle"></b-icon> Continue</b-button
          >
        </b-button-group>
      </b-form>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
import GkCardheader from '../components/GkCardheader.vue';
export default {
  components: { GkCardheader },
  name: 'SelectOrg',
  data() {
    return {
      orgYears: [],
      orgList: [],
      orgIndex: Number,
      orgCode: Number,
      isDisabled: true,
    };
  },
  computed: {
    ...mapState(['gkCoreUrl']),
  },
  created() {
    if (
      localStorage.getItem('gkCoreUrl') == null ||
      localStorage.getItem('gkCoreUrl') == 'null'
    ) {
      this.$router.push('/server-setup');
    } else {
      this.fetchOrgs();
    }
  },
  methods: {
    save() {
      let name = this.orgList[this.orgIndex].orgname;
      let type = this.orgList[this.orgIndex].orgtype;
      // Save org name for next login
      localStorage.setItem('orgChoice', `${name} (${type})`);
      this.orgFinancialYear();
      localStorage.setItem('orgCodeChoice', this.orgCode);
      this.$router.push('/');
    },
    /**
     * Get list of companies & show them in login form for user to select
     * */
    fetchOrgs() {
      axios
        .get(`${this.gkCoreUrl}/organisations`)
        .then((response) => {
          this.orgList = response.data.gkdata;
          this.orgIndex = 0;
          this.getOrgYears();

          this.isDisabled = false; // hide the spinner
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Get Organisations',
            variant: 'danger',
          });
          this.isDisabled = false; // hide the spinner
        });
    },

    /*
     * send org name & type & get a org's financial years as objects
     */
    getOrgYears() {
      this.isDisabled = true;
      let name = this.orgList[this.orgIndex].orgname;
      let type = this.orgList[this.orgIndex].orgtype;
      // Save org name for next login
      axios
        .get(`${this.gkCoreUrl}/orgyears/${name}/${type}`)
        .then((r) => {
          if (r.status == 200) {
            this.orgYears = r.data.gkdata;
            this.orgCode = r.data.gkdata[0].orgcode;
            // Set default financial year to latest one
          }
          this.isDisabled = false;
        })
        .catch((e) => {
          console.log(e);
          this.$bvToast.toast(e.message, {
            title: 'Get Orgyears',
            variant: 'danger',
          });
          this.isDisabled = false;
        });
    },
    /* add org financial start & end year to vuex
     */
    orgFinancialYear() {
      for (let i in this.orgYears) {
        if (this.orgYears[i].orgcode === this.orgCode) {
          const ys = this.orgYears[i].yearstart;
          const ye = this.orgYears[i].yearend;
          this.$store.dispatch('setSessionStates', {
            orgYears: {
              yearStart: ys,
              yearEnd: ye,
            },
          });
        }
      }
    },
  },
};
</script>
