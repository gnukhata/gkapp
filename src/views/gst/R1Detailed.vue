<template>
  <section class="m-2">
    <!-- Headings -->
    <div class="text-center">
      <h4>{{ orgName }}</h4>
      <h5 class="text-muted text-center text-uppercase">
        GST R1 {{ params.type }} ({{ dateReverse(params.fd) }} to
        {{ dateReverse(params.td) }})
      </h5>
    </div>
    <div class="gkcard mx-auto">
      <b-form-input type="text" v-model="search" placeholder="Search">
      </b-form-input>
    </div>
    <!-- report  -->
    <b-table
      class="mt-3"
      head-variant="dark"
      small
      bordered
      striped
      :items="list[this.params.type]"
      responsive="sm"
      :filter="search"
      :busy="loading"
    >
      <template #table-busy>
        <div class="text-center">
          <b-spinner type="grow" class="align-middle"></b-spinner>
          <strong> Fetching data</strong>
        </div>
      </template>
      <template #cell(invoice_value)="data">
        <div class="text-right">
          {{ data.item.invoice_value }}
        </div>
      </template>
      <template #cell(taxable_value)="data">
        <div class="text-right">
          {{ data.item.taxable_value }}
        </div>
      </template>
    </b-table>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';
export default {
  name: 'R1Detailed',
  data() {
    return {
      list: [],
      search: null,
      params: null,
      loading: false,
    };
  },
  computed: {
    ...mapState(['orgName']),
  },
  methods: {
    getGstR1Report() {
      this.loading = true;
      axios
        .get(
          `/gstreturns?type=r1&start=${this.params.fd}&end=${this.params.td}`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkresult) {
              case 0:
                this.list = r.data.gkdata;
                break;
              case 1:
                this.$bvToast.toast('Duplicate Entry', {
                  variant: 'warning',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast('Unauthorised Access', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast('Data error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast('No Privilege', {
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 5:
                this.$bvToast.toast('Integrity error', {
                  variant: 'danger',
                  solid: true,
                });
                break;
            }
          } else {
            console.log(r);
          }
          this.loading = false;
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
          this.loading = false;
        });
    },
  },
  created() {
    this.params = this.$route.params;
    this.getGstR1Report();
  },
};
</script>
