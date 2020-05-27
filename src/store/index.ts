import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import {IAppState} from './modules/app'
import {ISpacesState} from './modules/spaces'
import {IAlertsState} from './modules/alerts'
import {ISpaceConfig} from './modules/space-config'

export interface IRootState {
  app: IAppState
  spaces: ISpacesState
  alerts: IAlertsState
  spaceConfig: ISpaceConfig
}

export default new Vuex.Store<IRootState>({})


