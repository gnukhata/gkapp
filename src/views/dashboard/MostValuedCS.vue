<template>
  <b-card-group deck class="mt-4">
    <!-- Most valude customer -->
    <b-card class="shadow">
      <h5 class="ml-2 mt-4 text-secondary">
        <translate>Most Valued Customer</translate>
      </h5>
      <b-table
        :items="info.topfivecustlist"
        :fields="cusFields"
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
        <template #cell(data)="d">
          {{ gk_currency(d.item.data) }}
        </template>
      </b-table>
      <template #footer>
        <b-button
          @click="$router.push('/contact-details/create')"
          variant="dark float-right"
          ><translate>Add Customer</translate></b-button
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
  name: 'MostValuedCS',
  props: {
    info: {
      type: [Array, Object],
    },
  },
  data() {
    return {
      cusFields: [
        {
          key: 'custname',
          label: 'Name',
        },
        {
          key: 'data',
          label: 'Amount',
          sortable: true,
          class: 'gk-currency',
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
