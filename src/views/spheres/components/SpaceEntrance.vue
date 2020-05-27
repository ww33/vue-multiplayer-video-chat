<template>
  <div class="entrance">
    <form class="form" @submit="onEnter">
      <input type="text" class="name" placeholder="Your Name" v-model.trim="nickname" ref="nickname">
      <button v-show="!joining" class="pointer" type="submit" :disabled="nickname.length < 2 || joining">
        <img svg-inline src="../assets/joinbutton.svg">
      </button>
      <Spinner v-show="joining" name="three-bounce" color="#2cd79a" className="Spinner" :noFadeIn="true" />
    </form>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'
  import {spatialChat} from '@/services/spatialchat-api.service'
  import {storageService} from '@/services/storage.service'

  @Component
  export default class SpaceEntrance extends Vue {
    @Prop({required: true}) spaceName!: string;

    nickname = '';
    joining = false;

    mounted() {
      const lastNickname = storageService.lastNickname;
      if (lastNickname) {
        this.nickname = lastNickname
      }

      const nicknameEl = this.$refs.nickname as HTMLInputElement;
      nicknameEl.focus()
    }

  async onEnter (ev: Event) {
    ev.preventDefault();

    storageService.lastNickname = this.nickname;

    this.joining = true;
    try {
      const resp = await spatialChat.join(this.spaceName, this.nickname);
      this.$emit('enter', this.nickname, resp)
    } catch (e) {
      // TODO: error
      this.joining = false;
      this.$emit('error', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.entrance {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  background: url("../assets/entrance-bg.svg") no-repeat center center fixed;
  background-size: cover;
}

.form {
  display: inline-flex;
  align-items: center;

  input.name {
    width: 280px;
    height: 50px;
    border-radius: 12px;
    border: 2px solid #ffffff;
    background-color: transparent;
    color: #ffffff;
    padding: 0 21px;

    &::placeholder {
      opacity: 0.5;
    }

    font-size: 18px;
    line-height: normal;
    letter-spacing: -0.4px;
  }

  button[type=submit] {
    margin-left: 10px;
    padding: 0;
    background-color: transparent;
    border: 0;

    transition: opacity 200ms;
    &:disabled {
      opacity: 0.5;
    }
  }
}

.Spinner {
  margin-left: 10px;
  width: 50px;

  >>> div {
    width: 16px;
    height: 16px;
  }
}
</style>
