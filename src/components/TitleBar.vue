<template>
  <section class="section is-title-bar">
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <ul>
            <li v-for="(title,index) in titleStack" :key="index">{{ title }}</li>
          </ul>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <div v-if="$route.path !== '/'" class="buttons is-right">
            <router-link to="/">
            <button class="button is-dark">
              <b-icon icon="arrow-left-circle" custom-size="default"/>
              <span>Dashboard</span>
            </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TitleBar',
  props: {
    titleStack: {
      type: Array,
      default: () => []
    }
  }
}
</script>
