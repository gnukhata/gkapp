"use strict";

import Vue from 'vue';
import axios from "axios";

Plugin.install = function (Vue) {
  const _axios = axios.create();

  _axios.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      const vm = new Vue();
      let message;
      const { status } = error.response ?? {};
      if (status >= 400 && status < 500) {
        message = 'Client side error occurred, please try again later';
      } else if (status >= 500 && status < 600) {
        message = 'Server side error occurred, please try again later';
      } else {
        message = 'Some error occurred, please try again later';
      }
      vm.$bvToast.toast(message, {
        title: 'Error',
        variant: 'danger',
      }) ;
      return Promise.reject(error);
    }
 );

  Vue.prototype.$axios = _axios;
};

Vue.use(Plugin)

export default Plugin;
