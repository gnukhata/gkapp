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
  name: "SecurityQuestions",
  model: {
    prop: "value",
    event: "change"
  },
  props: ["value"],
  data() {
    return {
      choice: "",
      questions: [
        "Your favourite color ?",
        "Your favourite Place ?",
        "Your favourite ice cream ?",
        "Your favourite Bike ?",
        "Your lucky number ?",
        "Your first school ?"
      ]
    };
  }
};
</script>
