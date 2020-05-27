<template>
  <div class="publisher" :style="style" :class="{outside: !isInsideViewport}">
    <div v-if="space.published" class="video" ref="video"/>
    <div v-else class="video disabled-video" ref="video">
      <progressive-background v-if="profile && profile.avatar" :src="profile.avatar"/>
    </div>
    <div class="arrow" v-if="!isInsideViewport"/>
  </div>
</template>

<script lang="ts">
  import {Component, Mixins, Prop} from 'vue-property-decorator'
  import {Element} from './Element'
  import {User} from '@/models/User'
  import {SpacePosition} from '@/models/SpacePosition'
  import {SpacesModule} from "@/store/modules/spaces";
  import {SignalMessage} from "@/views/spheres/components/signals";
  import {Profile} from "@/models/Profile";

  @Component
  export default class Publisher extends Mixins(Element) {

    @Prop() space!: any;

    //move it?
    profile = SpacesModule.profile;

    demoModeAs: string | null = null;

    user: User | null = null;

    created() {
      this.movable = true;
      this.signalOnMoving = true;
      this.position = new SpacePosition(0, 0);
    }

    get outsideStyle(): Partial<CSSStyleDeclaration> | {} {
      if (!this.position || !this.viewport) return {};

      const offset = 5 / this.viewport.scale;
      const scale = this.MIN_SCALE / this.viewport.scale;
      const swidth = this.width * scale;
      const sheight = this.height * scale;

      const tx = Math.min(
        (this.viewport.x + this.viewport.width) / this.viewport.scale - swidth / 2 - offset,
        Math.max(
          this.viewport.x / this.viewport.scale + swidth / 2 + offset,
          this.position.x
        )
      ) - this.width / 2;

      const ty = Math.min(
        (this.viewport.y + this.viewport.height) / this.viewport.scale - sheight / 2 - offset,
        Math.max(
          this.viewport.y / this.viewport.scale + sheight / 2 + offset,
          this.position.y
        )
      ) - this.height / 2;

      const angleDeg = 90 + Math.atan2(ty + this.height / 2 - this.position.y, tx + this.width / 2 - this.position.x) * 180 / Math.PI;

      return {
        ...this.sizeStyle,
        '--arrow-rotate': `${angleDeg}deg`,
        transform: `translate3d(${tx}px, ${ty}px, 0px) scale(${scale})`
      }
    }

    mounted() {
      if (this.demoVideoFile !== null) {
        const demo = document.createElement('video');
        demo.loop = true;
        demo.muted = true;
        demo.src = this.demoVideoFile;
        demo.play();

        /*
                //this for emulate webcam streams only
                //@ts-ignore
                const stream = demo.captureStream(25);
                properties.videoSource = stream.getVideoTracks()[0];
                properties.audioSource = stream.getAudioTracks()[0];
                properties.disableAudioProcessing = true // get rid of clicks/pops (hopefully)
        */
      }

      /*
            this.publisher.on('accessDialogOpened', ev => {
                // analyticsService.fireAccessRequested();
                // this.publisher.once('accessAllowed', ev => {
                //     analyticsService.fireAccessAllowed()
                // })
            });

            this.publisherpublisher.on('accessDenied', ev => {
                // analyticsService.fireAccessDenied()
            });
      */
    }

    publish() {
      let createRoom = () => {
        let roomInfo = {
          room: this.space.id,
          description: "{\"test\":\"passed\"}",
          secret: "secret"
        };
        return this.session.createRoom(roomInfo);
      };

      let register = () => {
        let roomInfo = {
          room: this.space.id,
          //username: this.profile.name
          profile: this.profile
        };
        return this.session.register(roomInfo);
      };

      let roomExists = () => {
        let roomInfo = {
          room: this.space.id,
        };
        return this.session.exists(roomInfo);
      };

      this.session.getConfig().reinitHandler = () => {
        SpacesModule.deleteUser({
          spaceId: this.space.id,
          user: {id: this.rid.toString()}
        });
        publish();
      };

      let join = () => {
        this.session.getConfig().ridHandler = (rid) => {
          this.rid = rid;
          SpacesModule.addUser({
            spaceId: this.space.id,
            user: {
              id: rid.toString(),
              profile: this.profile
            },
          });
          this.user = SpacesModule.user(rid);
        };
        this.session.startOwnFeed({
          audioSend: true,
          videoSend: true,
        }, () => {
          //this.signalMoved();

          const el = this.$refs.video as HTMLDivElement;
          let video = el.getElementsByTagName('video').item(0);
          if (video == null) {
            video = document.createElement('video');
            video.setAttribute("playsinline", '');
            video.autoplay = true;
            video.muted = true;
            video.controls = false;
            el.appendChild(video);
          }

          this.session.attachStream(video, 0)
            .then(() => {
              console.log('local video stream attached', 0);
            })
            .catch(function (err) {
              console.error(err);
            });
        });
      };

      const publish = () => {
        roomExists().then((result) => {
          if (result.exists) {
            console.log(">>> Room exists", result);
            register().then(() => {
              join();
            }).catch(function (err) {
              alert(err);
            });
          } else {
            console.log(">>> Create room", result);
            createRoom().then(() => register().then(() => {
              join();
            }).catch(function (err) {
              alert(err);
            }));
          }
        });
      };

      publish()
    }

    signalReady(to?: number) {
      let profile: Profile = {
        id: this.profile.id,
        name: this.profile.name,
        description: this.profile.description || "desc",
        avatar: this.profile.avatar
      };
      const msg: SignalMessage = {
        t: 'ready', profile: profile
      };
      this.signal(msg, to);
    }

    beforeDestroy() {
      this.session.stopOwnFeed();
    }

    get demoVideoFile(): string | null {
      switch (this.demoModeAs) {
        case 'poper-1':
          return require('../../assets/demo/poper-1.webm');
        case 'poper-2':
          return require('../../assets/demo/poper-2.webm');
        case 'poper-3':
          return require('../../assets/demo/poper-3.webm');
        case 'porno-1':
          return require('../../assets/demo/porno-1.webm');
        case 'porno-2':
          return require('../../assets/demo/porno-2.webm');
        case 'shnur-1':
          return require('../../assets/demo/shnur-1.webm');
        case 'shnur-2':
          return require('../../assets/demo/shnur-2.webm');
        default:
          return null
      }
    }
  }
</script>

<style lang="scss">
  @import "./_element.scss";

  .publisher {
    .video {
      video {
        @extend %video-element;
        @include videoMemberTransformer(-1);
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import "./_element.scss";

  @mixin circleBorder($size) {
    box-shadow: 0 0 0 $size $white;
  }

  .publisher {
    @extend %space-element-shared;

    border-radius: 50%;
    cursor: pointer;
    z-index: 10;

    .video {
      @extend %circle-video-shared;
      @include circleBorder(3px);
    }

    &.outside {
      .video {
        @include circleBorder(5px);
      }
    }

    --arrow-rotate: 0deg;

    .arrow {
      position: absolute;
      z-index: -1;

      width: 51px;
      height: 51px;
      transform: rotate(var(--arrow-rotate)) translate(0px, 44px) rotate(45deg);

      background-color: #ffffff;
    }
  }
</style>
