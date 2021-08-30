import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'rnid',
  createNewPath: {
    name: 'Rejection_Note',
    params: {},
  },
  printPath: {
    name: 'Rejection_Note_List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
      },
      {
        text: 'Sale',
        props: { key: 'inout', value: 15 },
        icon: { name: 'cash-stack' },
      },
      {
        text: 'Purchase',
        props: { key: 'inout', value: 9 },
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
      text: 'No.',
      props: { key: 'rnno', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Date',
      value: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
    },
    {
      text: 'Amount',
      value: { text: 'Amount', props: { key: 'rntotal', isAsc: true } },
    },
    {
      text: 'Inv No',
      value: { text: 'Inv No', props: { key: 'invoiceno', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'rnno', isAsc: true } },
    },
  ],
  loadList: function() {
    return axios
      .get('/rejectionnote?type=all')
      .then((resp) => {
        let list = [];
        // Rejection Note
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.rnid,
                no: item.rnno,
                noteName: `Rejection Note`,
                text1: item.rnno,
                icon: item.inout === 15 ? 'cash-stack' : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.rndate,
                dateObj: Date.parse(
                  item.rndate
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
