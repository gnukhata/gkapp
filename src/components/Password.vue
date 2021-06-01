<template>
  <b-form-group
    :state="isPasswordValid"
    :invalid-feedback="passwordFeedback"
    :valid-feedback="passwordFeedback"
  >
    <b-form-input
      size="md"
      id="password-1"
      type="password"
      placeholder="Password"
      v-model.lazy="userPassword"
      label-cols="1"
      :state="isPasswordValid"
      required
    >
    </b-form-input>
  </b-form-group>
</template>

<script>
import passwordStrength from 'check-password-strength';

export default {
  name: 'Password',
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      userPassword: '',
      pwdFieldTypes: ['lowercase', 'uppercase', 'symbol', 'number'],
    };
  },
  methods: {
    getPasswordHint(pwdStrength) {
      const available = pwdStrength.contains.map((item) => item.message);
      let hint = this.pwdFieldTypes
        .filter((item) => !available.includes(item))
        .reduce((prev, cur) => {
          return `${prev} ${cur},`;
        }, '');
      hint = hint.substring(0, hint.length - 1);
      if (available.length < 4) {
        hint = `Recommended atleast 1 ${hint}`;
      }
      if (pwdStrength.length < 8) {
        hint += ' & minimum 8 characters long';
      }
      return hint;
    },
  },
  computed: {
    pwdStrength: (self) =>
      self.userPassword !== '' && self.userPassword !== null
        ? passwordStrength(self.userPassword)
        : { value: 'Empty' },
    allFieldsValid: (self) => !self.isPasswordValid && !self.arePasswordsSame,
    isPasswordValid: (self) =>
      self.pwdStrength.value === 'Empty'
        ? null
        : self.pwdStrength.value === 'Strong',
    passwordFeedback() {
      let text = '';
      if (this.userPassword) {
        switch (this.pwdStrength.value) {
          case 'Strong':
            text = 'Your Password is Strong!';
            this.$emit('change', this.userPassword);
            break;
          case 'Medium':
            text = this.getPasswordHint(this.pwdStrength);
            break;
          case 'Weak':
            text = this.getPasswordHint(this.pwdStrength);
            break;
          default:
            if (this.userPassword.length < 8) {
              text = 'is-danger';
            } else {
              text = 'is-success';
            }
        }
        this.$emit('change', this.userPassword);
      }
      return text;
    },
  },
};
</script>
