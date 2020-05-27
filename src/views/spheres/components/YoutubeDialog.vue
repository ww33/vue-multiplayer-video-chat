<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-text>
        <v-row style="margin-left: 3px">
          <v-icon large color="#FF0000">mdi-play-box-outline</v-icon>
          <v-card-title v-if="error" class="input-text error">{{ error }}</v-card-title>
          <v-card-title v-else>YouTube video link</v-card-title>
        </v-row>
        <v-row align="center"
               class="mx-0">
          <v-text-field
            label=""
            solo
            v-model="url"
            autofocus/>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="secondary"
               @click="dialog = false">CANCEL
        </v-btn>
        <v-btn @click="submit">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator'
  import urlParser from 'js-video-url-parser'
  import {AppModule} from '@/store/modules/app'

  @Component
  export default class YoutubeDialog extends Vue {
    private urlEl!: HTMLInputElement;
    url: string = '';
    error: string | null = null;

    get dialog() {
      return AppModule.getShowYoutubeDialog
    }

    set dialog(val) {
      AppModule.setShowYoutubeDialog(val)
    }

    opened() {
      this.url = '';
      this.error = '';

      this.urlEl = this.$refs.url as HTMLInputElement;
      this.urlEl.focus()
    }

    submit() {
      const video = urlParser.parse(this.url);
      if (!video || video.provider !== 'youtube' || video.mediaType !== 'video' || !video.id) {
        this.error = 'Incorrect link';
        return
      }

      this.$emit('added', this.url, video.id);
      this.dialog = false
    }
  }
</script>

<style lang="scss" scoped>

</style>
