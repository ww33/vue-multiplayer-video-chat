import {Stream} from "@/models/Stream";
import {Profile} from "@/models/Profile";

export class User {
  constructor(public id: string,
              public profile?: Profile,
              public stream?: Stream) {
  }
}
