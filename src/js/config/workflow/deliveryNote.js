import axios from 'axios';
const config = {
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
  options: {
    columns: [
      {
        text: 'Date',
        value: 'dateObj',
      },
      {
        text: 'Name',
        value: 'custname',
      },
      {
        text: 'No',
        value: 'dcno',
      },
      {
        text: 'Godown',
        value: 'goname',
      },
      {
        text: 'Delivery Type',
        value: 'dcflag',
      },
    ],
    columnMap: {
      dateObj: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
      custname: { text: 'Name', props: { key: 'custname', isAsc: true } },
      dcno: { text: 'No', props: { key: 'dcno', isAsc: true } },
      goname: { text: 'Godown', props: { key: 'goname', isAsc: true } },
      dcflag: { text: 'Delivery Type', props: { key: 'dcflag', isAsc: true } },
    },
  },
  loadList: function(fromDate) {
    const requests = [
      axios.get('/delchal?delchal=all').catch((error) => {
        return error;
      }),
      axios
        .get(
          `/report?type=del_unbilled&inout=i&inputdate=${fromDate}&del_unbilled_type=0`
        )
        .catch((error) => {
          return error;
        }),
      axios
        .get(
          `/report?type=del_unbilled&inout=o&inputdate=${fromDate}&del_unbilled_type=0`
        )
        .catch((error) => {
          return error;
        }),
      axios
        .get(
          `/delchal?type=listofcancelleddel&inout=i&inputdate=${fromDate}&del_cancelled_type=0`
        )
        .catch((error) => {
          return error;
        }),
      axios
        .get(
          `/delchal?type=listofcancelleddel&inout=o&inputdate=${fromDate}&del_cancelled_type=0`
        )
        .catch((error) => {
          return error;
        }),
    ];
    return Promise.all(requests)
      .then((resp) => {
        // Invoice List
        let dnoteMap = {};
        let dnotes = [];

        resp.forEach((_resp, i) => {
          if (_resp.data.gkstatus === 0) {
            _resp.data.gkresult.forEach((note) => {
              let index = dnoteMap[note.dcid];
              if (index >= 0) {
                Object.assign(dnotes[index], {
                  unBillFlag: true,
                  goname: note.goname,
                  dcflag: note.dcflag,
                });
              } else {
                dnoteMap[note.dcid] = i;
                dnotes.push(
                  Object.assign(
                    {
                      id: note.dcid,
                      no: note.dcno,
                      noteName: `Delivery Note`,
                      text1: note.custname,
                      text2: note.dcno,
                      icon: note.csflag === 3 ? 'cash-stack' : 'basket3',
                      // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                      date: note.dcdate,
                      dateObj: Date.parse(
                        note.dcdate
                          .split('-')
                          .reverse()
                          .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                      ),
                      unBillFlag: true,
                      cancelFlag: false,
                      goname: note.goname || '',
                      dcflag: note.dcflag || '',
                    },
                    note
                  )
                );
              }
            });
          }
        });
        return dnotes;
      })
      .catch((e) => {
        console.log(e);
      });
  },
  initListColumns: initColumns,
  setListColumns: setColumns,
};

function initColumns(orgCode) {
  // debugger;
  let columns =
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-dnote-columns`)) || [];
  if (!columns.length) {
    columns = [
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
    ];
  }
  config.sortBy = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-dnote-columns`,
      JSON.stringify(columns)
    );
    config.sortBy = columns;
  }
}

export default config;
