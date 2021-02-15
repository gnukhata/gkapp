<template>
  <section class="container-fluid">
    <h2 class="text-muted text-center mt-2 mb-2">Company Logs</h2>
    <div class="text-center mt-5">
      <b-icon
        v-if="isLoading"
        icon="arrow-clockwise"
        animation="spin"
        font-scale="4"
      ></b-icon>
    </div>
    <b-table
      busy="true"
      responsive="true"
      per-page="20"
      current-page="1"
      striped
      hover
      :items="log"
    ></b-table>
  </section>
</template>
<script>
import axios from "axios";
import { mapState } from "vuex";
export default {
  name: "Logs",
  data() {
    return {
      log: [],
      isLoading: true,
    };
  },
  computed: {
    ...mapState(["authToken"]),
  },
  methods: {
    getLogs() {
      axios
        .get("/log", {
          headers: {
            gktoken: this.authToken,
          },
        })
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
