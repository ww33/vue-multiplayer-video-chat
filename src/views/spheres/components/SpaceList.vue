<!--
<template>
  <v-dialog v-model="show" max-width="500px" persistent>
    <v-row>
    <v-card class="elevation-5" ref="form">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Spaces list</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-list dense v-if="configs">
          <v-list-item-group color="primary">

            <v-list-item
              v-for="(item) in configs"
              :key="item.spaceId"
              @click="select(item.spaceId)"
            >
              <v-list-item-content>
                <v-list-item-title v-text="item.name"/>
              </v-list-item-content>
              <v-list-item-content>
                <v-list-item-title v-text="item.spaceId"/>
              </v-list-item-content>
            </v-list-item>

          </v-list-item-group>
        </v-list>

      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn  color="secondary">secondary</v-btn>
        <v-btn  color="primary">primary</v-btn>
      </v-card-actions>
    </v-card>
    </v-row>
    <v-row>
      <SpaceEditor :value="true"/>
    </v-row>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {SpaceConfigModule} from "@/store/modules/space-config";
  import {SpacesModule} from "@/store/modules/spaces";
  import {ConfigStorage} from "@/models/ConfigStorage";
  import  SpaceEditor from './SpaceEditor.vue'

  @Component({
    components: {SpaceEditor}
  })
  export default class SpaceList extends Vue {
    @Prop({default: true}) private value!: boolean;

    select(spaceId) {
      SpaceConfigModule.setSpaceId(spaceId)
    }

    get configs() {
      return ConfigStorage.getConfigs()
    }

    get show() {
      return this.value
    }

    set show(value) {
      this.$emit('input', value)
    }
  }
</script>
-->
