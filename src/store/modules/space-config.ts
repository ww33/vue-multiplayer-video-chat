import {Vue} from 'vue-property-decorator';
import {Action, getModule, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import store from '@/store'
import {ConfigStorage} from "@/models/ConfigStorage";

export interface ISpaceConfig {
}

@Module({dynamic: true, store, name: 'spaceConfig'})
class SpaceConfig extends VuexModule implements ISpaceConfig {
  _spaceId = -1;
  _theme: any | null;
  _config: any = ConfigStorage.defaultConfig(this._spaceId);
  _copy = ConfigStorage.defaultConfig(this._spaceId);

  get config(): any {
    return () => {
      return this._config
    }
  }

  get theme() {
    return this._theme
  }

  @Mutation SET_DARK(dark: boolean) {
    Vue.set(this._config, 'dark', dark);
    this._theme.dark = dark
  }

  @Mutation SET_SPACE_ID(spaceId: number) {
    this._spaceId = spaceId
  }

  @Mutation SET_CONFIG(config) {
    this._config = config
  }

  @Mutation CREATE_COPY() {
    this._copy = {...this._config}
  }

  @Mutation RESTORE_COPY() {
    this._config = {...this._copy};
    this._theme.dark = this._config.dark
  }

  @Mutation SAVE() {
    if (this._spaceId > -1) {
      ConfigStorage.saveConfig(this._config, this._spaceId)
    }
  }

  @Mutation SET_THEME(theme) {
    if(theme) this._theme = theme;
    if (this._spaceId > -2) {
      const tempConfig = ConfigStorage.getConfigById(this._spaceId);
      if (tempConfig) {
        this._config = tempConfig;
        this._theme.dark = tempConfig.dark
      }
    }
  }

  @Action init(payload) {
    const {spaceId, theme} = payload;
    this.context.commit('SET_SPACE_ID', spaceId);
    this.context.commit('SET_THEME', theme)
  }

  @Action setSpaceId(spaceId) {
    return new Promise((resolve, reject) => {
      this.context.commit('SET_SPACE_ID', spaceId);
      const config = ConfigStorage.getConfigById(spaceId);
      this.context.commit('SET_CONFIG', config);
      const {dark, theme} = config;
      this.applyTheme({dark, theme});
      resolve(config)
    })
  }

  @Action({rawError: true}) applyTheme(payload) {
    const {dark, theme: themeName} = payload;
    const theme = ConfigStorage.getThemeByName(themeName, dark);
    // console.log('this.theme.themes', this.theme.themes)
    if (dark) {
      Object.assign(this.theme.themes.dark, theme)
    } else {
      Object.assign(this.theme.themes.light, theme)
    }
  }

}

export const SpaceConfigModule = getModule(SpaceConfig);
