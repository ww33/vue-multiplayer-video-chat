<template>
  <div ref="main" class="space-container" v-resize="onResize">

    <v-btn class="ma-1 menu-button"
           @click="onMenuButton"
           v-if="!showHeaderFooter"
           color="primary">
      <v-icon>mdi-layers</v-icon>
    </v-btn>

    <v-card id="create" class="card">
      <v-speed-dial
        :style="fabUsersStyle"
        bottom
        right
        direction="top">
        <template v-slot:activator>
          <v-btn
            @click="openUserMenu"
            :icon="!isConnectClub"
            :rounded="isConnectClub"
            :fab="!isMobile"
            :color="space.showUsersMenu ? 'primary': ''">
            <v-icon>mdi-account-multiple</v-icon>
            {{usersCount}}
          </v-btn>
        </template>
      </v-speed-dial>

      <v-speed-dial
        class="v-speed-dial"
        v-model="fab"
        bottom
        right
        direction="top">
        <template v-slot:activator>
          <v-btn
            @click.native.stop.prevent="onSpeedDial"
            color="primary"
            dark
            :small="isMobile"
            fab>
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else>mdi-chevron-up</v-icon>
          </v-btn>
        </template>
        <v-btn @click="addYoutube"
               :icon="!isConnectClub"
               :rounded="isConnectClub"
               :small="isMobile">
          <v-icon>mdi-play-box-outline</v-icon>
        </v-btn>
        <v-btn @click="addImage"
               :icon="!isConnectClub"
               :rounded="isConnectClub"
               :small="isMobile">
          <v-icon>mdi-file-image</v-icon>
        </v-btn>
        <v-btn @click.stop="publish"
               :icon="!isConnectClub"
               :rounded="isConnectClub"
               :color="space.published ? '' : 'primary'"
               :small="isMobile">
          <v-icon>mdi-video-off</v-icon>
        </v-btn>
        <v-btn @click.stop="mute"
               :icon="!isConnectClub"
               :rounded="isConnectClub"
               :color="space.muted ? 'primary': ''" :small="isMobile">
          <v-icon>mdi-microphone-off</v-icon>
        </v-btn>

        <v-btn @click.stop="onZoomButton('plus')"
               :icon="!isConnectClub"
               :rounded="isConnectClub">
          <v-icon>mdi-magnify-plus</v-icon>
        </v-btn>
        <v-btn @click.stop="onZoomButton('minus')"
               :icon="!isConnectClub"
               :rounded="isConnectClub">
          <v-icon>mdi-magnify-minus</v-icon>
        </v-btn>
        <v-btn @click="onFloors"
               :icon="!isConnectClub"
               :rounded="isConnectClub"
               :small="isMobile">
          <v-icon>mdi-layers</v-icon>
        </v-btn>
      </v-speed-dial>
    </v-card>

    <div v-if="$isDev" class="stats">Online Meetup map={{SIZE_X}}x{{SIZE_Y}}
      <button @click="centerViewport(undefined, undefined, true)">center</button>
      <button @click="updateScale(1)">reset</button>
      <button @click="updateScale(viewportRect.scale + 0.1)">+++++++++</button>
      <button @click="updateScale(viewportRect.scale - 0.1)">---------</button>
      <br>
      viewport={{viewportRect}} cursor={{cursorX}},{{cursorY}}
      center={{viewportCenterToMapPosition}}
    </div>

    <div class="viewport" ref="viewport" :style="viewportStyleVars"
         @wheel.prevent="onMapMouseWheel"
         @touchstart.prevent="onMapMouseDown"
         @mousedown.prevent="onMapMouseDown"
         v-hammer:pinch="(event)=> onPinch(event)"
         v-hammer:tap="onTap">
      <div class="back" ref="back" :style="mapSizeStyle"/>
      <div class="map" ref="map"
           :style="[
           mapSizeStyle,
           mapBackgroundStyle,
           {dragging: !!this.dragging}]">
        <slot/>
      </div>
    </div>

    <Floors v-model="showFloors" :session="session"/>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {SpacePosition} from '@/models/SpacePosition'
  import {ViewportRect} from '@/models/Viewport'
  import {getCursorPosition} from '@/services/utils'
  import random from 'lodash-es/random'
  import platform from 'platform'
  import {AppModule} from '@/store/modules/app';
  import {SpacesModule} from '@/store/modules/spaces';
  import Floors from './Floors.vue';
  import JanusRoom from "@/lib/janusRoom";

  @Component({
    components: {
      Floors,
    }
  })
  export default class SpaceMap extends Vue {
    @Prop() spaceId!: string;

    @Prop({required: true})
    session!: JanusRoom;

    isMobile = AppModule.isMobile;

    cursorX = 0;
    cursorY = 0;
    headerHeight = 48;

    scalingSpeed = 1000;
    pinchZoomSpeed = 10;
    buttonZoomSpeed = 100;
    centeringEffectTime = .3;

    dragging: { initViewportRect: ViewportRect, cursorX: number, cursorY: number } | null = null;

    SIZE_X = SpacePosition.SPACE_SIZE;
    SIZE_Y = SpacePosition.SPACE_SIZE;

    viewportRect: ViewportRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      scale: this.isMobile ? .5 : .5,
      minScale: 0,
      backgroundWidth: 2000, //def
      backgroundHeight: 2000
    };

    @Watch('viewportRect', {immediate: true}) onViewportRectChanged() {
      this.$emit('viewport-updated', this.viewportRect)
    }

    @Watch('showHeaderFooter') changeHeader(value) {
      if (!value) {
        try {
          //@ts-ignore
          document.documentElement.webkitRequestFullscreen();
        } catch (ignore) {
        }
      }
      this.onResize()
    }

    onResize() {
      setTimeout(() => {
        this.updateViewport()
      }, 100)
    }

    menu = false;
    message = false;
    centeringEffect = false;
    fab = false;
    stopDoubleTap = false

    showFloors = false

    onSpeedDial() {
      this.stopDoubleTap = true
      this.fab = !this.fab
    }

    onMenuButton() {
      this.stopDoubleTap = true
      if (!this.showHeaderFooter) {
        AppModule.setHeaderFooter(true)
      } else {
        this.menu = true
      }
    }

    onPinch(event) {
      this.dragging = null;
      if (event.additionalEvent == 'pinchout') {
        this.updateScale(this.viewportRect.scale + this.pinchZoomSpeed / this.scalingSpeed)
      } else if (event.additionalEvent == 'pinchin') {
        this.updateScale(this.viewportRect.scale - this.pinchZoomSpeed / this.scalingSpeed)
      }
    }

    onZoomButton(event) {
      this.stopDoubleTap = true
      if (event == 'plus') {
        this.updateScale(this.viewportRect.scale + this.buttonZoomSpeed / this.scalingSpeed)
      } else if (event == 'minus') {
        this.updateScale(this.viewportRect.scale - this.buttonZoomSpeed / this.scalingSpeed)
      }
    }

    mounted() {
      this.refreshViewportRect();
      window.addEventListener('resize', this.refreshViewportRect);
      window.addEventListener('mousemove', this.onMapMouseMove, {passive: true});
      window.addEventListener('touchmove', this.onMapMouseMove, {passive: true});
      window.addEventListener('mouseup', this.onMapMouseUp);
      window.addEventListener('touchend', this.onMapMouseUp);
      if (platform.name!.toLowerCase() === 'firefox') {
        this.scalingSpeed = 30;
      }

      // const isConnectClub = this.isConnectClub()
      // const backgroundImage = isConnectClub ? isConnectClub.backgroundImage : '../assets/patt-02-blue.png'
      // //@ts-ignore
      // this.$refs.map.style.backgroundImage = backgroundImage
      // // this.$root.$on('onZoomButton', this.onZoomButton)
    }

    beforeDestroy() {
      window.removeEventListener('resize', this.refreshViewportRect);
      window.removeEventListener('mousemove', this.onMapMouseMove);
      window.removeEventListener('touchmove', this.onMapMouseMove);
      window.removeEventListener('mouseup', this.onMapMouseUp);
      window.removeEventListener('touchend', this.onMapMouseUp)
    }

    updateViewport() {
      const main = this.$refs.main as HTMLDivElement;
      if (main) {
        const rect = main.getBoundingClientRect();
        this.viewportRect.width = rect.width;
        this.viewportRect.height = rect.height;
      }
    }

    refreshViewportRect() {
      const viewport = this.$refs.viewport as HTMLDivElement;
      if (viewport) {
        const rect = viewport.getBoundingClientRect();
        this.viewportRect.width = rect.width;
        this.viewportRect.height = rect.height;
        this.viewportRect.left = rect.left;
        this.viewportRect.top = rect.top;

        if (this.isConnectClub) {
          //get size background for cc (eg)
          // let width = 1500;
          // let height = 3000;
          let width = this.viewportWidth();
          let height = this.viewportHeight();
          //calc ratio
          //const ratio = width / height;

          this.viewportRect.backgroundWidth = width;
          this.viewportRect.backgroundHeight = height;

          const heightScale = this.viewportRect.height / height;
          const widthScale = this.viewportRect.width / width;

          let initScale = Math.min(heightScale, widthScale)

          this.viewportRect.scale = initScale * this.zoomConnectClub();
          this.viewportRect.minScale = initScale;
        }
        this.updateScale()
      }
    }

    viewportWidth() {
      if (this.spaceId === '2128509') {
        return 3000
      } else if (this.spaceId === '2128510') {
        return 3000
      } else if (this.spaceId === '2128511') {
        return 3000
      } else if (this.spaceId === '2128512') {
        return 3000
      } else if (this.spaceId === '2128517') {
        return 1500 * .80
      } else if (this.spaceId === '2128518') {
        return 1500 * .60
      } else if (this.spaceId === '2128519') {
        return 1500 * .40
      } else {
        return 1500
      }
    }

    viewportHeight() {
      if (this.spaceId === '2128509') {
        return 1357 * 2
      } else if (this.spaceId === '2128510') {
        return 1357 * 2
      } else if (this.spaceId === '2128511') {
        return 1357 * 2
      } else if (this.spaceId === '2128512') {
        return 1357 * 2
      } else if (this.spaceId === '2128517') {
        return 3000 * .80
      } else if (this.spaceId === '2128518') {
        return 3000 * .60
      } else if (this.spaceId === '2128519') {
        return 3000 * .40
      } else {
        return 3000
      }
    }

    get fabUsersStyle() {
      const marginRight = AppModule.isMobile ? 50 : 70;
      return {
        position: 'fixed',
        marginRight: `${marginRight}px`
      }
    }

    get mapSizeStyle(): Partial<CSSStyleDeclaration> {
      return {
        width: `${this.SIZE_X}px`,
        height: `${this.SIZE_Y}px`,
      }
    }

    get mapBackgroundStyle(): Partial<CSSStyleDeclaration> {
      return {
        backgroundImage: 'url(' + this.background() + ')',
        position: 'absolute',
        cursor: 'default',
        backgroundSize: `${this.viewportRect.backgroundWidth}px ${this.viewportRect.backgroundHeight}px`,
        //backgroundSize: `${this.SIZE_X}px ${this.SIZE_Y}px`,
        backgroundRepeat: this.isConnectClub ? 'no-repeat' : 'repeat',
        backgroundPosition: 'center',
        transformOrigin: '0 0',
        transform: 'translate(var(--translate-x), var(--translate-y)) scale(var(--map-scale))',
      }
    }

    public isConnectClub = ['2128501', '2128502', '2128503', '2128504'
      , '2128505', '2128507', '2128508', '2128509', '2128510', '2128511'
      , '2128512', '2128513', '2128514', '2128515', '2128516', '2128517', '2128518', '2128519'].indexOf(this.spaceId) > -1;

    background() {
      //TODO удалить каку после тестов
      if (['2128515', '2128516', '2128517', '2128518', '2128519'].indexOf(this.spaceId) > -1) {
        return require('../assets/2128501.png');
      }

      if (this.isConnectClub) {
        return require("../assets/" + this.spaceId + ".png");
      } else {
        return require('../assets/patt-02-blue.png');
      }
    }

    get viewportStyleVars() {
      const tx = -this.viewportRect.x;
      const ty = -this.viewportRect.y;
      const scale = this.viewportRect.scale;

      const perspective = 1;
      const backZ = -6;
      const backScale = (perspective - backZ) / perspective;

      return {
        '--translate-x': `${tx}px`,
        '--translate-y': `${ty}px`,
        '--map-scale': scale,
        '--back-scale': backScale + scale,
        '--back-z': `${backZ}px`
      }
    }

    onMapMouseDown(ev: MouseEvent | TouchEvent) {
      const target = ev.target as HTMLElement;
      if (target === this.$refs.map || target.closest('.map-transparent')) {

        const {x, y} = getCursorPosition(ev);

        this.dragging = {
          initViewportRect: Object.assign({}, this.viewportRect),
          cursorX: x - this.viewportRect.left,
          cursorY: y - this.viewportRect.top
        }
      }
    }

    onMapMouseMove(ev: MouseEvent | TouchEvent) {
      const cursor = getCursorPosition(ev);
      const cursorX = cursor.x - this.viewportRect.left;
      const cursorY = cursor.y - this.viewportRect.top;

      this.cursorX = cursorX;
      this.cursorY = cursorY;

      if (this.dragging) {
        if (this.centeringEffect) {
          this.centerViewport()
        }
        const x = -cursorX + this.dragging.cursorX + this.dragging.initViewportRect.x;
        const y = -cursorY + this.dragging.cursorY + this.dragging.initViewportRect.y;

        this.updateViewportPosition(
          this.xCenteringMode ? undefined : x,
          this.yCenteringMode ? undefined : y
        )
      }
    }

    yCenteringMode = false;
    xCenteringMode = false;

    private updateViewportPosition(x = this.viewportRect.x, y = this.viewportRect.y) {
      const constrainX = (axis: number, width: number) => {
        return Math.max(0, Math.min(axis, this.SIZE_X * this.viewportRect.scale - width))
      };
      const constrainY = (axis: number, height: number) => {
        return Math.max(0, Math.min(axis, this.SIZE_Y * this.viewportRect.scale - height))
      };

      let cX = constrainX(x, this.viewportRect.width);
      let cY = constrainY(y, this.viewportRect.height);

      if (this.isConnectClub) {
        const constraints = this.mapConstraints();

        // y mode
        let minY = constraints.minMapY * this.viewportRect.scale
        let maxY = constraints.maxMapY * this.viewportRect.scale;

        let isMinYConstrain = false;
        let isMaxYConstrain = false;
        let minYConstrain = 0;
        let maxYConstrain = 0;

        if (cY < minY) {
          minYConstrain = minY;
          isMinYConstrain = true;
        }

        if (cY + this.viewportRect.height > maxY) {
          maxYConstrain = maxY - this.viewportRect.height;
          isMaxYConstrain = true;
        }

        if (isMinYConstrain && isMaxYConstrain) {
          cY = this.SIZE_Y / 2 * this.viewportRect.scale - this.viewportRect.height / 2;
          this.yCenteringMode = true;
        } else {
          this.yCenteringMode = false;
          if (isMinYConstrain) {
            cY = minYConstrain;
          } else if (isMaxYConstrain) {
            cY = maxYConstrain;
          }
        }

        //x mode
        let minX = constraints.minMapX * this.viewportRect.scale
        let maxX = constraints.maxMapX * this.viewportRect.scale;

        let isMinXConstrain = false;
        let isMaxXConstrain = false;
        let minXConstrain = 0;
        let maxXConstrain = 0;

        if (cX < minX) {
          minXConstrain = minX;
          isMinXConstrain = true;
        }

        if (cX + this.viewportRect.width > maxX) {
          maxXConstrain = maxX - this.viewportRect.width;
          isMaxXConstrain = true;
        }

        if (isMinXConstrain && isMaxXConstrain) {
          cX = this.SIZE_X / 2 * this.viewportRect.scale - this.viewportRect.width / 2;
          this.xCenteringMode = true;
        } else {
          this.xCenteringMode = false;
          if (isMinXConstrain) {
            cX = minXConstrain;
          } else if (isMaxXConstrain) {
            cX = maxXConstrain;
          }
        }
      }

      this.viewportRect.x = cX;
      this.viewportRect.y = cY;
    }

    updateScale(newScale = this.viewportRect.scale, atX = this.viewportRect.width / 2, atY = this.viewportRect.height / 2) {
      let minScale = Math.max(this.viewportRect.width / this.SIZE_Y, this.viewportRect.height / this.SIZE_Y);

      if (this.isConnectClub) {
        minScale = this.viewportRect.minScale;
      }

      const oldScale = this.viewportRect.scale;
      newScale = Math.max(minScale, Math.min(this.maxScale, newScale));
      this.viewportRect.scale = newScale;

      // move viewport to atX/atY position after scaling
      const point = (current: number, to: number) => {
        const ratio = 1 - newScale / oldScale;
        return current + (to - current) * ratio
      };

      const x = point(this.viewportRect.x, -atX);
      const y = point(this.viewportRect.y, -atY);

      this.updateViewportPosition(x, y)
    }

    onMapMouseUp(ev: MouseEvent | TouchEvent) {
      if (this.dragging) {
        // FIXME: NOT USE SpacePosition!
        const scale = this.viewportRect.scale;
        const newPosition = new SpacePosition(this.viewportRect.x / scale, this.viewportRect.y / scale);
        const oldPosition = new SpacePosition(this.dragging.initViewportRect.x / scale, this.dragging.initViewportRect.y / scale);
        const distance = newPosition.getDistanceTo(oldPosition);
        if (distance > 0) {
          const {width, height} = this.viewportRect
          // analyticsService.fireMapPositionChanged(distance, newPosition, { width, height }, scale)
        }

        this.dragging = null
      }
    }

    onMapMouseWheel(ev: WheelEvent) {
      if (this.dragging) return;

      this.updateScale(this.viewportRect.scale - ev.deltaY / this.scalingSpeed,
        ev.clientX - this.viewportRect.left,
        ev.clientY - this.viewportRect.top);

      //const {width, height} = this.viewportRect
      // analyticsService.fireMapZoomedThrottled(ev.deltaY < 0 ? 'Map Zoomed in' : 'Map Zoomed out', this.viewportRect.scale, { width, height })

      // DEV:
      //this.updateScale(this.viewportRect.scale + 0.025 * Math.sign(ev.deltaY))
    }

    onTap(event) {
      setTimeout(() => {
        if (this.stopDoubleTap) {
          this.stopDoubleTap = false
          return null
        }
        if (event.tapCount === 1) {
          this.stopDoubleTap = true
          const tapX = event.center.x;
          const tapY = event.center.y - this.headerHeight;
          const centerX = this.viewportRect.width / 2;
          const centerY = this.viewportRect.height / 2;

          const deltaX = centerX - tapX;
          const deltaY = centerY - tapY;
          const y = this.viewportRect.y - deltaY;
          const x = this.viewportRect.x - deltaX;

          let mapX = (x + this.viewportRect.width / 2) / this.viewportRect.scale
          let mapY = (y + (!AppModule.showHeaderFooter ? this.headerHeight : 0) + this.viewportRect.height / 2) / this.viewportRect.scale

          if (this.isConnectClub) {
            const {minMapX, maxMapX, minMapY, maxMapY} = this.mapConstraints()
            const radius = 70

            if (mapX < minMapX + radius) {
              mapX = minMapX + radius
            } else if (mapX > maxMapX - radius) {
              mapX = maxMapX - radius
            }

            if (mapY < minMapY + radius) {
              mapY = minMapY + radius
            } else if (mapY > maxMapY - radius) {
              mapY = maxMapY - radius
            }
          }

          this.addCenteringEffect();
          setTimeout(() => {
            this.stopDoubleTap = false
            this.$emit('move-publisher', {x: mapX, y: mapY})
          }, this.centeringEffectTime * 1000)
        }
      }, 10)
    }

    addCenteringEffect() {
      this.centeringEffect = true;
      //@ts-ignore
      this.$refs.map.style.transition = `all ${this.centeringEffectTime}s cubic-bezier(0,0,.58,1)`;
      //@ts-ignore
      this.$refs.back.style.transition = `all ${this.centeringEffectTime}s cubic-bezier(0,0,.58,1)`;
      setTimeout(() => {
        this.centeringEffect = false;
        //@ts-ignore
        this.$refs.map.style.transition = null;
        //@ts-ignore
        this.$refs.back.style.transition = null
      }, this.centeringEffectTime * 1000)
    }

    centerViewport(mapX = this.SIZE_X / 2, mapY = this.SIZE_Y / 2, withEffect = false) {
      const x = mapX * this.viewportRect.scale - this.viewportRect.width / 2;
      const y = mapY * this.viewportRect.scale - this.viewportRect.height / 2;

      if (withEffect) {
        this.addCenteringEffect()
      } else if (this.centeringEffect) {//прямо сейчас идет эффект цетрирования от прежних действий, отменяем
        this.centeringEffect = false;
        //@ts-ignore
        this.$refs.map.style.transition = null
      }

      this.updateViewportPosition(x, y)
    }

    randomizeCenterViewport(radius: number) {
      this.centerViewport();
      if (!this.isConnectClub) {
        this.updateViewportPosition(
          random(this.viewportRect.x - radius, this.viewportRect.x + radius),
          random(this.viewportRect.y - radius, this.viewportRect.y + radius)
        )
      }
    }

    get viewportCenterToMapPosition(): SpacePosition {
      const x = this.viewportRect.x + this.viewportRect.width / 2;
      const y = this.viewportRect.y + this.viewportRect.height / 2;
      return new SpacePosition(x / this.viewportRect.scale, y / this.viewportRect.scale)
    }

    get maxScale() {
      return this.isMobile ? 1.3 : 2.5
    }

    get showHeaderFooter() {
      return AppModule.showHeaderFooter
    }

    get space() {
      return SpacesModule.space(parseInt(this.spaceId));
    }

    publish() {
      this.stopDoubleTap = true
      this.space.published = !this.space.published;
    }

    mute() {
      this.stopDoubleTap = true
      this.space.muted = !this.space.muted;
    }

    openUserMenu() {
      this.stopDoubleTap = true
      const space = this.space;
      space.showUsersMenu = !space.showUsersMenu;
      this.menu = false
    }

    addYoutube() {
      this.stopDoubleTap = true
      AppModule.setShowYoutubeDialog(true)
    }

    addImage() {
      this.stopDoubleTap = true
      AppModule.setShowImageDialog(true)
    }

    get usersCount() {
      return SpacesModule.usersCount(this.space.id);
    }

    onFloors() {
      this.stopDoubleTap = true
      this.showFloors = true
    }

    zoomConnectClub() {//TODO удалить каку после тестов
      if (this.spaceId === '2128515') {
        return 2
      } else if (this.spaceId === '2128516') {
        return 4
      } else {
        return 1
      }
    }

    public mapConstraints() {
      const minMapX = (this.SIZE_X - this.viewportRect.backgroundWidth) / 2
      const maxMapX = this.viewportRect.backgroundWidth + minMapX
      const minMapY = (this.SIZE_Y - this.viewportRect.backgroundHeight) / 2
      const maxMapY = this.viewportRect.backgroundHeight + minMapY
      return {minMapX, maxMapX, minMapY, maxMapY}
    }
  }
</script>

<style lang="scss" scoped>
  .space-container {
    display: flex;
    flex: auto;
  }

  .card {
    position: static;

    .v-speed-dial {
      position: fixed;
    }

    .v-speed-dial-users {
      position: fixed;
      margin-right: 40px;
    }
  }

  .vertical-menu {
    background: transparent !important;

    .v-list {
      background: transparent !important;
    }
  }

  .menu-button {
    position: absolute;
    z-index: 5;
    right: 0;
    opacity: 0.8;
  }

  .stats {
    z-index: 1000;
    position: absolute;
    left: 0;
    width: 50%;
    font-size: 10px;
    background-color: saddlebrown;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .viewport {
    --translate-x: 0px;
    --translate-y: 0px;
    --map-scale: 1;
    --back-scale: 4;
    --back-z: -4px;
    background-color: black;

    overflow: hidden;
    /*flex-grow: 1;*/
    flex: auto;
    perspective: 1px;
    perspective-origin: 0 0;

    .map {
      /*background-image: url('../assets/patt-02-blue.png');*/
      position: absolute;
      cursor: default;
      background-size: 720px 1280px;
      background-repeat: repeat;
      transform-origin: 0 0;
      transform: translate(var(--translate-x), var(--translate-y)) scale(var(--map-scale));
    }

    .backImage2128501 {
      background-image: url('../assets/2128502.png');
    }

    .dragging {
      cursor: move;
    }

    .back {
      position: absolute;
      background-image: url('../assets/patt-01-blue.png');
      background-size: 300px 300px;
      background-repeat: repeat;
      transform-origin: 0 0;
      transform: translate3d(var(--translate-x), var(--translate-y), var(--back-z)) scale(var(--back-scale));
      opacity: 0.2;
    }
  }

  /*#create .v-speed-dial {*/
  /*  position: absolute;*/
  /*}*/

  /*#create .v-btn--floating {*/
  /*  position: relative;*/
  /*}*/
</style>
