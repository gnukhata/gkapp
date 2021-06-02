<template>
  <b-form-select
    :size="size"
    v-model="choice"
    :options="questions"
    @change="$emit('change', choice)"
  >
    <b-form-select-option disabled value="null">
      -- Please select a question --
    </b-form-select-option>
  </b-form-select>
</template>

<script>
export default {
  name: 'SecurityQuestions',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    size: String,
  },
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
