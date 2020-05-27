import {Config} from '@/config'

export interface Space {
  name: string,
  session_id: string
}

export interface JoinResponse {
  id: string,
  sessionId: string,
  token: string,
  space: Space
}

export interface ImageUploadResponse {
  signedRequest: string,
  url: string
}

class SpatialChatApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = Config.API_ENDPOINT
  }

  stub(data: any): Promise<any> {
    return new Promise<JoinResponse>(function (resolve) {
      resolve(data);
    });
  }

  async userData(token: string, spaceId: string): Promise<JoinResponse> {
    return this.stub({
      "token": "5de64afbb8cd4c84c2754950",
      "isAdmin": true,
      "banned": false,
      "name": "Debugger",
      "avatar": "https:\/\/connect-club-stage-static.s3.eu-central-1.amazonaws.com\/pics\/socw3oJqo5Ii5nXsUjPKwAedaLjhNKjL7JgeNnqP-768.jpg",
      "profileLink": "https:\/\/stage2.connect.club\/event\/5de64afbea1e4d317f69d5b5\/profile\/5de64afbb8cd4c84c2754950"
    });

    const req = {
      space_id: spaceId,
      token: token,
    };

    return await this.request('/api/users/info', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async spaceData(spaceId: string): Promise<JoinResponse> {
    return this.stub({
      "_id": "5de64b1477c17b628b275a62",
      "name": "debug",
      "event_id": "5de64afbea1e4d317f69d5b5",
      "session_id": "1_MX40NjM5ODk2Mn5-MTU3NTM3MzU4ODc0OH53V2dxMFdYbDBzb0VpcGhyN1R3UUtwZmp-fg",
      "updated_at": "2019-12-03 14:46:28",
      "created_at": "2019-12-03 14:46:28"
    });

    const req = {
      id: spaceId,
    };

    return await this.request('/api/spaces', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async eventData(spaceToken: string): Promise<JoinResponse> {

    return this.stub({
      "started_at": "Wed, 04 Dec 2019 14:00:00 +0300",
      "ended_at": "Wed, 04 Dec 2019 17:00:00 +0300",
      "finished": false,
      "greetings": "debug",
      "image": "",
      "description": "",
      "link": ""
    });

    const req = {
      space_id: spaceToken,
    };

    return await this.request('/api/events/info', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async mediaData(spaceToken: string): Promise<JoinResponse> {

    return this.stub([]);

    const req = {
      space_id: spaceToken,
    };

    return await this.request('/api/media', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async addMedia(spaceToken: string, userToken: string, contentType: string, url: string): Promise<JoinResponse> {

    const req = {
      token: userToken,
      space_id: spaceToken,
      type: contentType,
      url: url,
    };

    return await this.request('/api/media/create', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async bannedList(spaceToken: string, userToken: string): Promise<JoinResponse> {
    const req = {
      space_id: spaceToken,
      token: userToken,
    };

    return await this.request('/api/spaces/bans', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async userBan(adminToken: string, userToken: string, spaceToken: string, active: boolean): Promise<any> {
    const req = {
      space_id: spaceToken,
      token: adminToken,
      user_token: userToken,
      active: active,
    };

    return await this.request('/api/spaces/bans/toggle', {
      method: 'POST',
      body: JSON.stringify(req)
    })
  }

  async join(spaceId: string, token: string): Promise<JoinResponse> {
    return this.stub({
      "id": "9c4f3e87-9b21-4878-99e5-abefa8d5bd61",
      "sessionId": "1_MX40NjM5ODk2Mn5-MTU3NTM3MzU4ODc0OH53V2dxMFdYbDBzb0VpcGhyN1R3UUtwZmp-fg",
      "token": "T1==cGFydG5lcl9pZD00NjM5ODk2MiZzaWc9ZjJhNzMyMjBhN2ExOWJlMmNmZWE4ODVmMDE2YWZlYzlhZWE3MzQwZjpzZXNzaW9uX2lkPTFfTVg0ME5qTTVPRGsyTW41LU1UVTNOVE0zTXpVNE9EYzBPSDUzVjJkeE1GZFliREJ6YjBWcGNHaHlOMVIzVVV0d1ptcC1mZyZjcmVhdGVfdGltZT0xNTc1Mzc0NzA3JnJvbGU9cHVibGlzaGVyJm5vbmNlPTE1NzUzNzQ3MDcuMTM3MTI3OTE2NzQ0MCZleHBpcmVfdGltZT0xNTc1OTc5NTA3JmNvbm5lY3Rpb25fZGF0YT0lN0IlMjJ0b2tlbiUyMiUzQSUyMjVkZTY0YWZiYjhjZDRjODRjMjc1NDk1MCUyMiUyQyUyMmlzQWRtaW4lMjIlM0F0cnVlJTJDJTIyYmFubmVkJTIyJTNBZmFsc2UlMkMlMjJuYW1lJTIyJTNBJTIyQWxla2hpbitJdmFuJTIyJTJDJTIyYXZhdGFyJTIyJTNBJTIyaHR0cHMlM0ElNUMlMkYlNUMlMkZjb25uZWN0LWNsdWItc3RhZ2Utc3RhdGljLnMzLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tJTVDJTJGcGljcyU1QyUyRnNvY3czb0pxbzVJaTVuWHNValBLd0FlZGFMamhOS2pMN0pnZU5ucVAtNzY4LmpwZyUyMiUyQyUyMnByb2ZpbGVMaW5rJTIyJTNBJTIyaHR0cHMlM0ElNUMlMkYlNUMlMkZzdGFnZTIuY29ubmVjdC5jbHViJTVDJTJGZXZlbnQlNUMlMkY1ZGU2NGFmYmVhMWU0ZDMxN2Y2OWQ1YjUlNUMlMkZwcm9maWxlJTVDJTJGNWRlNjRhZmJiOGNkNGM4NGMyNzU0OTUwJTIyJTdEJmluaXRpYWxfbGF5b3V0X2NsYXNzX2xpc3Q9",
      "space": {
        "_id": "5de64b1477c17b628b275a62",
        "name": "test2",
        "event_id": "5de64afbea1e4d317f69d5b5",
        "session_id": "1_MX40NjM5ODk2Mn5-MTU3NTM3MzU4ODc0OH53V2dxMFdYbDBzb0VpcGhyN1R3UUtwZmp-fg",
        "updated_at": "2019-12-03 14:46:28",
        "created_at": "2019-12-03 14:46:28"
      }
    });

    const req = {
      space_id: spaceId,
      token: token,
    };

    const resp = await this.request('/api/spaces/join', {
      method: 'POST',
      body: JSON.stringify(req)
    });

    return {
      id: resp.id,
      sessionId: resp.sessionId,
      token: resp.token,
      space: resp.space
    }
  }

  /*
    async createImageUploadRequest(file: File): Promise<ImageUploadResponse> {
      const req = {
        fileName: file.name,
        fileType: file.type
      };

      return this.request('/api/images/upload', {
        method: 'POST',
        body: JSON.stringify(req)
      })
    }
  */

  async uploadImage(file: File): Promise<any> {
    //const uploadReq = await this.createImageUploadRequest(file);
    let data = new FormData();

    data.append('image', file);

    let resp = await fetch(`${this.apiUrl}/api/images/upload`, {
      method: 'POST',
      body: data,
    });

    return resp.json()
  }

  private async request(path: string, params?: RequestInit) {
    let resp: Response;

    try {
      resp = await fetch(this.apiUrl + path, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        ...params
      })
    } catch (e) {
      const err = new Error('Can not connect to API');
      err.name = 'SC_API_FAILED';
      err.stack = e.stack;
      throw err
    }

    const json = await resp.json();
    if (json.error) {
      const err = new Error(json.error);
      err.name = 'SC_API_FAILED';
      throw new Error(json.error)
    }
    return json
  }

}

export const spatialChat = new SpatialChatApiService();
