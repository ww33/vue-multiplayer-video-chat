<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card class="mx-auto">
      <v-card-title class="headline">Profile</v-card-title>
      <v-card-text>
        <v-text-field
          ref="name"
          label="User name"
          v-model="profile.name"
          autofocus
          @change="nameChange"/>
        <v-text-field
          label="Description"
          v-model="profile.description"
          @change="descChange"/>
        <croppa class="croppa-container"
                v-model="myCroppa"
                canvas-color="transparent"
                :width=100
                :height=100
                :zoom-speed=20
                :initial-image="profile.avatar"
                :file-size-limit="maxSize * 1024"
                @new-image-drawn="avatarChange"
                @image-remove="imageRemove"
                @file-size-exceed="fileSizeExceed"/>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn text @click="cancelBtn" style="margin-right: 5px; margin-left: 5px">CLOSE</v-btn>
        <v-btn text @click="saveBtn" color="primary">SAVE</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {SpacesModule} from "@/store/modules/spaces";
  import {AlertsModule} from "@/store/modules/alerts";
  import {ProfileStorage} from '@/models/ProfileStorage'

  @Component({
    components: {}
  })
  export default class ProfileEditor extends Vue {
    @Prop({default: false}) private value!: boolean;

    maxSize = 100;//Kb
    myCroppa: any = null;

    profile = ProfileStorage.emptyProfile();
    newName = '';
    newDesc = '';
    newAvatar = '';

    onOpen(){
      this.profile = {...SpacesModule.profile};
      if (this.profile.avatar && this.myCroppa) {
        //принудительно обновляем, если есть аватарка
        this.myCroppa.refresh()
      }
    }

    nameChange(val) {
      this.newName = val
    }

    descChange(val) {
      this.newDesc = val
    }

    avatarChange() {
      this.newAvatar = this.myCroppa.generateDataUrl()
    }

    imageRemove() {
      this.newAvatar = ''
    }

    fileSizeExceed(file) {
      this.newAvatar = '';
      if (!this.profile.avatar && this.myCroppa) {
        this.myCroppa.remove();
      }
      AlertsModule.setError('Max size ' + this.maxSize + 'Kb, but this ' + Math.round(file.size / 1024) + 'Kb')
    }

    cancelBtn() {
      this.show = false;
      if (!this.profile.avatar && this.myCroppa) {
        this.myCroppa.remove();
      }
    }

    saveBtn() {
      const profile = {...this.profile};

      if (this.newName) {
        profile.name = this.newName;
        this.newName = ''
      }
      if (this.newDesc) {
        profile.description = this.newDesc;
        this.newDesc = ''
      }
      profile.avatar = this.newAvatar;

      if (this.myCroppa) {
        this.myCroppa.remove();
      }

      SpacesModule.setProfile(profile);
      ProfileStorage.updateProfile(profile);

      this.show = false;
    }

    get show() {
      if (this.value) this.onOpen(); //обработчик при открытии
      return this.value
    }

    set show(value) {
      this.$emit('input', value)
    }
  }
</script>

<style lang="scss" scoped>
  .croppa-container {
    background-color: white;
    border: 2px solid var(--v-primary-base);
    box-sizing: content-box;
    width: 100px;
    height: 100px;
  }
</style>
