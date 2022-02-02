<template>
  <div class="container">
    <b-img
      fluid
      center
      width="90"
      src="img/icons/manifest-icon-192.png"
    ></b-img>
    <div class="text-center">
      <b-badge pill variant="primary">v{{ ver }}</b-badge>
    </div>
    <div class="text-center mt-2">
      <h4 class="font-italic text-dark">
        <translate>
          GNUKhata is A Community Driven Free &amp; Open Source Accounting
          Software
        </translate>
      </h4>
      <p class="text-muted text-monospace text-left" v-translate>
        Founded and Developed by Digital Freedom Foundation under the leadership
        of Mr. Krishnakant Mane, Currently supported by Accion Labs Pvt. Ltd as
        a social contribution to the Open Source Community.
      </p>
      <div class="mt-4 has-text-centered">
        <a class="mx-1" href="https://gnukhata.in" target="_blank">
          <b-button variant="dark">
            <b-icon icon="globe"></b-icon
            ><translate> Website</translate></b-button
          >
        </a>
        <a href="https://gitlab.com/gnukhata" target="_blank">
          <b-button variant="dark">
            <b-icon icon="code-square"></b-icon
            ><translate> Source Code</translate></b-button
          >
        </a>
        <div class="mt-3 d-flex-row">
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">
            <img
              class="mt-3 img-fluid"
              width="100px"
              src="img/agpl3.png"
              alt="AGPLv3 License"
            />
          </a>
          <a href="https://accionlabs.com" target="_blank">
            <img
              width="200px"
              class="mt-3 img-fluid"
              src="img/accionlabs.png"
              alt="accion labs logo"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { version } from '../../package';
export default {
  name: 'About',
  data() {
    return {
      ver: version,
    };
  },
};
</script>
