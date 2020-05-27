<template>
    <div class="banned-wrapper">
        <div class="banned-block">
<!--            <img svg-inline class="close-red" src="../assets/close-red.svg">-->
            <div class="banned-caption">
                The meeting is over
            </div>
            <div class="banned-text">
                We're sorry that you were late. <br/>
                Watch new interesting meetings in our <a href="https://connect.club/conferences">Connect.Club</a> service.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator'

  @Component
    export default class EventFinishedPopup extends Vue {
        @Prop() eventData!: any
    }
</script>

<style lang="scss" scoped>
    .banned-wrapper {
        width: 710px;
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 999;
        -webkit-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;

        .banned-block {
            text-align: center;

            .close-red {
                width: 48px;
                height: 48px;
            }
        }
    }

    .w-text {
        color: $black;
        font-size: 16px;
    }

    .banned-caption {
        margin-top: 15px;
        font-size: 30px;
        font-weight: 600;
    }

    .banned-text {
        color: $grey-05;
        margin-top: 40px;
        font-size: 16px;

        a {
            color: $white;
        }
    }
</style>
