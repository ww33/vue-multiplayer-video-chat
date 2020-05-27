<template>
  <v-container class="container fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8">
        <v-card class=" card elevation-5" ref="form">
          <v-form
            ref="form"
            v-on:submit.prevent="inputRoom"
            @keydown.enter="onEnter">
            <v-card-text>
              <v-card-title>
                {{afterExit? 'Edit your name' : 'What is your name?'}}
              </v-card-title>

              <v-row style="margin-top: 30px">
                <v-col>
                  <v-text-field
                    class="text-field"
                    v-model="userName"
                    label="First name"
                    dense
                    single-line/>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    class="text-field"
                    v-model="secondName"
                    label="Second name"
                    dense
                    single-line/>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-btn
                class="btnBig light-blue--text"
                type="submit"
                small
                :disabled="btnContinueDisabled"
              >
                Continue
              </v-btn>

            </v-card-actions>
            <v-card-actions>
              <v-btn
                class="btnBig light-blue--text"
                type="submit"
                small
                disabled
              >
                Create new meetup
              </v-btn>
            </v-card-actions>

          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import {SpacesModule} from '@/store/modules/spaces';
  import {ProfileStorage} from '@/models/ProfileStorage';
  import {SpaceConfigModule} from '@/store/modules/space-config';
  import {Profile} from "@/models/Profile";
  import CreateMeetup from './CreateMeetup.vue'

  @Component({
    components: {CreateMeetup}
  })
  export default class LoginForm extends Vue {
    roomId = null;
    spaceId = null;
    userName: string = '';
    secondName: string = '';
    // userName: string = 'Не Лев';
    // secondName: string = 'Толстой';
    item: any = null;
    items: Profile[] = [];
    profileId = -1
    afterExit:boolean = false

    // @Watch('item') select(item) {
    //   if (item && item.name) {
    //     this.userName = item.name;
    //   // } else if (item) {
    //   //   this.userName = item;
    //   }
    // }

    _currentConfig: any | null = null;
    newSpaceId = 0;

    created() {
      //@ts-ignore
      this.roomId = this.$route.params.roomId;
      //@ts-ignore
      this.spaceId = this.$route.params.spaceId;

      const {item, items, profileId, afterExit} = ProfileStorage.get();

      this.profileId = profileId
      this.afterExit = afterExit

      if(item.name){
        this.item = item;
        this.userName = item.name
        this.secondName = item.secondName
      }

      this.items = items;
    }

    nameChange(val) {
      console.log('val', val);
      this.userName = val;
    }

    addNewProfile() {
      const {items} = ProfileStorage.get();
      this.items = items;
      const id = Date.now();
      const profile = {
        name: this.userName,
        secondName: this.secondName,
        id
      };
      this.item = profile;
      this.items.push(profile);
      return this.items.length-1;
    }

    saveProfile() {
      let id;
      let profile = this.item;

      if (!profile) {
        if (!this.userName) {
          return null;
        } else {
          id = this.addNewProfile();
        }
      } else {
        if (!this.userName) {
          this.userName = profile.name;
          id = this.items.indexOf(profile);
        } else {
          if (profile.name !== this.userName) {
            profile.name = this.userName
          }
          if (profile.secondName !== this.secondName) {
            profile.secondName = this.secondName
          }
        }
      }

      if (id == undefined) {
        id = this.profileId > -1 ?this.profileId : 0
      }

      ProfileStorage.save(id, this.items);
      SpacesModule.setProfile(this.item);
    }

    async inputRoom() {
      try {
        //@ts-ignore
        document.documentElement.webkitRequestFullscreen();
      } catch (ignore) {
      }

      setTimeout(() => {
        this.saveProfile();
        if (this.spaceId == null) {
          //@ts-ignore
          this.spaceId = new Date().getTime();
        }
        try {
          SpaceConfigModule.setSpaceId(this.spaceId).then(config => {
            this._currentConfig = config;
            //@ts-ignore
            this.$router.push({path: `/space/${this._currentConfig.spaceId}`});
          }).catch((error) => {
          });
        } catch (e) {
        }
      }, 500);
    }

    get btnContinueDisabled() {
      return !this.userName || this.userName.length < 3 || !this.secondName || this.secondName.length < 3
    }

    onEnter() {
      console.log('onEnter')
    }

    onContinue() {

    }
  }
</script>

<style scoped lang="scss">
  @import "./elements/_element.scss";

  @mixin circleBorder($size) {
    box-shadow: 0 0 0 $size $white;
  }

  .container {
    background: #3A1C71;
    background: linear-gradient(to bottom, #000e17, #000a29, #000c1f);
    margin-right: auto;
    margin-left: auto;
  }

  .video {
    @extend %circle-video-shared;
    @include circleBorder(3px);
    width: 80px;
    height: 80px;
  }

  .card {
    background: #000c1f;
    opacity: .8;
  }

  .text-field {
    max-width: 90%;
    margin-right: auto;
    margin-left: auto;
  }

  .btnBig {
    max-width: 90%;
    width: 90%;
    margin-right: auto;
    margin-left: auto;
  }

</style>
