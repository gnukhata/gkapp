<template>
  <b-select
    v-model="choice"
    :options="questions"
    @change="$emit('change', choice)"
  >
    <b-form-select-option disabled :value="null">
      -- Please select a question --
    </b-form-select-option>
  </b-select>
</template>

<script>
export default {
  name: 'SecurityQuestions',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: ['value'],
  data() {
    return {
      choice: '',
      questions: [
        'Your Favourite Place ?',
        'Your Lucky number ?',
        'Your Favourite Color ?',
        "Your Mother's Maiden name",
        'Your Favourite Ice Cream flavour ?',
        'Your Favourite Bike ?',
        'Your First School Name ?',
      ],
    };
  },
};
</script>
