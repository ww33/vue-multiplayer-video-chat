import {Vue} from 'vue-property-decorator';
import {getModule, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import store from '@/store'
import {User} from '@/models/User'
import {ProfileStorage} from '@/models/ProfileStorage'

export interface ISpacesState {
}

interface IUserSpace {
  spaceId: number;
  user: User;
}

class UserSpace {
  constructor(userId: string, spaceId: number) {
    this.userId = userId;
    this.spaceId = spaceId;
  }

  userId!: string;
  spaceId!: number;
  banned: boolean = false;
  muted: boolean = false;
  role: Role = Role.USER;
}

enum Role {
  ADMIN,
  SPEAKER,
  USER
}

enum SpaceType {
  SPACE,
  ROOM,
  STREAM
}

@Module({dynamic: true, store, name: 'spaces'})
class Spaces extends VuexModule implements ISpacesState {
  _users = {};
  _currentUser: User | null = null

  _userSpaces: UserSpace[] = [];

  _spaces = {
    0: {
      id: 0,
      published: false,
      muted: false,
      type: null,
      showUsersMenu: false,
      connected: false,
      showDebug: false
    } //test
  };
  _profile = ProfileStorage.emptyProfile();
  _spaceId: number = -1;

  _floors = [
    {id: 0, spaceId: '2128501', count: 0},
    {id: 1, spaceId: '2128502', count: 0},
    {id: 2, spaceId: '2128503', count: 0},
    {id: 3, spaceId: '2128504', count: 0},
  ]

  _currentFloor = 0

  get spaces() {
    return () => {
      return this._spaces;
    }
  }

  get space() {
    return (spaceId) => {
      //TODO move it anywhere
      if (!this._spaces[spaceId]) {
        Vue.set(this._spaces, spaceId, {
          id: spaceId,
          connected: false,
          published: false,
          muted: false,
          type: null,
          showUsersMenu: false,
          showChat: false
        });
      }
      //TODO move it anywhere
      return this._spaces[spaceId]
    }
  }

  get user() {
    return (userId) => {
      return this._users[userId];
    }
  }

  get usersCount() {
    return (spaceId) => {
      const userSpaces = this._userSpaces.map(value => value.spaceId == spaceId);
      return userSpaces ? userSpaces.length : 0
    }
  }

  get usersInSpace() {
    return (spaceId) => {
      const userSpaces = this._userSpaces.map(value => value.spaceId == spaceId);
      return userSpaces ? this._userSpaces.map(value => this._users[value.userId]) : undefined
    }
  }

  get profile() {
    return this._profile
  }

  get spaceId() {
    return this._spaceId
  }

  get isConnectClub() {
    return ['2128501', '2128502', '2128503', '2128504'
      , '2128505', '2128507', '2128508', '2128509', '2128510', '2128511'
      , '2128512', '2128513', '2128514', '2128515', '2128516', '2128517', '2128518', '2128519'].indexOf(this.spaceId.toString()) > -1
  }

  get floors() {
    return this._floors
  }

  get currentFloor() {
    return this._currentFloor
  }

  @Mutation addUser(entity: IUserSpace) {
    const {spaceId, user} = entity;
    this._spaceId = spaceId;

    const spaceIdString = spaceId.toString();
    const floor = this._floors.find((item) => item.spaceId === spaceIdString)
    if (floor) this._currentFloor = floor.id

    const userId = user.id;

    if (!this._users[userId]) {
      Vue.set(this._users, userId, user);
    }
    const find = this._userSpaces.find(value =>
      value.userId == userId && value.spaceId == spaceId
    );
    if (!find) {
      this._userSpaces.push(new UserSpace(userId, spaceId));
      if (!this._currentUser) {
        console.log(' add current user')
        this._currentUser = user
      }
    }
  }

  @Mutation deleteCurrentUser() {
    if (this._currentUser) {
      const payload = {user: this._currentUser, spaceId: this._spaceId}
      const index = this._userSpaces.findIndex(value =>
        value.userId == payload.user.id && value.spaceId == payload.spaceId
      );
      if (index > -1) {
        Vue.delete(this._userSpaces, index);
      }
      this._currentUser = null
      console.log(' delete current user')
    }
  }

  @Mutation deleteUser(payload: IUserSpace) {
    const index = this._userSpaces.findIndex(value =>
      value.userId == payload.user.id && value.spaceId == payload.spaceId
    );
    if (index > -1) {
      Vue.delete(this._userSpaces, index);
    }
  }

  @Mutation deleteAllUsers() {
    this._userSpaces = [];
    this._profile = ProfileStorage.emptyProfile();

    //full exit
    ProfileStorage.exit();
  }

  @Mutation
  setProfile(val) {
    this._profile.id = val.id;
    this._profile.name = val.name;
    this._profile.avatar = val.avatar;
    this._profile.description = val.description;
  }

  @Mutation init() {
    const {item} = ProfileStorage.get();
    if (item) {
      this._profile = item
    }
  }
}

export const SpacesModule = getModule(Spaces);
