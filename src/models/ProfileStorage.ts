import {Profile} from "@/models/Profile";

export class ProfileStorage {

  static emptyProfile() {
    return new Profile(Date.now(), '', '');
    //{name: '', description: '', avatar: '', id: 0}
  }

  static get() {
    let result = {item: this.emptyProfile(), items: [], profileId:-1, afterExit: false};
    // let result = {item: this.emptyProfile(), items: [], profileId:-1};

    let item = this.emptyProfile();
    let afterExit = false
    const profilesStr = localStorage.getItem('profiles');
    if (profilesStr) {
      try {
        let profileId = -1
        const items = JSON.parse(profilesStr);
        const profileIdStr = localStorage.getItem('profileId');
        if (profileIdStr) {
          profileId = parseInt(profileIdStr);
          item = items[profileId];
        } else if(items.length > 0) {
          profileId = items.length-1
          item = items[profileId];
          afterExit = true//after Exit profileId is missing
        }
        result = {item, items, profileId, afterExit }
      } catch (e) {
        console.error(JSON.stringify(e));
      }
    }
    return result
  }

  static save(id, items) {
    localStorage.setItem('profileId', id.toString());
    localStorage.setItem('profiles', JSON.stringify(items));
  }

  static exit() {
    localStorage.removeItem('profileId');
  }

  static updateProfile(profile) {
    const profilesStr = localStorage.getItem('profiles');
    if (profilesStr) {
      try {
        let items = JSON.parse(profilesStr);
        let id = profile.id;
        if (id !== null) {
          items[id] = profile;
          localStorage.setItem('profileId', id);
          localStorage.setItem('profiles', JSON.stringify(items))
        }
      } catch (e) {
        console.error(JSON.stringify(e));
        return false
      }
    }
    return true
  }
}
