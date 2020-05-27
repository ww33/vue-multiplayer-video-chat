<template>
  <Space class="space"/>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'
  import Space from './Space.vue'

  @Component({
    components: {
      Space,
    }
  })
  export default class Index extends Vue {
  }
</script>

<style scoped lang="scss">
</style>
