<template>
  <section
    class="d-print-none container-fluid mb-2 bg-light d-flex justify-content-between"
  >
    <div class="row">
      <slot name="left"></slot>
    </div>
    <div class="row">
      <slot name="center"></slot>
    </div>
    <!-- this slot aligns to right & is the default slot -->
    <div class="row">
      <slot></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'GkToolbar',
};
</script>
