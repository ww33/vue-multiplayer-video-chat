<template>
  <div class="image-el" :style="style" @mouseenter="mouseIn = true" @mouseleave="mouseIn = false"
       :class="{opaque: mouseIn || (movable && mouseDowned) || !!resizing, 'map-transparent': !obj.publishing}">

    <ElementHeader :title="title" :publishing="obj.publishing" :absolutePos="true" @close="close()"
                   :visible="mouseIn || (movable && mouseDowned) || !!resizing"/>

    <img class="img map-transparent" :src="obj.url" alt=""/>

    <template v-if="obj.publishing">
      <div class="resizer bottom-right" @mousedown.stop="resizerMouseDownHandler"/>
      <div class="resizer bottom-left" @mousedown.stop="resizerMouseDownHandler"/>
    </template>
  </div>
</template>

<script lang="ts">
  import {Component, Mixins, Watch} from 'vue-property-decorator'
  import {ImageObject} from '@/models/ImageObject'
  import {Element} from './Element'
  import ElementHeader from './ElementHeader.vue'

  @Component({
    components: {ElementHeader}
  })
  export default class ImageElement extends Mixins(Element) {
    obj!: ImageObject;

    @Watch('obj', {immediate: true, deep: true})
    onObjectChanged(val: ImageObject, old: ImageObject) {
      this.width = val.width;
      this.height = val.height
    }

    mouseIn = false;

    created() {
      this.movable = this.obj.publishing;
      this.signalOnMoving = this.obj.publishing;

      this.position = this.obj.position;

      if (this.obj.publishing) {
        this.signalCreated()
      }
    }

    close() {
      if (this.obj.publishing) {
        this.$emit('close', this)
      }
    }

    beforeDestroy() {
      if (this.obj.publishing) {
        this.signal({t: 'image-destroy', id: this.obj.id});
      }
    }

    // only for publisher
/*
    onStreamCreated(ev: any) {
      this.signalCreated(ev.stream.connection)
    }
*/

    signalCreated(to?: any) {
      this.signal({
        t: 'image-created',
        id: this.obj.id,
        url: this.obj.url,
        naturalWidth: this.obj.naturalWidth,
        naturalHeight: this.obj.naturalHeight,
        width: this.obj.width,
        height: this.obj.height,
        x: this.position!.x,
        y: this.position!.y
      }, to, this.obj.user.id)
    }

    signalChanged() {
      this.signal({
        t: 'image-changed',
        id: this.obj.id,
        width: this.obj.width,
        height: this.obj.height
      })
    }

    get title() {
      if (this.obj.publishing) {
        return `Pinned by you`
      } else if (this.obj.user.profile) {
        return `Pinned by ${this.obj.user.profile.name}`
      }
    }

    resizing: { origX: number, origY: number, origW: number, origH: number, direction: 'b-left' | 'b-right' } | null = null;

    resizerMouseDownHandler(ev: MouseEvent) {
      if (ev.target instanceof HTMLElement && ev.target.classList.contains('resizer')) {
        this.resizing = {
          origX: ev.clientX, origY: ev.clientY, origW: this.obj.width, origH: this.obj.height,
          direction: ev.target.classList.contains('bottom-left') ? 'b-left' : 'b-right'
        };
        window.addEventListener('mousemove', this.resizerMouseMoveHandler);
        window.addEventListener('mouseup', this.resizerMouseUpHandler)
      }
    }

    resizerMouseUpHandler(ev: MouseEvent) {
      if (this.resizing) {
        const ratio = this.obj.width / this.obj.naturalWidth
      }
      this.resizing = null;
      window.removeEventListener('mousemove', this.resizerMouseMoveHandler);
      window.removeEventListener('mouseup', this.resizerMouseUpHandler)
    }

    resizerMouseMoveHandler(ev: MouseEvent) {
      if (!this.resizing) return;

      let offsetX = (ev.clientX - this.resizing.origX);
      if (this.resizing.direction === 'b-left') {
        offsetX = -offsetX
      }

      const offsetY = (ev.clientY - this.resizing.origY);

      const ratio = this.obj.height / this.obj.width;

      this.obj.width = Math.max(20 / ratio, this.resizing.origW + (offsetX + offsetY / ratio) / this.viewport!.scale);
      this.obj.height = Math.max(20 * ratio, this.obj.width * ratio);

      // TODO: THROTTLING
      this.signalChanged()
    }
  }
</script>

<style lang="scss" scoped>
  @import "./_element.scss";

  .image-el {
    @extend %space-element-shared;

    &.opaque {
      background-color: #2e2e2e;
    }

    .img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .resizer {
      position: absolute;
      // background-color: aquamarine;
      width: 10px;
      height: 10px;

      &.bottom-left {
        bottom: 0;
        left: 0;
        cursor: nesw-resize;
      }

      &.bottom-right {
        bottom: 0;
        right: 0;
        cursor: nwse-resize;
      }
    }
  }
</style>
