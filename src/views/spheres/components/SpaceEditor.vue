<template>
  <v-dialog v-model="show" max-width="500px" persistent>
    <v-card class="mx-auto">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Space configurator {{config.spaceId}}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <!--
                <v-row v-if="spaceId && spaceId<0">
                  <v-combobox
                    class="mx-2"
                    label="Space"
                    @input="spaceChange"
                    v-model="_currentConfig"
                    :items="configs"
                    item-text="spaceId"
                    item-value="spaceId"
                    autocomplete="off"/>
                  <v-btn text @click="newBtn" style="margin-top: 1em">NEW</v-btn>
                </v-row>
        -->

        <v-row class="mb-12">
          <v-col cols="10">
            <v-select
              label="Theme"
              v-model="theme"
              :items="themeNames"/>
          </v-col>
          <v-col cols="2">
            <v-checkbox v-model="dark" label="Dark" color="primary"></v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mb-12">
          <v-col cols="6">
            <v-text-field
              label="Slogan"
              v-model="config.slogan"/>
          </v-col>
          <v-col cols="6">
            <v-select
              style="margin-left: 1em"
              label="Logo"
              v-model="config.logo"
              :items="logoList"/>
          </v-col>
        </v-row>

        <v-row class="mb-12">
          <v-checkbox v-model="config.showDebug" label="Debug" color="primary"></v-checkbox>
        </v-row>

      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn text @click="cancelBtn">CANCEL</v-btn>
        <v-btn text @click="saveBtn" color="primary">SAVE</v-btn>
        <v-btn text @click="goBtn" color="primary" v-if="spaceId && spaceId<0">GO</v-btn>
      </v-card-actions>
    </v-card>

    <!--    NEW-->
    <v-dialog v-model="dialog" persistent max-width="600px">

      <v-card>
        <v-card-title>
          <span class="headline">New Space Id</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  type="number"
                  v-model="newSpaceId"
                  label="Space Id"
                  required></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="newCancelBtn">CANCEL</v-btn>
          <v-btn color="blue darken-1" text @click="newOkBtn">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-dialog>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {SpaceConfigModule} from "@/store/modules/space-config";
  import {SpacesModule} from "@/store/modules/spaces";
  import {ConfigStorage} from "@/models/ConfigStorage";

  @Component({
    components: {}
  })
  export default class SpaceEditor extends Vue {
    @Prop({default: false}) private value!: boolean;
    _currentConfig: any | null = null;
    dialog = false;
    newSpaceId = 0;

    /*    configs = this.getConfigs();

        getConfigs() {
          //@ts-ignore
          const _configs = ConfigStorage.getConfigs();
          if (_configs.length > 0) {
            const _currentConfig = _configs[0];
            this._currentConfig = _currentConfig;
            SpaceConfigModule.setSpaceId(_currentConfig.spaceId);
            SpaceConfigModule.SET_CONFIG(_currentConfig)
          }
          return _configs
        }*/

    spaceChange() {
      SpaceConfigModule.setSpaceId(this._currentConfig.spaceId);
      console.log('spaceChange', this._currentConfig)
    }

    newBtn() {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
      }

      this.newSpaceId = getRandomInt(1000, 10000);
      this.dialog = true
    }

    newCancelBtn() {
      this.dialog = false
    }

    newOkBtn() {
      SpaceConfigModule.setSpaceId(this.newSpaceId)
        .then(config => {
          //console.log(config);
          //this.configs.push(config);
          //console.log(this.configs.length);
          this._currentConfig = config
        });
      this.dialog = false
    }

    goBtn() {
      //@ts-ignore
      this.$router.push({path: `/space/${this._currentConfig.spaceId}`})
    }

    cancelBtn() {
      SpaceConfigModule.RESTORE_COPY();
      this.show = false
    }

    saveBtn() {
      SpaceConfigModule.SAVE();
      this.show = false
    }

    get currentConfig() {
      return this._currentConfig
    }

    set currentConfig(val) {
      // console.log('currentConfig', val)
      // console.log('this.spaceId', this.spaceId)
      this._currentConfig = val;
      if (val) {
        //@ts-ignore
        if (this.spaceId !== val.spaceId) {
          //@ts-ignore
          SpaceConfigModule.setSpaceId(val.spaceId)
        }
      }
    }

    create() {

    }

    // get cconfigs() {
    // if(this._configs && this._configs.length > 0){
    //   return this._configs
    // } else {
    //   const configs = ConfigStorage.getConfigs()
    //   if (configs.length > 0 && this._currentConfig == null) {
    //     this.currentConfig = configs[0]
    //   }
    //   //@ts-ignore
    //   this._configs = configs
    //   return configs
    // }
    // }

    get logoList() {
      return ConfigStorage.logoList()
    }

    get themes() {
      return ConfigStorage.getThemes()
    }

    get themeNames() {
      const arr: any[] = [];
      for (let [key] of Object.entries(this.themes)) {
        arr.push(key)
      }
      return arr
    }

    get config() {
      return SpaceConfigModule.config()
    }

    get spaceId() {
      return SpacesModule.spaceId
    }

    get show() {
      return this.value
    }

    set show(value) {
      this.$emit('input', value)
    }

    get dark() {
      return SpaceConfigModule.config().dark
    }

    set dark(val) {
      SpaceConfigModule.SET_DARK(val);
      // const tempTheme = {...this.theme}
      // tempTheme.dark = val
      // this.theme = tempTheme
      // SpaceConfigModule.config().dark = val
      SpaceConfigModule.applyTheme({theme: this.theme, dark: val})
    }

    get theme() {
      return SpaceConfigModule.config().theme
      // if (this._currentConfig) {
      //   //@ts-ignore
      //   // return this._currentConfig.theme
      //   return SpaceConfigModule.config().theme
      // }
      // console.log('SpaceConfigModule.config().theme', SpaceConfigModule.config().theme)
      // return SpaceConfigModule.config().theme
    }

    set theme(val) {
      if (val) {
        this._currentConfig.theme = val;
        SpaceConfigModule.config().theme = val;
        SpaceConfigModule.applyTheme({theme: val, dark: this.dark})
      }
    }

  }
</script>

<style>

</style>
