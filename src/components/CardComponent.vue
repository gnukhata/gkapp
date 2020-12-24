<template>
  <div class="card">
    <header v-if="title" class="card-header">
      <p class="card-header-title" :id="headerId">
        <b-icon v-if="icon" :icon="icon" custom-size="default"/>
        {{ title }}
      </p>
      <a v-if="headerIcon" href="#" class="card-header-icon" aria-label="more options" @click.prevent="headerIconClick">
        <b-icon :icon="headerIcon" custom-size="default"/>
      </a>
    </header>
    <div class="card-content" :aria-labelledby="headerId">
      <slot/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'CardComponent',
  props: {
    title: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    headerIcon: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapState(['ariaIterator']),
    headerId: (self) => {
      return (self.title) ? `${self.title.split(' ').join('_')}_${self.ariaIterator}` : ''
    }
  },
  methods: {
    headerIconClick () {
      this.$emit('header-icon-click')
    }
  },
  created () {
    this.$store.commit('incrementAriaIterator')
  }
}
</script>
