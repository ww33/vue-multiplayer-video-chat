<template>
  <div class="landing-wrapper">
    <div class="logo-wrapper">
      <div class="logo">
        Online

        <span class="green"> Meetup </span>
      </div>
    </div>

    <landing-popup />
  </div>
</template>

<script lang="ts">
  import LandingPopup from './components/LandingPopup.vue'
  import {Component, Vue} from 'vue-property-decorator'

  @Component({
    components: {
      LandingPopup,
    }
  })
  export default class Landing extends Vue {

  }
</script>

<style scoped lang="scss">
.landing-wrapper {
  background: url("./assets/entrance-bg.svg") no-repeat center center fixed;
  background-size: cover;

  font-weight: normal;
  min-height: 100vh;
  width: 100%;
}

.logo-wrapper{
  height: 52px;
  padding: 0 50px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .logo {
    font-weight: 600;
    font-size: 24px;

    .green {
      font-weight: 300;
      color: $green;
    }
  }
}
</style>
