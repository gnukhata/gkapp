<template>
  <aside
      style="overflow-x:hide; overflow-y:auto;scrollbar-width: none;-ms-overflow-style: none;"
      v-show="isAsideVisible"
      class="aside is-placed-left is-expanded">
    <aside-tools :is-main-menu="true">
      <router-link to="/" slot="label">
        <img class="is-valign-m" src="img/icons/gnukhata_icon.png" alt="GNUKhata Logo" width=30em>
        <span class="has-text-weight-semibold ml-3  is-gk-blue">
          <span>GNUKhata</span> <span class="ml-1">v7.0</span>
        </span>
      </router-link>
    </aside-tools>
    <div class="menu is-menu-main">
      <template v-for="(menuGroup, index) in menu" >
        <p class="menu-label" v-if="typeof menuGroup === 'string'" :key="index">{{ menuGroup }}</p>
        <aside-menu-list
            v-else
            :key="index"
            @menu-click="menuClick"
            :menu="menuGroup"/>
      </template>
    </div>
  </aside>
</template>

<script>
import { mapState } from 'vuex'
import AsideTools from '@/components/AsideTools'
import AsideMenuList from '@/components/AsideMenuList'

export default {
  name: 'AsideMenu',
  components: { AsideMenuList, AsideTools },
  props: {
    menu: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState([
      'isAsideVisible'
    ])
  },
  methods: {
    menuClick (item) {
      this.$emit('menu-click', item)
    }
  }
}
</script>
