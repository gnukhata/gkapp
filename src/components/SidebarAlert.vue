<template>
  <b-alert
    class="m-2"
    :show="gkConfig.sidebar_banner.show"
    :variant="gkConfig.sidebar_banner.variant"
    v-html="gkConfig.sidebar_banner.content"
  />
</template>

<script>
export default {
  name: 'SidebarAlert',
};
</script>
