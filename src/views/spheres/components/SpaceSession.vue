<template>
  <div class="session" ref="session">
    <v-progress-circular
      v-show="!space.connected"
      indeterminate
      color="red"
      style="z-index: 10000; position: absolute"
      size="20"/>

    <SpaceMap ref="spaceMap" @viewport-updated="mapViewport = $event" :spaceId="spaceId"
              @move-publisher="movePublisher" :session="session">
      <Publisher :session="session" @error="errorHandler" @selected="onElementSelected"
                 ref="publisher"
                 :viewport="mapViewport"
                 :space="space"
                 :userName="userName"
                 v-show="initialized"/>

      <Subscriber v-for="stream in streams" :key="stream.id" :session="session"
                  :stream="stream"
                  ref="subscribers"
                  @error="errorHandler" @subscribed="onSubscribed"
                  :viewport="mapViewport"/>

      <template>
        <component v-for="obj in objects" :is="getObjectComponent(obj)" :key="obj.id"
                   :session="session"
                   :viewport="mapViewport" :obj="obj"
                   @selected="onElementSelected" @close="onObjectElementClose"
                   ref="objects"/>
      </template>
    </SpaceMap>
    <!--    <Button @click="testButton" style="z-index: 10000">Reconnect</Button>-->
    <YoutubeDialog ref="youtubeDlg" @added="onYoutubeAdded"/>
    <AddImageDialog ref="addImageDlg" @selected="onImageAdded"/>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import Subscriber from '../components/elements/Subscriber.vue'
  import Publisher from '../components/elements/Publisher.vue'
  import {Element} from './elements/Element'
  import {SignalMessage} from './signals'
  import YoutubeElement from '../components/elements/YoutubeElement.vue'
  import {YoutubeObject} from '@/models/YoutubeObject'
  import {ImageObject} from '@/models/ImageObject'
  import {SpaceObject} from '@/models/SpaceObject'
  import YoutubeDialog from '../components/YoutubeDialog.vue'
  import {Stream} from '@/models/Stream'
  import {SpacePosition} from '@/models/SpacePosition'
  import SpaceMap from '../components/SpaceMap.vue'
  import {ViewportRect} from '@/models/Viewport'
  import {getCursorPosition} from '@/services/utils'
  import AddImageDialog from '../components/AddImageDialog.vue'
  import ImageElement from '../components/elements/ImageElement.vue'
  import JanusRoom from "@/lib/janusRoom";
  import {SpacesModule} from '@/store/modules/spaces';

  @Component({
    components: {
      Publisher,
      Subscriber,
      YoutubeDialog,
      AddImageDialog,
      YoutubeElement,
      ImageElement,
      SpaceMap
    }
  })

  export default class SpaceSession extends Vue {
    @Prop() spaceId!: string;

    @Prop({required: true})
    userName!: string;

    profile = SpacesModule.profile;

    space = SpacesModule.space(parseInt(this.spaceId));

    session!: JanusRoom;
    streams: Stream[] = [];

    initialized = false;

    testButton() {
      //this.space.connected = true;
      this.session.reinit();
    }

    @Watch('streams', {immediate: true}) onStreamsChanged() {
      this.$emit('members', this.streams)
    }

    objects: SpaceObject[] = [];
    mapViewport: ViewportRect | null = null;

    private publisher!: Publisher;
    private dragging: { el: Element, offsetX: number, offsetY: number, initialPosition: SpacePosition } | null = null;

    @Watch('space.muted', {immediate: true}) muted(muted) {
      if (this.session) {
        const handler = this.session.getConfig().videoRoomHandler;
        if (muted) {
          handler.muteAudio();
        } else {
          handler.unmuteAudio();
        }
      }
    }

    @Watch('space.published', {immediate: true}) published(published) {
      if (this.session) {
        const handler = this.session.getConfig().videoRoomHandler;
        if (published) {
          handler.unmuteVideo();
        } else {
          handler.muteVideo();
        }
      }
    }

    joinToSession() {
      this.space.connected = true;

      let config = this.session.getConfig();
      //output limit 100 KBt
      config.videoRoomHandler.send({
        message: {
          request: 'configure',
          bitrate: 131072
        }
      });

      if (this.space.published == false) {
        this.$nextTick(() => {
          const map = this.$spaceMap;
          if (map) {
            //@ts-ignore
            map.refreshViewportRect();
            //@ts-ignore
            //map.randomizeCenterViewport(128);
            //@ts-ignore
            const vpPos = map.viewportCenterToMapPosition;
            //@ts-ignore
            this.moveElement(this.publisher, vpPos.x, vpPos.y);
            this.space.published = true;
          }
        });
      }

      this.$emit('connected');
      this.initialized = true;
    }

    addStream(stream: Stream) {
      if (!this.streams.find(value => value.id === stream.id)) {
        console.info('JOIN', stream);
        let config = this.session.getConfig();
        stream.feed = config.feeds[stream.id];
        this.streams.push(stream);

        SpacesModule.addUser({
          spaceId: parseInt(this.spaceId),
          user: {
            id: stream.feed.rfid,
            profile: {
              id: stream.feed.rfid,
              name: stream.name
            },
            stream: stream
          },
        });
        this.objects.filter(value => {
          return value.user.id == config.myid;
        }).forEach(value => {
          const element = this.getObjectElementById(value.id);
          if (element !== undefined) {
            if (value instanceof ImageObject) {
              const image = element as ImageElement;
              setTimeout(() => {
                //@ts-ignore
                image.signalCreated();
              }, 1000);
            }
            if (value instanceof YoutubeObject) {
              const youtube = element as YoutubeElement;
              setTimeout(() => {
                //@ts-ignore
                youtube.signalYouTubeCreated();
                //@ts-ignore
                youtube.signalSyncIfNeeded();
              }, 1000);
            }
          }
        });
      }
    }

    removeStream(streamIndex) {
      console.info('REMOVE', streamIndex);
      const tempIndex = this.streams.findIndex(value => value.id === streamIndex);
      const stream = this.streams[tempIndex];
      if (stream && stream.name && this.spaceId) {
        SpacesModule.deleteUser(
          {
            spaceId: parseInt(this.spaceId),
            user: {id: stream.feed.rfid},
          }
        )
      }
      this.objects.filter(value => {
        return value.user.id == stream.feed.rfid
      }).forEach(value => {
        const element = this.getObjectElementById(value.id);
        if (element != undefined) {
          this.onObjectElementClose(element);
        }
      });
      this.$delete(this.streams, this.streams.findIndex(value => value.id === streamIndex));
    }

    receiveMessage(message) {
      if (message.type === 'signal') {
        if (message.to === undefined || message.to === this.session.getConfig().myid) {
          this.onSignal(message.from, message.data as SignalMessage);
        }
      }
      if (message.type === 'message') {
        //this.$refs.chat.addMessage(message);
      }
    }

    createSession() {
      let options = {
        //server: 'wss://test.meetup.inachi.eu:8989',
        server: 'wss://meetup.gekus.ru:8989',
        //server: 'ws://192.168.88.22:8188',
        //server: '/janus',
        publishers: 20,
        //media: 'lowres',
        onLocalJoin: () => {
          //console.log(">>>>>>>>>>>>>>>>>>>> onLocalJoin");
          this.joinToSession();
        },
        onRemoteJoin: (streamIndex, username) => {
          //console.log(">>>>>>>>>>>>>>>>>>> JOIN", streamIndex, username);
          this.addStream(new Stream(streamIndex, username));
        },
        onRemoteUnjoin: (streamIndex) => {
          this.removeStream(streamIndex);
        },
        onMessage: (data) => {
          this.receiveMessage(data);
        },
        onError: (err) => {
          console.log('Error', err);
        },
        onVolumeMeterUpdate: (streamIndex, volume) => {
          let stream = this.streams.find(value => value.id === streamIndex) || null;
          if (stream != null) {
            stream.volume = volume;
          }
        },
        onDataOpen: (feed, label) => {
          console.log(">>>>>>>> Open data to remote feed", label, feed);
          //@ts-ignore
          this.publisher.signalReady(feed.rid);
          //@ts-ignore
          this.publisher.signalMoved(feed.rid); // send my position to new subscriber
        },
        onLocalDataOpen: (label) => {
          console.log("Local data to feed");
        },
        connectionInit: () => {
          //AppModule.setConnected(false);
          //console.log("connectionInit");
          this.space.connected = true;
        },
        connectionLost: () => {
          //AppModule.setConnected(false);
          //console.log("connectionLost");
          this.space.connected = false;
        },
        connectionRestored: () => {
          //AppModule.setConnected(true);
          //console.log("connectionRestored");
          this.space.connected = true;
        }
      };

      this.session = new JanusRoom(options);
      this.session.init({
        success: () => {
          //@ts-ignore
          this.publisher.publish()
        }
      });
    }

    stopSession() {
      this.streams.forEach(value => this.removeStream(value.id));
      this.session.stopOwnFeed();
    }

    created() {
      this.$root.$on('destroySpaceSession', ()=>{
        this.destroySession()
      })

      this.createSession();

      let room = this;

      window.onbeforeunload = function (e) {
        room.stopSession();
        return 'exit';
      };


      // this.$root.$on('show-add-youtube', () => {
      //   const dlg = this.$refs.youtubeDlg as YoutubeDialog;
      //   //@ts-ignore
      //   dlg.show()
      // });

      /*
            this.$root.$on('show-add-image', () => {
              const dlg = this.$refs.addImageDlg as AddImageDialog;
              //@ts-ignore
              dlg.show()
            });
      */

      this.$root.$on("show-user", this.navigateToToMember);
    }

    mounted() {
      this.publisher = this.$refs.publisher as Publisher;
      window.addEventListener('mousemove', this.onMouseMove, {passive: true});
      window.addEventListener('touchmove', this.onMouseMove, {passive: true});
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('touchend', this.onMouseUp);
      //@ts-ignore
      this.$spaceMap.randomizeCenterViewport(128);
    }

    onElementSelected(el: Element, ev: MouseEvent | TouchEvent) {
      console.log('selected', el);
      const {x, y} = getCursorPosition(ev);
      const zoomInv = 1 / this.mapViewport!.scale;
      this.dragging = {
        el,
        // offsetX: ev.clientX - el.position!.getViewportX(this.spaceWidth),
        // offsetY: ev.clientY - el.position!.getViewportY(this.spaceHeight)
        offsetX: x * zoomInv - el.position!.x,
        offsetY: y * zoomInv - el.position!.y,
        initialPosition: SpacePosition.fromPosition(el.position!) // clone
      }
    }

    get $spaceMap(): SpaceMap {
      return this.$refs.spaceMap as SpaceMap
    }

    private requestAnimation: number | null = null;

    onMouseMove(ev: MouseEvent | TouchEvent) {
      const dragging = this.dragging;
      if (!dragging || !dragging.el.movable) return;

      const scaleInv = 1 / this.mapViewport!.scale;

      if (this.requestAnimation !== null) window.cancelAnimationFrame(this.requestAnimation);
      this.requestAnimation = window.requestAnimationFrame(() => {
        this.requestAnimation = null;
        const cursor = getCursorPosition(ev);
        let x = cursor.x * scaleInv - dragging.offsetX;
        let y = cursor.y * scaleInv - dragging.offsetY;

        //TODO CONSTRAINT HERE
        let map = this.$refs.spaceMap as SpaceMap;
        //@ts-ignore
        if (map.isConnectClub) {
          //@ts-ignore
          const mapConstraints = map.mapConstraints();
          const radius = 70;

          if (x > mapConstraints.maxMapX - radius) {
            x = mapConstraints.maxMapX - radius
          }
          if (x < mapConstraints.minMapX + radius) {
            x = mapConstraints.minMapX + radius
          }
          if (y > mapConstraints.maxMapY - radius) {
            y = mapConstraints.maxMapY - radius
          }
          if (y < mapConstraints.minMapY + radius) {
            y = mapConstraints.minMapY + radius
          }
        }

        this.moveElement(dragging.el, x, y)
      })
    }

    onMouseUp(ev: MouseEvent | TouchEvent) {
      if (this.dragging) {
        const position = this.dragging.el.position!;
        const distance = this.dragging.initialPosition.getDistanceTo(position);
        if (distance > 0) {
          //@ts-ignore
          const {width, height} = this.$spaceMap.viewportRect;
          if (this.dragging.el instanceof Publisher) {
            // analyticsService.firePositionChanged(distance, position, {width, height})
          } else if (this.dragging.el instanceof YoutubeElement) {
            // analyticsService.fireYTVideoPositionChanged(distance, position, {width, height})
          } else if (this.dragging.el instanceof ImageElement) {
            // analyticsService.fireImagePositionChanged(distance, position, {width, height})
          } else {
            console.warn('Unknown element moved', this.dragging.el)
          }
        }

        this.dragging = null
      }
    }

    beforeDestroy() {
      this.destroySession()
    }

    destroySession(){
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('touchmove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('touchend', this.onMouseUp);

      this.$root.$off('show-add-youtube');
      this.$root.$off('show-add-image');
      this.$root.$off('show-user', this.navigateToToMember);

      if (this.session) {
        this.streams.forEach(value => this.removeStream(value.id));
        this.streams = [];
        this.session.stopOwnFeed();
        this.session.stop();
        this.space.published = false;
      }
    }

    errorHandler(err: Error | any) {
      if (this.session.connection) {
        err.connectionId = this.session.connection.connectionId
      }

      if (err.name === 'OT_STREAM_DESTROYED') {
        return
      }

      this.$emit('error', err)
    }

    moveElement(el: Element, x: number, y: number) {
      // x = Math.max(el.width / 2, Math.min(x, this.spaceWidth - el.width / 2))
      // y = Math.max(el.height / 2, Math.min(y, this.spaceHeight - el.height / 2))
      if (el.position && el.position.x === x && el.position.y === y) {
        return
      }

      el.setPosition(x, y);

      if (el instanceof Publisher) {
        let elements: Element[] = [];
        if (this.$refs.subscribers instanceof Array) {
          //@ts-ignore
          elements.push(...this.$refs.subscribers as Subscriber[])
        }

        if (this.$refs.objects instanceof Array) {
          elements.push(...this.$refs.objects as Element[])
        }

        for (const el2 of elements) {
          if (!el.position || !el2.position) continue;
          el2.distance = el.position.getDistanceTo(el2.position)
        }
      } else {
        //@ts-ignore
        if (el.position && this.publisher.position) {
          //@ts-ignore
          el.distance = el.position.getDistanceTo(this.publisher.position)
        }
      }
    }

    async onSignal(from: number, msg: SignalMessage) {

      if (from == undefined) {

        if (msg.t === 'image-changed') {
          const obj = this.getObjectById(msg.id);
          if (obj instanceof ImageObject) {
            obj.width = msg.width;
            obj.height = msg.height
          }
        }

        if (msg.t === 'image-destroy') {
          this.$delete(this.objects, this.objects.findIndex(o => o.id === msg.id))
        }

        if (msg.t === 'youtube-sync') {
          const obj = this.getObjectElementById(msg.id);
          if (obj instanceof YoutubeElement) {
            if (msg.s === 'play') {
              //@ts-ignore
              await obj.play(msg.pos)
            } else if (msg.s === 'pause') {
              //@ts-ignore
              await obj.pause(msg.pos)
            }
          } else {
            console.warn('unable to find YouTube object element %s', msg.id, msg)
          }
        }

        if (msg.t === 'youtube-destroy') {
          this.$delete(this.objects, this.objects.findIndex(o => o.id === msg.id))
        }
        return;
      }

      //TODO ignoring self

      const subscriber = this.getSubscriberByConnectionId(from);

      if (!subscriber) return console.warn('subscriber with connectionId %s not found', from);

      if (msg.t === 'ready') {
        console.log("READY", msg, from);
      }

      if (msg.t === 'moved') {
        if (msg.id !== undefined) {
          const obj = this.getObjectElementById(msg.id);

          if (!obj) return console.warn('unable to find object %s', msg.id, msg);
          this.moveElement(obj, msg.x, msg.y)
        } else {
          //@ts-ignore
          this.moveElement(subscriber, msg.x, msg.y)
        }
      }

      const user = SpacesModule.user(from);

      if (msg.t === 'image-created') {
        if (!this.getObjectElementById(msg.id)) {
          const obj = new ImageObject(
            msg.id,
            msg.url,
            msg.naturalWidth,
            msg.naturalHeight,
            msg.width,
            msg.height,
            new SpacePosition(msg.x, msg.y),
            user, false);
          this.objects.push(obj)
        }
      }

      if (msg.t === 'youtube-created') {
        if (!this.getObjectElementById(msg.id)) {
          const yobj = new YoutubeObject(msg.id, msg.vid, new SpacePosition(msg.x, msg.y), user, false);
          this.objects.push(yobj)
        }
      }

      /*
        if (msg.t === 'banned' && this.userToken === msg.token) {
          this.$emit('onBanned')
        }

        if ((msg.t === 'admin-muted' || msg.t === 'admin-unmuted') && this.userToken === msg.token) {
          this.$emit('onAdminMuted', {active: msg.active})
        }
      */
    }

    onSubscribed(subscriber: Subscriber) {
      //@ts-ignore
      this.publisher.signalMoved(subscriber.rid); // send my position to new subscriber

      //TODO fix it. catch open data channel or something else
      setTimeout(() => {
        //@ts-ignore
        this.publisher.signalMoved(subscriber.rid);
      }, 1000);
      setTimeout(() => {
        //@ts-ignore
        this.publisher.signalMoved(subscriber.rid);
      }, 2000);
      setTimeout(() => {
        //@ts-ignore
        this.publisher.signalMoved(subscriber.rid);
      }, 4000);
      setTimeout(() => {
        //@ts-ignore
        this.publisher.signalMoved(subscriber.rid);
      }, 8000);
      setTimeout(() => {
        //@ts-ignore
        this.publisher.signalMoved(subscriber.rid);
      }, 16000);
      //TODO fix it. catch open data channel or something else
    }

    private getSubscriberByConnectionId(id: number): Subscriber | undefined {
      if (!(this.$refs.subscribers instanceof Array)) return undefined;
      const subscribers = this.$refs.subscribers as Subscriber[];
      //@ts-ignore
      return subscribers.find(s => s.rid === id)
    }

    private getObjectById(id: string): SpaceObject | undefined {
      return this.objects.find(o => o.id === id)
    }

    private getObjectElementById(id: string): Element | undefined {
      if (!(this.$refs.objects instanceof Array)) return undefined;
      const objects = this.$refs.objects as Element[];
      return objects.find(o => o.obj!.id === id)
    }

    async onYoutubeAdded(url: string, videoId: string) {
      //@ts-ignore
      const obj = new YoutubeObject(Math.random().toString(), videoId, this.$spaceMap.viewportCenterToMapPosition, this.publisher.user!, true);
      this.objects.push(obj);
    }

    async onImageAdded(url: string, width: number, height: number) {
      let constrainedWidth: number;
      let constrainedHeight: number;
      if (width >= height) {
        constrainedWidth = Math.min(450, width);
        constrainedHeight = height * constrainedWidth / width
      } else {
        constrainedHeight = Math.min(450, height);
        constrainedWidth = width * constrainedHeight / height
      }

      //@ts-ignore
      const img = new ImageObject(Math.random().toString(), url, width, height, constrainedWidth, constrainedHeight,
        //@ts-ignore
        this.$spaceMap.viewportCenterToMapPosition, this.publisher.user!, true);
      this.objects.push(img);
    }

    onObjectElementClose(el: Element) {
      if (el.obj === null) return;
      this.$delete(this.objects, this.objects.findIndex(o => o.id === el.obj!.id));
    }

    getObjectComponent(obj: SpaceObject): typeof Vue | null {
      if (obj instanceof YoutubeObject) {
        return YoutubeElement
      } else if (obj instanceof ImageObject) {
        return ImageElement
      } else {
        return null
      }
    }

    savedViewportRect: ViewportRect | null = null;

    navigateToToMember(member: Stream) {
      let position!: SpacePosition;
      //@ts-ignore
      if (member.id == this.publisher.rid) {
        //@ts-ignore
        if (!this.publisher.position) return console.warn('publisher doesnt have position yet');
        //@ts-ignore
        position = this.publisher.position;
      } else {
        const subscriber = this.getSubscriberByConnectionId(member.id);
        if (!subscriber) return console.warn('unable to find subscriber by id', member.id);
        //@ts-ignore
        if (!subscriber.position) return console.warn('subscriber doesnt have position yet', subscriber);
        //@ts-ignore
        position = subscriber.position;
      }

      if (this.savedViewportRect === null) {
        //@ts-ignore
        this.savedViewportRect = Object.assign({}, this.$spaceMap.viewportRect)
      }
      //@ts-ignore
      this.$spaceMap.centerViewport(position.x, position.y, true);

      //??????
      this.$root.$off('over-member-out', this.restoreViewport);
      this.$root.$once('over-member-out', this.restoreViewport)
    }

    restoreViewport() {
      if (this.savedViewportRect) {
        //@ts-ignore
        this.$spaceMap.viewportRect = this.savedViewportRect;
        this.savedViewportRect = null
      }
    }

    centeringPublisher() {
      const effectTime = .5;
      const map = this.$spaceMap;
      if (map) {
        //@ts-ignore
        map.refreshViewportRect();
        //@ts-ignore
        //map.randomizeCenterViewport(128);
        const vpPos = map.viewportCenterToMapPosition;
        //@ts-ignore
        this.moveElement(this.publisher, vpPos.x, vpPos.y);
        //@ts-ignore
        this.$refs.publisher.style.transition = `all ${effectTime}s cubic-bezier(0,0,.58,1)`;

        setTimeout(() => {
          //@ts-ignore
          this.$refs.publisher.style.transition = null
        }, effectTime * 1000)
      }
    }

    movePublisher(params) {
      const {x, y} = params
      const effectTime = .5;
      //@ts-ignore
      this.moveElement(this.publisher, x, y);
      //@ts-ignore
      this.$refs.publisher.style.transition = `all ${effectTime}s cubic-bezier(0,0,.58,1)`;
      setTimeout(() => {
        //@ts-ignore
        this.$refs.publisher.style.transition = null
      }, effectTime * 1000)
    }

  }
</script>

<style lang="scss" scoped>
  .session {
    flex-grow: 1;
    position: relative;
    user-select: none;
    display: flex;
  }
</style>


<style lang="scss">
  ::-webkit-scrollbar {
    -webkit-appearance: none;

    &:vertical {
      width: 7px;
    }

    &:horizontal {
      height: 7px;
    }
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
  }

  ::-webkit-scrollbar-corner {
    background-color: $backgroundColor;
  }
</style>
