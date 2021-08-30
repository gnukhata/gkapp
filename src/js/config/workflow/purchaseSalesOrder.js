import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'orderid',
  createNewPath: {
    name: 'Purchase_Sales_Order',
    params: {},
  },
  printPath: {
    name: 'Ps_Order_List',
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
      props: { key: 'customer', isAsc: true },
    },
    {
      text: 'No.',
      props: { key: 'orderno', isAsc: true },
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
      value: { text: 'Amount', props: { key: 'ordertotal', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'orderno', isAsc: true } },
    },
  ],
  loadList: function() {
    return axios
      .get('/purchaseorder')
      .then((resp) => {
        let list = [];
        // Purchase Sales Order
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.orderid,
                no: item.orderno,
                noteName: `Order`,
                text1: item.customer,
                text2: item.orderno,
                // csflag: custSupMap[item.customer] ? 3 : 19,
                // icon: custSupMap[item.customer]
                //   ? 'cash-stack'
                //   : 'basket3',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.orderdate,
                dateObj: Date.parse(
                  item.orderdate
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
