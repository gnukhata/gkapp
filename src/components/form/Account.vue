<template>
  <div class="card" :style="{ minWidth: '300px' }">
    <b-overlay :show="isPreloading" variant="secondary" no-wrap blur>
    </b-overlay>
    <div class="card-header text-left py-2">
      <b>Create Account</b>
      <slot name="close-button"> </slot>
    </div>
    <div class="card-body pb-2">
      <b-form class="text-left" @submit.prevent="onSubmit">
        <b-form-group
          label="Group"
          label-for="acc-input-10"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <autocomplete
            size="sm"
            id="acc-input-10"
            v-model="form.group"
            :options="options.groups"
            textField="groupname"
            valueField="groupcode"
            @input="fetchSubGroups"
            required
            valueUid="id"
          ></autocomplete>
        </b-form-group>
        <b-form-group
          label="Sub-Group"
          label-for="acc-input-20"
          label-cols="3"
          label-size="sm"
        >
          <autocomplete
            size="sm"
            id="acc-input-20"
            v-model="form.subGroup"
            :options="subGroups"
            textField="subgroupname"
            valueField="groupcode"
            @input="onSubGroupSelect"
            required
            valueUid="id"
            :readonly="!subGroups.length || flags.newSubGroup"
          ></autocomplete>
        </b-form-group>
        <b-card body-class="p-2" class="mb-3" bg-variant="light">
          <b-form-checkbox
            v-model="flags.newSubGroup"
            class="mb-2"
            switch
            size="sm"
            :disabled="!form.group"
            >Add New Sub-Group</b-form-checkbox
          >
          <b-collapse id="acc-collapse-10" v-model="showAddSubGroup">
            <b-form-group
              label="Sub-Group Name"
              label-for="acc-input-30"
              label-cols="4"
              label-size="sm"
            >
              <b-form-input
                type="text"
                size="sm"
                id="acc-input-30"
                v-model="newSubGroup"
              ></b-form-input>
            </b-form-group>
          </b-collapse>
        </b-card>
        <b-form-checkbox v-if="flags.gst" size="sm" class="mb-2">GST Account</b-form-checkbox>
        <b-form-checkbox v-if="defaultGroupName" size="sm" class="mb-2"
          >Set default for {{ defaultGroupName }}</b-form-checkbox
        >
        <b-form-group
          label="Account Name"
          label-for="acc-input-40"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <b-form-input type="text" size="sm" required v-model="form.name"></b-form-input>
        </b-form-group>
        <b-form-group
          label="Opening Balance"
          label-for="acc-input-50"
          label-cols="3"
          label-size="sm"
          label-class="required"
        >
          <b-form-input type="number" size="sm" required v-model="form.openingBalance" step="0.01" min="0.01"></b-form-input>
        </b-form-group>
        <hr class="my-2" />
        <div class="float-right">
          <b-button
            v-if="!hideBackButton"
            size="sm"
            class="m-1"
            variant="danger"
            @click.prevent="$router.go(-1)"
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
              v-else
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
import axios from 'axios';
import Autocomplete from '../Autocomplete.vue';
export default {
  name: 'Account',
  components: {
    Autocomplete,
  },
  data() {
    return {
      form: {
        name: '',
        group: null,
        subGroup: null,
        openingBalance: null,
        defaultFlag: false,
      },
      newSubGroup: '',
      flags: {
        default: false,
        newSubGroup: false,
        gst: false,
        moreDetails: false,
      },
      isPreloading: false,
      isLoading: false,
      subGroups: [],
      options: {
        groups: [],
        subGroups: {},
        groupNameToCode: {},
        gstGroup: 'Duties & Taxes',
        moreDetailGroups: {
          'Sundry Debtors': true,
          'Sundry Creditors for Purchase': true,
        },
        defaultGroups: {
          Bank: { name: 'Bank Transaction', code: 2 },
          Cash: { name: 'Cash Transaction', code: 3 },
          Purchase: { name: 'Purchase Transaction', code: 16 },
          Sales: { name: 'Sale Transaction', code: 19 },
          'Indirect Income': { name: 'Round Off Received', code: 181 },
          'Indirect Expense': { name: 'Round Off Paid', code: 180 },
        },
      },
    };
  },
  computed: {
    defaultGroupName: (self) => {
      let group = self.options.groupNameToCode[self.form.group];
      let subGroup = self.options.groupNameToCode[self.form.subGroup];
      if (self.options.defaultGroups[subGroup]) {
        return self.options.defaultGroups[subGroup].name;
      } else if (self.options.defaultGroups[group]) {
        return self.options.defaultGroups[group].name;
      }
      return '';
    },
    showAddSubGroup: {
      get: function () {
        return this.flags.newSubGroup && !!this.form.group;
      },
      set: function (show) {
        this.flags.newSubGroup = show;
      },
    },
  },
  props: {
    mode: {
      type: String,
      validator: function (value) {
        return ['create', 'edit'].indexOf(value) !== -1;
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
    onSubGroupSelect() {
      if (!this.form.subGroup) {
        this.flags.gst = false;
        this.flags.moreDetails = false;
        return;
      }
      let subGroupName = this.options.groupNameToCode[this.form.subGroup];
      this.flags.gst = subGroupName === this.options.gstGroup;
      this.flags.moreDetails = this.options.moreDetailGroups[subGroupName];
    },
    createSubGroup(payload) {
      return axios.post('/groupsubgroups', payload).catch((e) => {
        this.displayToast('Create Account Failed!', e.message, 'warning');
        return e;
      });
    },
    createAccount(payload) {
      return axios.post('/accounts', payload).catch((e) => {
        this.displayToast('Create Account Failed!', e.message, 'warning');
        return e;
      });
    },
    onSubmit() {
      this.isLoading = true;
      // console.log('in submit')
      const payload = this.initPayload();
      const self = this;
      // console.log(payload);

      console.log(payload);
      // return;

      if (payload.gkdata.groupcode === 'New') {
        this.createSubGroup({
          groupname: this.newSubGroup,
          subgroupof: this.form.group,
        })
          .then((resp1) => {
            if (resp1.data.gkstatus === 0) {
              payload.gkdata.groupcode = resp1.data.gkresult;
              self.displayToast(
                'Create Sub-Group Success',
                `Account: ${self.newSubGroup} was created Successfully!`,
                'success'
              );
              self.createAccount(payload).then((resp2) => {
                self.isLoading = false;
                onAccountCreated(resp2.data);
              });
            } else {
              self.displayToast(
                'Create Sub-Group Failed',
                `Could not Create Account: ${self.newSubGroup}!`,
                'warning'
              );
              self.isLoading = false;
            }
          })
          .catch((e) => {
            self.isLoading = false;
          });
      } else {
        this.createAccount(payload)
          .then((resp) => {
            self.isLoading = false;
            onAccountCreated(resp.data);
          })
          .catch((e) => {
            self.isLoading = false;
          });
      }

      function onAccountCreated(data) {
        switch (data.gkstatus) {
          case 0:
            self.displayToast(
              'Create Account Success',
              `Account: ${self.form.name} was created Successfully!`,
              'success'
            );
            self.resetForm();
            self.$emit('account-created');
            break;
          case 1:
            self.displayToast(
              'Create Account Failed',
              `Duplicate Entry, change account name and try again!`,
              'warning'
            );
            break;
          case 2:
            self.displayToast(
              'Create Account Failed',
              `Unauthorized access, please sign in and try again!`,
              'warning'
            );
            break;
          default:
            self.displayToast(
              'Create Account Failed',
              'Unable to Create Acccount, please try again later!',
              'danger'
            );
        }
      }
    },
    initPayload() {
      let payload = {
        origin: 'createaccount',
      };
      let gkdata = {
        accountname: this.form.name,
        openingbal: parseFloat(this.form.openingBalance).toFixed(2),
        groupcode: this.form.subGroup,
      };

      if(this.flags.newSubGroup) {
        if(this.newSubGroup) {
          gkdata.groupcode = 'New';
        } else {
          gkdata.groupcode = this.form.group;  
        }
      } else if (!this.form.subGroup) {
        // if subGroup is None
        gkdata.groupcode = this.form.group;
      }

      if (this.defaultGroupName) {
        let subGroupName = this.options.groupNameToCode[this.form.subGroup];
        if (this.options.defaultGroups[subGroupName]) {
          gkdata['defaultflag'] = this.options.defaultGroups[subGroupName].code;
        }
      }

      payload['gkdata'] = gkdata;
      return payload;
    },
    resetForm() {
      this.form = {
        name: null,
        group: null,
        subGroup: null,
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
    fetchSubGroups(fetchNew) {
      const groupId = this.form.group;
      if (!groupId) {
        this.form.subGroup = null;
        return;
      }
      if (!fetchNew) {
        if (this.options.subGroups[groupId]) {
          this.subGroups = this.options.subGroups[groupId];
          return;
        }
      }
      axios
        .get(`/groupDetails/${groupId}`)
        .then((resp) => {
          this.options.subGroups[groupId] = resp.data.gkresult;
          this.subGroups = this.options.subGroups[groupId];
          if (!this.subGroups.length) {
            this.flags.newSubGroup = true;
          } else {
            this.subGroups.forEach((subGroup) => {
              this.options.groupNameToCode[subGroup.groupcode] =
                subGroup.subgroupname;
            });
          }
        })
        .catch((e) => {
          this.displayToast(
            'Fetch SubGroups Data Failed!',
            e.message,
            'warning'
          );
        });
    },
    preloadData() {
      this.isPreloading = true;

      const requests = [
        axios.get('/groupsubgroups').catch((e) => {
          this.displayToast('Fetch Groups Data Failed!', e.message, 'warning');
        }),
      ];

      Promise.all([...requests])
        .then(([resp1]) => {
          this.isPreloading = false;
          if (resp1.data.gkstatus === 0) {
            this.options.groups = resp1.data.gkresult;
            this.options.groups.forEach((group) => {
              this.options.groupNameToCode[group.groupcode] =
                group.groupname;
            });
          }
        })
        .catch((e) => {
          this.isPreloading = false;
          this.displayToast('Preload Data Failed!', e.message, 'warning');
          return e;
        });
    },
  },
  mounted() {
    this.preloadData();
  },
};
</script>
