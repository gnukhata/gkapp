<template>
  <section class="m-1">
    <b-overlay :show="isLoading" no-wrap> </b-overlay>
    <!-- {{ details }} -->
    <!-- Close Books -->
    <b-card
      v-show="details.booksclosedflag == 0"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mt-4"
      style="max-width: 40em; margin: auto"
    >
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
      <div class="text-left"><b>Current Financial Year: </b></div>
      <!-- <div class="d-flex-inline justify-content-center"> -->
      <b-form-group
        label="Start Date"
        class="mt-3"
        label-align="right"
        label-cols="auto"
        content-cols="auto"
      >
        <b-form-datepicker
          v-model="details.yearstart"
          disabled
          :date-format-options="{
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }"
        ></b-form-datepicker>
      </b-form-group>
      <b-form-group
        label="End Date"
        label-cols="auto"
        content-cols="auto"
        label-align="right"
      >
        <b-form-datepicker
          v-model="details.yearend"
          disabled
          :date-format-options="{
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
          }"
        ></b-form-datepicker>
      </b-form-group>
      <b-button class="float-right" @click="confirm('close')" variant="dark"
        ><b-icon icon="journal"></b-icon> Close Books</b-button
      >
    </b-card>

    <!-- Roll Over -->
    <b-card
      v-show="details.booksclosedflag == 1"
      header-bg-variant="info"
      header-text-variant="light"
      style="max-width: 40em; margin: auto"
      class="mt-4"
    >
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
      <b>Current Financial Year: </b>
      <div class="d-flex">
        <b-form-datepicker
          title="Year Start"
          v-model="details.yearstart"
          disabled
          class="m-1"
          :date-format-options="{
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }"
        ></b-form-datepicker>
        <b-form-datepicker
          v-model="details.yearend"
          disabled
          class="m-1"
          :date-format-options="{
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }"
        ></b-form-datepicker>
      </div>
      <br />
      <b>New Financial Year: </b>
      <b-form-group
        label="Start Year"
        label-cols="auto"
        content-cols-md="auto"
        content-cols-lg="auto"
        class="mt-2"
      >
        <b-form-datepicker
          v-model="details.yearend"
          disabled
          :date-format-options="{
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          }"
        ></b-form-datepicker>
      </b-form-group>
      <b-form-group
        label="End Year"
        label-cols="auto"
        content-cols-md="auto"
        content-cols-lg="auto"
      >
        <b-form-datepicker placeholder="Select Date"></b-form-datepicker>
      </b-form-group>
      <b-button @click="confirm" class="mt-3" variant="info"
        ><b-icon icon="calendar-check"></b-icon> Roll Over</b-button
      >
    </b-card>
  </section>
</template>

<script>
import axios from "axios";
export default {
  name: "CloseBooks",
  data() {
    return {
      details: [],
      isLoading: true,
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
              console.log("close books");
              this.details.booksclosedflag = 1;
              // closeBooks()
            } else {
              console.log("roll over");
              this.details.booksclosedflag = 0;
              // rollOver()
            }
          }
        });
    },
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
     * Close Company books for the current financial year
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
                this.isLoading = false;
                this.updateDetails();
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
  },
  mounted() {
    this.getDetails();
  },
};
</script>
