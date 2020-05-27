<template>
  <div class="header" :class="{pointer: publishing, hidden: !visible, absolute: absolutePos}">
    <div class="title">{{ title }}</div>
    <v-icon v-if="publishing" @click="$emit('close')">mdi-close</v-icon>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'

  @Component
export default class ElementHeader extends Vue {
    @Prop({type: Boolean, required: true}) visible!: boolean;
    @Prop({type: Boolean, required: true}) publishing!: boolean;
    @Prop({type: String}) title!: string;
    @Prop({type: Boolean, default: false}) absolutePos!: boolean
  }
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
  width: 100%;
  height: 22px;
  background-color: #2e2e2e;

  &.absolute {
    position: absolute;
    top: -22px;
  }

  .title {
    flex-grow: 1;
    opacity: 0.5;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.83;
    color: #ffffff;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .close {
    min-width: 10px;
    width: 10px;
    height: 10px;
    cursor: pointer;
  }

  &.hidden {
    opacity: 0;
  }
}
</style>
