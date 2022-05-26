    <template>
      <div v-if="show" class="mb-3 d-flex flex-row justify-content-center">
        <div class="rounded  m-2 p-3 bg-warning">
          <div class="row">
            <div class="col">
              <b-icon icon="building" class="mr-1"></b-icon>Bank Balance:
              <b>{{ gk_currency(currentBalance.bankaccdata[0].bankbalance) }}</b>
            </div>
          </div>
        </div>
        <div class="rounded m-2 p-3 bg-success text-light">
          <div class="row">
            <div class="col">
              <b-icon icon="cash" class="mr-1"></b-icon>Cash Balance:
              <b>{{ gk_currency(currentBalance.cashaccdata[0].cashbalance) }}</b>
            </div>
          </div>
        </div>
      </div>
    </template>

    <script>
    import axios from 'axios';
    export default {
      name: 'Balance',
      data() {
        return {
          currentBalance: [],
          show: false,
        };
      },
      methods: {
        getBalances() {
          axios
            .get('/dashboard?type=cashbankaccountdata')
            .then((r) => {
              if (r.status == 200) {
                this.currentBalance = r.data;
                this.show = true;
              }
            })
            .catch((e) => {
              console.log(e);
            });
        },
      },
      created() {
        this.getBalances();
      },
    };
    </script>
