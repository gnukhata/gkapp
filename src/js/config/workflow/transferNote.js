import axios from 'axios';
export default {
  icon: 'receipt',
  color: 'success',
  data: [],
  key: 'custname',
  uidKey: 'transfernoteid',
  createNewPath: {
    name: 'Transfer_Note',
    params: {},
  },
  printPath: {
    name: 'Transfer_Note_List',
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
      props: { key: 'transfernoteno', isAsc: true },
    },
  ],
  columns: [
    {
      text: 'Date',
      value: { text: 'Date', props: { key: 'dateObj', isAsc: true } },
    },
    {
      text: 'No',
      value: { text: 'No', props: { key: 'transfernoteno', isAsc: true } },
    },
  ],
  loadList: function() {
    return axios
      .get('/transfernote?type=all')
      .then((resp) => {
        let list = [];
        // Transfer Notes
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) => {
            return Object.assign(
              {
                icon: 'truck',
                // dateObj is invoicedate stored in a format that can be logically compared, used by sorters and filters.
                date: item.transfernotedate,
                dateObj: Date.parse(
                  item.transfernotedate
                    .split('-')
                    .reverse()
                    .join('-') // date recieved as dd-mm-yyyy, changing it to yyyy-mm-dd format (js Date compatible)
                ),
                id: item.transfernoteid,
                no: item.transfernoteno,
                noteName: 'Transfer Note',
                text1: item.transfernoteno,
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
