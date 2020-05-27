<template>
  <div>
    <v-app-bar dense>
      <v-toolbar-title class="subtitle-1">Users</v-toolbar-title>
      <v-spacer/>
      <v-btn @click="close" icon small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-app-bar>
    <v-list dense v-if="users">
      <v-list-item-group color="primary">
        <v-list-item v-for="(item, id) in users" :key="id" @click="select(item)">
<!--
          <v-list-item-avatar
            v-if="item.profile.avatar !== undefined && item.profile.avatar.length > 0" size="24"
            class="mr-2">
            <v-img :src="item.profile.avatar"/>
          </v-list-item-avatar>
-->
          <v-list-item-content>
            <v-list-item-title v-text="item.profile.name"/>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import {SpacesModule} from '@/store/modules/spaces'

  @Component
  export default class UsersMenu extends Vue {
    @Prop() spaceId!: string;

    // space = SpacesModule.space(parseInt(this.spaceId));

    get space(){
      return SpacesModule.space(parseInt(this.spaceId));
    }

    select(item) {
      this.$root.$emit("show-user", item);
    }

    close() {
      this.space.showUsersMenu = false;
    }

    get users() {
      return SpacesModule.usersInSpace(this.space.id);
    }

    // @Watch('spaceId')
    // onSpaceIdChanged(val: string, oldVal: string) {
    //   console.log('in UsersMenu SpaceId Changed', this.spaceId)
    // }
  }
</script>

<style lang="scss" scoped>

</style>
