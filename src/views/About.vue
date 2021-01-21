<template>
<div class="container">
  <b-img fluid center width="90" src="img/icons/manifest-icon-192.png"></b-img>
  <div class="text-center">
    <b-badge pill variant="primary">v{{ver}}</b-badge>
  </div>
  <div class="text-center mt-2">
    <h4 class="font-italic gk-blue">GNUKhata is A Community Driven Free &amp; Open Source Accounting Software</h4>
    <p class="text-muted text-monospace gk-orange text-left">
    Founded and Developed by Digital Freedom Foundation under the leadership of Mr. Krishnakant Mane.
    Currently supported by <a class='has-text-weight-bold' href="https://accionlabs.com" target="_blank" rel="noopener noreferrer">Accion Labs Pvt. Ltd</a>
    as a social contribution to the Open Source Community.
   </p>
<div class="mt-4 has-text-centered">
    <a class="mx-1" href="https://gnukhata.in" target="_blank">
        <b-button variant="primary">
          <b-icon icon="globe"></b-icon> Website</b-button>
    </a>
    <a href="https://gitlab.com/gnukhata" target="_blank">
        <b-button variant="primary">
          <b-icon icon="code-square"></b-icon> Source Code</b-button>
    </a>
    <br>
    <img class='mt-3' src="img/agpl3.png" alt="AGPLv3 License">
</div>

  </div>
</div>
</template>
<script>
import {version} from '../../package'
export default {
  name: 'About',
  data() {
    return {
      ver: version
    }
  }
}
</script>