<template>
  <section class="container-fluid">
    <div class="d-flex justify-content-center mt-3 mb-3">
      <b-form-input
        class="border border-secondary w-75"
        type="text"
        placeholder="Search Logs"
        v-model="searchText"
      ></b-form-input>
    </div>
    <b-overlay :show="isLoading" no-wrap> </b-overlay>

    <!-- <b-icon
        v-if="isLoading"
        icon="arrow-clockwise"
        animation="spin"
        font-scale="4"
      ></b-icon> -->
    <!-- </div> -->
    <b-table
      stacked="sm"
      outlined
      small
      hover
      :items="log"
      :filter="searchText"
    ></b-table>
  </section>
</template>
<script>
import axios from "axios";
export default {
  name: "Logs",
  data() {
    return {
      log: [],
      isLoading: true,
      searchText: "",
    };
  },
  methods: {
    getLogs() {
      axios
        .get("/log")
        .then((r) => {
          if (r.status == 200) {
            switch (r.data.gkstatus) {
              case 0:
                this.log = r.data.gkresult.reverse();
                this.isLoading = false;
                break;
              case 2:
                this.$bvToast.toast("Unauthorised Access", {
                  title: "Error",
                  variant: "danger",
                  solid: true,
                });
                break;
              case 4:
                this.$bvToast.toast("You have no permission to access", {
                  title: "Error",
                  variant: "danger",
                  solid: true,
                });
                break;
              default:
                console.log(r.data.gkstatus);
            }
          }
        })
        .catch((e) => {
          console.log(e);
          this.$bvToast.toast(e.message, {
            title: e.message,
            variant: "danger",
            solid: true,
          });
        });
    },
  },
  mounted() {
    this.getLogs();
  },
};
</script>
