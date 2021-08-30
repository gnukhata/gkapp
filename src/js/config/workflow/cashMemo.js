import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'invid',
  createNewPath: {
    name: 'Cash_Memo',
    params: {},
  },
  printPath: {
    name: 'Cash_Memo_List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
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
      props: { key: 'invoiceno', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Date',
      value: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
    },
    {
      text: 'Amount',
      value: { text: 'Amount', props: { key: 'invoicetotal', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'invoiceno', isAsc: true } },
    },
  ],
  loadList: function() {
    const requests = [
      axios.get('/invoice?cash=all&inoutflag=15').catch((error) => {
        return error;
      }),
      //purchase
      axios.get('/invoice?cash=all&inoutflag=9').catch((error) => {
        return error;
      }),
    ];
    return Promise.all(requests).then((resp) => {
      let list = [];
      // Cash Memo Sale
      if (resp[0].data.gkstatus === 0) {
        list = resp[0].data.gkresult.map((item) => {
          return Object.assign(
            {
              id: item.invid,
              no: item.invoiceno,
              noteName: `Cash Memo`,
              text1: item.invoiceno,
              icon: 'cash-stack',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.invoicedate,
              dateObj: Date.parse(
                item.invoicedate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
      }

      // Cash Memo Purchase
      if (resp[1].data.gkstatus === 0) {
        let cmPurchase = resp[1].data.gkresult.map((item) => {
          return Object.assign(
            {
              id: item.invid,
              no: item.invoiceno,
              noteName: `Cash Memo`,
              text1: item.invoiceno,
              icon: 'basket3',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.invoicedate,
              dateObj: Date.parse(
                item.invoicedate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
        if (cmPurchase.length) {
          list.push(...cmPurchase);
        }
      }

      return list;
    });
  },
};
