<template>
  <div class="element subscriber" :style="style" :class="{outside: !isInsideViewport}"
       @mouseleave="mouseOnArrow = false" v-title="name" title-placement="bottom"
       @mouseenter="mouseOnArrow = true">
    <div v-if="hasSignal" class="video" ref="video" v-show="isInsideViewport || mouseOnArrow"/>
    <div v-else class="video no-signal-video" ref="video" v-show="isInsideViewport || mouseOnArrow">
      <img src="../../assets/no-signal.png">
    </div>
    <!--
    <div v-else class="video disabled-video" ref="video" v-show="isInsideViewport || mouseOnArrow">
        <progressive-background
                :src="stream.connData.avatar"
                v-if="stream.connData.avatar !== undefined"/>
    </div>
    -->
    <img svg-inline :src="muteBtn" class="mute pointer" v-show="isInsideViewport"
         :class="{muted}"
         @click="muted = !muted"
         :style="muteStyle">
    <div v-if="!isInsideViewport" class="arrow" @mouseenter="mouseOnArrow = true"/>
    <div class="debug" v-if="config.showDebug">
      <span style="white-space: nowrap;">
        <strong>Bit:</strong> {{bitrate}}
      </span>
      <br/>
      <span style="white-space: nowrap;">
        <strong>Res:</strong> {{resolution}}
      </span>
      <br/>
      <!--
      <span style="white-space: nowrap;">
        <strong>Fps:</strong> {{framerate}}
      </span>
      -->
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Mixins, Prop, Watch} from 'vue-property-decorator'
  import {Element} from './Element'
  import {calcGainExponential} from '@/services/utils'
  import {Stream} from '@/models/Stream'
  import {SpaceConfigModule} from "@/store/modules/space-config";

  @Component
  export default class Subscriber extends Mixins(Element) {
    @Prop({type: Stream, required: true}) stream!: Stream;
    @Prop({type: Boolean, default: false}) demoMode!: boolean;

    muted = false;

    @Watch('muted') onMuteChanged() {
      this.getVideo().muted = this.muted;
    }

    timer = 0;
    bitrate = "";
    resolution = "";
    framerate = "";

    hasSignal = true;

    //config = SpaceConfigModule.config();

    get config() {
      return SpaceConfigModule.config();
    }

    mounted() {
      this.session.attachStream(this.getVideo(), this.stream.id)
        .then(() => {
          console.log('subscriber stream attached', this.stream.id);
          this.rid = this.stream.feed.rfid;
          this.$emit('subscribed', this);

          this.timer = setInterval(() => {
            this.bitrate = this.stream.feed.getBitrate();
            let video = this.getVideo();
            let height = video.videoHeight;
            let width = video.videoWidth;

            this.hasSignal = !(height == 0 || width == 0);

            if (width > 0 && height > 0) {
              this.resolution = width + 'x' + height;
            }
          }, 1000);
        })
        .catch((err) => {
          console.error(err);
          this.$emit('error', err);
        });
    }

    beforeDestroy() {
      clearInterval(this.timer);
    }

    get name(): string {
      return this.stream.name.valueOf()
    }

    get muteBtn(): string {
      if (this.muted) {
        return require('../../assets/mute-1.svg')
      } else {
        return require('../../assets/mute-0.svg')
      }
    }

    @Watch('distance', {immediate: true}) onDistanceChanged() {
      if (!this.$refs.video) return;
      const gain = calcGainExponential(this.distance, this.MAX_SIZE * 1.5, 4);
      let video = this.getVideo();
      let volume = video.volume;
      if (!this.muted && gain !== volume) {
        //console.debug('%s set volume to %f from %f', this.stream.id, gain, volume);
        video.volume = gain;
      }

      // const c = 1 - 0.5 * (this.distance - MAX_SIZE * 2) / (1000 - MAX_SIZE * 2)
      this.scale = this.MIN_SCALE + gain * (1 - this.MIN_SCALE)
    }

    private getVideo(): HTMLVideoElement {
      const el = this.$refs.video as HTMLDivElement;
      let video = el.getElementsByTagName('video').item(0);
      if (video == null) {
        video = document.createElement('video');
        video.setAttribute("playsinline", '');
        video.autoplay = true;
        video.muted = false;
        video.volume = 1;
        video.controls = false;
        el.appendChild(video);
      }
      return video;
    }

    get muteStyle(): Partial<CSSStyleDeclaration> {
      const scale = 1 / this.scale;
      return {
        transform: `scale(${scale})`
      }
    }

    // TODO: move to Element
    private calcTranslate(vpCoord: number,
                          vpSize: number,
                          vpScale: number,
                          elPosition: number,
                          elSize: number,
                          elSizeScaled: number,
                          offset = 0): number {
      return Math.min(
        (vpCoord + vpSize) / vpScale - elSizeScaled / 2 - offset,
        Math.max(
          vpCoord / vpScale + elSizeScaled / 2 + offset,
          elPosition
        )
      ) - elSize / 2
    }

    mouseOnArrow = false;

    get outsideStyle(): Partial<CSSStyleDeclaration> | {} {
      if (!this.position || !this.viewport) return {};

      const offset = 8 / this.viewport.scale;
      const scale = this.MIN_SCALE / this.viewport.scale;
      const swidth = this.width * scale;
      const sheight = this.height * scale;

      const tx = this.calcTranslate(
        this.viewport.x,
        this.viewport.width,
        this.viewport.scale,
        this.position.x,
        this.width,
        swidth,
        offset
      );

      const ty = this.calcTranslate(
        this.viewport.y,
        this.viewport.height,
        this.viewport.scale,
        this.position.y,
        this.height,
        sheight,
        offset
      );

      const angleDeg = 90 + Math.atan2(
        ty + this.height / 2 - this.position.y,
        tx + this.width / 2 - this.position.x) * 180 / Math.PI;

      return {
        ...this.sizeStyle,
        '--arrow-rotate': `${angleDeg - 90}deg`,
        '--arrow-scale': 1 / scale / this.viewport.scale,
        transform: `translate3d(${tx}px, ${ty}px, 0px) scale(${scale})`
      }
    }
  }
</script>

<style lang="scss">
  @import "./_element.scss";

  .subscriber {
    .video {
      video {
        @extend %video-element;
        @include videoMemberTransformer(1);
      }
    }

    .no-signal-video {
      video {
        display: none;
      }

      img {
        object-fit: scale-down;
        width: 100%;
        height: 100%;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import "./src/styles/variables";
  @import "./element";

  $hoverDuration: 200ms;
  $zIndex: 5;

  .debug {
    display: block;
    font-size: small;
    position: absolute;
    bottom: 0;
    left: 100%;
  }

  .element {
    @extend %space-element-shared;
    z-index: $zIndex;
  }

  @mixin circleBorder($size) {
    box-shadow: 0 0 0 $size $subscriber;
  }

  .subscriber {
    transition: box-shadow $hoverDuration, transform 100ms;
    border-radius: 50%;

    .video {
      @extend %circle-video-shared;
      @include circleBorder(3px);

      video {
        @extend %circle-video-shared;
      }
    }

    .mute {
      position: absolute;
      bottom: 10px;
      z-index: $zIndex+1;
      opacity: 0;
      transition: opacity $hoverDuration, transform 100ms;
      transform-origin: center bottom;
    }

    &:hover:not(.outside), &:active:not(.outside) {
      box-shadow: 0 0 0 3px #ffffff;

      .mute {
        opacity: 1;
      }
    }

    .muted {
      opacity: 1;
    }
  }

  .outside {
    transition: none;
    --arrow-rotate: 0deg;
    --arrow-scale: 1;

    .arrow {
      position: absolute;
      z-index: -1;

      width: 0;
      height: 0;

      $size: 10px;

      border-left: $size solid transparent;
      border-right: $size solid transparent;
      border-top: $size solid #ffffff;

      transform: rotate(var(--arrow-rotate)) translate(-69px, 0px) rotate(90deg) scale(var(--arrow-scale));
    }
  }
</style>
