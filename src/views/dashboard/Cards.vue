<template>
  <!--Cards-->
  <div class="row">
    <router-link v-for="(card, i) in cards" :key="i" :to="card.url">
      <div class="col m-2">
        <b-card
          :footer="card.name"
          class="text-center"
          :footer-text-variant="card.textColor"
          footer-tag="footer"
          :footer-bg-variant="card.color"
          :border-variant="card.color"
          style="height: 10em; width: 10em"
        >
          <b-card-text
            ><b-icon
              scale="4"
              :variant="card.color"
              :icon="card.icon"
              class="mt-3"
            ></b-icon
          ></b-card-text>
        </b-card>
      </div>
    </router-link>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  name: 'Cards',
  data() {
    return {
      cards: [
        {
          name: 'Go To Workflow',
          icon: 'tools',
          text: 'Manage Customers / Suppliers / Goods / Services',
          url: '/workflow/Transactions-Invoice/-1',
          color: 'dark',
          textColor: 'light',
        },
        {
          name: 'Adjust Bills',
          icon: 'receipt-cutoff',
          text: 'Manage Customers / Suppliers / Goods / Services',
          url: '/billwise/3/-1',
          color: 'dark',
          textColor: 'light',
        },
        // {
        //   name: 'Adjust Bills',
        //   icon: 'receipt-cutoff',
        //   text: 'Manage Customers / Suppliers / Goods / Services',
        //   url: '/billwise/3/-1',
        //   color: 'dark',
        //   textColor: 'light',
        // },
        // {
        //   name: 'Adjust Bills',
        //   icon: 'receipt-cutoff',
        //   text: 'Manage Customers / Suppliers / Goods / Services',
        //   url: '/billwise/3/-1',
        //   color: 'dark',
        //   textColor: 'light',
        // },
      ],
    };
  },
};
</script>
