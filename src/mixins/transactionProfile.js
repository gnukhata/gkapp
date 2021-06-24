import { mapState } from 'vuex';
export default {
  computed: {
    numberFormat: (self) => self.$store.getters['global/getTrnNoFormat'],
    dateFormat: (self) => self.$store.getters['global/getDateFormat'],
    minDate: (self) => self.reverseDate(self.yearStart),
    maxDate: (self) => self.reverseDate(self.yearEnd),
    ...mapState(['yearStart', 'yearEnd']),
  },
  methods: {
    reverseDate(date) {
      return date.split('-').reverse().join('-');
    },
    formatNoteNo(format, counter, code, date, date2) {
      let prefix = '', suffix = '';

      function formatPattern(patterns, separator) {
        const formattedPattern = patterns.reduce((acc, pattern) => {
          let text = '';
          switch (pattern.type) {
            case 'date':
              {
                let dt = new Date(date).getFullYear();
                switch (pattern.format) {
                  case 'yy':
                    {
                      text += `${acc}${dt % 100}${separator}`;
                    }
                    break;
                  case 'yyyy':
                    {
                      text += `${acc}${dt}${separator}`;
                    }
                    break;
                  case 'yy-yy':
                    {
                      let dt2 = new Date(date2).getFullYear() % 100;
                      text += `${acc}${dt % 100}${separator}${dt2}${separator}`;
                    }
                    break;
                  case 'yyyy-yyyy': {
                    let dt2 = new Date(date2).getFullYear();
                    text += `${acc}${dt % 100}${separator}${dt2}${separator}`;
                  }
                }
              }
              break;
            case 'string':
              text += `${acc}${code}${separator}`;
              break;
          }
          return text;
        }, '');
        return formattedPattern.slice(0, formattedPattern.length - 1);
      }

      if (format.prefix) {
        prefix = `${formatPattern(format.prefix.pattern, format.prefix.separator)}${format.separator}`;
      }
      if (format.suffix) {
        suffix = `${format.separator}${formatPattern(format.suffix.pattern, format.suffix.separator)}`;
      }
      return `${prefix}${counter}${suffix}`;
    },
    getNoteDate() {
      let today = new Date().getTime(),
        min = new Date(this.yearStart).getTime(),
        max = new Date(this.yearEnd).getTime();
      let noteDate;
      if (today >= min && today <= max) {
        noteDate = this.convertDateToStr(new Date());
      } else {
        noteDate = this.yearEnd;
      }
      return noteDate
    },
    /**
     * convertDateToStr(date)
     *
     * Description: Converts a js Date object, into yyyy-mm-dd string
     */
    convertDateToStr(date) {
      return date.toISOString().slice(0, 10);
    },
    displayToast(title, message, variant) {
      this.$bvToast.toast(message, {
        title: title,
        autoHideDelay: 3000,
        variant: variant,
        appendToast: true,
        solid: true,
      });
    },
  }
}