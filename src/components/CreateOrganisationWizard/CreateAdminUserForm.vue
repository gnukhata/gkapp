<!-- Page 3/3 0f Organisation Creation Wizard -->
<template>
  <div class="columns">
    <div class="column">
      <b-field label="User Name">
          <b-input icon="office-building" placeholder="ABC Organisation" required></b-input>
      </b-field>
      <b-field label="Password">
          <b-input icon="office-building" placeholder="ABC Organisation" required></b-input>
      </b-field>
      <b-field label="Confirm Password">
          <b-input icon="office-building" placeholder="ABC Organisation" required></b-input>
      </b-field>
    </div>
    <div class="column">
      <b-field label="Security Question">
          <b-input icon="office-building" placeholder="ABC Organisation" required></b-input>
      </b-field>
      <b-field label="Answer to Security Question">
          <b-input icon="office-building" placeholder="ABC Organisation" required></b-input>
      </b-field>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreateAdminUserForm',
  components: {
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
