import axios from 'axios';
const config = {
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
  fields: [
    {
      label: 'Name',
      key: 'custname',
      sortable: true
    },
  ],
  options: {
    columns: [
      {
        label: 'Name',
        value: 'custname',
      },
    ],
    columnMap: {
      custname: { label: 'Name', key: 'custname', sortable: true },
    },
  },
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
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns(orgCode) {
  // debugger;
  let columns =
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-contacts-columns`)) ||
    [];
  if (!columns.length) {
    columns = [
      {
        label: 'Name',
        key: 'custname',
        sortable: true
      },
    ];
  }
  config.fields = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-contacts-columns`,
      JSON.stringify(columns)
    );
    config.fields = columns;
  }
}

export default config;
