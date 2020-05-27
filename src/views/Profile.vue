<template>
  <div id="profile">
    <Avatar maxFileSize="50"/>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import Avatar from './spheres/components/Avatar.vue'

  @Component({
    components: {Avatar}
  })
  export default class Profile extends Vue {
  }
</script>

<style>

</style>
