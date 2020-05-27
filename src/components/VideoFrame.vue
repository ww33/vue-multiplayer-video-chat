<template>
  <div class="video-frame" :class="{selected: stream.speaker}">
    <div ref="video"/>
    <div class="name">{{stream.name}}</div>
  </div>
</template>

<script lang="js">
  import { Component, Prop, Vue } from 'vue-property-decorator';

  import JanusRoom from '@/lib/janusRoom';
  import { Stream } from '@/models/Stream';

  @Component
  export default class VideoFrame extends Vue {

    @Prop({
      required: true,
      type: JanusRoom
    })
    janusRoom;

    @Prop({
      type: Stream
    })
    stream;

    mounted() {
      this.update();
    }

    update() {
      let video = this.$refs.video.getElementsByTagName('video')
        .item(0);
      if (video == null) {
        video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.autoplay = true;
        if (this.stream.id === 0) {
          video.muted = true;
        }
        video.controls = false;
        this.$refs.video.appendChild(video);
      }
      this.janusRoom.attachStream(video, this.stream.id)
        .then(() => {
          console.log('stream attached', this.stream);
        })
        .catch(function (err) {
          console.error(err);
        });
    }
  }
</script>

<style lang="scss">

  .video-frame {
    position: relative;
    margin: 2px;
    border: solid 2px var(--v-secondary-base);
    float: left;

    video {
      width: 20vh;
      height: 15vh;
      padding: 0;
      margin: 0;
      display: flex;
      object-fit: cover;
    }
  }

  .selected {
    border: solid 2px var(--v-primary-base);
    box-sizing: border-box;
  }

  /*
    .local {
      transform: scale(-1, 1) !important;
      //transform-origin: 50% 50% !important;
    }
  */

  $sh: .08vh;
  $shm: -$sh;

  .name {
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
    padding: 0 3px;
    color: black;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    font-size: 1.2vh;
    text-shadow: $sh 0 0 #fff,
    $shm 0 0 #fff,
    0 $sh 0 #fff,
    0 $shm 0 #fff,
    $sh $sh #fff,
    $shm $shm 0 #fff,
    $sh $shm 0 #fff,
    $shm $sh 0 #fff;
  }
</style>
