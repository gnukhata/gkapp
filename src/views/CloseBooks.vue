<template>
  <section class="m-1">
    <!-- {{ details }} -->
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
          <div class="mr-auto">Close Books</div>
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
        label="Current Financial Year:"
      >
        <div class="row">
          <div class="col-6">
            <b-form-group
              content-cols="auto"
              id="input-group-3"
              label="From"
              label-for="date-1"
            >
              <b-input-group class="mb-3">
                <b-form-input
                  v-model="details.yearstart"
                  type="text"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-form-datepicker
                    button-only
                    right
                    locale="en-GB"
                    aria-controls="date-1"
                    disabled
                  >
                  </b-form-datepicker>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </div>
          <div class="col">
            <b-form-group
              content-cols="auto"
              id="input-group-4"
              label="To"
              label-for="date-2"
            >
              <b-input-group class="mb-3">
                <b-form-input
                  v-model="details.yearend"
                  type="text"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-form-datepicker
                    button-only
                    right
                    locale="en-GB"
                    aria-controls="date-2"
                    disabled
                  >
                  </b-form-datepicker>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </div>
        </div>
      </b-form-group>
      <b-button class="float-right" @click="confirm('close')" variant="dark">
        <b-icon icon="journal"></b-icon> Close Books
      </b-button>
    </b-card>

    <!-- Roll Over -->
    <b-card
      v-if="details.roflag == 0"
      header-bg-variant="info"
      header-text-variant="light"
      style="max-width: 40em; margin: auto"
      class="mt-4"
    >
      <b-overlay :show="isLoading" no-wrap></b-overlay>

      <template #header>
        <div class="d-flex">
          <div class="mr-auto">Roll Over</div>
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
      <b-form-group
        id="input-group-2"
        label-class="font-weight-bold"
        label="Current Financial Year:"
      >
        <div class="row">
          <div class="col-6">
            <b-form-group
              content-cols="auto"
              id="input-group-3"
              label="From"
              label-for="date-1"
            >
              <b-input-group class="mb-3">
                <b-form-input
                  v-model="details.yearstart"
                  type="text"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-form-datepicker
                    button-only
                    right
                    locale="en-GB"
                    aria-controls="date-1"
                    disabled
                  >
                  </b-form-datepicker>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </div>
          <div class="col">
            <b-form-group
              content-cols="auto"
              id="input-group-4"
              label="To"
              label-for="date-2"
            >
              <b-input-group class="mb-3">
                <b-form-input
                  v-model="details.yearend"
                  type="text"
                  disabled
                ></b-form-input>
                <b-input-group-append>
                  <b-form-datepicker
                    button-only
                    right
                    locale="en-GB"
                    aria-controls="date-2"
                    disabled
                  >
                  </b-form-datepicker>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </div>
        </div>
      </b-form-group>
      <!-- Set New Financial Year -->
      <b-form @submit.prevent="confirm">
        <b-form-group
          id="input-group-2"
          label-class="font-weight-bold"
          label="New Financial Year:"
        >
          <div class="row">
            <div class="col-6">
              <b-form-group
                content-cols="auto"
                id="input-group-3"
                label="From"
                label-for="date-1"
              >
                <b-input-group>
                  <b-form-input
                    id="setyearEnd"
                    v-model="newYearStart"
                    type="text"
                    required
                  ></b-form-input>
                  <b-input-group-append>
                    <b-form-datepicker
                      button-only
                      right
                      locale="en-GB"
                      aria-controls="start-date"
                      v-model="newYearStart"
                      @context="setYearEnd"
                      required
                    >
                    </b-form-datepicker>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </div>
            <div class="col">
              <b-form-group
                content-cols="auto"
                id="input-group-4"
                label="To"
                label-for="date-2"
              >
                <b-input-group class="mb-3">
                  <b-form-input
                    v-model="newYearEnd"
                    required
                    type="text"
                  ></b-form-input>
                  <b-input-group-append>
                    <b-form-datepicker
                      v-model="newYearEnd"
                      button-only
                      right
                      locale="en-GB"
                      aria-controls="date-2"
                      required
                    >
                    </b-form-datepicker>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </div>
          </div>
        </b-form-group>
        <b-button type="submit" class="float-right" variant="info">
          <b-icon icon="calendar-check"></b-icon> Roll Over
        </b-button>
      </b-form>
    </b-card>
    <b-alert v-if="details.roflag == 1" show variant="info"
      >Close Books &amp; Roll Over is Done for this year</b-alert
    >
  </section>
</template>

<script>
/**
 * This module implements close books & roll over functionality. Only admin can perform this
 * action.
 *
 * TODO:
 *  - Hook the functions to action buttons in confirm() method
 */
import axios from "axios";
export default {
  name: "CloseBooks",
  data() {
    return {
      details: [],
      isLoading: true,
      newYearStart: "",
      newYearEnd: "",
    };
  },
  computed: {},
  methods: {
    confirm(type) {
      this.$bvModal
        .msgBoxConfirm(`Confirm ?`, {
          centered: true,
          size: "sm",
          okVariant: "danger",
        })
        .then((val) => {
          if (val === true) {
            if (type === "close") {
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
        .get("/organisation")
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
      if (this.yearStart !== null && this.year !== "") {
        const from = this.newYearStart.split("-"); // yyyy/mm/dd
        const to = new Date(`${parseInt(from[0]) + 1}/${from[1]}/${from[2]}`);
        let end = null;
        to.setDate(to.getDate() - 1);
        end = `${to.getFullYear()}-${to.getMonth() + 1}-${to.getDate()}`;
        if (end.includes("NaN")) {
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
                this.$bvToast.toast("Close Books Complete", {
                  title: "Success",
                  variant: "success",
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
          this.$bvToast.toast(e.message + " Please Retry", {
            title: "Close Books Error",
            variant: "danger",
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
          if (r.status == 200 && r.data.gkstatus == 0) {
            switch (r.data.gkstatus) {
              case 0:
                this.$bvToast.toast("Roll Over Complete", {
                  title: "Success",
                  variant: "success",
                  solid: true,
                });
                this.getDetails();
                this.isLoading = false;
                break;
              case 3:
                this.$bvToast.toast("Error occured while processing request", {
                  title: "Server Error",
                  variant: "danger",
                  solid: true,
                });
                this.isLoading = false;
                break;
              case 4:
                this.$bvToast.toast(
                  "You don't have permissions to do this action",
                  {
                    title: "Error",
                    variant: "danger",
                    solid: true,
                  }
                );
                break;
            }
          }
        })
        .catch((e) => {
          this.isLoading = false;
          this.$bvToast.toast(e.message + " Please Retry", {
            title: "Close Books Error",
            variant: "danger",
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
