<template>
  <section>
    <b-overlay :show="loading" blur no-wrap></b-overlay>
    <b-form @submit.prevent="updateGodownInfo">
      <b-form-group label="Name">
        <b-form-input required v-model="form.goname"> </b-form-input>
      </b-form-group>
      <b-form-group label="State">
        <b-form-input v-model="form.state"> </b-form-input>
      </b-form-group>
      <b-form-group label="Address">
        <b-form-input v-model="form.goaddr"> </b-form-input>
      </b-form-group>
      <b-form-group label="Contact Person">
        <b-form-input v-model="form.contactname"> </b-form-input>
      </b-form-group>
      <b-form-group label="Contact Number">
        <b-form-input v-model="form.gocontact"> </b-form-input>
      </b-form-group>
      <b-form-group label="Designation">
        <b-form-input v-model="form.designation"> </b-form-input>
      </b-form-group>
      <div class="float-right">
        <b-button-group size="sm">
          <b-button variant="success" type="submit" class="mr-1"
            ><b-icon icon="cloud-arrow-up"></b-icon> Update</b-button
          >
          <b-button variant="danger" @click="confirm"
            ><b-icon icon="x-circle"></b-icon> Delete</b-button
          >
        </b-button-group>
      </div>
    </b-form>
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'GodownEdit',
  props: ['id'],
  data() {
    return {
      loading: false,
      form: {},
    };
  },
  computed: {
    ...mapState(['gkCoreUrl', 'authToken']),
  },
  methods: {
    confirm() {
      this.$bvModal
        .msgBoxConfirm('Confirm?', {
          centered: true,
          okVariant: 'danger',
        })
        .then((r) => {
          if (r) {
            this.deleteGodown();
          }
        });
    },
    getGodownInfo() {
      this.loading = true;
      axios
        .get(`${this.gkCoreUrl}/godown?qty=single&goid=${this.id}`, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          if (r.status == 200 && r.data.gkstatus == 0) {
            this.form = r.data.gkresult;
          }
          this.loading = false;
        })
        .catch((e) => {
          console.log(e.message);
        });
    },
    updateGodownInfo() {
      this.loading = true;
      axios
        .put(`${this.gkCoreUrl}/godown`, this.form, {
          headers: {
            gktoken: this.authToken,
          },
        })
        .then((r) => {
          switch (r.data.gkstatus) {
            case 0:
              this.$bvToast.toast('Godown Info Updated Successfully', {
                title: 'Success',
                variant: 'success',
                solid: true,
              });
              axios.post(
                `${this.gkCoreUrl}/log`,
                {
                  activity: `godown updated: ${this.form.goname}`,
                },
                {
                  headers: {
                    gktoken: this.authToken,
                  },
                }
              );
              this.$emit('godownupdate');
              this.loading = false;
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
            default:
              this.loading = false;
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
    },
    deleteGodown() {
      this.loading = true;
      axios
        .delete(`${this.gkCoreUrl}/godown`, {
          headers: {
            gktoken: this.authToken,
          },
          data: {
            goid: this.id,
          },
        })
        .then((r) => {
          if ((r.status == 200) & (r.data.gkstatus == 0)) {
            this.$bvToast.toast(`${this.form.goname} deleted`, {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
            axios
              .post(
                `${this.gkCoreUrl}/log`,
                {
                  activity: `godown deleted: ${this.form.goname}`,
                },
                {
                  headers: { gktoken: this.authToken },
                }
              )
              .then((r) => {
                console.log(r);
                this.$emit('godownupdate');
                this.$bvModal.hide('edit-godown');
                this.loading = false;
              });
          } else {
            this.$bvToast.toast('Failed to delete', {
              title: 'Success',
              variant: 'success',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            variant: 'danger',
            solid: true,
          });
        });
      this.loading = false;
    },
  },
  mounted() {
    this.getGodownInfo();
  },
};
</script>
