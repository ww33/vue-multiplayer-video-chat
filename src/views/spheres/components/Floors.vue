<template>
  <v-dialog v-model="show" max-width="500px" class="floors">
    <v-card class="mx-auto card" max-width="500">
      <v-card-title class="headline">Floors</v-card-title>
      <v-card-text>
        <v-flex>
          <v-list dense>
            <v-list-item-group color="primary" v-model="currentFloor">
              <v-list-item
                two-line
                v-for="(item) in floors"
                :key="item.id"
                :disabled="disabledItem(item.id)"
                @click.native="onClickItem(item)">
                <v-list-item-content>
                  <v-list-item-title>Floor {{item.id + 1}}</v-list-item-title>
                  <v-row disabled="true">
                    <v-col cols="7">
                      <v-list-item-subtitle>{{item.count}} people</v-list-item-subtitle>
                    </v-col>
                    <v-col cols="5">
                      <v-list-item-subtitle :style="itemStyle(item.id)">{{itemText(item.id)}}
                      </v-list-item-subtitle>
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-flex>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" text @click="show = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {SpacesModule} from '@/store/modules/spaces';
  import {SpaceConfigModule} from '@/store/modules/space-config';
  import JanusRoom from "@/lib/janusRoom";

  @Component
  export default class Floors extends Vue {
    @Prop({default: false}) private value!: boolean;
    @Prop({required: true}) session!: JanusRoom;

    maxCountInFloor = 12

    getPublishersCount(room) {
      return new Promise((resolve, reject) => {
        this.session.getRoomParticipants(room).then(roomInfo => {
          let floor = this.floors.find(floor => floor.spaceId == String(room));
          if (floor != undefined) {
            //@ts-ignore
            floor.count = roomInfo.participants.filter(item => item.publisher).length;
          }
        }).catch(error => reject(error));
      });
    }

    get show() {
      if (this.value) {
        this.getPublishersCount(2128501);
        this.getPublishersCount(2128502);
        this.getPublishersCount(2128503);
        this.getPublishersCount(2128504);
      }
      return this.value
    }

    set show(value) {
      this.$emit('input', value)
    }

    get floors() {
      return SpacesModule.floors
    }

    get currentFloor() {
      return SpacesModule.currentFloor
    }

    set currentFloor(val) {
      // const spaceId = '212850' + (val+1).toString()
      // console.log(spaceId)
      //@ts-ignore
      // this.$router.push({path: `/space/${spaceId}`})
    }

    onClickItem(item) {
      const {spaceId} = item
      console.log('spaceId', spaceId)
      //@ts-ignore
      // this.$router.go('space/'+ spaceId)


      SpacesModule.deleteCurrentUser()
      this.$root.$emit('destroySpaceSession')
      SpaceConfigModule.setSpaceId(spaceId);
      setTimeout(() => {
        //@ts-ignore
        this.$router.push({path: `/space/${spaceId}`});
      }, 400)


      // this.$root.$on('onNewSpaceId', this.onZoomButton)
      // SpaceConfigModule.setSpaceId(spaceId).then(config => {
      //   //@ts-ignore
      //   this.$router.push({path: `/space/${spaceId}`});
      // }).catch((error) => {
      //   console.error(error)
      // });

    }

    itemStyle(id) {
      if (this.floors[id].count >= this.maxCountInFloor) {
        return {color: 'red'}
      } else {
        return null
      }
    }

    itemText(id) {
      if (id === this.currentFloor) {
        return 'You here'
      } else if (this.floors[id].count >= this.maxCountInFloor) {
        return 'Full'
      } else {
        return ''
      }
    }

    disabledItem(id) {
      return this.floors[id].count >= this.maxCountInFloor
    }
  }
</script>

<style scoped>
  .floors {
  }

  .card {
    opacity: .9;
  }

</style>
