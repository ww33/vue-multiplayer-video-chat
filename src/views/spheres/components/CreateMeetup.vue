<template>
  <v-dialog v-model="show" max-width="500px" class="floors">
    <v-card class="mx-auto card" max-width="500">
      <v-card-title class="headline">CreateMeetup</v-card-title>
      <v-card-text>
        <v-flex>

<!--          <v-list dense>-->
<!--            <v-list-item-group color="primary" v-model="currentFloor">-->
<!--              <v-list-item-->
<!--                two-line-->
<!--                v-for="(item) in floors"-->
<!--                :key="item.id"-->
<!--                :disabled="disabledItem(item.id)"-->
<!--                @click.native="onClickItem(item)">-->
<!--                <v-list-item-content>-->
<!--                  <v-list-item-title>Floor {{item.id + 1}}</v-list-item-title>-->
<!--                  <v-row disabled="true">-->
<!--                    <v-col cols="7">-->
<!--                      <v-list-item-subtitle>{{item.count}} people</v-list-item-subtitle>-->
<!--                    </v-col>-->
<!--                    <v-col cols="5">-->
<!--                      <v-list-item-subtitle :style="itemStyle(item.id)">{{itemText(item.id)}}-->
<!--                      </v-list-item-subtitle>-->
<!--                    </v-col>-->
<!--                  </v-row>-->
<!--                </v-list-item-content>-->
<!--              </v-list-item>-->
<!--            </v-list-item-group>-->
<!--          </v-list>-->

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

  @Component
  export default class CreateMeetup extends Vue {
    @Prop({default: false}) private value!: boolean;


    get show() {

      return this.value
    }

    set show(value) {
      this.$emit('input', value)
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
