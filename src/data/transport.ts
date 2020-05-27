export interface Transport {
  send(test: string): void;
}

interface JanusRoom {

}

class DataChannelTransport implements Transport {
  constructor(janusRoom: JanusRoom) {
  }

  send(test: string): void {

  }
}

class StubTransport implements Transport {
  constructor() {

  }

  send(test: string): void {

  }
}
