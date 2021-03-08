<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="card-header text-left py-2">
      <b>Create Godown</b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2">
      <b-form class="text-left" @submit.prevent="onSubmit">
        <b-row>
          <b-col cols="12" :md="inOverlay ? 12 : 6" lg="6">
            <b-form-group
              label-size="sm"
              label="Name"
              label-for="go-input-1"
              label-cols="3"
              label-class="required"
            >
              <b-form-input
                size="sm"
                id="go-input-1"
                placeholder="Godown Name"
                v-model="form.name"
                trim
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="State"
              label-for="go-input-2"
              label-cols="3"
              label-class="required"
            >
              <b-form-select
                id="go-input-2"
                v-model="form.state"
                :options="options.states"
                required
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Address"
              label-for="go-input-3"
              label-cols="3"
              label-class="required"
            >
              <b-form-textarea
                id="go-input-3"
                v-model="form.address"
                size="sm"
                rows="2"
                max-rows="3"
                required
              >
              </b-form-textarea>
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group
              label-size="sm"
              label="Contact Person"
              label-for="go-input-4"
              label-cols="3"
            >
              <b-form-input
                size="sm"
                id="go-input-4"
                placeholder="Contact Person"
                v-model="form.contactPerson"
                trim
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-size="sm"
              label="Contact Number"
              label-for="ci-input-5"
              label-cols="3"
              invalid-feedback="Require 10 digit number"
            >
              <b-form-input
                size="sm"
                id="go-input-5"
                type="number"
                v-model="form.contactNumber"
              ></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <hr class="my-2" />
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            :to="{ name: 'Workflow' }"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-left"
            ></b-icon>
            <span class="align-middle"> Back</span>
          </b-button>
          <b-button
            size="sm"
            class="m-1"
            variant="warning"
            @click.prevent="resetForm"
          >
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="arrow-repeat"
            ></b-icon>
            <span class="align-middle"> Reset</span>
          </b-button>
          <b-button size="sm" type="submit" class="m-1" variant="success">
            <b-spinner v-if="isLoading" small></b-spinner>
            <b-icon
              aria-hidden="true"
              class="align-middle"
              icon="plus-square"
            ></b-icon>
            <span class="align-middle"> Save</span>
          </b-button>
        </div>
      </b-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Godown",
  data() {
    return {
      form: {
        name: null,
        address: null,
        state: null,
        contactNumber: null,
        contactPerson: null,
      },
      isPreloading: false,
      isLoading: false,
      options: {
        states: [],
      },
    };
  },
  computed: {},
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ["create", "edit"].indexOf(value) !== -1;
      },
      required: true,
    },
    onSave: {
      type: Function,
      required: false,
    },
    hideBackButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    inOverlay: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    onSubmit() {
      this.isLoading = true;
      // console.log('in submit')
      const payload = this.initPayload();
      // console.log(payload);
      axios
        .post("/godown", payload)
        .then((response) => {
          // console.log(response)
          this.isLoading = false;
          switch (response.data.gkstatus) {
            case 0:
              {
                this.$bvToast.toast(`Godown created successfully`, {
                  title: `Create Godown Error!`,
                  autoHideDelay: 3000,
                  variant: "success",
                  appendToast: true,
                  solid: true,
                });

                // === Server Log ===
                let logdata = { activity: "" };
                logdata.activity = payload.goname + " godown created";
                axios.post("/log", logdata);

                // only reset form on success, otherwise leave it as is so that user may edit their input and try again
                this.resetForm();
              }
              break;
            case 1:
              this.$bvToast.toast(
                `Godown entry already exists! (Please check Name)`,
                {
                  title: `Create Godown Error!`,
                  autoHideDelay: 3000,
                  variant: "warning",
                  appendToast: true,
                  solid: true,
                }
              );
              break;
            case 2:
              this.$bvToast.toast(`Unauthorized access, Please contact admin`, {
                title: `Create Godown Error!`,
                autoHideDelay: 3000,
                variant: "warning",
                appendToast: true,
                solid: true,
              });
              break;
            default:
              this.$bvToast.toast(`Unable to create Godown, Please try again`, {
                title: `Create Godown Error!`,
                autoHideDelay: 3000,
                variant: "danger",
                appendToast: true,
                solid: true,
              });
          } // end switch
          if (this.onSave) {
            this.onSave(response.data);
          }
        })
        .catch((error) => {
          this.$bvToast.toast(`Error: ${error.message}`, {
            title: `Create Godown Error!`,
            autoHideDelay: 3000,
            variant: "warning",
            appendToast: true,
            solid: true,
          });
        });
    },
    initPayload() {
      return {
        goname: this.form.name,
        goaddr: this.form.address,
        state: this.form.state.name,
        gocontact: this.form.contactPerson || "",
        contactname: this.form.contactNumber || "",
      };
    },
    resetForm() {
      this.form = {
        name: null,
        address: null,
        state: null,
        contactNumber: null,
        contactPerson: null,
      };
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
    preloadData() {
      this.isPreloading = true;
      axios
        .get("/state")
        .then((resp) => {
          this.isPreloading = false;
          if (resp.data.gkstatus === 0) {
            this.options.states = resp.data.gkresult.map((item) => {
              const name = Object.values(item)[0];
              let code = Object.keys(item)[0] + "";
              if (code.length < 2) {
                code = "0" + code;
              }

              return {
                text: name,
                value: {
                  name: name,
                  code: code,
                },
              };
            });
          } else {
            this.displayToast(
              "Preload Data Failed!",
              "Error fetching State List, please try again after sometime.",
              "warning"
            );
          }
        })
        .catch((error) => {
          this.displayToast("Preload Data Failed!", error.message, "warning");
          return error;
        });
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>

