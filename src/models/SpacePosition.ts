export class SpacePosition {
  static readonly SPACE_SIZE = 5000;
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y
  }

  static fromPosition(position: SpacePosition): SpacePosition {
    return new SpacePosition(position.x, position.y)
  }

  // static fromViewport (x: number, y: number, width: number, height: number): SpacePosition {
  //   const pos = new this(0, 0)
  //   pos.setFromViewport(x, y, width, height)
  //   return pos
  // }

  // getViewportX (windowWidth: number) {
  //   return SpacePosition.convertPosition(this.x, SpacePosition.SPACE_SIZE, windowWidth)
  // }

  // getViewportY (windowHeight: number) {
  //   return SpacePosition.convertPosition(this.y, SpacePosition.SPACE_SIZE, windowHeight)
  // }

  // setFromViewport (x: number, y: number, windowWidth: number, windowHeight: number) {
  //   this.x = SpacePosition.convertPosition(x, windowWidth, SpacePosition.SPACE_SIZE)
  //   this.y = SpacePosition.convertPosition(y, windowHeight, SpacePosition.SPACE_SIZE)
  // }

  // getViewportDistanceTo (to: SpacePosition, viewportW: number, viewportH: number) {
  //   return Math.hypot(this.getViewportX(viewportW) - to.getViewportX(viewportW),
  //     this.getViewportY(viewportH) - to.getViewportY(viewportH))
  // }

  getDistanceTo (to: SpacePosition) {
    return Math.hypot(this.x - to.x, this.y - to.y)
  }

  // static convertPosition (fromPos: number, fromSize: number, toSize: number) {
  //   return fromPos * toSize / fromSize
  // }
}
