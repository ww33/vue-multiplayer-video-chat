enum KEYS {
  LAST_NICKNAME = 'lastNickname',
  FIRST_VISIT_AT = 'firstVisitAt'
}

class StorageService {
  constructor (private storage: Storage) {

  }

  get lastNickname (): string | null {
    return this.storage.getItem(KEYS.LAST_NICKNAME)
  }

  set lastNickname (val: string | null) {
    if (val === null || val.length === 0) {
      this.storage.removeItem(KEYS.LAST_NICKNAME)
    } else {
      this.storage.setItem(KEYS.LAST_NICKNAME, val)
    }
  }

  get firstVisitAt (): Date | null {
    const ms = localStorage.getItem(KEYS.FIRST_VISIT_AT);
    if (ms !== null) {
      const msNumber = Number.parseInt(ms, 10);
      if (!Number.isNaN(msNumber)) return new Date(msNumber)
    }
    return null
  }

  set firstVisitAt (date: Date | null) {
    if (date !== null && localStorage.getItem(KEYS.FIRST_VISIT_AT) === null) {
      localStorage.setItem(KEYS.FIRST_VISIT_AT, date.getTime().toString())
    }
  }
}

export const storageService = new StorageService(window.localStorage);
