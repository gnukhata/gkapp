import axios from 'axios';
export default {
  icon: 'person-lines-fill',
  color: 'primary',
  data: [],
  key: 'custname',
  uidKey: 'custid',
  createNewPath: {
    name: 'Contact_Details',
    params: { mode: 'create' },
  },
  printPath: {
    name: 'Contact List',
  },
  filterBy: {
    value: [
      {
        text: 'All', // text -> Display text for this filter
        props: {}, // the properties required to perform the filter
      },
      {
        text: 'Customers',
        props: { key: 'csflag', value: true },
        icon: { name: 'person-fill' },
      },
      {
        text: 'Suppliers',
        props: { key: 'csflag', value: false },
        icon: { name: 'briefcase-fill' },
      },
    ],
    range: [],
  },
  sortBy: [
    {
      text: 'Name',
      props: { key: 'custname', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Name',
      value: { text: 'Name', props: { key: 'custname', isAsc: true } },
    },
  ],
  loadList: function() {
    const requests = [
      axios.get('/customersupplier?qty=custall').catch((error) => {
        return error;
      }),
      axios.get('/customersupplier?qty=supall').catch((error) => {
        return error;
      }),
    ];
    return Promise.all(requests).then((resp) => {
      let contacts = [];

      // Customer List
      if (resp[0].data.gkstatus === 0) {
        contacts = resp[0].data.gkresult.map((item) => {
          return Object.assign({ csflag: true, icon: 'person-fill' }, item);
        });
      }

      // Supplier List
      if (resp[1].data.gkstatus === 0) {
        contacts.push(
          ...resp[1].data.gkresult.map((item) => {
            return Object.assign(
              { csflag: false, icon: 'briefcase-fill' },
              item
            );
          })
        );
      }
      return contacts;
    });
  },
};
