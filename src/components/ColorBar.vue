<template>
    <div class="d-flex flex-row justify-content-left">
        <div class="m-1" v-for="(style, index) in version" :key="index" :style="style"></div>
    </div>
</template>

<script>
export default {
    name: 'ColorBar',
    data() {
        return {
      // color codes for numbers
        number: {
            zero: 'violet',
            one: 'Indigo',
            two: 'blue',
            three: 'green',
            four: 'yellow',
            five: 'orange',
            six: 'red',
            seven: 'black',
            eight: 'maroon',
            nine: 'coral'
            },
        version: []
        }
    },
    methods: {
        ver() {
            this.version = [
                `background-color: ${this.number.zero}; height: 3px; width: 50%`,
                `background-color: ${this.number.one}; height: 3px; width: 50%`,
                `background-color: ${this.number.zero}; height: 3px; width: 50%`
            ]
        }
    },
    mounted() {
        this.ver()
    }
}
</script>
