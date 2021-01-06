<template>
    <div v-if="$route.name !== 'Login' && $route.name !== 'Create_Organisation' && $route.name !== 'Dashboard'" class="container-fluid mt-3">
        <router-link to="/dashboard">
        <b-button class="float-right" role="button"
            variant="outline-info">
            <b-icon icon="arrow-left-circle"></b-icon>
            Dashboard
        </b-button>
        </router-link>
    </div>
</template>

<script>
export default {
    name: 'Navhelp'
}
</script>