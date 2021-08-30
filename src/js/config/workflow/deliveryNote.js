import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'dcid',
  createNewPath: {
    name: 'Delivery_Note',
    params: {
      mode: 'create',
      invid: 0,
    },
  },
  printPath: {
    name: 'Delivery_Note_List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
      },
      {
        text: 'Sale',
        props: { key: 'csflag', value: 3 },
        icon: { name: 'cash-stack' },
      },
      {
        text: 'Purchase',
        props: { key: 'csflag', value: 19 },
        icon: { name: 'basket3' },
      },
    ],
    range: [
      {
        from: {
          text: 'From Date',
        },
        to: {
          text: 'To Date',
        },
        props: {
          key: 'dateObj',
        },
      },
    ],
  },
  sortBy: [
    {
      text: 'Date',
      props: { key: 'dateObj', isAsc: true },
    },
    {
      text: 'Name',
      props: { key: 'custname', isAsc: true },
    },
    {
      text: 'No.',
      props: { key: 'dcno', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Date',
      value: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
    },
    {
      text: 'Customer',
      value: { text: 'Customer', props: { key: 'custname', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'dcno', isAsc: true } },
    },
  ],
  loadList: function() {
    return axios
      .get('/delchal?delchal=all')
      .then((resp) => {
        let list = [];
        // Delivery Note
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.dcid,
                no: item.dcno,
                noteName: `Delivery Note`,
                text1: item.custname,
                text2: item.dcno,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.dcdate,
                dateObj: Date.parse(
                  item.dcdate
                    .split('-')
                    .reverse()
                    .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                ),
              },
              item
            );
          });
        }
        return list;
      })
      .catch((error) => {
        return error;
      });
  },
};
