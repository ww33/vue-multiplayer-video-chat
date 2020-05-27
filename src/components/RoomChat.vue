<template>
  <div>
    <v-tabs grow v-model="model">
      <v-tab href="#messages">Chat</v-tab>
      <v-tab href="#rec">Rec</v-tab>
    </v-tabs>
    <v-container class="messages pa-1" ref="messages_list">

      <v-tabs-items v-model="model">

        <v-tab-item value="messages">

          <v-list>
            <template v-for="(msg) in messages">

              <v-list-item :key="msg.date" dense :class="{output: msg.sendMe, repeat: msg.repeat}">

                <v-list-item-avatar v-if="(msg.sendMe)" class="mr-n8"/>

                <v-list-item-avatar v-else-if="(!msg.sendMe && msg.avatar == '')"
                                    class="mr-2 align-self-start" color="#999">
                  <v-icon dark>mdi-account-circle</v-icon>
                </v-list-item-avatar>

                <v-list-item-avatar v-else class="mr-2 align-self-start">
                  <v-img :src="msg.avatar"/>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-regular">{{msg.from}}
                    <div class="float-right font-weight-light">{{msg.date | time}}</div>
                  </v-list-item-title>
                  <v-list-item-subtitle v-linkified class="text-wrap"><span>{{msg.text}}</span>
                  </v-list-item-subtitle>
                </v-list-item-content>

              </v-list-item>

            </template>
          </v-list>

        </v-tab-item>

        <v-tab-item value="rec">
          <div v-for="msg of recognizes" :key="msg.date">
            <span class="subtitle-2 font-weight-bold">[{{msg.date | time}}] {{msg.from}}:
              <span class="body-2">{{msg.text}}</span>
            </span>
            <br/>
          </div>
        </v-tab-item>
      </v-tabs-items>

    </v-container>
    <v-footer color="#666" absolute class="ma-1 pa-0 body-2">
      <v-textarea
        v-model="message"
        label="Чат"
        rows="1"
        row-height="20"
        auto-grow
        filled
        @keyup.enter="chatSendMessage(name)"/>
      <v-btn depressed large block @click="chatSendMessage(name)" class="mt-n6">Send</v-btn>
    </v-footer>
  </div>
</template>

<script lang="js">
  import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
  import linkify from 'vue-linkify';
  import JanusRoom from '@/lib/janusRoom';
  import moment from 'moment';

  Vue.directive('linkified', linkify);

  Vue.filter('time', function (value) {
    if (value) {
      return moment(value).locale('ru').format('LTS');
    }
  });

  @Component
  export default class RoomChat extends Vue {

    @Prop({
      required: true,
      type: JanusRoom
    })
    janusRoom;

    @Prop({
      required: true,
      type: String
    })
    name;

    model = 'messages';

    maxMessages = 256;

    message = null;

    messages = [];
    /*
        messages = [{
          'date': '12345678',
          'avatar': '',
          'from': 'vvp',
          'sendMe': false,
          'text': 'Привет, этот как дела?',
          'repeat': false
        }, {
          'date': '12345679',
          'avatar': '',
          'from': 'vvp',
          'sendMe': false,
          'text': 'Привет, этот как дела?',
          'repeat': true
        }];
    */

    recognizes = [];

    @Watch('messages')
    changeMessages(messages) {
      if (messages.length <= 1) return;
      let index = messages.length - 2;
      if (messages[index].from === messages[(index + 1)].from && messages[index].sendMe === messages[(index + 1)].sendMe)
        messages[(index + 1)].repeat = true;
    }


    chatSendMessage(name) {
      let chat = this;
      if (this.message == null || this.message.length === 0) return;
      if (this.messages.length >= this.maxMessages) this.messages.splice(0, 1);

      let message = {
        'type': 'message',
        'date': new Date().getTime(),
        'avatar': '',
        'from': name,
        'sendMe': true,
        'text': chat.message,
        'repeat': false
      };

      this.janusRoom.sendMessage(message)
        .then(function () {
          chat.messages.push(message);
          chat.message = null;
        });

      setTimeout(this.scrollToBottom, 200);
    }

    addMessage(message) {
      console.log('MESS', message);
      switch (message.type) {
        case 'recognize': {
          this.recognizes.push(message);
          break;
        }
        case 'message': {
          this.messages.push(message);
          this.$toast('New message from <b>' + message.from + '</b>:<br/> ' + message.text);
          break;
        }
      }
    }

    scrollToBottom() {
      let element = this.$refs.messages_list;
      element.scrollTop = element.scrollHeight + 2000;
    }
  }
</script>

<style lang="scss" scoped>

  $b-radius: 10px;
  $b-margin: 10px;

  /*
    .v-list-item {
      background-color: var(--v-secondary-lighten2) !important;
      border-radius: $b-radius $b-radius $b-radius 0;
      margin: 0 $b-margin 5px 3px;

      span {
        color: #fff;
      }

      a {
        color: var(--v-accent-lighten3) !important;
      }
    }
  */

  /*
    .v-list-item.repeat {
      margin: 0 $b-margin + 10 5px 3px;
    }
  */

  .output {
    background-color: var(--v-secondary-darken2) !important;
    border-radius: $b-radius $b-radius 0 $b-radius;
    margin: 0 3px 5px $b-margin;

    span {
      color: #ccc;
    }
  }


  .repeat {
    border-radius: $b-radius;
  }

  .output.repeat {
    margin: 0 3px 5px $b-margin + 10;
  }


  /*
    .v-footer {
      background-color: var(--v-secondary-base) !important;
    }
  */

  .messages {
    overflow-y: auto;
    height: calc(100vh - 160px);
  }
</style>
