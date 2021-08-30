import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'drcrid',
  createNewPath: {
    name: 'Debit_Credit_Note',
  },
  printPath: {
    name: 'Dc_Note_List',
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
      text: 'Amount',
      props: { key: 'totreduct', isAsc: true },
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
      text: 'Amount',
      value: { text: 'Amount', props: { key: 'totreduct', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'drcrno', isAsc: true } },
    },
  ],
  loadList: function() {
    return axios
      .get('/drcrnote?drcr=all')
      .then((resp) => {
        let list = [];

        // Debit Credit Note
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.drcrid,
                no: item.drcrno,
                noteName: `${item.dctypeflag === 3 ? 'Credit' : 'Debit'} Note`,
                text1: item.custname,
                text2: `₹ ${item.totreduct}`,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.drcrdate,
                dateObj: Date.parse(
                  item.drcrdate
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
