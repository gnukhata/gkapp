<!-- 
Credits:
The GSTR3B summary structure was used from ErpNext's GSTR3B report (https://github.com/frappe/erpnext/blob/develop/erpnext/regional/doctype/gstr_3b_report/gstr_3b_report.html)
License: GPLv3 (https://github.com/frappe/erpnext/blob/develop/license.txt)
-->
<template>
  <section class="m-1">
    <b-overlay :show="loading">
      <b-card
        header="GSTR 3B Report"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mx-auto gkcard d-print-none"
      >
        <b-form @submit.prevent="getGst3rbJson">
          <gk-period @update="onPeriodUpdate" @validity="updateValidity">
          </gk-period>
          <b-button
            type="submit"
            size="sm"
            variant="success"
            class="float-right"
            :disabled="!periodValidity"
          >
            <b-icon class="mr-1" icon="eye-fill"></b-icon> Show
          </b-button>
        </b-form>
      </b-card>

      <div class="container-fluid mt-4">
        <div>
          <h3 class="text-center">GSTR3B-Form</h3>
          <small>
            <b> GSTIN: {{ gst_data.gstin }} </b>
          </small>
          <small>
            <b> Period: {{ gst_data.ret_period }} </b>
          </small>
          <gk-file-download
            class="float-right"
            :url="spreadSheetUrl"
            fileName="GSTR-3B"
            fileExtn="xlsx"
            :addDate="true"
            :addTimeStamp="true"
            name="Spreadsheet"
            :disabled="!datesValid"
            icon="cloud-download"
          ></gk-file-download>
        </div>

        <small class="mb-1">
          <b>
            3.1 Details of Outward Supplies and inward supplies liable to
            reverse charge
          </b>
        </small>
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0">Nature Of Supplies</th>
              <th class="border-bottom-0">Total Taxable value</th>
              <th class="border-bottom-0">Integrated Tax</th>
              <th class="border-bottom-0">Central Tax</th>
              <th class="border-bottom-0">State/UT Tax</th>
              <th class="border-bottom-0">Cess</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                (a) Outward taxable supplies(other than zero rated, nil rated
                and exempted)
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_det.txval }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_det.iamt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_det.camt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_det.samt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_det.csamt }}
              </td>
            </tr>
            <tr>
              <td>(b) Outward taxable supplies(zero rated)</td>
              <td class="right">
                {{ gst_data.sup_details.osup_zero.txval }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.osup_zero.iamt }}
              </td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="right">
                {{ gst_data.sup_details.osup_zero.csamt }}
              </td>
            </tr>
            <tr>
              <td>(b) Other outward supplies(Nil rated,Exempted)</td>
              <td class="right">
                {{ gst_data.sup_details.osup_nil_exmp.txval }}
              </td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
            </tr>

            <tr>
              <td>(d) Inward Supplies(liable to reverse charge)</td>
              <td class="right">
                {{ gst_data.sup_details.isup_rev.txval }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.isup_rev.iamt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.isup_rev.camt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.isup_rev.samt }}
              </td>
              <td class="right">
                {{ gst_data.sup_details.isup_rev.csamt }}
              </td>
            </tr>
            <tr>
              <td>(e) Non-GST outward supplies</td>
              <td class="right">
                {{ gst_data.sup_details.osup_nongst.txval }}
              </td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
              <td class="disabled"></td>
            </tr>
          </tbody>
        </table>

        <small>
          <b>
            3.2 Of the supplies shown in 3.1 (a) above, details of inter-State
            supplies made to unregisterd persons, composition taxable persons
            and UIN holders
          </b>
        </small>

        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0"></th>
              <th class="border-bottom-0">Place Of Supply (State/UT)</th>
              <th class="border-bottom-0">Total Taxable Value</th>
              <th class="border-bottom-0">Amount of Integrated Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b> Supplies made to Unregistered Persons </b></td>
              <td colspan="3"></td>
            </tr>
            <tr
              v-for="(row, index) in gst_data.inter_sup.unreg_details"
              :key="`${index}-unreg`"
            >
              <td></td>
              <td class="right">{{ stateIdToName[row.pos] }}</td>
              <td class="right">{{ row.txval }}</td>
              <td class="right">{{ row.iamt }}</td>
            </tr>
            <tr>
              <td><b> Supplies made to Composition Taxable Persons </b></td>
              <td colspan="3"></td>
            </tr>
            <tr
              v-for="(row, index) in gst_data.inter_sup.comp_details"
              :key="`${index}-comp`"
            >
              <td></td>
              <td class="right">{{ stateIdToName[row.pos] }}</td>
              <td class="right">{{ row.txval }}</td>
              <td class="right">{{ row.iamt }}</td>
            </tr>
            <tr>
              <td><b> Supplies made to UIN holders </b></td>
              <td colspan="3"></td>
            </tr>
            <tr
              v-for="(row, index) in gst_data.inter_sup.uin_details"
              :key="`${index}-uin`"
            >
              <td></td>
              <td class="right">{{ stateIdToName[row.pos] }}</td>
              <td class="right">{{ row.txval }}</td>
              <td class="right">{{ row.iamt }}</td>
            </tr>
          </tbody>
        </table>

        <small> <b> 4. Eligible ITC </b> </small>
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0">Details</th>
              <th class="border-bottom-0">Integrated Tax</th>
              <th class="border-bottom-0">Central Tax</th>
              <th class="border-bottom-0">State/UT tax</th>
              <th class="border-bottom-0">Cess</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <small>
                  <b> (A) ITC Available (whether in full or part) </b>
                </small>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>(1) Import of goods</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[0].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[0].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[0].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[0].csamt }}</td>
            </tr>
            <tr>
              <td>(2) Import of services</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[1].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[1].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[1].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[1].csamt }}</td>
            </tr>
            <tr>
              <td>
                (3) Inward supplies liable to reverse charge (other than 1 & 2
                above)
              </td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[2].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[2].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[2].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[2].csamt }}</td>
            </tr>
            <tr>
              <td>(4) Inward supplies from ISD</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[3].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[3].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[3].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[3].csamt }}</td>
            </tr>
            <tr>
              <td>(5) All other ITC</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[4].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[4].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[4].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_avl[4].csamt }}</td>
            </tr>
            <tr>
              <td>
                <small> <b> (B) ITC Reversed </b> </small>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>(1) As per rules 42 & 43 of CGST Rules</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[0].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[0].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[0].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[0].csamt }}</td>
            </tr>
            <tr>
              <td>(2) Others</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[1].iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[1].camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[1].samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_rev[1].csamt }}</td>
            </tr>
            <tr>
              <td>
                <small> <b> (C) Net ITC Available(A) - (B) </b> </small>
              </td>
              <td class="right">{{ gst_data.itc_elg.itc_net.iamt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_net.camt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_net.samt }}</td>
              <td class="right">{{ gst_data.itc_elg.itc_net.csamt }}</td>
            </tr>
            <tr>
              <td>
                <small> <b> (D) Ineligible ITC </b> </small>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>(1) As per section 17(5)</td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[0].iamt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[0].camt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[0].samt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[0].csamt }}
              </td>
            </tr>
            <tr>
              <td>(2) Others</td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[1].iamt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[1].camt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[1].samt }}
              </td>
              <td class="right">
                {{ gst_data.itc_elg.itc_inelg[1].csamt }}
              </td>
            </tr>
          </tbody>
        </table>

        <small>
          <b>
            5. Values of exempt, nil rated and non-GST inward supplies
          </b>
        </small>
        <table
          class="table table-bordered table-striped table-sm table-border-dark small"
        >
          <thead>
            <tr>
              <th class="border-bottom-0">Nature of Supplies</th>
              <th class="border-bottom-0">Inter-State Supplies</th>
              <th class="border-bottom-0">Intra-State Supplies</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                From a supplier under composition scheme, Exempt and Nil rated
              </td>
              <td class="right">
                {{ gst_data.inward_sup.isup_details[0].inter }}
              </td>
              <td class="right">
                {{ gst_data.inward_sup.isup_details[0].intra }}
              </td>
            </tr>
            <tr>
              <td>Non GST Inward Supplies</td>
              <td class="right">
                {{ gst_data.inward_sup.isup_details[1].inter }}
              </td>
              <td class="right">
                {{ gst_data.inward_sup.isup_details[1].intra }}
              </td>
            </tr>
          </tbody>
        </table>

        <div>
          <small>
            <b>
              GSTR-3B JSON
            </b>
          </small>
          <b-link
            class="float-right display-inline-block p-1"
            :href="jsonDownloadLink"
            download="GSTR_3B.json"
          >
            <b-icon icon="cloud-download"></b-icon>
          </b-link>
        </div>
        <b-form-textarea
          id="textarea"
          v-model="jsonStr"
          rows="10"
          max-rows="20"
          readonly
        ></b-form-textarea>
      </div>
    </b-overlay>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import GkFileDownload from '@/components/GkFileDownload.vue';
import GkPeriod from '@/components/GkPeriod.vue';
export default {
  components: { GkFileDownload, GkPeriod },
  name: 'Main',
  data() {
    return {
      gst_data: {
        gstin: '',
        ret_period: '',
        sup_details: {
          osup_zero: {},
          osup_nil_exmp: {},
          osup_nongst: {},
          osup_det: {},
          isup_rev: {},
        },
        inter_sup: { unreg_details: [], comp_details: [], uin_details: [] },
        itc_elg: {
          itc_avl: [{}, {}, {}, {}, {}],
          itc_net: {},
          itc_rev: [{}, {}],
          itc_inelg: [{}, {}],
        },
        inward_sup: {
          isup_details: [{}, {}],
        },
        intr_ltfee: {
          intr_details: {},
        },
      },
      fromDate: null,
      toDate: null,
      periodValidity: false,
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
      options: {
        stateIdToName: {},
      },
    };
  },
  computed: {
    jsonStr: function() {
      return typeof this.gst_data === 'object'
        ? JSON.stringify(this.gst_data, null, 4)
        : JSON.stringify({}, null, 2);
    },
    jsonDownloadLink: function() {
      let link = '';
      if (typeof this.gst_data === 'object') {
        link = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(this.gst_data)
        )}`;
      }
      return link;
    },
    datesValid: (self) => self.dateValidity.from && self.dateValidity.to,
    spreadSheetUrl: (self) => {
      return `/spreadsheet?type=gstr3b&calculateto=${self.toDate}&calculatefrom=${self.fromDate}&gstin=${self.orgGstin}&orgname=${self.orgName}`;
    },
    ...mapState(['yearStart', 'yearEnd', 'orgName']),
  },
  methods: {
    updateValidity(validity) {
      this.periodValidity = validity;
    },
    onPeriodUpdate(period) {
      this.fromDate = period.from || null;
      this.toDate = period.to || null;
    },
    resetJson() {
      this.gst_data = {
        gstin: '',
        ret_period: '',
        sup_details: {
          osup_zero: {},
          osup_nil_exmp: {},
          osup_nongst: {},
          osup_det: {},
          isup_rev: {},
        },
        inter_sup: { unreg_details: [], comp_details: [], uin_details: [] },
        itc_elg: {
          itc_avl: [{}, {}, {}, {}, {}],
          itc_net: {},
          itc_rev: [{}, {}],
          itc_inelg: [{}, {}],
        },
        inward_sup: {
          isup_details: [{}, {}],
        },
        intr_ltfee: {
          intr_details: {},
        },
      };
    },
    updateDateValidity(validity, key) {
      if (validity === null) {
        validity = true;
      }
      this.dateValidity[key] = validity;
    },
    getGst3rbJson() {
      this.resetJson();
      axios
        .get(
          `/gstreturns?type=r3b&calculateto=${this.toDate}&calculatefrom=${this.fromDate}&gstin=${this.orgGstin}`
        )
        .then((resp) => {
          if (resp.data.gkstatus === 0) {
            let result = resp.data.gkresult;
            this.gst_data = result.json;
          }
        });
    },
    getOrgDetails() {
      return Promise.all([
        axios.get('/state'),
        axios.get('/organisation'),
      ]).then((resp) => {
        let stateMap = {}; // name to id
        let stateIdToName = {};
        if (resp[0].data.gkstatus === 0) {
          resp[0].data.gkresult.forEach((state) => {
            let name = Object.values(state)[0],
              id = Object.keys(state)[0];
            stateMap[name] = id;
            stateIdToName[id] = `${name} (${id})`;
          });

          this.stateIdToName = stateIdToName;
        }

        if (resp[1].data.gkstatus === 0) {
          let data = resp[1].data.gkdata;
          let stateCode = stateMap[data.orgstate]
            ? stateMap[data.orgstate]
            : Object.keys(data.gstin)[0];
          if(stateCode < 10) {
            stateCode = `0${parseInt(stateCode)}`;
          }
          let gstin;
          if (data.gstin) {
            gstin = stateCode ? data.gstin[stateCode] : '';
          }
          this.orgGstin = gstin || '';
        }
      });
    },
    showSummary() {
      this.$router.push(
        `/gst/3b/from=${this.fromDate}&to=${this.toDate}&state=${this.state}`
      );
    },
  },
  mounted() {
    // this.fromDate = this.yearStart;
    // this.toDate = this.yearEnd;
    this.getOrgDetails().then(() => {
      this.getGst3rbJson();
    });
  },
};
</script>

<style>
.print-format {
  padding: 15mm;
  font-size: 8pt !important;
  font-family: Tahoma, sans-serif;
}
.disabled {
  background-color: #d9d9d9;
}
.right {
  text-align: right;
}

#textarea {
  font-size: 0.8em;
}
</style>
