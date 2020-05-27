<template>
  <div class="popup-wrapper">
    <div class="landing-popup">
      <div>
        <progressive-background class="profile-pic"
                                :src="userData.avatar"
                                v-if="userData.avatar !== undefined" />
      </div>

      <div class="greeting">
        Welcome, <span v-if="userData.name !== undefined">{{ userData.name }}</span>
      </div>

      <div class="meeting-info">
        <span class="topic"> Meeting topic: </span>

        <span class="text"
              v-if="eventData.greetings !== undefined"> {{ eventData.greetings }} </span>
      </div>

      <div class="warning">
        <div class="warn-sign">
          !
        </div>

        <div class="text">
            Online Meetup works best on Chrome, Firefox and wide screens.
        </div>
      </div>

      <div class="timer-caption">
        The room will automatically open:
      </div>

      <Countdown :end="eventData.started_at"
                 class="timer"
                 v-if="eventData.started_at !== undefined">
      </Countdown>

      <v-btn class="join"
              v-if="(hasEntrance || userData.isAdmin) && !joining"
              @click="onEnter">
        Join Room
      </v-btn>

      <Spinner v-show="joining" name="three-bounce" color="#2cd79a" className="Spinner" :noFadeIn="true" class="loader" />
    </div>
  </div>
</template>

<script lang="ts">
  import {isAfter} from 'date-fns'
  import Countdown from 'vuejs-countdown'
  import {spatialChat} from '@/services/spatialchat-api.service'
  import {Component, Prop, Vue} from 'vue-property-decorator'

  @Component({
    components: {
      Countdown,
    }
  })

  export default class LandingPopup extends Vue {
    @Prop() eventData!: any;
    @Prop() userData!: any;
    @Prop() spaceId!: string;

    hasEntrance: boolean = false;

    intervalId: number | null = null;

    joining: boolean = false;

    mounted() {
      this.intervalId = setInterval(() => {
        this.hasEntrance = !isAfter(this.eventData.started_at, new Date()) &&
        isAfter(this.eventData.ended_at, new Date())
    }, 1000)
  }

  beforeDestroy () {
    //@ts-ignore
    clearInterval(this.intervalId)
  }

  async onEnter () {
    this.joining = true;

    try {
      const resp = await spatialChat.join(this.spaceId, this.userData.token);
      this.$emit('enter', this.userData.token, resp)
    } catch (e) {
      // TODO: error
      this.joining = false;
      this.$emit('error', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.popup-wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 999;
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.landing-popup {
  padding: 60px 20px;
  height: 680px;
  width: 710px;
  background-color: $grey-95;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  .profile-pic {
    background-position: center center;
    background-size: cover;
    border-radius: 50%;
    height: 100px;
    width: 100px;
  }

  .greeting {
    font-weight: normal;
    margin-top: 20px;
    margin-bottom: 34px;
    text-align: center;
    font-size: 35px;
  }

  .meeting-info {
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid $grey-20;
    border-left: 3px solid $green;
    padding: 0px 30px;

    .topic {
      text-align: center;
      font-weight: 600 !important;
    }

    .text {
      margin-left: 5px;
      text-align: center;
    }
  }

  .warning {
    margin-top: 25px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .warn-sign {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $orange;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .text {
      color: $grey-30;
    }
  }

  .timer-caption {
    margin-top: 56px;
    font-size: 15px;
    color: $grey-30;
  }

  .timer {
    margin-top: 5px;
  }

  .join {

    margin-top: 45px;
    font-size: 16px;
    width: 220px;
    height: 52px;
  }
}

.loader {
  margin-top: 70px !important;
}
</style>
