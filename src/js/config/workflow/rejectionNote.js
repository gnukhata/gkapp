import axios from 'axios';
const config = {
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
  options: {
    columns: [
      {
        text: 'Date',
        value: 'dateObj',
      },
      {
        text: 'Amount',
        value: 'rntotal',
      },
      {
        text: 'Inv No',
        value: 'invoiceno',
      },
      {
        text: 'No',
        value: 'rnno',
      },
    ],
    columnMap: {
      dateObj: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
      rntotal: { text: 'Amount', props: { key: 'rntotal', isAsc: true } },
      invoiceno: { text: 'Inv No', props: { key: 'invoiceno', isAsc: true } },
      rnno: { text: 'No', props: { key: 'rnno', isAsc: true } },
    },
  },
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
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns(orgCode) {
  // debugger;
  let columns =
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-rnote-columns`)) || [];
  if (!columns.length) {
    columns = [
      {
        text: 'Date',
        props: { key: 'dateObj', isAsc: true },
      },
      {
        text: 'No.',
        props: { key: 'rnno', isAsc: true },
      },
    ];
  }
  config.sortBy = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-rnote-columns`,
      JSON.stringify(columns)
    );
    config.sortBy = columns;
  }
}

export default config;
