import {getModule, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import store from '@/store'
import {detectIsMobile,} from './_utils'

export interface IAppState {
}

@Module({dynamic: true, store, name: 'app'})
class App extends VuexModule implements IAppState {
  //признак запуска на мобильном устройстве
  private _isMobile = detectIsMobile();
  get isMobile() {
    return this._isMobile
  }

  //версия приложения
  private _appVersion = process.env.PACKAGE_VERSION || '0';
  get appVersion() {
    return this._appVersion
  }

  //время сборки
  private _buildTime = process.env.TIME_OF_BUILD || '';
  get buildTime() {
    return this._buildTime
  }

  //отборажение панели ControlsPanel
  private showControls = true;

  get getShowControls() {
    return this.showControls
  }

  @Mutation setShowControls(val: boolean) {
    this.showControls = val
  }

  //скрытие иотборажение  панелей Header и Footer одновременно
  private _showHeaderFooter = false;

  get showHeaderFooter() {
    return this._showHeaderFooter
  }

  @Mutation setHeaderFooter(val: boolean) {
    this._showHeaderFooter = val
  }

  //отборажение YoutubeDialog
  private showYoutubeDialog = false;

  get getShowYoutubeDialog() {
    return this.showYoutubeDialog
  }

  @Mutation setShowYoutubeDialog(val: boolean) {
    this.showYoutubeDialog = val
  }

  //отборажение AddImageDialog
  private showImageDialog = false;

  get getShowImageDialog() {
    return this.showImageDialog
  }

  @Mutation setShowImageDialog(val: boolean) {
    this.showImageDialog = val
  }

  //текущий пользователь
  private destroySession = false;

  get getDestroySession() {
    return this.destroySession
  }

  @Mutation setDestroySession(val: boolean) {
    this.destroySession = val
  }
}

export const AppModule = getModule(App);
