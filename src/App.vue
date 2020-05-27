<template>
  <Vue100vh>
    <v-app dark>
      <v-app-bar app dense v-if="showHeaderFooter">
        <div class="d-flex align-center">
          <v-icon large>{{config.logo}}</v-icon>
          <p v-if="!isMobile" class="slogan">{{config.slogan}}</p>
        </div>
        <v-spacer/>
        <!--      <v-text-field v-show="connect" v-model="url" hide-details/>-->

        <v-btn v-show="connect" small v-clipboard:copy="url" class="mx-2">Copy Link</v-btn>
        <!--      <v-btn v-show="connect" small @click="share">Send</v-btn>-->
        <v-spacer/>

        <v-menu offset-y z-index="10000">
          <template v-slot:activator="{ on }">
            <v-btn small v-on="on" class="ma-2" v-show="connect">
              <v-icon>mdi-settings</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="showProfileEditor=true" dense>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item @click="spaceEditor" dense>
              <v-list-item-title>Space</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showAboutForm=true" dense>
              <v-list-item-title>About</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exit" dense>
              <v-list-item-title>Exit</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn @click="hidePanels" icon>
          <v-icon>mdi-arrow-collapse-down</v-icon>
        </v-btn>

        <ProfileEditor v-model="showProfileEditor"/>
        <SpaceEditor v-model="showSpaceEditor"/>
        <About v-model="showAboutForm"/>

      </v-app-bar>

      <v-content>
        <router-view v-on:connected="connected" v-on:disconnected="connect = false"/>
      </v-content>

      <template v-if="error">
        <v-snackbar
          top
          :timeout="9000"
          :multi-line="true"
          color="error"
          @input="closeError"
          :value="true">
          {{error}}
          <v-btn text dark @click.native="closeError">Close</v-btn>
        </v-snackbar>
      </template>
      <template v-if="message">
        <v-snackbar
          top
          :timeout="5000000"
          :multi-line="true"
          color="success"
          @input="closeMessage"
          :value="true">
          {{message}}
          <v-btn text dark @click.native="closeMessage">Close</v-btn>
        </v-snackbar>
      </template>

    </v-app>
  </Vue100vh>
</template>

<script lang="ts">
  import Vue from 'vue';
  import About from "@/views/About.vue";
  import {SpacesModule} from '@/store/modules/spaces';
  import {SpaceConfigModule} from '@/store/modules/space-config';
  import {AlertsModule} from '@/store/modules/alerts';
  import ProfileEditor from "@/views/spheres/components/ProfileEditor.vue";
  import SpaceEditor from "@/views/spheres/components/SpaceEditor.vue";
  import {AppModule} from '@/store/modules/app'
  import Vue100vh from 'vue-div-100vh'

  export default Vue.extend({
    name: 'OMP',
    components: {
      ProfileEditor,
      About,
      SpaceEditor,
      Vue100vh
    },
    methods: {
      connected() {
        AppModule.setDestroySession(false)
        this.connect = true;
        //@ts-ignore
        this.url = document.location.origin + this.$route.path
      },
      share() {
        window.open("tg://msg_url?url=" + this.url, "newwindow");
        return false;
      },
      exit() {
        SpacesModule.deleteAllUsers();
        this.connect = false;
        AppModule.setDestroySession(true)
        //@ts-ignore
        //this.$router.push({name: "home"});
      },
      closeError() {
        AlertsModule.clearError()
      },
      closeMessage() {
        AlertsModule.clearMessage()
      },
      spaceEditor() {
        SpaceConfigModule.CREATE_COPY();
        this.showSpaceEditor = true
      },
      hidePanels() {
        AppModule.setHeaderFooter(false)
      }
    },
    data: function () {
      return {
        connect: false,
        url: "",
        showAboutForm: false,
        fav: true,
        menu: false,
        hints: true,
        showProfileEditor: false,
        showSpaceEditor: false,
      }
    },
    computed: {
      config() {
        return SpaceConfigModule.config()
      },
      error() {
        return AlertsModule.error
      },
      message() {
        return AlertsModule.message
      },
      isMobile() {
        return AppModule.isMobile
      },
      showHeaderFooter() {
        return AppModule.showHeaderFooter
      }
    },
    created(): void {
      //@ts-ignore
      SpaceConfigModule.SET_THEME(this.$vuetify.theme);
      SpacesModule.init()
    },
  });
</script>

<style lang="scss">
  html, body {
    height: 100%;
    overflow-y: visible !important;

    .v-content__wrap {
      display: flex;
    }
  }

  .slogan {
    margin-top: 0.8em;
    margin-left: 0.2em;
  }

  .v-application--wrap {
    min-height: -webkit-fill-available !important;
  }
</style>
