<template>
  <div id="profile">
    <v-card style="max-height:200px; margin: 30px">
      <v-container>
        <v-list-item-title class="headline mb-1">Avatar</v-list-item-title>
        <v-row justify="space-between">
          <v-col cols="auto">
            <v-img
              height="100"
              width="100"
              :src="imgUrl"
              @click="dialog=true"
            ></v-img>
          </v-col>
          <v-col
            cols="auto"
            class="text-center pl-0"
          >
            <v-row
              class="flex-column ma-0 fill-height"
              justify="center"
            >
              <v-col class="px-0">
                <v-btn @click="dialog=true" icon>
                  <v-icon>mdi-folder-open</v-icon>
                </v-btn>
              </v-col>

            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog
      v-model="dialog"
      width="200"
    >
      <v-card>
        <strong style="margin-left: 5px">choose and edit avatar</strong>
        <croppa
        v-model="myCroppa"
        canvas-color="transparent"
        :width=100
        :height=100
        :zoom-speed=20
        :initial-image="initialImage"
        :file-size-limit="maxFileSize * 1024"

      />
        <v-card-actions>
          <v-btn color="secondary" @click="dialog=false" style="margin-right: 5px; margin-left: 5px">CANCEL</v-btn>
          <v-btn @click="generateImage">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import 'vue-croppa/dist/vue-croppa.css';

  @Component({
    components: {}
  })
  export default class Avatar extends Vue {
    @Prop() maxFileSize!: number | 0;
    @Prop() avatar!: any | null;

    myCroppa: any = null;
    emptyAvatar: string = 'https://secure.gravatar.com/avatar/1aedb8d9dc4751e229a335e371db8058?s=96&d=mm&r=g.jpg';
    imgUrl: string = this.emptyAvatar;
    dialog: boolean = false;

    get initialImage() {
      return this.imgUrl === this.emptyAvatar ? null : this.imgUrl
    }

    created(){
      if(this.avatar){
        this.imgUrl = this.avatar
      }
    }

    generateImage() {
      let url = this.myCroppa.generateDataUrl();
      this.dialog = false;
      this.imgUrl = url ? url : this.emptyAvatar;
      this.$emit('changeAvatar', url)
    }
  }
</script>

<style>
  .croppa-container {
    background-color: white;
    border: 3px solid black;
    /*height: 100px;*/
    margin: 20px;
  }
</style>
