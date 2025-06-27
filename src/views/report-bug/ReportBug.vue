<template>
  <section class="mt-5 m-2">
    <b-card
      header="Report Bug"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto gkcard"
    >
      <!-- card header -->
      <template #header>
        <gk-card-header
          name="Report Bug"
          :help-body="
            $gettext(
              'Select the component for which you want to report bug, briefly describe your issue & click on the <b>Submit</b> Button. This will open your email client & prefills the details. Then, you need to send the email.',
            )
          "
        />
      </template>
      <b-alert
        show
        class="text-center mx-auto d-print-none"
      >
        <p class="text-center">
          Please check if your bug is already reported at <a href="https://gitlab.com/groups/gnukhata/-/issues">GitLab repository</a> before filing a new bug report.
          <br>
          Please fill the form and submit to file a bug report. It will generate a mail template with a <a href="mailto:contact-project+gnukhata-issue-tracker-inapp@incoming.gitlab.com">recipient address</a> and redirect you to your mail client.
          <br>
          Alternatively, you can also file your bugs <a href="https://gitlab.com/gnukhata/issue-tracker/-/issues/">here</a>.
        </p>
      </b-alert>
      <!-- select component -->
      <b-form-group
        label="Select Module"
        label-class="font-weight-bold required"
        label-cols="auto"
        content-cols="11"
      >
        <v-select
          :options="finalRoutes"
          v-model="selectedModule"
          :placeholder="this.$gettext('Select / Search Modules')"
          label="name"
          required
        />
      </b-form-group>
      <!-- Bug Title -->
      <b-form-group
        label-cols="10"
        label="Title"
        label-class="font-weight-bold required"
        content-cols="11"
      >
        <b-form-input
          :placeholder="$gettext('Title')"
          v-model="bugTitle"
        />
      </b-form-group>
      <!-- bug description -->
      <b-form-group
        label-class="font-weight-bold required"
        label="Description"
        content-cols="11"
      >
        <b-textarea
          v-model="bugDescription"
          required
          class="mt-2"
          :placeholder="this.$gettext('Describe your problem')"
        />
      </b-form-group>
      <!-- Submit button -->
      <b-button
        :disabled="
          !selectedModule?.name ||
            bugTitle.length == 0 ||
            bugDescription.length == 0
        "
        variant="success"
        type="submit"
        size="sm"
        class="float-right"
        :href="
          `mailto:contact-project+gnukhata-issue-tracker-inapp@incoming.gitlab.com?subject=[${this.selectedModule?.name}] ${this.bugTitle}&body=${this.bugDescription}`
        "
      >
        <b-icon
          class="mr-1"
          icon="envelope"
        /><translate>Submit</translate>
      </b-button>
    </b-card>
  </section>
</template>

<script>
import routes from '../../router/index';
import GkCardHeader from '@/components/GkCardHeader.vue';
export default {
  name: 'ReportBug',
  components: { GkCardHeader },
  data() {
    return {
      selectedModule: '',
      finalRoutes: [],
      bugTitle: '',
      bugDescription: '',
    };
  },
  methods: {
    // create menu list from vue router config list
    filterRoutes() {
      const re = new RegExp(':');
      // do not include dynamic routes
      this.finalRoutes = routes.options.routes.filter((route) => {
        if (!re.test(route.path)) {
          // sanitize route names
          route['name'] = route.name.replaceAll('_', ' ');
          if (route.name !== 'Report Bug') {
            return route;
          }
        }
      });
    },
  },
  mounted() {
    this.filterRoutes();
  },
};
</script>
