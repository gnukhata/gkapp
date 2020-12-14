<!--
    TODO
    =====
    1. On clicking Create & Login, collect the required request parameters and
    make a POST request to /organisations
    2. Route link config from login page
    3. Hiding unwanted navbars
-->
<template>
    <section class="section">
        <card-component title="Organisation setup wizard" icon="office-building">
          <form @submit.prevent="next">
            <create-organisation-form v-if="pageId === 0" />
            <organisation-profile-form v-if="pageId === 1" />
            <create-admin-user-form v-if="pageId === 2" />
            <hr>
            <b-field grouped position="is-right">
              <div class="control" v-if="pageId !== 0">
                <button class="button is-warning" @click.prevent="back">
                  <b-icon icon="arrow-left" class></b-icon> <span>Back</span>
                </button>
              </div>
              <div class="control" v-if="pageId !== 2">
                <button type="submit" class="button is-primary">
                  <b-icon icon="arrow-right" class></b-icon> <span>Proceed</span>
                </button>
              </div>
              <div class="control" v-if="pageId === 2" @click.prevent="submit">
                <button type="submit" class="button is-success">
                  <b-icon icon="content-save" class></b-icon> <span>Create & Login</span>
                </button>
              </div>
            </b-field>
          </form>
        </card-component>
    </section>
</template>

<script>
import wizardState from '../store/modules/organisationCreationWizard'

import CardComponent from '@/components/CardComponent'
import CreateOrganisationForm from '@/components/CreateOrganisationWizard/CreateOrganisationForm'
import CreateAdminUserForm from '@/components/CreateOrganisationWizard/CreateAdminUserForm'
import OrganisationProfileForm from '@/components/CreateOrganisationWizard/OrganisationProfileForm'
export default {
  name: 'CreateOrganisation',
  components: { CardComponent, CreateOrganisationForm, CreateAdminUserForm, OrganisationProfileForm },
  data () {
    return {
      pageId: 0
    }
  },
  computed: {},
  methods: {
    next () {
      this.pageId = Math.min(2, this.pageId + 1)
      // this.$emit('next-page')
    },
    back () {
      this.pageId = Math.max(0, this.pageId - 1)
    },
    submit () {

    }
  },
  created () {
    // registering the organisation creation wizard vuex state when creating this vue
    this.$store.registerModule('orgWiz', wizardState)
  }
}
</script>
