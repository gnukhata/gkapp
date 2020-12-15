<template>
  <section class="section">
    <div class="columns is-centered">
      <div class="column is-11-tablet is-10-desktop is-8-widescreen">
            <card-component title="Create Organisation Form" icon="office-building">
              <create-organisation-form />
            </card-component>
      </div>
    </div>
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
