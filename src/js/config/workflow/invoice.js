import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'invid',
  createNewPath: {
    name: 'Invoice',
    params: {
      mode: 'create',
      invid: 0,
    },
  },
  printPath: {
    name: 'Invoice_List',
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
      {
        text: 'Cancelled',
        props: { key: 'deletedFlag', value: true },
        icon: { name: 'x-circle', variant: 'danger' },
      },
      {
        text: 'On Credit',
        props: { key: 'onCreditFlag', value: true },
        icon: { name: 'dash', variant: 'danger' },
      },
      {
        text: 'Editable',
        props: { key: 'rectifyFlag', value: true },
        icon: { name: '' },
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
      props: { key: 'netamt', isAsc: true },
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
      value: { text: 'Amount', props: { key: 'netamt', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'invoiceno', isAsc: true } },
    },
    {
      text: 'Tax',
      value: { text: 'Tax', props: { key: 'taxamt', isAsc: true } },
    },
  ],
  loadList: function(yearStart, yearEnd) {
    const requests = [
      axios
        .get(
          `/invoice?type=list&flag=0&fromdate=${yearStart}&todate=${yearEnd}`
        )
        .catch((error) => {
          return error;
        }),
      axios.get('/billwise?type=all').catch((error) => {
        return error;
      }),
      axios
        .get(
          `/invoice?type=listdeleted&flag=0&fromdate=${yearStart}&todate=${yearEnd}`
        )
        .catch((error) => {
          return error;
        }),
    ];
    return Promise.all(requests)
      .then((resp) => {
        let list = [];
        let invoiceMap = {};
        // Invoices
        if (resp[0].data.gkstatus === 0) {
          list = resp[0].data.gkresult.map((item, index) => {
            invoiceMap[item.invid] = index;
            return Object.assign(
              {
                id: item.invid,
                no: item.invoiceno,
                noteName: `${item.csflag === 3 ? 'Sale' : 'Purchase'} Invoice`,
                date: item.invoicedate,
                text1: item.custname,
                text2: `₹ ${item.netamt}`,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                onCreditFlag: false,
                rectifyFlag: false, // can be rectified or not
                deletedFlag: false,
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
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

        // Invoice in credit
        if (resp[1].data.gkstatus === 0) {
          // let data = transactionTab['Invoice'].data;
          if (resp[1].data.gkstatus === 0 && list.length) {
            let index = '';
            resp[1].data.invoices.forEach((inv) => {
              index = invoiceMap[inv.invid];
              if (index >= 0) {
                list[index].onCreditFlag = true;
                list[index].rectifyFlag =
                  inv.balanceamount === inv.invoicetotal; // can be rectified or not
              }
            });
          }
        }

        // Deleted Invoices
        if (resp[2].data.gkstatus === 0) {
          const deletedInv = resp[2].data.gkresult.map((item) => {
            return Object.assign(
              {
                id: item.invid,
                no: item.invoiceno,
                noteName: `${item.csflag === 3 ? 'Sale' : 'Purchase'} Invoice`,
                date: item.invoicedate,
                text1: item.custname,
                text2: `₹ ${item.netamt}`,
                icon: item.csflag === 3 ? 'cash-stack' : 'basket3',
                onCreditFlag: false,
                rectifyFlag: false, // can be rectified or not
                deletedFlag: true,
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
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
          list.push(...deletedInv);
        }

        return list;
      })
      .catch((e) => {
        console.log(e.message);
      });
  },
};
