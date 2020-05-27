<template>
  <div class="youtube-el" :style="style" @mouseenter="mouseIn = true" @mouseleave="mouseIn = false"
       :class="{'map-transparent': !publishing}">
    <ElementHeader :title="title" :publishing="publishing"
                   :visible="mouseIn || mouseDowned || !ready" @close="close()"/>

    <img v-if="!publishing" v-show="mouseIn || muted" svg-inline class="mute" :src="mutedImg"
         @click="muted = !muted" alt=""/>

    <div class="player" :class="{'pointer-events-none': !this.publishing || this.mouseDowned}">
      <youtube :video-id="obj.videoId" :player-vars="playerVars" ref="player" width="100%"
               height="100%"
               @ready="onPlayerReady"
               @playing="onPlayerStateChanged('playing')" @ended="onPlayerStateChanged('ended')"
               @paused="onPlayerStateChanged('paused')"
               @buffering="onPlayerStateChanged('buffering')" @cued="onPlayerStateChanged('cued')"/>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Mixins, Watch} from 'vue-property-decorator'
  import {Element} from './Element'
  import {YoutubeObject} from '@/models/YoutubeObject'
  import {Youtube} from 'vue-youtube'
  import {calcGainExponential} from '@/services/utils'
  import ElementHeader from '../../components/elements/ElementHeader.vue'

  const YT_UNSTARTED = -1;
  const YT_ENDED = 0;
  const YT_PLAYING = 1;
  const YT_PAUSED = 2;
  const YT_BUFFERING = 3;
  const YT_CUED = 5;

  @Component({
    components: {
      Youtube,
      ElementHeader
    }
  })
  export default class YoutubeElement extends Mixins(Element) {
    obj!: YoutubeObject;

    mouseIn = false;
    muted = false;

    @Watch('muted')
    async onMutedChanged() {
      if (await this.ytPlayer.isMuted()) {
        this.ytPlayer.unMute()
      } else {
        this.ytPlayer.mute()
      }
    }

    ready = false;

    playerVars = {
      origin: `${window.location.protocol}//${window.location.host}`,
      enablejsapi: 1,
      autoplay: 0,
      autohide: 1,
      modestbranding: 1,
      disablekb: 1,
      controls: this.publishing ? 1 : 0
    };

    ytMutedTimer: number | null = null;

    get publishing() {
      return this.obj.publishing
    }

    created() {
      this.movable = this.publishing;
      this.signalOnMoving = this.publishing;

      this.position = this.obj.position;
      this.width = 427;
      this.height = 240 + 22;

      if (this.publishing) {
        //this.session.on('streamCreated', this.onStreamCreated)
      }

      if (this.obj.publishing) {
        this.ytMutedTimer = setInterval(this.ytMuteChecker(), 1000)
      }
    }

    ytMuteChecker() {
      let lastIsMuted = false;
      return async () => {
        const muted = await this.ytPlayer.isMuted();
        if (!lastIsMuted && muted) {
          // analyticsService.fireYTVideoMuted()
        } else if (lastIsMuted && !muted) {
          // analyticsService.fireYTVideoUnmuted()
        }
        lastIsMuted = muted
      }
    }

    onStreamCreated(ev: any) {
      // onStreamCreated (ev: OT.Event<'streamCreated', OT.Session> & { stream: OT.Stream }) {
      //this.signalYouTubeCreated(ev.stream.connection);
      this.signalSyncIfNeeded()
    }

    close() {
      this.ytPlayer.stopVideo();
      this.$emit('close', this)
    }

    beforeDestroy() {
      if (this.publishing) {
        this.signal({t: 'youtube-destroy', id: this.obj.id});
        //this.session.off('streamCreated', this.onStreamCreated)
      }

      if (this.ytMutedTimer !== null) {
        clearInterval(this.ytMutedTimer);
        this.ytMutedTimer = null
      }
    }

    get mutedImg(): string {
      if (this.muted) {
        return require('../../assets/mute-1.svg')
      } else {
        return require('../../assets/mute-0.svg')
      }
    }

    get player() {
      return this.$refs.player as any
    }

    get ytPlayer() {
      return (this.$refs.player as any).player
    }

    async onPlayerReady() {
      this.ready = true;
      if (this.publishing) {
        // TODO: check for readiness
        this.signalYouTubeCreated()
        // analyticsService.fireYTVideoShared(await this.ytPlayer.getVideoUrl(), await this.ytPlayer.getDuration())
      }
      this.onDistanceChanged()
    }

    lastPlayerTime = 0;

    async onPlayerStateChanged(state: 'playing' | 'ended' | 'paused' | 'buffering' | 'cued' | 'unstarted') {
      console.log('youtube[%s]: state changed to %s', this.obj.id, state);
      if (this.publishing) {
        await this.signalSyncIfNeeded();
        const currentPlayerTime = await this.ytPlayer.getCurrentTime();
        if (state === 'playing') {
          this.lastPlayerTime = currentPlayerTime
          // analyticsService.fireYTVideoLaunched()
        } else if (state === 'paused') {
          // analyticsService.fireYTVideoPaused()
        } else if (state === 'buffering') {
          const seeked = Math.abs(currentPlayerTime - this.lastPlayerTime) > 2;
          this.lastPlayerTime = currentPlayerTime;
          if (seeked) {
            // analyticsService.fireYTVideoRewonded()
          }
        }
      }
    }

    signalYouTubeCreated(to?: any) {
      this.signal({
        t: 'youtube-created',
        id: this.obj.id,
        vid: this.obj.videoId,
        x: this.position!.x,
        y: this.position!.y
      }, to, this.obj.user.id)
    }

    signalYouTubeSync(state: 'play' | 'pause', position: number, to?: any) {
      // signalYouTubeSync (state: 'play' | 'pause', position: number, to?: OT.Connection) {
      this.signal({t: 'youtube-sync', id: this.obj.id, s: state, pos: position}, to)
    }

    async signalSyncIfNeeded() {
      const state = await this.ytPlayer.getPlayerState();
      const currentTime = await this.ytPlayer.getCurrentTime();
      if ([YT_PLAYING].includes(state)) {
        this.signalYouTubeSync('play', currentTime)
      } else if (state === YT_PAUSED || state === YT_BUFFERING) {
        this.signalYouTubeSync('pause', currentTime)
      }
    }

    async play(at: number) {
      const now = new Date().getTime() / 1000;
      await this.ytPlayer.getPlayerState(); // waiting for player ready
      await this.ytPlayer.seekTo(at + (new Date().getTime() / 1000 - now), true);
      await this.ytPlayer.playVideo()
    }

    async pause(at: number) {
      const now = new Date().getTime() / 1000;
      await this.ytPlayer.getPlayerState(); // waiting for player ready
      await this.ytPlayer.seekTo(at + (new Date().getTime() / 1000 - now), true);
      await this.ytPlayer.pauseVideo()
    }

    @Watch('distance') onDistanceChanged() {
      const ref = this.height;
      const gain = calcGainExponential(this.distance, ref, 5);
      const volume = Math.floor(gain * 100);
      this.ytPlayer.setVolume(volume)
    }

    get title() {
      if (this.publishing) {
        return `Pinned by you`
      } else if (this.obj.user.profile) {
        return `Pinned by ${this.obj.user.profile.name}`
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "./_element.scss";

  .youtube-el {
    @extend %space-element-shared;

    justify-content: flex-end;
    overflow: visible;

    .mute {
      cursor: pointer;
      position: absolute;
      left: 10px;
      bottom: 10px;
      z-index: 1;
      filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
    }

    .player {
      background-color: #3d5169;
      flex-grow: 1;
      width: 100%;
      display: flex;
      flex-direction: column;

      & > > > iframe {
        flex-grow: 1;
      }
    }
  }
</style>
