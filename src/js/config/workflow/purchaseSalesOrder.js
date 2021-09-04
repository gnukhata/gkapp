import axios from 'axios';
const config = {
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
  options: {
    columns: [
      {
        text: 'Date',
        value: 'dateObj',
      },
      {
        text: 'Customer',
        value: 'custname',
      },
      {
        text: 'Amount',
        value: 'ordertotal',
      },
      {
        text: 'No',
        value: 'orderno',
      },
    ],
    columnMap: {
      dateObj: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
      custname: { text: 'Customer', props: { key: 'custname', isAsc: true } },
      ordertotal: { text: 'Amount', props: { key: 'ordertotal', isAsc: true } },
      orderno: { text: 'No', props: { key: 'orderno', isAsc: true } },
    },
  },
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
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns(orgCode) {
  // debugger;
  let columns =
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-psorder-columns`)) ||
    [];
  if (!columns.length) {
    columns = [
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
    ];
  }
  config.sortBy = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-psorder-columns`,
      JSON.stringify(columns)
    );
    config.sortBy = columns;
  }
}

export default config;
