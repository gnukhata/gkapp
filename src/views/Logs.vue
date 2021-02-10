<template>
<section>
  <h2 class='text-muted text-center'>Logs</h2>
</section>
</template>
<script>
  import axios from 'axios'
  export default {
  name: 'Logs',
  data() {
  return {
    log: []
    }
  },
  methods: {
  getLogs() {
  axios.get('/logs', {

  })
}
  }
  }

</script>

<style>

</style>
