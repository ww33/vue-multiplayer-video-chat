<template>
  <v-flex>
    <v-container v-if="!userName">
      <LoginForm v-on:submit="createSession"/>
    </v-container>
    <v-container v-else fluid>
      <v-alert type="error" dense dismissible v-show="errorMessage !== null">
        {{errorMessage}}
      </v-alert>
      <v-row fluid class="justify-center" fill-height child-flex>
        <!--
          <div class="video-frame-test">
            <video src="@/assets/shnur-1.webm" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/shnur-2.webm" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test selected">
            <video src="@/assets/320_240p.mp4" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/v_720.mp4" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/h_360p.mp4" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/v_144p.mp4" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/v_144p.mp4" autoplay muted controls loop/>
          </div>
          <div class="video-frame-test">
            <video src="@/assets/v_144p.mp4" autoplay muted controls loop/>
          </div>
          -->
        <VideoFrame :janus-room="janusRoom"
                    v-for="stream in streams"
                    :key="stream.id"
                    :stream="stream"
                    ref="streams"/>
      </v-row>
      <v-row class="justify-center">
        <MainVideoFrame :janus-room="janusRoom" ref="mainFrame"/>
      </v-row>
    </v-container>
    <v-navigation-drawer clipped absolute fixed right v-model="space.showChat"
                         disable-resize-watcher width="400px">
      <RoomChat v-if="$route.query.userName"
                :janus-room="janusRoom"
                :name="$route.query.userName"
                ref="chat"/>
    </v-navigation-drawer>
    <v-navigation-drawer clipped absolute fixed left v-model="space.showUsersMenu"
                         disable-resize-watcher
                         width="150px">
      <UsersMenu :spaceId="roomId"/>
    </v-navigation-drawer>
    <v-footer absolute class="justify-center">
      <v-item-group>
        <v-btn small value="users" @click="openUserMenu"
               :color="space.showUsersMenu ? 'primary' : ''">
          <span>Users</span>
          <v-icon>mdi-account-multiple</v-icon>
          {{usersCount}}
        </v-btn>
        <v-btn small @click.stop="toggleAudio" :color="space.muted ? 'primary': ''">
          <span>Mute</span>
          <v-icon>mdi-volume-mute</v-icon>
        </v-btn>
        <v-btn small value="screen" @click.stop="toggleScreen">
          <span>Screen</span>
          <v-icon>mdi-monitor</v-icon>
        </v-btn>
        <v-btn small @click.stop="toggleChat" :color="space.showChat ? 'primary': ''">
          <span>Chat</span>
          <v-icon>mdi-message-text-outline</v-icon>
        </v-btn>
        <!--
                <v-btn small value="rec" @click.stop="toggleRecognize">
                  <span>Recognize</span>
                  <v-icon>mdi-text-to-speech</v-icon>
                </v-btn>
        -->
      </v-item-group>
    </v-footer>
  </v-flex>
</template>

<script lang="js">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
  import JanusRoom from '@/lib/janusRoom';
  import VideoFrame from '@/components/VideoFrame';
  import MainVideoFrame from '@/components/MainVideoFrame';
  import LoginForm from '@/components/LoginForm';
  import { Stream } from '@/models/Stream';
  import RoomChat from '@/components/RoomChat';
  import UsersMenu from './spheres/components/UsersMenu.vue';
  import { SpacesModule } from '@/store/modules/spaces';

  @Component({
    components: {
      LoginForm,
      VideoFrame,
      MainVideoFrame,
      RoomChat,
      UsersMenu,
    }
  })

  export default class Room extends Vue {

    streams = [];
    mainStream = null;

    @Prop({
      required: true,
      type: String
    })
    roomId;

    chat = false;
    req = false;
    janusRoom = null;
    errorMessage = null;
    selectedStream = null;

    get space() {
      return SpacesModule.space(parseInt(this.roomId));
    }

    get usersCount() {
      return SpacesModule.usersCount(this.space.id);
    }

    get userName() {
      return SpacesModule.profile.name;
    }

    created() {
      this.createSession();

      this.$root.$on('show-user', (user) => {

      });

      let room = this;

      window.onbeforeunload = function (e) {
        room.stopSession();
        return 'exit';
      };

      setInterval(function () {
        if (room !== undefined) {
          room.switchToActive(false);
        } else {
          console.error('room is null');
        }
      }, 1000);
    }

    toggleChat() {
      this.space.showChat = !this.space.showChat;
    }

    toggleRecognize() {

    }

    joinToSession() {
      this.$emit('connected');

      let config = this.janusRoom.getConfig();
      //output limit 1 MBt
      config.videoRoomHandler.send({
        'message': {
          'request': 'configure',
          'bitrate': 300000
        }
      });

      const userName = this.$route.query.userName;

      SpacesModule.addUser({
          spaceId: this.space.id,
          user: {
            id: config.myid,
            name: userName
          }
        }
      );

      if (!this.streams.find(value => value.id === 0)) {
        this.streams.push(new Stream(0, this.$route.query.userName, null, 0, true));
        this.switchToActive(true);
      } else {
        let streams = this.$refs.streams;
        streams.find(s => s.stream.id === 0)
          .update();
      }
    }

    toggleAudio() {
      this.space.muted = !this.space.muted;
    }

    @Watch('space.muted', { immediate: true }) muted(muted) {
      if (this.janusRoom) {
        const handler = this.janusRoom.getConfig().videoRoomHandler;
        if (muted) {
          handler.muteAudio();
        } else {
          handler.unmuteAudio();
        }
      }
    }

    toggleScreen() {
      if (this.janusRoom.getConfig().isShareScreenActive) {
        this.janusRoom.stopShareScreen()
          .then(() => {
            this.janusRoom.startOwnFeed({
              audioSend: true,
              videoSend: true
            }, () => {
              this.switchToActive(true);
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      } else {
        this.janusRoom.shareScreen()
          .then(() => {
            this.switchToActive(true);
          })
          .catch((err) => {
            console.log(err);
            if (err.name === 'NotAllowedError') {
              this.errorMessage = 'The access to camera is not allowed by the user agent or the platform';
            }
            this.janusRoom.startOwnFeed({
              audioSend: true,
              videoSend: true
            }, () => {
              this.switchToActive(true);
            });
          });
      }
    }

    addStream(stream) {
      console.info('JOIN', stream);
      if (!this.streams.find(value => value.id === stream.id)) {
        let config = this.janusRoom.getConfig();
        let feed = config.feeds[stream.id];
        stream.feed = feed;
        this.setSubStream(feed, 0);
        this.streams.push(stream);
        SpacesModule.addUser({
            spaceId: this.space.id,
            user: {
              id: stream.feed.rfid,
              name: stream.name
            }
          }
        );
      }
    }

    removeStream(streamIndex) {
      console.info('REMOVE', streamIndex);
      const stream = this.streams[streamIndex];
      if (stream && stream.name) {
        SpacesModule.deleteUser({
          spaceId: this.space.id,
          user: { id: stream.feed.rfid }
        });
      }
      this.$delete(this.streams, this.streams.findIndex(value => value.id === streamIndex));
      this.switchToActive(true);
    }

    receiveMessage(message) {
      this.$refs.chat.addMessage(message);
    }

    createSession() {
      let roomId = parseInt(this.roomId);
      let userName = this.$route.query.userName;
      if (!userName) return;
      let room = this;

      let options = {
        server: 'wss://meetup.gekus.ru:8989',
        //useRecordPlugin: true,
        onLocalJoin: function () {
          room.joinToSession();
        },
        onRemoteJoin: function (streamIndex, username, feedId) {
          room.addStream(new Stream(streamIndex, username, null));
        },
        onRemoteUnjoin: function (streamIndex) {
          room.removeStream(streamIndex);
        },
        onMessage: function (data) {
          room.receiveMessage(data);
        },
        onError: function (err) {
          console.log('Error', err);
        },
        onVolumeMeterUpdate: function (streamIndex, volume) {
          let stream = room.streams.find(value => value.id === streamIndex);
          if (stream != null) {
            stream.volume = volume;
          }
        }
      };

      let janusRoom = this.janusRoom = new JanusRoom(options);

      let createRoom = () => {
        let roomInfo = {
          room: roomId,
          publishers: 20,
          audio_level_average: 75
        };
        return janusRoom.createRoom(roomInfo);
      };

      let register = () => {
        let roomInfo = {
          room: roomId,
          username: userName
        };
        return janusRoom.register(roomInfo);
      };

      janusRoom.init()
        .then(() => createRoom()
          .then(() =>
            register()
              .then(() => {
                janusRoom.startOwnFeed({
                  audioSend: true,
                  videoSend: true
                }, () => {
                  //joinToSession(this);
                });
              })
          ))
        .catch(function (err) {
          room.errorMessage = err;
        });
    }

    setSubStream(feed, substream) {
      if (feed.simulcastStarted) {
        console.log('set substream for feed: ', feed.rfindex, substream);
        feed.send({
          message: {
            request: 'configure',
            substream: substream
          }
        });
      } else {
        console.log('not simulcasted yet');
        //TODO make lazy
        setTimeout(function () {
          if (feed.simulcastStarted) {
            console.log('slow set substream for feed: ', feed.rfindex, substream);
            feed.send({
              message: {
                request: 'configure',
                substream: substream
              }
            });
          } else {
            console.log('not simulcasted');
          }
        }, 1000);
      }
    }

    switchToActive(force) {
      if (this.streams.length === 0) {
        return;
      }
      const maxPeak = this.streams.reduce((p, c) => p.volume > c.volume ? p : c);
      if (maxPeak.volume > 10 || force) {
        //console.log('maxpeak', maxPeak);
        this.streams.forEach(value => {
          value.speaker = false;
        });
        maxPeak.speaker = true;

        if (this.mainStream == null || this.mainStream.id !== maxPeak.id || force) {
          this.mainStream = maxPeak;
          this.$refs.mainFrame.setStream(maxPeak);
        }
      }
    }

    beforeDestroy() {
      this.$emit('disconnected');
      this.stopSession();
    }

    stopSession() {
      this.streams.forEach(value => this.removeStream(value.id));
      this.janusRoom.stopOwnFeed();
    }

    openUserMenu() {
      this.space.showUsersMenu = !this.space.showUsersMenu;
    }
  };

</script>

<style lang="scss">
  .video-frame-test {
    margin: 2px;
    border: solid 2px var(--v-secondary-base);
    display: flex;
    float: left;

    video {
      height: 100px;
      min-width: 100%;
      padding: 0;
      margin: 0;
      object-fit: contain;
    }
  }
</style>
