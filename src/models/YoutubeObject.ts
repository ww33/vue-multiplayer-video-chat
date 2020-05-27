import {SpaceObject} from './SpaceObject'
import {User} from './User'
import {SpacePosition} from './SpacePosition'

export class YoutubeObject extends SpaceObject {
  public videoId: string;

  constructor(id: string, videoId: string, position: SpacePosition, user: User, publishing: boolean) {
    super(id, position, user, publishing);
    this.videoId = videoId
  }
}
