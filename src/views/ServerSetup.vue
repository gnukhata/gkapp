<template>
  <!-- Server Selection-->
  <section class="m-2">
    <b-card
      header-bg-variant="dark"
      header-text-variant="light"
      class="shadow mx-auto gkcard"
    >
      <template #header>
        <gk-cardheader
          :name="$gettext('GNUKhata Server Setup')"
          help-body="This menu helps you to select gkcore server to use with this webapp. The default server is <code>localhost:6543</code><br>You can also set your custom gkcore server address."
        ></gk-cardheader>
      </template>
      <b-card-body>
        <b-form @submit.prevent="setCustomServerUrl" class="text-center">
          <b-button size="sm" variant="dark" @click.prevent="setDefaultServer">
            <b-icon class="mr-1" icon="arrow-right-circle"></b-icon>
            <translate>Continue with Default Server</translate>
          </b-button>
          <div class="mt-2 mb-2"><b>OR</b></div>
          <h5 class="text-muted text-center">
            <translate>Enter Custom Server URL</translate>
          </h5>
          <b-form-group label-cols="auto">
            <b-form-input
              size="sm"
              :state="urlIsValid"
              v-model="serverUrl"
              type="url"
              placeholder="https://example.com"
            ></b-form-input>
            <b-form-invalid-feedback id="input-live-feedback">
              <translate>URL should not contain " / " in the end</translate>
            </b-form-invalid-feedback>
          </b-form-group>
          <b-button
            type="submit"
            size="sm"
            variant="success"
            :disabled="serverUrl === '' ? true : false"
          >
            <b-icon class="mr-1" icon="arrow-right-circle"></b-icon>
            <translate> Save & Continue</translate>
          </b-button>
        </b-form>
      </b-card-body>
    </b-card>
  </section>
</template>

<script>
import axios from 'axios';
import GkCardheader from '../components/GkCardheader.vue';
export default {
  components: { GkCardheader },
  name: 'ServerSetup',
  data() {
    return {
      serverUrl: '',
    };
  },
  created() {
    // if (localStorage.getItem('gkCoreUrl')) {
    //   if (localStorage.getItem('gkCoreUrl') != 'null') {
    //     // this.$router.push('/select-org');
    //   }
    // }
  },
  computed: {
    urlIsValid() {
      if (this.serverUrl !== '') {
        return this.serverUrl
          .split('')
          .reverse()
          .join('')[0] == '/'
          ? false
          : true;
      } else {
        return null;
      }
    },
  },
  methods: {
    setDefaultServer() {
      // If you want to change this value, Set environment variable VUE_APP_GKCORE_URL (only updates during build)
      const defaultGkCoreUrl =
        process.env.VUE_APP_GKCORE_URL !== undefined
          ? process.env.VUE_APP_GKCORE_URL
          : 'http://localhost:6543';
      axios
        .get(`${defaultGkCoreUrl}/state`)
        .then((res) => {
          if (res.status == 200 && res.data.gkstatus == 0) {
            this.$store.commit('setGkCoreUrl', {
              gkCoreUrl: defaultGkCoreUrl,
            });
            // this.$router.push('/select-org'); // old code
            this.$router.push('/user-login'); // new code
          } else {
            this.$bvToast.toast('Please check your server setup', {
              title: 'Unable to Connect To The Server :-(',
              variant: 'danger',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(
            'Please check if gkcore is properly setup & running on port 6543',
            {
              title: e.message,
              solid: true,
              variant: 'danger',
            }
          );
        });
    },
    /**
     * Validate given server URL
     */
    setCustomServerUrl() {
      axios
        .get(`${this.serverUrl}/state`)
        .then((res) => {
          if (res.status == 200 && res.data.gkstatus == 0) {
            this.$store.commit('setGkCoreUrl', {
              gkCoreUrl: this.serverUrl,
            });
            this.$router.push('/select-org');
          } else {
            this.$bvToast.toast('Please check your server setup', {
              title: 'Unable to Connect To The Server :-(',
              variant: 'danger',
              solid: true,
            });
          }
        })
        .catch((e) => {
          this.$bvToast.toast(e.message, {
            title: 'Invalid URL',
            variant: 'danger',
            solid: true,
          });
        });
    },
  },
};
</script>
