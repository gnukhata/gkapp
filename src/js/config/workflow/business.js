import axios from 'axios';
const config = {
  icon: 'box-seam',
  color: 'warning',
  data: [],
  key: 'productdesc',
  uidKey: 'productcode',
  createNewPath: {
    name: 'Business_Details',
    params: { mode: 'create' },
  },
  printPath: {
    name: 'Product List',
  },
  filterBy: {
    value: [
      {
        text: 'All',
        props: {},
      },
      {
        text: 'Product',
        props: { key: 'gsflag', value: 7 },
        icon: { name: 'box' },
      },
      {
        text: 'Service',
        props: { key: 'gsflag', value: 19 },
        icon: { name: 'headset' },
      },
    ],
    range: [],
  },
  sortBy: [
    {
      text: 'Name',
      props: { key: 'productdesc', isAsc: true },
    },
  ],
  options: {
    columns: [
      {
        text: 'Name',
        value: 'productdesc',
      },
    ],
    columnMap: {
      productdesc: { text: 'Name', props: { key: 'productdesc', isAsc: true } },
    },
  },
  loadList: function() {
    return axios
      .get('/products')
      .then((resp) => {
        let list = [];
        // Products & Services List
        if (resp.data.gkstatus === 0) {
          list = resp.data.gkresult.map((item) =>
            Object.assign({ icon: item.gsflag === 7 ? 'box' : 'headset' }, item)
          );
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
    JSON.parse(localStorage.getItem(`${orgCode}-workflow-business-columns`)) ||
    [];
  if (!columns.length) {
    columns = [
      {
        text: 'Name',
        props: { key: 'productdesc', isAsc: true },
      },
    ];
  }
  config.sortBy = columns;
}

function setColumns(orgCode, columns) {
  if (Array.isArray(columns) && columns.length <= 3) {
    localStorage.setItem(
      `${orgCode}-workflow-business-columns`,
      JSON.stringify(columns)
    );
    config.sortBy = columns;
  }
}

export default config;
