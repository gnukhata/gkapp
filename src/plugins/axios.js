"use strict";

import Vue from 'vue';
import axios from "axios";

Plugin.install = function (Vue) {
  const _axios = axios.create();
  Vue.prototype.$axios = _axios;
};

Vue.use(Plugin)

export default Plugin;
