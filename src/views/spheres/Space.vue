<template>
  <LoginForm v-if="userName === '' || spaceId == null"/>
  <!--  <SpaceEditor v-else-if="!spaceId" :value="true"/>-->
  <v-layout v-else column>
    <!--  <v-layout column>-->
    <v-navigation-drawer
      app
      right
      touchless
      v-model="showUsersMenu"
      disable-resize-watcher
      width="200px"
      max-width="300px">
      <UsersMenu :spaceId="spaceId" />
    </v-navigation-drawer>

    <Session v-if="spaceId"
             @connected="onSessionConnected"
             @members="streams = $event"
             @error="errorHandler"
             @onBanned="onBanned"
             @onAdminMuted="onAdminMuted"
             :spaceId="spaceId"
             :userName="userName"
              :key="spaceId"/>

    <!--    <ControlPanel v-if="showHeaderFooter" :spaceId="spaceId" class="controlPanel"/>-->

  </v-layout>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'
  import UsersMenu from './components/UsersMenu.vue'
  import Session from './components/SpaceSession.vue'
  import SpaceEditor from './components/SpaceEditor.vue'
  import LoginForm from "./components/LoginForm.vue";
  import {SpacesModule} from "@/store/modules/spaces";
  import {SpaceConfigModule} from '@/store/modules/space-config';
  import {AppModule} from '@/store/modules/app'

  @Component({
    components: {
      Session,
      UsersMenu,
      // ControlPanel,
      LoginForm,
      SpaceEditor,
    }
  })
  export default class Space extends Vue {
    @Prop() spaceId!: string;

    // space = SpacesModule.space(parseInt(this.spaceId));

    get space(){
      return SpacesModule.space(parseInt(this.spaceId));
    }
    created() {
      //@ts-ignore
      SpaceConfigModule.init({theme: this.$vuetify.theme, spaceId: this.spaceId})
    }

    get userName() {
      if (SpacesModule.profile) {
        return SpacesModule.profile.name;
      }
      return null;
    }

    get showUsersMenu() {
      return this.space.showUsersMenu;
    }

    set showUsersMenu(val) {
      this.space.showUsersMenu = val;
    }

    onSessionConnected() {
      this.$emit("connected");
    }

    errorHandler(err: Error) {

    }

    onBanned() {

    }

    onAdminMuted(payload) {

    }

    get showHeaderFooter() {
      return AppModule.showHeaderFooter
    }

    // @Watch('spaceId')
    // onSpaceIdChanged(val: string, oldVal: string) {
    //   console.log('in Space SpaceId Changed', this.spaceId)
    // }
  }
</script>


<style lang="scss" scoped>
  .controlPanel {
    height: 40px;
    max-height: 40px;
  }
</style>
