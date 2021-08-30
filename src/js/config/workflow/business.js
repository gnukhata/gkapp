import axios from 'axios';
export default {
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
  columns: [
    {
      text: 'Name',
      value: { text: 'Name', props: { key: 'productdesc', isAsc: true } },
    },
  ],
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
};
