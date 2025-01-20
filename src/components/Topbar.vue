<template>
  <b-navbar
    size="sm"
    variant="light"
  >
    <template v-if="screenWidth < 1200">
      <sidebar v-if="userOrgAuthenticated" />
    </template>
    <b-navbar-brand class="d-flex flex-row">
      <router-link
        style="border-bottom: 0px; align-self: center"
        to="/dashboard"
        class="flex-column"
      >
        <img
          :src="orgImg"
          width="40"
          height="40"
          class="d-inline-block align-top"
          alt="logo"
        >
      </router-link>
      <div class="ml-2 d-inline-block">
        <!-- truncate org name in mobile view -->
        <div>
          <div
            v-b-tooltip.click
            class="text-sm"
            :class="{'text-truncate': is_mobile()}"
            :style="{'max-width': is_mobile() ? '6.5em' : ''}"
          >
            <span v-if="this.orgName">
              {{ this.orgName }}
            </span>
            <span v-else>
              <translate>
                GNUKhata
              </translate>
            </span>
          </div>
          <div
            style="font-size: 0.6em"
            class="font-italic"
            v-if="userOrgAuthenticated"
          >
            <!-- WARN: beware of Y3K Bug ;-)  -->
            FY {{ yearStart.split('-')[0] }} -
            {{ yearEnd.split('-')[0].slice(2, 4) }}
          </div>
        </div>
      </div>
    </b-navbar-brand>
    <!-- user menu -->
    <b-navbar-nav class="ml-auto">
      <b-nav-item-dropdown
        v-if="userOrgAuthenticated"
        id="quick-actions"
        class="mt-2"
        right
      >
        <template #button-content>
          <b-icon icon="plus-lg" /> Add
        </template>
        <b-dropdown-item to="/invoice">
          Invoice
        </b-dropdown-item>
        <b-dropdown-item to="/dc-note">
          Debit/Credit Note
        </b-dropdown-item>
        <b-dropdown-item to="/cash-memo">
          Cash Memo
        </b-dropdown-item>
        <b-dropdown-item to="/ps-order">
          Purchase/Sales Order
        </b-dropdown-item>
        <b-dropdown-item to="/transfer-note">
          Transfer Note
        </b-dropdown-item>
        <b-dropdown-item to="/voucher/create/receipt/-1">
          Voucher
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item to="/business-details/create">
          Business Items
        </b-dropdown-item>
        <b-dropdown-item to="/contact-details/create/customer">
          Contacts
        </b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown
        v-if="userAuthenticated"
        id="usermenu"
        toggle-class="nav-link-custom"
        right
      >
        <template #button-content>
          <b-avatar
            variant="dark"
            icon="person"
            :title="userName"
          />
          <span class="d-none d-md-inline"> {{ userName }} </span>
        </template>
        <!-- logout button -->
        <b-dropdown-item
          v-if="userOrgAuthenticated"
          @click="logOut"
          href="#"
        >
          <b-icon icon="box-arrow-in-left" /> Change Org
        </b-dropdown-item>
        <!-- fy switch button, only shown when org has more than one financial year -->
        <b-dropdown-item
          v-if="finYears.length > 1"
          v-b-modal.fy-modal
          href="#"
        >
          <b-icon icon="toggles" /> Switch FY
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
  </b-navbar>
</template>

<script>
import { mapState } from 'vuex';
import Sidebar from './Sidebar.vue';

export default {
  name: 'Topbar',
  props: {
    screenWidth: {
      type: Number,
      required: true,
    },
  },
  components: { Sidebar },
  computed: {
    ...mapState([
      'userName',
      'orgName',
      'orgImg',
      'userOrgAuthenticated',
      'yearStart',
      'yearEnd',
      'finYears',
    ]),
  },
}
</script>
