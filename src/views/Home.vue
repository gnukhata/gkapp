<template>
  <section>
    <!--Cards-->
    <div class="container mt-3">
      <b-card-group deck>
        <router-link v-for="(card, i) in cards" :key="i" :to="card.url">
          <b-card
            :footer="card.name"
            class="text-center"
            :footer-text-variant="card.textColor"
            footer-tag="footer"
            :footer-bg-variant="card.color"
            :border-variant="card.color"
            style="height: 10em; width: 20em"
          >
            <b-card-text
              ><b-icon
                scale="4"
                :variant="card.color"
                :icon="card.icon"
                class="mt-3"
              ></b-icon
            ></b-card-text>
            <!-- <b-card-title class="text-secondary">{{ card.text }}</b-card-title> -->
          </b-card>
        </router-link>
      </b-card-group>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Home",
  data() {
    return {
      cards: [
        {
          name: "Workflow",
          icon: "tv",
          text: "Manage Customers / Suppliers / Goods / Services",
          url: "/workflow",
          color: "dark",
          textColor: "light",
        },
      ],
    };
  },
};
</script>
