<template>
  <b-card-group deck class="mt-4">
    <!-- Most bought product/service -->
    <b-card class="shadow">
      <h5 class="ml-2 mt-4 text-secondary">
        <translate>Most Brough Product/Service</translate>
      </h5>
      <b-table
        :items="info.mostboughtprodsev"
        :fields="cusFields"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(proddesc)="d">
          <router-link :to="'/workflow/Business/' + d.item.prodcode">
            {{ d.item.proddesc }}
          </router-link>
        </template>
      </b-table>
      <template #footer>
        <b-button
          @click="$router.push('/business-details/create')"
          variant="dark float-right"
          ><translate>Add product/Service</translate></b-button
        >
      </template>
    </b-card>
    <!-- Most Valued Supplier -->
    <b-card class="shadow">
      <h5 class="ml-2 mt-4 text-secondary">
        <translate>Most Valued Supplier</translate>
      </h5>
      <b-table
        :fields="supFields"
        :items="info.topfivesuplist"
        class="table-border-dark"
        head-variant="dark"
        striped
        small
      >
        <template #cell(custname)="d">
          <router-link :to="'/workflow/Contacts/' + d.item.custid">
            {{ d.item.custname }}
          </router-link>
        </template>
      </b-table>
      <template #footer>
        <b-button
          @click="$router.push('/contact-details/create')"
          variant="dark float-right"
          ><translate>Add Supplier</translate></b-button
        >
      </template>
    </b-card>
  </b-card-group>
</template>
<script>
export default {
  name: 'MostSoldPS',
  props: {
    info: {
      type: [Array, Object],
    },
  },
  data() {
    return {
      cusFields: [
        {
          key: 'proddesc',
          label: 'Name',
        },
        {
          key: 'count',
          label: 'Invoice Count',
        },
      ],
      supFields: [
        {
          key: 'custname',
          label: 'Name',
        },
        {
          key: 'data',
          label: 'Invoice Count',
        },
      ],
    };
  },
  methods: {
    /*Let's Rename the columns with one's specified via prop `columns`*/
    renameColumns() {
      const newNames = this.info.map((obj) => {
        let newObj = {};
        newObj[this.columns[0]] = Object.values(obj)[0];
        newObj[this.columns[1]] = Object.values(obj)[1];
        return newObj;
      });
      return newNames;
    },
  },
};
</script>
