<template>
  <b-container fluid>
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <b-row>
      <b-col order="2" order-md="1">
        <b-container fluid class="pl-0">
          <b-col class="px-0">
            <h5>Dispatch From</h5>
            <b>{{ delnote.from.name }}</b> <br />
            <span>{{ delnote.from.addr }}</span
            ><br />
            <span>{{ delnote.from.state }}</span
            ><br />
            <br />
          </b-col>
          <b-col class="px-0">
            <h5>Deliver To</h5>
            <b>{{ delnote.to.name }}</b
            ><br />
            <span>{{ delnote.to.addr }}</span
            ><br />
            <span>{{ delnote.to.state }}</span
            ><br /><br />
          </b-col>
        </b-container>
      </b-col>
      <b-col class="text-md-right" cols="12" md="6" order="1" order-md="2">
        <h5>Delivery Note Details</h5>
        Date:{{ delnote.date }} <br />
        Supply Date: {{ delnote.supplyDate ? delnote.supplyDate : '-' }} <br />
        Transport By : {{ delnote.transport.mode }} <br />
        <span v-if="delnote.transport.vehicleNo">
          Vehicle No : {{ delnote.transport.vehicleNo }} <br />
        </span>
        Package Count: {{ delnote.transport.packageQty }} <br /><br />
      </b-col>
    </b-row>
    <b-table-lite
      :items="delnote.contents"
      :fields="tableFields"
      bordered
      head-variant="dark"
      stacked="sm"
      :responsive="true"
    >
    </b-table-lite>
    <b-row>
      <b-col cols="12" md="6" class="my-2" order="2" order-md="1"> </b-col>
      <b-col cols="12" md="6" class="my-2" order="1" order-md="2">
        <b-table-simple small>
          <b-thead>
            <b-tr>
              <b-th>Total</b-th>
              <b-th class="text-right">₹</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr>
              <b-th>Taxable</b-th>
              <b-td class="text-right">{{ total.taxable }}</b-td>
            </b-tr>
            <b-tr v-if="!total.isIgst">
              <b-th>CGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="!total.isIgst">
              <b-th>SGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr v-if="total.isIgst">
              <b-th>IGST</b-th>
              <b-td class="text-right">{{ total.tax }}</b-td>
            </b-tr>
            <b-tr>
              <b-th>CESS</b-th>
              <b-td class="text-right">{{ total.cess }}</b-td>
            </b-tr>
            <b-tr>
              <b-th>Delivery Note Value</b-th>
              <b-td class="text-right">{{ total.amount }}</b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </b-col>
    </b-row>
    <div class="float-right" v-if="cancelFlag">
      <b-button
        @click.prevent="onDelete"
        size="sm"
        variant="danger"
        class="mx-1"
      >
        Delete
      </b-button>
    </div>
  </b-container>
</template>

<script>
import axios from 'axios';
export default {
  name: 'DeliveryNoteProfile',
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
      isPreloading: false,
      cancelFlag: false,
      no: '',
      isSale: false,
      delnote: {
        contents: [],
        date: '',
        narration: '',
        transport: {},
        supplyDate: '',
        from: {},
        to: {},
      },
      party: {},
      total: {
        isIgst: true,
      },
    };
  },
  computed: {
    tableFields: (self) => {
      let fields = [
        {
          key: 'name',
          label: 'Item',
        },
        'qty',
        {
          key: 'rate',
          label: 'Rate',
        },
        'discount',
        { key: 'igst', label: 'IGST %' },
        { key: 'cgst', label: 'CGST %' },
        { key: 'sgst', label: 'SGST %' },
        { key: 'cess', label: 'CESS %' },
        'total',
      ];
      if (self.total.isIgst) {
        fields.splice(5, 2);
      } else {
        fields.splice(4, 1);
      }

      return fields;
    },
  },
  methods: {
    onDelete() {
      const self = this;
      const text = this.$createElement('div', {
        domProps: {
          innerHTML: `Delete Delivery Note <b>${this.no}</b>?"`,
        },
      });
      this.$bvModal
        .msgBoxConfirm(text, {
          size: 'md',
          buttonSize: 'sm',
          okVariant: 'success',
          headerClass: 'p-0 border-bottom-0',
          footerClass: 'border-top-0', // p-1
          // bodyClass: 'p-2',
          centered: true,
        })
        .then((val) => {
          if (val) {
            // return;
            axios
              .delete('/delchal?type=canceldel', {
                data: {
                  dcid: this.id,
                },
              })
              .then((resp) => {
                if (resp.data.gkstatus === 0) {
                  let type = self.isSale ? 'sale' : 'purchase';
                  let log = {
                    activity: `delivery note for ${type} deleted: ${self.no}`,
                  };
                  axios.post('/log', log);

                  self.displayToast(
                    `Delivery Note Delete success!`,
                    `Delivery Note : ${self.no}, deleted successfully.`,
                    'success'
                  );
                  this.onUpdate({ type: 'delete' });
                } else {
                  self.displayToast(
                    `Delivery Note Delete failed!`,
                    `Unable to delete Delivery Note : ${self.no}`,
                    'danger'
                  );
                }
              });
          }
        });
    },
    formatDetails(details) {
      this.no = details.delchaldata.dcno;
      this.cancelFlag = !details.delchaldata.cancelFlag;
      this.isSale = details.delchaldata.inoutflag === 15;
      this.total = {
        amount: details.delchaldata.delchaltotal,
        isIgst: details.taxname === 'IGST',
        cess: details.totalcessamt,
        tax: details.totaltaxamt,
        discount: details.totaldiscount,
        taxable: details.totaltaxablevalue,
      };
      this.delnote = {
        contents: [],
        date: details.delchaldata.dcdate,
        narration: details.delchaldata.dcnarration,
        supplyDate: details.dateofsupply,
        transport: {
          mode: details.delchaldata.modeoftransport,

          packageQty: details.delchaldata.noofpackages,
          vehicleNo: details.delchaldata.vehicleno,
        },
      };

      let party = {
        name: details.custSupDetails.custname,
        addr: details.custSupDetails.custaddr,
        state: details.custSupDetails.custsupstate,
        pin: details.custSupDetails.pincode,
      };

      let godown = {
        name: details.delchaldata.goname,
        addr: details.delchaldata.goaddr,
        state: details.delchaldata.gostate,
      };

      if (details.delchaldata.inoutflag === 15) {
        this.delnote.from = godown;
        this.delnote.to = party;
      } else {
        this.delnote.from = party;
        this.delnote.to = godown;
      }

      for (const name in details.delchalContents) {
        const item = details.delchalContents[name];
        this.delnote.contents.push({
          name: item.proddesc,
          qty: item.qty,
          rate: item.priceperunit,
          discount: item.discount,
          igst: item.taxrate,
          cgst: item.taxrate / 2,
          sgst: item.taxrate / 2,
          cess: item.cessrate,
          total: item.totalAmount,
        });
      }
    },
    getDetails() {
      return axios
        .get(`/delchal?delchal=single&dcid=${this.id}`)
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Fetch Delivery Note Error!`,
            autoHideDelay: 3000,
            variant: 'warning',
            appendToast: true,
            solid: true,
          });
        });
    },
    fetchAndUpdateData() {
      return this.getDetails().then((response) => {
        switch (response.data.gkstatus) {
          case 0:
            // this.invoice = response.data.gkresult;
            // this.formatInvoiceDetails(response.data.gkresult);
            // this.output = response.data.gkresult;
            this.formatDetails(response.data.gkresult);
            break;
          case 2:
            this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
              title: `Fetch Delivery Note Error!`,
              autoHideDelay: 3000,
              variant: 'warning',
              appendToast: true,
              solid: true,
            });
            break;
          default:
            this.$bvToast.toast(
              `Unable to Fetch Delivery Note Details! Please Try after sometime.`,
              {
                title: `Fetch Transaction Details Error!`,
                autoHideDelay: 3000,
                variant: 'warning',
                appendToast: true,
                solid: true,
              }
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
    id: function(id) {
      if (id) {
        this.isPreloading = true;
        this.fetchAndUpdateData()
          .then(() => {
            this.isPreloading = false;
          })
          .catch(() => {
            this.isPreloading = false;
          });
      }
    },
  },
  mounted() {
    if (this.id) {
      this.isPreloading = true;
      this.fetchAndUpdateData()
        .then(() => {
          this.isPreloading = false;
        })
        .catch(() => {
          this.isPreloading = false;
        });
    }
  },
};
</script>
