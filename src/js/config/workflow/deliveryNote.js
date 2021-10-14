import axios from 'axios';
import { PAGES, CONFIGS } from '../../enum.js';
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
  fields: [
    {
      label: 'Date',
      key: 'dateObj',
      sortable: true,
    },
    {
      label: 'Name',
      key: 'custname',
      sortable: true,
    },
    {
      label: 'No.',
      key: 'dcno',
      sortable: true,
    },
  ],
  options: {
    columns: [
      {
        label: 'Date',
        value: 'dateObj',
      },
      {
        label: 'Name',
        value: 'custname',
      },
      {
        label: 'No',
        value: 'dcno',
      },
      {
        label: 'Godown',
        value: 'goname',
      },
      {
        label: 'Delivery Type',
        value: 'dcflag',
      },
    ],
    columnMap: {
      dateObj: { label: 'Date', key: 'dateObj', sortable: true },
      custname: { label: 'Name', key: 'custname', sortable: true },
      dcno: { label: 'No', key: 'dcno', sortable: true },
      goname: { label: 'Godown', key: 'goname', sortable: true },
      dcflag: { label: 'Delivery Type', key: 'dcflag', sortable: true },
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

function initColumns() {
  // debugger;
  let columns = [];
  axios.get('/config?conftype=user').then((resp) => {
    if (resp.data.gkstatus === 0) {
      let userConf = resp.data.gkresult[PAGES['workflow-delivery-note']];

      if (userConf) {
        columns = userConf[CONFIGS['workflow-left-pane-columns']];
      }
    }
    if (!columns || !columns.length) {
      columns = [
        {
          label: 'Date',
          key: 'dateObj',
          sortable: true,
        },
        {
          label: 'Name',
          key: 'custname',
          sortable: true,
        },
        {
          label: 'No.',
          key: 'dcno',
          sortable: true,
        },
      ];
    }
    config.fields = columns;
  });
}

function setColumns(columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    const payload = {
      config: columns,
      path: [PAGES['workflow-delivery-note'], CONFIGS['workflow-left-pane-columns']],
    };
    return axios
      .put('/config?conftype=user&update=path&confcategory=workflow', payload)
      .then((resp) => {
        if (resp.data.gkstatus === 0) {
          config.fields = columns;
        }
        return resp.data;
      });
  }
}

export default config;
