<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card class="mx-auto" max-width="500">
      <v-card-title class="headline">About</v-card-title>
      <v-card-text>
        <v-flex>
          <div><span class="subtitle-2">Version:</span>
            <!--{{appVersion}}-->
            0.3.16
          </div>
          <div><span class="subtitle-2">Revision:</span>
            {{revision}}
          </div>
          <div><span class="subtitle-2">Commit time:</span>
            {{buildTime}}
          </div>
        </v-flex>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" text @click="onTest">Test</v-btn>
        <v-btn color="primary" text @click="show = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {AppModule} from '@/store/modules/app'
  import {AlertsModule} from '@/store/modules/alerts'
  import {getModule } from 'vuex-module-decorators'

  @Component
  export default class About extends Vue {
    @Prop({default: false}) private value!: boolean;

    get show() {
      return this.value
    }

    set show(value) {
      this.$emit('input', value)
    }

    get buildTime() {
      return AppModule.buildTime;
    }

    get appVersion() {
      return AppModule.appVersion;
    }

    get revision() {
      //@ts-ignore
      return GIT_DESCRIBE.raw;
    }

    onTest(){

    }
  }
</script>
