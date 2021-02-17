<template>
  <section class="ml-2 mr-2">
    <h3 class="text-muted text-center mt-2">Close Books / Roll Over</h3>
    <!-- Close Books -->
    <b-card
      header="Close Books"
      header-bg-variant="dark"
      header-text-variant="light"
    >
      <b-overlay :show="isLoading" no-wrap> </b-overlay>
      <b-row>
        <b-col sm="6">
          <b-alert show variant="dark">
            On activating this option, balances in all expense and income
            accounts will be transferred to Profit &amp; Loss or Income &amp;
            Expenditure Account and these accounts will be closed. No
            transactions can be recorded in these accounts but Ledger accounts
            can be viewed, printed.
          </b-alert>
        </b-col>
        <b-col>
          <b-form-group label="Start year" label-cols="auto">
            <b-form-datepicker
              v-model="details.yearstart"
              disabled
              class="m-2"
              :date-format-options="{
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }"
            ></b-form-datepicker>
          </b-form-group>
          <b-form-group label="End year" label-cols="auto">
            <b-form-datepicker
              v-model="details.yearend"
              class="m-2"
              disabled
              :date-format-options="{
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              }"
            ></b-form-datepicker>
          </b-form-group>
          <b-button variant="dark"
            ><b-icon icon="journal"></b-icon> Close Books</b-button
          >
        </b-col>
      </b-row>
    </b-card>
    <!-- Roll Over -->
    <b-card
      class="mt-4"
      header="Roll Over"
      header-bg-variant="info"
      header-text-variant="light"
    >
      <b-row>
        <b-overlay :show="isLoading" no-wrap> </b-overlay>
        <b-col>
          <b-alert show variant="info">
            <ul>
              <li>
                A new organization with the same name and type is created for
                the next accounting year,
              </li>
              <li>
                Every existing asset and liability account is automatically
                opened under its respective Group and Sub-Group and correct
                opening balance is brought down, in case of expense and income
                accounts these are also opened under their respective Groups and
                Sub-Groups, of course, without opening balances,
              </li>
              <li>
                The Closing Stock of the earlier year gets transferred to the
                next year as Opening Stock. This module can only be activated
                after CLOSE BOOKS is done.
              </li>
            </ul>
          </b-alert>
        </b-col>
        <b-col sm="6">
          <span>Current Financial Year</span>
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
          <span>New Financial Year</span>
          <div class="d-flex">
            <b-form-datepicker
              v-model="details.yearstart"
              disabled
              class="m-1"
              :date-format-options="{
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }"
            ></b-form-datepicker>
            <b-form-datepicker class="m-1"></b-form-datepicker>
          </div>
          <b-button class="mt-3" variant="info"
            ><b-icon icon="calendar-check"></b-icon> Roll Over</b-button
          >
        </b-col>
      </b-row>
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
  },
  mounted() {
    this.getDetails();
  },
};
</script>
