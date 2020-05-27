<template>
  <v-app-bar dense>
    <v-spacer/>
    <v-btn @click="addYoutube" icon>
      <v-icon>mdi-play-box-outline</v-icon>
    </v-btn>
    <v-btn @click="addImage" icon>
      <v-icon>mdi-file-image</v-icon>
    </v-btn>
    <v-btn @click="publish" icon :color="space.published ? '' : 'primary'">
      <v-icon>mdi-video-off</v-icon>
    </v-btn>
    <v-btn @click="mute" icon :color="space.muted ? 'primary': ''">
      <v-icon>mdi-microphone-off</v-icon>
    </v-btn>
    <v-btn @click="openUserMenu" icon :color="space.showUsersMenu ? 'primary': ''">
      <v-icon>mdi-account-multiple</v-icon>
      {{usersCount}}
    </v-btn>
    <v-btn @click="onZoomButton('plus')" icon>
      <v-icon>mdi-magnify-plus</v-icon>
    </v-btn>
    <v-btn @click="onZoomButton('minus')" icon>
      <v-icon>mdi-magnify-minus</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {SpacesModule} from '@/store/modules/spaces'
  import {AppModule} from '@/store/modules/app'

  @Component
  export default class ControlsPanel extends Vue {
    @Prop() spaceId!: string;

    get usersCount() {
      return SpacesModule.usersCount(this.space.id);
    }

    openUserMenu() {
      const space = this.space;
      space.showUsersMenu = !space.showUsersMenu;
    }

    get space() {
      return SpacesModule.space(parseInt(this.spaceId));
    }

    addYoutube() {
      AppModule.setShowYoutubeDialog(true)
    }

    addImage() {
      AppModule.setShowImageDialog(true)
    }

    publish() {
      this.space.published = !this.space.published;
    }

    mute() {
      this.space.muted = !this.space.muted;
    }

    onZoomButton(event){
      this.$root.$emit('onZoomButton', event)
    }
  }
</script>

<style lang="scss" scoped>

</style>
