<template>
  <section class="m-2">
    <!-- {{ details }} -->
    <b-card-group>
      <!-- Close Books -->
      <b-card
        v-if="details.booksclosedflag == 0"
        header-bg-variant="dark"
        header-text-variant="light"
        class="mt-4"
        style="max-width: 40em; margin: auto"
      >
        <b-overlay :show="isLoading" no-wrap></b-overlay>
        <template #header>
          <div class="d-flex">
            <div class="mr-auto"><translate>Close Books</translate></div>
            <div>
              <b-icon
                icon="question-circle"
                v-b-popover.click.blur="{
                  variant: 'dark',
                  title: 'Close Books',
                  html: 'true',
                  content:
                    'On activating this option, balances in all expense and income accounts will be transferred to Profit & Loss or Income & Expenditure Account and these accounts will be closed. No transactions can be recorded in these accounts but Ledger accounts can be viewed, printed. To <b>ROLL OVER</b> the company to new financial year, You have to close books first',
                }"
              ></b-icon>
            </div>
          </div>
        </template>
        <b-form-group
          id="input-group-2"
          label-class="font-weight-bold"
          :label="$gettext('Current Financial Year:')"
        >
          <div class="row">
            <div class="col-sm-4">
              <b-form-group
                content-cols="auto"
                id="input-group-3"
                :label="$gettext('From')"
                label-for="date-1"
              >
                <b-input-group class="mb-3">
                  <gk-date
                    :readonly="true"
                    id="cb-from"
                    v-model="details.yearstart"
                  ></gk-date>
                </b-input-group>
              </b-form-group>
            </div>
            <div class="col-sm-4">
              <b-form-group
                content-cols="auto"
                id="input-group-4"
                :label="$gettext('To')"
                label-for="date-2"
              >
                <b-input-group>
                  <gk-date id="cb-to" v-model="details.yearend"></gk-date>
                </b-input-group>
              </b-form-group>
            </div>
          </div>
        </b-form-group>
        <b-button
          :disabled="details.booksclosedflag == 1"
          class="float-right"
          @click="confirm('close')"
          variant="dark"
          size="sm"
        >
          <b-icon icon="journal"></b-icon><translate> Close Books</translate>
        </b-button>
        <b-alert v-show="details.booksclosedflag == 1" show variant="dark"
          ><translate>Close Books is done</translate></b-alert
        >
      </b-card>

      <!-- Roll Over -->
      <b-card
        header-bg-variant="dark"
        header-text-variant="light"
        class="mt-4 gkcard mx-auto"
      >
        <b-overlay :show="isLoading" no-wrap></b-overlay>

        <template #header>
          <div class="d-flex">
            <div class="mr-auto"><translate>Roll Over</translate></div>
            <div>
              <b-icon
                icon="question-circle"
                v-b-popover.click.blur="{
                  variant: 'info',
                  title: 'Roll Over',
                  content:
                    '<ul><li>A new organization with the same name and type is created forthe next accounting year,</li><li>Every existing asset and liability account is automatically opened under its respective Group and Sub-Group and correct opening balance is brought down, in case of expense and income accounts these are also opened under their respective Groups and Sub-Groups, of course, without opening balances, </li><li>The Closing Stock of the earlier year gets transferred to thenext year as Opening Stock. This module can only be activated after CLOSE BOOKS is done.</li></ul>',
                  html: true,
                }"
              ></b-icon>
            </div>
          </div>
        </template>
        <!-- Set New Financial Year -->
        <b-form @submit.prevent="confirm">
          <b-form-group
            id="input-group-2"
            label-class="font-weight-bold"
            :label="$gettext('New Financial Year:')"
          >
            <div class="row">
              <div class="col-sm-4">
                <b-form-group
                  content-cols="auto"
                  id="input-group-3"
                  :label="$gettext('From')"
                  label-for="date-1"
                >
                  <b-input-group>
                    <gk-date id="ro-from" v-model="newYearStart"></gk-date>
                  </b-input-group>
                </b-form-group>
              </div>
              <div class="col-sm-4">
                <b-form-group
                  content-cols="auto"
                  id="input-group-4"
                  :label="$gettext('To')"
                  label-for="date-2"
                >
                  <b-input-group class="mb-3">
                    <gk-date id="ro-from" v-model="newYearEnd"></gk-date>
                  </b-input-group>
                </b-form-group>
              </div>
            </div>
          </b-form-group>
          <b-button
            :disabled="details.booksclosedflag == 0"
            type="submit"
            class="float-right"
            variant="dark"
            size="sm"
          >
            <b-icon icon="calendar-check"></b-icon
            ><translate> Roll Over</translate>
          </b-button>
        </b-form>
        <b-alert v-if="details.roflag == 1" show variant="success"
          ><translate
            >Roll Over is done for this financial year</translate
          ></b-alert
        >
      </b-card>
    </b-card-group>
  </section>
</template>
<script>
/**
 * This module implements close books & roll over functionality. Only admin can perform this
 * action.
 */
import axios from 'axios';
import GkDate from '../components/GkDate.vue';
export default {
  components: { GkDate },
  name: 'CloseBooks',
  data() {
    return {
      details: [],
      isLoading: true,
      newYearStart: '',
      newYearEnd: '',
    };
  },
  computed: {},
  methods: {
    confirm(type) {
      this.$bvModal
        .msgBoxConfirm(`Confirm ?`, {
          centered: true,
          size: 'sm',
          okVariant: 'danger',
        })
        .then((val) => {
          if (val === true) {
            if (type === 'close') {
              this.closeBooks();
            } else {
              this.rollOver();
            }
          }
        });
    },
    /**
     * Fetch the company details from api & assign it to 'details' variable
     */
    getDetails() {
      axios
        .get('/organisation')
        .then((res) => {
          if (res.status == 200)
            switch (res.data.gkstatus) {
              case 0:
                this.details = res.data.gkdata;
                this.isLoading = false;
            }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    /**
     * Automatically set year end when year start date is selected by the user
     */
    setYearEnd() {
      if (this.yearStart !== null && this.year !== '') {
        const from = this.newYearStart.split('-'); // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`);
        let end = null;
        to.setDate(to.getDate() - 1);
        end = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;
        if (end.includes('NaN')) {
          this.newYearEnd = null;
        } else {
          this.newYearEnd = end;
        }
      } else {
        this.newYearEnd = null;
      }
    },
    /**
     * Close Company books for the current financial year. This function takes the user selected dates
     * and makes api request to perform close books
     */
    closeBooks() {
      this.isLoading = true;
      axios
        .get(`/rollclose?task=closebooks&financialend=${this.details.yearend}`)
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast('Close Books Complete', {
                  title: 'Success',
                  variant: 'success',
                  solid: true,
                });
                this.getDetails();
                this.isLoading = false;
                break;
              case 1:
                break;
            }
          }
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(e.message + ' Please Retry', {
            title: 'Close Books Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
    /**
     * Roll Over The company to new financial year. This function takes user selected date range &
     * makes api request to roll over the company to new financial year
     */
    rollOver() {
      this.isLoading = true;
      axios
        .get(
          `/rollclose?task=rollover&financialend=${this.newYearEnd}&financialstart=${this.newYearStart}"`
        )
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast(this.$gettext('Roll Over Complete'), {
                  title: this.$gettext('Success'),
                  variant: 'success',
                  solid: true,
                });
                this.getDetails();
                break;
              case 1:
                this.$bvToast.toast(this.$gettext('Duplicate Financial Year'), {
                  title: this.$gettext('Data Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 2:
                this.$bvToast.toast(this.$gettext('Please login to access'), {
                  title: this.$gettext('Unauthorised Access'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 3:
                this.$bvToast.toast(this.$gettext('Invalid Data'), {
                  title: this.$gettext('Data Error'),
                  variant: 'danger',
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast(
                  this.$gettext('You have no access for perform this task'),
                  {
                    title: this.$gettext('Privilige Error'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
              case 5:
                this.$bvToast.toast(
                  this.$gettext('You are not allowed to perform this action'),
                  {
                    title: this.$gettext('Action Disallowed'),
                    variant: 'danger',
                    solid: true,
                  }
                );
                break;
            }
          }
          this.isLoading = false;
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(e.message + ' Please Retry', {
            title: 'Role Over Error',
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getDetails();
  },
};
</script>
