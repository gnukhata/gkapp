<template>
  <section class="m-2">
    <b-alert
      v-if="gkConfig.notice"
      show
      variant="dark"
      class="mb-2 gkcard mx-auto"
    >
      Demo Organisation:
      <b>WALLMART (Profit Making)</b>
      <br />
    </b-alert>
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
      <b-form @submit.prevent="save">
        <!--Select company area-->
        <b-form-group
          :label="$gettext('Organisation')"
          label-align="right"
          label-size="sm"
          label-cols="4"
        >
          <b-overlay :show="isDisabled">
            <v-select
              @input="getOrgYears"
              :reduce="(option) => option.value"
              :options="orgList"
              v-model="selectedOrg"
              placeholder="Search Org Name"
            ></v-select>
          </b-overlay>
        </b-form-group>

        <!-- Financial Year-->
        <b-form-group
          :label="$gettext('Financial Year')"
          label-cols="4"
          label-align="right"
          label-size="sm"
        >
          <b-overlay :show="isDisabled">
            <b-form-select v-model="orgCode" size="sm" required>
              <template #first>
                <b-form-select-option :value="null" disabled
                  ><translate
                    >-- Select Year --</translate
                  ></b-form-select-option
                >
              </template>
              <b-form-select-option
                v-for="(org, index) in orgYears"
                :key="index"
                :value="org.orgcode"
                >{{ org.yearstart }} to {{ org.yearend }}</b-form-select-option
              >
            </b-form-select>
          </b-overlay>
        </b-form-group>
        <b-button-group size="sm" class="row float-right">
          <b-button variant="dark" class="m-1" size="sm" @click="switchServer">
            <b-icon class="mr-1" icon="cloud"></b-icon>
            <translate>Change Server</translate>
          </b-button>
          <b-button
            class="m-1"
            variant="dark"
            size="sm"
            :to="{ name: 'Create_Organisation' }"
          >
            <b-icon class="mr-1" icon="person-plus"></b-icon>
            <translate>Create Organisation</translate>
          </b-button>
          <b-button size="sm" class="m-1" variant="success" type="submit">
            <b-icon class="mr-1" icon="arrow-right-circle"></b-icon>
            <translate>Continue</translate>
          </b-button>
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
      orgIndex: '',
      selectedOrg: { label: '' },
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
      let name = this.selectedOrg.orgname;
      let type = this.selectedOrg.orgtype;
      // Save org name for next login
      localStorage.setItem('orgChoice', `${name} (${type})`);
      // useful in consolidated final accounts
      localStorage.setItem('orgArray', JSON.stringify([name, type]));
      this.orgFinancialYear();
      localStorage.setItem('orgCodeChoice', this.orgCode);
      this.$router.push('/');
    },
    /**
     * Get list of companies & show them in login form for user to select
     * */
    fetchOrgs() {
      axios
        .get(`${this.gkCoreUrl}/organisation/all`)
        .then((response) => {
          this.orgList = response.data.gkdata.map((data) => {
            return {
              label: `${data.orgname} (${data.orgtype})`,
              value: {
                // label: `${data.orgname} (${data.orgtype})`,
                orgname: data.orgname,
                orgtype: data.orgtype,
              },
            };
          });
          if (this.orgList.length > 0) {
            this.selectedOrg = this.orgList[0].value;
            this.getOrgYears();
          }
          // this.getOrgYears();
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
      if (
        this.selectedOrg === null ||
        !this.selectedOrg.orgname || !this.selectedOrg.orgtype
      ) {
        this.orgCode = -1;
        return;
      }
      this.isDisabled = true;
      let name = this.selectedOrg.orgname;
      let type = this.selectedOrg.orgtype;
      // Save org name for next login
      const URL = `${this.gkCoreUrl}/orgyears/${encodeURIComponent(name)}/${type}`
      axios
        .get(URL)
        .then((r) => {
          if (r.status == 200) {
            this.orgYears = r.data.gkdata;
            this.orgCode = r.data.gkdata[0].orgcode;
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
