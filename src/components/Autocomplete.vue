<template>
  <div ref="autocomplete" class="gk-autocomplete" v-if="options">
    <!-- Autocomplete Input -->
    <b-form-input
      class="gk-autocomplete-input"
      v-bind="$attrs"
      v-on="$listeners"
      v-bind:value="searchFilter"
      ref="inputField"
      @focus="showOptions()"
      @blur="exit()"
      @keydown="keyMonitor"
      @input="onInput"
      debounce="500"
      autocomplete="off"
    />

    <!-- Autocomplete Menu -->
    <b-list-group class="gk-autocomplete-content" v-if="optionsShown">
      <b-list-group-item
        button
        class="gk-autocomplete-item"
        :class="{ 'gk-autocomplete-item-hover': index === hovered }"
        v-for="(option, index) in filteredOptions"
        :key="index"
        @mousedown="selectOption(option)"
        @mouseenter="setHovered(index)"
      >
        {{ option.text }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: "Autocomplete",
  model: {
    prop: "value",
    event: "input",
  },
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Object, Number],
      required: false,
      default: null,
      note: "used for exposing v-model",
    },
    valueUid: {
      type: String,
      required: false,
      default: "",
      note: "used when value is object, to quickly compare values",
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
      note: "Options of autocomplete. An array of options with id and name",
    },
    textField: {
      type: String,
      required: false,
      default: "text",
      note: "Alternate key for the display text",
    },
    valueField: {
      type: String,
      required: false,
      default: "value",
      note: "Alternate key for the value",
    },
    isOptionsShared: {
      type: Boolean,
      required: false,
      default: false,
      note: `If the same options is shared between several of this component in the same page,
      then hide the options selected in other components`,
    },
    emptyValue: {
      type: [Number, String, Object],
      required: false,
      default: null,
    },
  },
  data() {
    return {
      selected: {
        text: "",
        value: this.emptyValue,
      },
      optionsShown: false,
      searchFilter: "",
      hovered: null,
      isSelected: false,
      filteredOptions: [],
      optionsB: [],
    };
  },
  created() {
  },
  mounted() {
  },
  computed: {
  },
  methods: {
    initOptions() {
      // console.log("in optionsB");
      let options = [];
      if (this.options.length) {
        let val;
        this.options.forEach((option) => {
          val = null;
          // console.log(JSON.stringify(option))
          if (typeof option === "object") {
            val = option;
            val.text = option[this.textField];
            val.value = option[this.valueField];
            ``;
            val.disabled = !!val.disabled;
          } else {
            val = {
              text: option,
              value: option,
            };
          }
          options.push(val);
        });
      }

      this.optionsB = options;
    },
    onInput() {
      // console.log("In search filter");
      // console.log(this.filteredOptions)
      if (this.isSelected || this.searchFilter) {
        if (this.filteredOptions.length > 0) {
          this.selected = this.filteredOptions[0];
        }
        this.setHovered(0);
      } else {
        // this.selectOption(null);
      }
      this.isSelected = false;
      this.filterOptions();
      // this.$emit("filter", this.searchFilter);
    },
    filterOptions() {
      if (typeof this.searchFilter === "string") {
        // console.log("In FilteredOptions");
        const filtered = [];
        let searchText = this.searchFilter.toLowerCase();
        let optionText = "";
        for (const option of this.optionsB) {
          if (!option.disabled || !this.isOptionsShared) {
            optionText = option.text.toLowerCase();
            if (
              this.searchFilter.length < 1 ||
              optionText.indexOf(searchText) >= 0
            ) {
              filtered.push(option);
            }
          }
        }
        this.filteredOptions = filtered;
      }
    },
    setHovered(index) {
      this.hovered = index;
    },
    selectOption(option) {
      if(this.selected.value === null) {
        debugger;
      }
      if (
        !this.compareOptions(option, this.selected) &&
        typeof this.selected.text === "string"
      ) {
        if (this.isOptionsShared) {
          this.updateDisabledStatus(option);
        }

        // console.log("In select option")
        this.selected = option;
        // this.optionsShown = false;
        if (this.searchFilter !== this.selected.text) {
          // console.log(this.selected.text)
          if(!this.selected.text) debugger
          this.searchFilter = this.selected.text;
        }
        console.log(this.selected.value)
        this.$emit("input", this.selected.value);
      }
    },
    updateDisabledStatus(option) {
      if (this.selected && this.selected.value) {
        this.selected.disabled = false;
      }
      if (option) {
        option.disabled = true;
      }
    },
    showOptions() {
      // console.log("In showOptions");
      if (!this.searchFilter) {
        this.searchFilter = "";
      }
      if (this.optionsB.length < this.options.length) {
        this.initOptions();
      }
      this.filterOptions();
      this.optionsShown = true;
      this.setHovered(0);
    },
    compareOptions(a, b) {
      if (typeof a.value === typeof b.value) {
        if (typeof a.value === "object") {
          if (a.value && b.value) {
            return a.value[this.valueUid] === b.value[this.valueUid];
          }
        } else {
          return a.value === b.value;
        }
      }
      return false;
    },
    exit() {
      // console.log("In Exit");
      // console.log(this.selected.value)
      if (this.selected.value) {
        this.searchFilter = this.selected.text;
      } else {
        this.selected = {
          text: "",
          value: this.emptyValue,
        };
        this.searchFilter = "";
      }
      this.optionsShown = false;
      this.hovered = false;
    },
    keyMonitor: function (event) {
      switch (event.which) {
        case 38: // ArrowUp
          {
            this.setHovered(Math.max(0, --this.hovered));
          }
          break;
        case 40: // ArrowDown
          {
            this.setHovered(
              Math.min(this.filteredOptions.length - 1, ++this.hovered)
            );
          }
          break;
        case 13:
          {
            // Enter Key
            if (this.filteredOptions[this.hovered]) {
              event.preventDefault();
              this.selectOption(this.filteredOptions[this.hovered]);
              this.isSelected = true;
            }
          }
          break;
        case 27:
          {
            // Esc key
            this.$refs.inputField.blur();
          }
          break;
      }

      // on arrow key press, move the hover from one element to another and scroll when necessary
      if (this.optionsShown) {
        const list = this.$refs.autocomplete.querySelector(
          ".gk-autocomplete-content"
        );
        const element = list.querySelectorAll(".gk-autocomplete-item")[
          this.hovered
        ];

        if (!element) return;

        const visMin = list.scrollTop;
        const visMax = list.scrollTop + 200 - element.clientHeight;

        if (element.offsetTop < visMin) {
          list.scrollTop = element.offsetTop;
        } else if (element.offsetTop >= visMax) {
          list.scrollTop =
            element.offsetTop - list.clientHeight + element.clientHeight;
        }
      }
    },
  },
  watch: {
    value(newVal) {
      // console.log("In Value");
      // console.log(newVal);
      if(newVal === null) {
        debugger;
      }
      if (!this.optionsB) {
        return;
      }
      if (this.optionsB.length !== this.options.length) {
        this.initOptions();
      }

      // if the query string entered doesn't have any matching options, its value will become null.
      // Then this method will again be called with null as newVal. At that time the text entered must not vanish.
      if (newVal === null || newVal === undefined) {
        // console.log(this.searchFilter)
        this.selectOption({ text: this.searchFilter, value: this.emptyValue });
        return;
      }
      if (this.optionsB && Array.isArray(this.optionsB)) {
        if (this.optionsB.length) {
          let optionsType = typeof this.optionsB[0].value;
          let newType = typeof newVal;
          if (newType === optionsType) {
            let selected = null;
            if (newType === "object") {
              selected = this.optionsB.find((option) =>
                option
                  ? option.value[this.valueUid] === newVal[this.valueUid]
                  : !!option
              ) || { text: "", val: this.emptyValue };
            } else {
              selected = this.optionsB.find((option) =>
                option ? option.value === newVal : !!option
              ) || { text: "", value: this.emptyValue };
            }
            this.selectOption(selected);
          } else {
            this.selectOption({ text: newVal, value: this.emptyValue });
          }
        }
      }
      this.filterOptions();
    },
  },
  beforeDestroy() {
    this.updateDisabledStatus({
      text: this.searchFilter,
      value: this.emptyValue,
    });
  },
};
</script>


<style lang="scss" scoped>
.gk-autocomplete {
  position: relative;
  display: block;
  margin: auto;
  .gk-autocomplete-input {
    background: #fff;
    border: 1px solid #ced4da;
    // border: 1px solid #e7ecf5;
    border-radius: 0.25rem;
    color: #333;
    display: block;
    font-size: 0.8em;
    padding: 6px;
    // min-width: 250px;
    // max-width: 250px;
  }
  .gk-autocomplete-content {
    position: absolute;
    background-color: #fff;
    // min-width: 248px;
    width: 100%;
    // max-width: 248px;
    max-height: 200px;
    border: 1px solid #e7ecf5;
    box-shadow: 0px -8px 34px 0px rgba(0, 0, 0, 0.05);
    overflow: auto;
    z-index: 99999;
    .gk-autocomplete-item {
      cursor: pointer;
      color: black;
      font-size: 0.7em;
      line-height: 1em;
      padding: 8px;
      text-decoration: none;
      display: block;
      &:hover {
        background-color: #e7ecf5;
      }
    }
  }
  .gk-autocomplete:hover .dropdowncontent {
    display: block;
  }

  .gk-autocomplete-item-hover {
    background-color: #e7ecf5;
  }
}
</style>