import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  uidKey: 'vouchercode',
  createNewPath: {
    name: 'Create_Voucher',
    params: {
      type: 'receipt',
      customer: '-1',
    },
  },
  printPath: {
    name: 'Voucher_List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
      },
      {
        text: 'Receipt',
        props: { key: 'vouchertype', value: 'receipt' },
      },
      {
        text: 'Payment',
        props: { key: 'vouchertype', value: 'payment' },
      },
      {
        text: 'Purchase',
        props: { key: 'vouchertype', value: 'purchase' },
      },
      {
        text: 'Sales',
        props: { key: 'vouchertype', value: 'sales' },
      },
      {
        text: 'Journal',
        props: { key: 'vouchertype', value: 'journal' },
      },
      {
        text: 'Contra',
        props: { key: 'vouchertype', value: 'contra' },
      },
      {
        text: 'Cancelled',
        props: { key: 'deletedFlag', value: true },
        icon: { name: 'x-circle', variant: 'danger' },
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
      text: 'Dr',
      props: { key: 'drAmount', isAsc: true },
    },
    {
      text: 'Cr',
      props: { key: 'crAmount', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Date',
      value: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
    },
    {
      text: 'Dr',
      value: { text: 'Dr', props: { key: 'drAmount', isAsc: true } },
    },
    {
      text: 'Cr',
      value: { text: 'Cr', props: { key: 'crAmount', isAsc: true } },
    },
    {
      text: 'Type',
      value: { text: 'Type', props: { key: 'vouchertype', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'vouchernumber', isAsc: true } },
    },
    {
      text: 'Narration',
      value: { text: 'Narration', props: { key: 'narration', isAsc: true } },
    },
  ],
  loadList: function(yearStart, yearEnd) {
    const requests = [
      axios
        .get(`/transaction?searchby=date&from=${yearStart}&to=${yearEnd}`)
        .catch((error) => {
          return error;
        }),
      axios.get('/report?type=deletedvoucher').catch((error) => {
        return error;
      }),
    ];
    return Promise.all(requests).then((resp) => {
      let list = [];
      // Vouchers
      if (resp[0].data.gkstatus === 0) {
        list = resp[0].data.gkresult.map((item) => {
          let drAccount = Object.keys(item.drs)[0];
          let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
          let crAccount = Object.keys(item.crs)[0];
          let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
          return Object.assign(
            {
              id: item.vouchercode,
              no: item.vouchernumber,
              noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                1
              )} Voucher`,
              text1: `${drAmount} (${drAccount})`,
              text2: `${crAmount} (${crAccount})`,
              drAmount: drAmount,
              crAmount: crAmount,
              icon: 'cash-stack',
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.voucherdate,
              dateObj: Date.parse(
                item.voucherdate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
      }

      // Vouchers
      if (resp[1].data.gkstatus === 0) {
        let deletedVouchers = resp[1].data.gkresult.map((item) => {
          let drAccount = Object.keys(item.drs)[0];
          let drAmount = parseFloat(item.drs[drAccount]).toFixed(2);
          let crAccount = Object.keys(item.crs)[0];
          let crAmount = parseFloat(item.crs[crAccount]).toFixed(2);
          return Object.assign(
            {
              id: item.vouchercode,
              no: item.vouchernumber,
              noteName: `${item.vouchertype[0].toUpperCase()}${item.vouchertype.slice(
                1
              )} Voucher`,
              text1: `${drAmount} (${drAccount})`,
              text2: `${crAmount} (${crAccount})`,
              drAmount: drAmount,
              crAmount: crAmount,
              icon: 'cash-stack',
              deletedFlag: true,
              // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
              date: item.voucherdate,
              dateObj: Date.parse(
                item.voucherdate
                  .split('-')
                  .reverse()
                  .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
              ),
            },
            item
          );
        });
        list.push(...deletedVouchers);
      }
      return list;
    });
  },
};
