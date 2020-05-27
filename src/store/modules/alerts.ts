import {getModule, Module, Mutation, VuexModule} from 'vuex-module-decorators'
import store from '@/store'

export interface IAlertsState {
}

@Module({dynamic: true, store, name: 'alerts'})
class Alerts extends VuexModule implements IAlertsState {
  _error = '';
  _message = '';

  get error() {
    return this._error
  }

  get message() {
    return this._message
  }

  @Mutation setError(val: string) {
    this._error = val
  }

  @Mutation clearError(){
    this._error = ''
  }

  @Mutation setMessage(val: string){
    this._message = val
  }

  @Mutation clearMessage(){
    this._message = ''
  }
}

export const AlertsModule = getModule(Alerts);
