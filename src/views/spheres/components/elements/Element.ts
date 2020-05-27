// import OT from '@opentok/client'

import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
import {SignalMessage} from '../signals'
import throttle from 'lodash-es/throttle'
import {SpaceObject} from '@/models/SpaceObject'
import {SpacePosition} from '@/models/SpacePosition'
import {ViewportRect} from '@/models/Viewport'
import JanusRoom from '@/lib/janusRoom'
import {SpacesModule} from '@/store/modules/spaces';

@Component
export class Element extends Vue {
  //protected MAX_SIZE = AppModule.isMobile ? 64 : 128;
  protected MAX_SIZE = 128;
  //protected MAX_SIZE = AppModule.isMobile ? 64: 256;// for CC
  protected MIN_SIZE = 40;
  protected MIN_SCALE = this.MIN_SIZE / this.MAX_SIZE;

  @Prop({type: JanusRoom, required: true}) session!: JanusRoom;
  @Prop({type: SpaceObject, default: null}) obj!: SpaceObject | null;
  @Prop({required: true}) viewport!: ViewportRect | null;

  rid!: number;

  movable = false;
  signalOnMoving = false;

  position: SpacePosition | null = null;
  scale = 1;
  width = this.MAX_SIZE;
  height = this.MAX_SIZE;
  distance = 0;

  mouseDowned = false;

  mounted() {
    const el = this.$el as HTMLElement;
    el.addEventListener('mousedown', this.onMouseDown);
    el.addEventListener('touchstart', this.onMouseDown);
    el.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('touchend', this.onMouseUp)
  }

  onMouseDown(ev: MouseEvent | TouchEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.map-transparent')) {
      this.mouseDowned = true;
      this.$emit('selected', this, ev)
    }
  }

  onMouseUp() {
    this.mouseDowned = false
  }

  get isInsideViewport(): boolean {
    if (!this.viewport || !this.position) return false;

    // v2
    // function IntersectRect(r1:Rectangle, r2:Rectangle):Boolean {
    //   return !(r2.left > r1.right
    //       || r2.right < r1.left
    //       || r2.top > r1.bottom
    //       || r2.bottom < r1.top);
    // }

    // TODO: this.scale
    // const left = (this.position.x - this.width / 2 * this.scale) * this.viewport.scale
    // const right = (this.position.x + this.width / 2) * this.viewport.scale
    // const top = (this.position.y - this.height / 2) * this.viewport.scale
    // const bottom = (this.position.y + this.height / 2) * this.viewport.scale

    // const vpLeft = this.viewport.x
    // const vpRight = vpLeft + this.viewport.width
    // const vpTop = this.viewport.y
    // const vpBottom = vpTop + this.viewport.height

    // return left > vpLeft && top > vpTop && right < vpRight && bottom < vpBottom

    const x = this.position.x * this.viewport.scale;
    const y = this.position.y * this.viewport.scale;

    return x >= this.viewport.x && x <= this.viewport.x + this.viewport.width
      && y >= this.viewport.y && y <= this.viewport.y + this.viewport.height
  }

  get sizeStyle(): Partial<CSSStyleDeclaration> {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`
    }
  }

  get insideStyle(): Partial<CSSStyleDeclaration> {
    if (!this.position) return {};

    const translateX = this.position.x - (this.width / 2);
    const translateY = this.position.y - (this.height / 2);

    let transform = `translate3d(${translateX}px, ${translateY}px, 0px)`;
    if (this.scale !== 1 && !SpacesModule.isConnectClub) {
      transform += ` scale3d(${this.scale},${this.scale},1)`
    }

    return {
      ...this.sizeStyle,
      transform
    }
  }

  /**
   * By default, outside position equals inside
   */
  get outsideStyle(): Partial<CSSStyleDeclaration> {
    return this.insideStyle
  }

  get style(): Partial<CSSStyleDeclaration> {
    if (this.position) {
      if (this.isInsideViewport) {
        return this.insideStyle
      } else {
        return this.outsideStyle
      }
    } else {
      return {
        display: 'none'
      }
    }
  }

  //TODO refactor
  protected signal(msg: SignalMessage, to?: number, from?: string) {
    const params: { type?: string, data?: any, from?: number, to?: number } = {
      data: msg,
      type: 'signal'
    };
    if (to) {
      params.to = to
    }
    if (msg.t === 'moved') {
      if (this.rid === undefined && from !== undefined) {
        params.from = parseInt(from);
      } else {
        params.from = this.rid;
      }
      if (this.rid == undefined && from == undefined) {
        console.error("RID is undefined");
        return;
      }
    } else if (msg.t == 'ready') {
      params.from = this.rid;
    } else {
      if (from !== undefined) {
        params.from = parseInt(from);
      }
    }
    this.session.sendMessage(params).catch(reason => {
      console.error("SEND ERROR", reason);
    });
  }

  // POSITION CHANGED SIGNALING
  @Watch('position', {deep: true}) onPositionChangedSignaling() {
    if (!this.position) return;
    if (this.signalOnMoving && this.session.getConfig().janus.isConnected()) {
      this.signalMoveThrottled()
    }
  }

  protected signalMoveThrottled = throttle(() => this.signalMoved(), 100, {
    leading: true,
    trailing: true
  });

  signalMoved(to?: number) {
    const msg: SignalMessage = {
      t: 'moved', x: this.position!.x, y: this.position!.y
    };
    if (this.obj !== null) {
      msg.id = this.obj.id;
      this.signal(msg, to, this.obj.user.id)
    } else {
      this.signal(msg, to)
    }
  }

  setPosition(x: number, y: number) {
    x = Math.max(this.width / 2, x);
    y = Math.max(this.height / 2, y);

    // const halfwc = (this.width * SpacePosition.SPACE_SIZE / this.spaceWidth) / 2
    // x = Math.max(halfwc, Math.min(x, SpacePosition.SPACE_SIZE - halfwc))
    // const halfhc = (this.height * SpacePosition.SPACE_SIZE / this.spaceHeight) / 2
    // y = Math.max(halfhc, Math.min(y, SpacePosition.SPACE_SIZE - halfhc))

    if (this.position) {
      // seems this is more faster
      this.position.x = x;
      this.position.y = y
    } else {
      this.position = new SpacePosition(x, y)
    }
  }



}
