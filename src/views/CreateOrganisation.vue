<!--
    ToDo
    1. Hide the unwanted Nav bars as in login view
-->
<template>
    <section class="section">
        <card-component title="Create Organisation Form" icon="office-building">
          <create-organisation-form />
        </card-component>
    </section>
</template>

<script>
import CardComponent from '@/components/CardComponent'
import CreateOrganisationForm from '@/components/CreateOrganisationForm'
export default {
  name: 'CreateOrganisation',
  components: { CardComponent, CreateOrganisationForm },
  data () {
    return {}
  },
  computed: {},
  methods: {
  },
  created () {
  }
}
</script>
