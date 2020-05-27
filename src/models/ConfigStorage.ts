import {AlertsModule} from '@/store/modules/alerts'

export class ConfigStorage {

  static defaultConfig(id: number) {
    return {
      spaceId: id,
      slogan: 'Online Meetup',
      logo: 'mdi-message-video',
      theme: 'default',
      dark: true,
      showDebug: false
    }
  }

  static getKeyBySpaceId(spaceId: number) {
    return spaceId > -1 ? 'space_' + spaceId.toString() : null
  }

  static saveConfig(config, spaceId) {
    config.spaceId = spaceId;
    const key = this.getKeyBySpaceId(spaceId);
    let err = '';
    if (key) {
      localStorage.setItem(key, JSON.stringify(config))
    } else {
      err = 'failed to save configuration'
    }

    if (err) {
      AlertsModule.setError(err)
    }
  }

  static getConfigById(spaceId) {
    const key = this.getKeyBySpaceId(spaceId);
    if (key) {
      const configStr = localStorage.getItem(key);
      try {
        if (configStr) {
          return JSON.parse(configStr)
        }
      } catch (e) {

      }
    }

    return this.defaultConfig(spaceId);
  }

  static logoList() {
    return ['mdi-message-video', 'mdi-cat', 'mdi-duck',]
  }

  static getThemeByName(name: string, dark: boolean) {
    const tmp = this.getThemes()[name];
    if (tmp) {
      return dark ? tmp.themes['dark'] : tmp.themes['light']
    }
  }

  static getThemes() {
    return {
      default: {
        name: 'default',
        dark: true,
        themes: {
          dark: {
            primary: '#2196F3',
            accent: '#FF4081',
            secondary: '#424242',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          },
          light: {
            primary: '#1976D2',
            accent: '#82B1FF',
            secondary: '#424242',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          }
        }
      },
      green: {
        name: 'green',
        dark: true,
        themes: {
          dark: {
            primary: '#388E3C',
            accent: '#4CAF50',
            secondary: '#757575',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          },
          light: {
            primary: '#4CAF50',
            accent: '#4CAF50',
            secondary: '#757575',
            success: '#4CAF50',
            info: '#2196F3',
            warning: '#FB8C00',
            error: '#FF5252'
          }
        }
      },


    }
  }

  /*
    static getConfigs() {
      const arr: any[] = [];
      for (let [fullKey, valueStr] of Object.entries(localStorage)) {
        if (fullKey.indexOf('space_') === 0) {
          try {
            const key = fullKey.substring(6);
            const config = JSON.parse(valueStr);
            config.spaceId = key;
            if (!config.name) config.name = key;
            arr.push(config)
          } catch (e) {
            console.error(e)
          }
        }
      }
      if (arr.length === 0) {
        arr.push(this.defaultConfig())
      }
      return arr
    }
  */

}



