<template>
  <!-- app version info -->
  <footer class="col-12 my-4 footer text-center">
    Frontend (gkapp):
    <b-link
      target="_blank"
      :href="url.gkapp"
    >
      <code>{{ gkappVersion }}</code>
    </b-link>
    | Backend (gkcore):
    <b-link
      target="_blank"
      :href="url.gkcore"
    >
      <code>{{ gkcoreVersion }}</code>
    </b-link>
  </footer>
</template>

<script>
import axios from 'axios';
import { version } from '../../package';
export default {
  name: 'VersionInfo',
  data() {
    return {
      gkappVersion: process.env.VUE_APP_GKAPP_VERSION || version,
      gkcoreVersion: null,
      url: {},
    };
  },
  methods: {
    gitUrl() {
      const baseUrl = 'https://gitlab.com/gnukhata';
      let url = {};
      if (this.gkappVersion) {
        if (this.gkappVersion.includes('.')) {
          url['gkapp'] = `${baseUrl}/gkapp/-/tags/${this.gkappVersion}`;
        } else {
          url['gkapp'] = `${baseUrl}/gkapp/-/commit/${this.gkappVersion}`;
        }
      }
      if (this.gkcoreVersion) {
        if (this.gkcoreVersion.includes('.')) {
          url['gkcore'] = `${baseUrl}/gkcore/-/tags/${this.gkcoreVersion}`;
        } else {
          url['gkcore'] = `${baseUrl}/gkcore/-/commit/${this.gkcoreVersion}`;
        }
      }
      this.url = url;
    },
    fetchVersions() {
      axios
        .get('/')
        .then((r) => {
          if (r.status == 200) {
            this.gkcoreVersion = r.data.version;
          }
        })
        .then(() => {
          this.gitUrl();
        })
        .catch((e) => {
          console.error(e);
        });
    },
  },
  mounted() {
    this.fetchVersions();
    this.$root.$on('updateVersionInfo', this.fetchVersions);
  },
};
</script>

<style>
@media only screen and (max-width: 991px) {
  .footer {
    position: absolute;
    bottom: 60px;
  }
}
</style>
