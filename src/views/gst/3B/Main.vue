<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        header="GSTR 3B Report"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="showSummary">
          <div class="row row-cols-auto">
            <div class="col">
              <b-form-group label="From" label-cols="auto" label-align="right">
                <gk-date
                  id="from"
                  v-model="fromDate"
                  :min="dateReverse(yearStart)"
                  :max="dateReverse(yearEnd)"
                  @validity="updateDateValidity($event, 'from')"
                ></gk-date>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group label="To" label-cols="auto" label-align="right">
                <gk-date
                  id="to"
                  v-model="toDate"
                  :min="fromDate ? dateReverse(fromDate) : ''"
                  :max="dateReverse(yearEnd)"
                  @validity="updateDateValidity($event, 'to')"
                ></gk-date>
              </b-form-group>
            </div>
          </div>
          <!-- <b-form-group label="State" label-cols="auto">
            <gk-state v-model="state"></gk-state>
          </b-form-group> -->
          <!-- <b-button
            type="submit"
            size="sm"
            variant="success"
            class="float-right"
            ><b-icon icon="eye-fill"></b-icon> Show</b-button
          > -->
          <gk-file-download
            class="float-right"
            :url="spreadSheetUrl"
            fileName="GSTR-3B"
            fileExtn="xlsx"
            :addDate="true"
            :addTimeStamp="true"
            name="Download Report"
            :disabled="!datesValid"
          ></gk-file-download>
        </b-form>
      </b-card>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import GkDate from '../../../components/GkDate.vue';
import GkState from '../../../components/GkState.vue';
import GkFileDownload from '@/components/GkFileDownload.vue';
export default {
  components: { GkDate, GkState, GkFileDownload },
  name: 'Main',
  data() {
    return {
      fromDate: null,
      toDate: null,
      loading: false,
      state: '',
      search: '',
      report: {
        data: null,
        selected: '',
        summary: null,
      },
      dateValidity: {
        from: true,
        to: true,
      },
      orgGstin: '',
      spreadSheetName: '',
    };
  },
  computed: {
    datesValid: (self) => self.dateValidity.from && self.dateValidity.to,
    spreadSheetUrl: (self) => {
      return `/spreadsheet?type=gstr3b&calculateto=${self.toDate}&calculatefrom=${self.fromDate}&gstin=${self.orgGstin}&orgname=${self.orgName}`;
    },
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    updateDateValidity(validity, key) {
      if (validity === null) {
        validity = true;
      }
      this.dateValidity[key] = validity;
    },
    getOrgDetails() {
      Promise.all([axios.get('/state'), axios.get('/organisation')]).then(
        (resp) => {
          let stateMap = {}; // name to id
          if (resp[0].data.gkstatus === 0) {
            resp[0].data.gkresult.forEach((state) => {
              let name = Object.values(state)[0],
                id = Object.keys(state)[0];
              stateMap[name] = id;
            });
          }

          if (resp[1].data.gkstatus === 0) {
            let data = resp[1].data.gkdata;
            let stateCode = stateMap[data.orgstate]
              ? stateMap[data.orgstate]
              : Object.keys(data.gstin)[0];
            let gstin;
            if (data.gstin) {
              gstin = stateCode ? data.gstin[stateCode] : '';
            }
            this.orgGstin = gstin || '';
          }
        }
      );
    },
    showSummary() {
      this.$router.push(
        `/gst/3b/from=${this.fromDate}&to=${this.toDate}&state=${this.state}`
      );
    },
  },
  mounted() {
    this.fromDate = this.yearStart;
    this.toDate = this.yearEnd;
    this.getOrgDetails();
  },
};
</script>
