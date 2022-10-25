<template>
  <section class="mt-5">
    <b-card
      header="Report Bug"
      header-bg-variant="dark"
      header-text-variant="light"
      class="mx-auto gkcard"
    >
      <!-- card header -->
      <template #header>
        <gk-cardheader
          name="Report Bug"
          :help-body="
            $gettext(
              'Select the component for which you want to report bug, briefly describe your issue & click on the <b>Submit</b> Button. This will open your email client & prefills the details. Then, you need to send the email.'
            )
          "
        ></gk-cardheader>
      </template>
      <!-- select component -->
      <b-form-group
        label="Select Module"
        label-class="font-weight-bold required"
        content-cols="11"
      >
        <v-select
          :options="finalRoutes"
          v-model="selectedUrl"
          :placeholder="this.$gettext('Select / Search Modules')"
          label="name"
          required
        ></v-select>
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
        ></b-textarea>
      </b-form-group>
      <b-button
        :href="
          `mailto:?to=incoming+gnukhata-gnukhata-40456223-8s695fsvkl2uw7wjim3xsmk0r-issue@incoming.gitlab.com&subject=${this.selectedUrl.name}&body=${this.bugDescription}`
        "
        :disabled="!selectedUrl.name || !this.bugDescription.length > 0"
        variant="success"
        size="sm"
        class="mt-2 float-right"
        ><b-icon class="mr-1" icon="envelope"></b-icon
        ><translate>Submit</translate></b-button
      >
    </b-card>
  </section>
</template>

<script>
import routes from '../../router/index';
import GkCardheader from '@/components/GkCardheader.vue';
export default {
  components: { GkCardheader },
  data() {
    return {
      selectedUrl: '',
      finalRoutes: [],
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
