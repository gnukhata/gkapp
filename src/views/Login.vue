<template>
    <section class="section">
      <div class="columns is-centered">
        <div class="column is-8-tablet is-6-desktop is-5-widescreen">
              <login-form class="tile is-child"/>
        </div>
      </div>
    </section>
</template>

<script>
import LoginForm from '@/components/LoginForm'

export default {
  name: 'Login',
  components: { LoginForm }
}
</script>
