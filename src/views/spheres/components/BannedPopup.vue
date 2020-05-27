<template>
  <div class="banned-wrapper">
    <div class="profile-pic-wrapper">
      <progressive-background class="profile-pic"
                              :src="userData.avatar"
                              v-if="userData.avatar !== undefined" />
    </div>

    <div class="banned-caption">
      Banned
    </div>

    <div class="banned-text">
      You were banned by the administrator
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'

  @Component
export default class BannedPopup extends Vue {
  @Prop() userData!: any
}
</script>

<style lang="scss" scoped>
.banned-wrapper {
  width: 710px;
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 999;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.profile-pic-wrapper {
  border-radius: 50%;
  border: 3px solid #FF3B30;
  padding: 5px;
}

.profile-pic {
  background-size: cover;
  background-position: center center;
  height: 110px;
  width: 110px;
  border-radius: 50%;
}

.w-text {
  margin-left: 20px;
  color: $black;
  font-size: 15px;
}

.banned-caption {
  margin-top: 15px;
  font-size: 28px;
  font-weight: 500;
}

.banned-text {
  color: $grey-05;
  margin-top: 45px;
  font-size: 16px;

}

.leave {
  //@include button;


  margin-top: 120px;
  width: 190px;
  height: 52px;
  font-size: 16px;
}
</style>
