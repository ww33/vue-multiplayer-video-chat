class OpentalkMock {
  getSupportedCodecs() {
    return {
      videoEncoders: [],
      videoDecoders: [],
    }
  }

  getConnection() {
    return {
      connectionId: 'connectionId',
      creationTime: 0,
      data: '{}',
    }
  }

  getSession(){
    return {
      connection: this.getConnection()
    }
  }

  SubscriberProperties(){
    return {
      insertMode: 'append',
      showControls: false,
      // insertDefaultUI: false,
      fitMode: 'cover',
      width: '', // flex
      height: '',
      preferredResolution: {width: 320, height: 240},
      // TODO:
      // audioVolume: 0, // start silent, when moved - recalculate
      preferredFrameRate: 30,
      subscribeToAudio: false
    }
  }

  initPublisher(el, properties, err){
    return {}
  }

}

export default new OpentalkMock()

