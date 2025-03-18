<template>
  <section :class="show ? '' : 'd-none d-print-block'">
    <!-- org details card, appears while printing only -->
    <div class="row mt-4 mx-3 p-2 border">
      <!-- col 1 -->
      <div class="col">
        <div class="d-flex">
          <img
            :src="orgImg"
            width="60"
            height="60"
            class="rounded "
            alt="Org Logo"
          >
          <div class="ml-2">
            <h6 class="font-weight-bold mt-1 mb-0">
              {{ orgAddress?.orgname || '' }}
            </h6>
            <small v-if="orgAddress?.orgaddr">
              {{ orgAddress.orgaddr }}
              <br>
            </small>
            <small v-if="orgAddress?.orgcity">
              {{ orgAddress.orgcity }}
              <br>
            </small>
            <small v-if="orgAddress?.orgstate">
              {{ orgAddress.orgstate }}
            </small>
            <small v-if="orgAddress?.orgpincode">
              {{ orgAddress.orgpincode }}
              <br>
            </small>
            <small>{{ orgAddress?.orgcountry || '' }}</small>
          </div>
        </div>
      </div>
      <!-- col 2 -->
      <div class="col">
        <small v-if="orgAddress?.orgtelno">
          <b>Phone: </b> {{ orgAddress.orgtelno }}
          <br>
        </small>
        <small v-if="orgAddress?.orgwebsite">
          <b>Website: </b> {{ orgAddress.website }}
          <br>
        </small>
        <small v-if="orgAddress?.orgemail">
          <b>Email: </b> {{ orgAddress.orgemail }}
          <br>
        </small>
        <small v-if="orgAddress?.gstin">
          <b>GSTIN: </b>
          {{ Object.values(orgAddress.gstin)[0] || '' }}
          <br>
        </small>
        <small v-if="orgAddress?.tin">
          <b>TIN: </b>
          {{ orgAddress.tin }}
          <br>
        </small>
        <small v-if="orgAddress?.orgpan">
          <b>PAN: </b>
          {{ orgAddress.orgpan }}
          <br>
        </small>
      </div>
      <!-- col 3 -->
      <div class="col">
        <small>
          <b>Date:</b> {{ dateReverse(currentDate()) }}
        </small>
        <br>
        <small>
          <b>Time:</b>
          {{ new Date().toTimeString().split(' ')[0] }}
          {{ new Date().toTimeString().split(' ')[1] }}
        </small>
        <br>
        <small>
          <b>User:</b>
          {{ userName }}
        </small>
      </div>
    </div>
    <slot />
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: {
    show: {
      type: [String, Boolean],
      default: false,
    },
  },
  name: 'ReportHeader',
  computed: {
    ...mapState(['orgName', 'orgImg', 'userName', 'orgAddress']),
    gstin: (self) => (self.orgAddress?.gstin ? self.orgAddress.gstin[0] : ''),
  },
};
</script>
