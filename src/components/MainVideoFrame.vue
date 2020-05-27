<template>
  <div ref="video" class="video-main-frame"/>
  <!--
    <div ref="video" class="video-main-frame">
      <video src="@/assets/v_360p.mp4" autoplay muted controls loop/>
    </div>
  -->
</template>

<script lang="js">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import JanusRoom from '@/lib/janusRoom';

  @Component
  export default class MainVideoFrame extends Vue {

    @Prop({
      required: true,
      type: JanusRoom
    })
    janusRoom;

    lastStream = null;

    setSubStream(feed, substream) {
      if (feed.simulcastStarted) {
        console.log('set substream for feed: ', feed.rfindex, substream);
        feed.send({
          message: {
            request: 'configure',
            substream: substream
          }
        });
      }
    }

    setStream(stream) {
      if (this.lastStream == null || this.lastStream.id !== stream.id) {
        if (this.lastStream !== null && this.lastStream.id > 0) {
          this.setSubStream(this.lastStream.feed, 0);
        }
        if (stream.id > 0) {
          this.setSubStream(stream.feed, 2);
        }
        this.lastStream = stream;
      }

      let video = this.$refs.video.getElementsByTagName('video')
        .item(0);
      if (video == null) {
        video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.autoplay = true;
        video.controls = false;
        video.muted = true;
        this.$refs.video.appendChild(video);
      }
      this.janusRoom.attachStream(video, stream.id)
        .then(() => {
          console.log('attached');
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  }
</script>

<style lang="scss">
  .video-main-frame {
    border: solid 3px var(--v-primary-base);
    box-sizing: border-box;
    margin-top: 1px;

    video {
      display: flex;
      object-fit: cover;
      width: 60vh;
      height: 45vh;
      padding: 0;
      margin: 0;
    }
  }
</style>
