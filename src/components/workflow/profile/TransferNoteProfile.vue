<template>
  <b-container fluid>
    <b-row>
      <b-col class="pl-0" order="2" order-md="1">
        <b-container fluid>
          <b-col class="px-0">
            <h5>Transfer From</h5>
            <b>{{ godown.from.name }}</b
            ><br />
            <span>{{ godown.from.addr }}</span
            ><br />
            <span>{{ godown.from.state }}</span
            ><br />
            <br />
          </b-col>
          <b-col class="px-0">
            <h5>Transfer To</h5>
            <b>{{ godown.to.name }}</b
            ><br />
            <span>{{ godown.to.addr }}</span
            ><br />
            <span>{{ godown.to.state }}</span
            ><br /><br />
          </b-col>
        </b-container>
      </b-col>
      <b-col cols="12" md="6" order="1" order-md="2">
        <h5>Transfer Note Details</h5>
        <b-form-group
          label="No"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.no }}
        </b-form-group>
        <b-form-group
          label="Date"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.date }}
        </b-form-group>
        <b-form-group
          label="No. of Packages"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.packageCount }}
        </b-form-group>
        <b-form-group
          label="Trasported By"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.transportMode }}
        </b-form-group>
        <b-form-group
          label="Grace Period"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.gracePeriod }}
          {{ tnote.gracePeriod > 1 ? 'Days' : 'Day' }}
        </b-form-group>
        <b-form-group
          label="Expected Receipt Date"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          {{ tnote.dueDate }}</b-form-group
        >
        <b-form-group
          label="Actual Receipt Date"
          label-for="tnp-input-10"
          label-cols="5"
          label-size="sm"
          class="mb-0"
        >
          <gk-date
            id="cmd-date-1"
            :format="dateFormat"
            v-model="tnote.rdate"
            :min="minDate"
            :required="true"
            v-if="!tnote.recieved"
          ></gk-date>
          <span v-else>{{ tnote.rdate }}</span>
        </b-form-group>
        <br />
      </b-col>
    </b-row>
    <b-table-lite
      :items="tnote.products"
      :fields="tableFields"
      bordered
      head-variant="dark"
    ></b-table-lite>
    <b-button
      v-if="!tnote.recieved"
      @click.prevent="onSubmit"
      size="sm"
      variant="success"
    >
      Approve
    </b-button>
  </b-container>
</template>

<script>
import axios from 'axios';
import GkDate from '../../GkDate.vue';
export default {
  name: 'TransferNoteProfile',
  components: {
    GkDate,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    pdata: {
      type: Object,
      required: true,
    },
    onUpdate: {
      type: Function,
      required: false,
      note: `Run after every update of Invoice, as a callback.
      Used to update the data used in workflow.`,
    },
  },
  data() {
    return {
      tableFields: [
        {
          key: 'name',
          label: 'Item',
        },
        { key: 'qty', label: 'Qty' },
      ],
      tnote: {
        no: '',
        gracePeriod: '',
        recieved: false,
        rdate: '',
        date: '',
        dueDate: '',
        products: [],
        designation: '',
        issuer: '',
        packageCount: '',
        transportMode: '',
      },
      godown: {
        from: {
          name: '',
          addr: '',
          id: '',
          state: '',
        },
        to: {
          name: '',
          addr: '',
          id: '',
          state: '',
        },
      },
    };
  },
  computed: {
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    minDate: (self) =>
      self.dateFormat === 'dd-mm-yyyy'
        ? self.tnote.date
        : self.reverseDate(self.tnote.date),
  },
  methods: {
    onSubmit() {
      const payload = {
        transfernoteid: this.id,
        recieveddate: this.tnote.rdate,
      };
      axios.put('/transfernote?received=true', payload).then((resp) => {
        if (resp.data.gkstatus === 0) {
          this.displayToast(
              `Success`,
              `Transfer Note ${this.tnote.no} was successfully approved!`,
              'success'
            );
          this.fetchAndUpdateData();
        }
      });
    },
    reverseDate(date) {
      return date ? date.split('-').reverse().join('-') : '';
    },
    formatDetails(details) {
      this.saleFlag = details.psflag === 19;

      this.tnote = {
        no: details.transfernoteno,
        date: details.transfernotedate,
        dueDate: details.duedate,
        gracePeriod: details.grace,
        recieved: details.recieved,
        rdate: details.receiveddate,
        products: [],
        designation: details.designation,
        issuer: details.issuername,
        packageCount: details.nopkt,
        transportMode: details.transportationmode,
      };

      this.godown.from = {
        name: details.fromgodown,
        addr: details.fromgodownaddr,
        id: details.fromgodownid,
        state: details.fromgodownstate,
      };

      this.godown.to = {
        name: details.togodown,
        addr: details.togodownaddr,
        id: details.togodownid,
        state: details.togodownstate,
      };

      this.tnote.products = [];
      for (const name in details.productdetails) {
        const item = details.productdetails[name];
        this.tnote.products.push({
          name: item.productdesc,
          qty: item.qty,
          unit: item.unitname,
        });
      }
    },
    getDetails() {
      return axios
        .get(`/transfernote?tn=single&transfernoteid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Transfer Note Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    fetchAndUpdateData() {
      this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            // this.formatInvoiceDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            this.formatDetails(response.data.gkresult);
            break;
          case 2:
            this.displayToast(
              `Fetch Transfer Note Error!`,
              `Unauthorized access, Please contact admin`,
              'warning'
            );
            break;
          default:
            this.displayToast(
              `Fetch Transfer Note Error!`,
              `Unable to Fetch Transaction Details! Please Try after sometime.`,
              'warning'
            );
        } // end switch
      });
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  },
  watch: {
    id: function () {
      this.fetchAndUpdateData();
    },
  },
  mounted() {
    if (this.id) {
      this.fetchAndUpdateData();
    }
  },
};
</script>