<template>
  <section :class="show ? '' : 'd-none d-print-block'">
    <!-- org details card, appears while printing only -->
    <div class="d-flex flex-row justify-content-between m-2 bg-light">
      <div class="d-none d-print-block p-1">
        <img
          :src="orgImg"
          width="30"
          height="30"
          class="rounded d-inline-block align-top"
          alt="Logo"
        />
        <h5 class="d-inline-block ml-1">{{ orgAddress.orgname || 'N/A' }}</h5>
        <br />
        <small><b>Address: </b> {{ orgAddress.orgaddr || 'N/A' }}</small>
        <br />
        <small><b>City: </b>{{ orgAddress.orgcity || 'N/A' }}</small> <br />
      </div>
      <div>
        <small><b>Contact No: </b> {{ orgAddress.orgtelno || 'N/A' }}</small>
        <br />
        <small v-if="orgAddress.gstin != null"
          ><b>GSTIN: </b>
          {{ Object.values(orgAddress.gstin)[0] || 'N/A' }}</small
        ><br />
        <small><b>State: </b>{{ orgAddress.orgstate || 'N/A' }}</small> <br />
      </div>
      <div>
        <small><b>Date:</b> {{ dateReverse(currentDate()) }}</small
        ><br />
        <small
          ><b>Time:</b> {{ new Date().toTimeString().split(' ')[0] }}
          {{ new Date().toTimeString().split(' ')[1] }}</small
        ><br />
        <small><b>User:</b> {{ userName }}</small>
      </div>
    </div>
    <!-- <div class="text-center bg-light mb-2"> -->
    <!--   <h3>{{ orgName }}</h3> -->
    <!--   <span v-if="gstin" class="mr-1 font-weight-bold">GSTIN: </span> -->
    <!--   <span v-if="gstin" class="text-monospace">{{ gstin }}</span> -->
    <!-- </div> -->
    <slot> </slot>
    <!-- <div class="text-center"> -->
    <!--   <small v-if="!show"> -->
    <!--     Printed by User: <b>{{ userName }}</b> <i>on</i> {{ new Date() }} -->
    <!--   </small> -->
    <!-- </div> -->
  </section>
</template>

<script>
import { mapState } from 'vuex';
export default {
  props: {
    show: {
      value: [String, Boolean],
      default: false,
    },
  },
  name: 'ReportHeader',
  computed: {
    ...mapState(['orgName', 'orgImg', 'userName', 'orgAddress']),
    gstin: (self) => (self?.orgAddress.gstin ? self.orgAddress.gstin[0] : ''),
  },
};
</script>
