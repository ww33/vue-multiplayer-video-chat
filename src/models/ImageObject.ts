import {SpaceObject} from './SpaceObject'
import {User} from './User'
import {SpacePosition} from './SpacePosition'

export class ImageObject extends SpaceObject {
  constructor(id: string,
              public url: string,
              public naturalWidth: number,
              public naturalHeight: number,
              public width: number,
              public height: number,
              public position: SpacePosition,
              user: User,
              publishing: boolean) {
    super(id, position, user, publishing)
  }
}
