<template>
  <div class="warning-wrapper">
    <div class="">
      <img src="../assets/svg/mic-off.svg"
           class="" />
    </div>

    <div class="w-text">
      You were muted by the admin of the meeting group.
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'

  @Component
export default class MutedPopup extends Vue {

}
</script>

<style lang="scss" scoped>
.warning-wrapper {
  background-color: $grey-60;
  height: 75px;
  width: 525px;
  position: fixed;
  top: 10%;
  left: 50%;
  z-index: 999;
  border-radius: 13px;
  padding: 20px;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(54.3656px);
}

.w-text {
  margin-left: 20px;
  color: $black;
  font-size: 15px;
}
</style>
