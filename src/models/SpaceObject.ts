import {User} from './User'
import {SpacePosition} from './SpacePosition'

export class SpaceObject {
  constructor(public readonly id: string,
              public position: SpacePosition,
              public readonly user: User,
              public readonly publishing: boolean) {
  }
}
