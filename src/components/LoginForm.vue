<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8">
        <v-card class="elevation-5" ref="form">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Welcome</v-toolbar-title>
          </v-toolbar>
          <v-form
            ref="form"
            v-on:submit.prevent="inputRoom"
            @keydown.enter="onEnter">
            <v-card-text>
              <v-row>
                <!--
                                <v-col cols="auto">
                                  <div class="video">
                                    <video id="video_test"/>
                                  </div>
                                </v-col>
                -->
                <v-col>
                  <v-combobox
                    class="mr-2"
                    @input.native="nameChange($event.target.value)"
                    v-model="item"
                    :items="items"
                    item-text="name"
                    item-value="id"
                    autofocus
                    autocomplete="off"/>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn v-if="spaceId != null" type="submit" color="primary"
                     :disabled="btnOpenSpaceDisabled">
                Open Space
              </v-btn>
              <v-btn v-else type="submit" color="primary">
                Create Space
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

  @Component({
    components: {}
  })
  export default class LoginForm extends Vue {
    roomId = null;
    spaceId = null;

    userName = '';
    item: any = null;
    items: Profile[] = [];

    @Watch('item') select(item) {
      if (item && item.name) {
        this.userName = item.name;
      } else if (item) {
        this.userName = item;
      }
    }

    _currentConfig: any | null = null;
    newSpaceId = 0;

    created() {
      //@ts-ignore
      this.roomId = this.$route.params.roomId;
      //@ts-ignore
      this.spaceId = this.$route.params.spaceId;

      const {item, items} = ProfileStorage.get();
      this.item = item;
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
        id
      };
      this.item = profile;
      this.items.push(profile);
      return id;
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
            id = this.addNewProfile()
          }
        }
      }

      if (id == undefined) {
        id = profile.id;
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

    get btnOpenSpaceDisabled() {
      return !this.userName || this.userName.length < 3
    }

    onEnter() {
      console.log('onEnter')
    }
  }
</script>

<style scoped lang="scss">
  @import "./../views/spheres/components/elements/_element.scss";

  @mixin circleBorder($size) {
    box-shadow: 0 0 0 $size $white;
  }

  .video {
    @extend %circle-video-shared;
    @include circleBorder(3px);
    width: 80px;
    height: 80px;
  }
</style>
