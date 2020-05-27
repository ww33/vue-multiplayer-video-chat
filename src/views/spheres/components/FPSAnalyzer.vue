<template>
  <div class="fps-analyzer"></div>
</template>


<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator'

  @Component
export default class FPSAnalyzer extends Vue {
    @Prop({type: Boolean, required: true}) sessionConnected!: boolean;
    @Prop({type: Number, required: true}) numMembers!: number;

    private frameTime!: number;
    private fpsSmoothing = 20;
    private lastFrameAt?: number;
    private fpsCheckerEnabled!: boolean;

    currentFPS = 0;
    minFPS = Number.MAX_SAFE_INTEGER;
    maxFPS = Number.MIN_SAFE_INTEGER;
    private performanceTimer?: number;
    private lastAnalyzeAt?: number;
    private readonly PERFORMANCE_ANALYZER_FLUSH_EVERY_MS = 30000;

    @Watch('sessionConnected', {immediate: true}) onSessionConnectedChanged() {
      if (this.sessionConnected) {
        this.start()
      } else {
        this.stop()
      }
    }

    beforeDestroy() {
    this.stop()
  }

  start () {
    this.fpsCheckerEnabled = true;
    this.lastFrameAt = undefined;
    this.frameTime = 0;
    this.fpsChecker();
    this.performanceTimer = setInterval(() => this.analyzePerformance(), 1000)
  }

  stop () {
    this.fpsCheckerEnabled = false;
    if (this.performanceTimer !== undefined) {
      clearInterval(this.performanceTimer);
      this.performanceTimer = undefined
    }
  }

  private fpsChecker () {
    window.requestAnimationFrame(now => {
      if (this.lastFrameAt !== undefined) {
        const currentFrameTime = now - this.lastFrameAt;
        this.frameTime += (currentFrameTime - this.frameTime) / this.fpsSmoothing
      }

      this.lastFrameAt = now;

      if (this.fpsCheckerEnabled) {
        this.fpsChecker()
      }
    })
  }

  private analyzePerformance () {
    if (this.lastAnalyzeAt === undefined) {
      this.lastAnalyzeAt = Date.now()
    }

    this.currentFPS = Math.round(1000 / this.frameTime);

    this.minFPS = Math.min(this.minFPS, this.currentFPS);
    this.maxFPS = Math.max(this.maxFPS, this.currentFPS);

    // every 30 seconds send statistics
    if (Date.now() - this.lastAnalyzeAt > this.PERFORMANCE_ANALYZER_FLUSH_EVERY_MS) {
      this.sendAndFlush()
    }
  }

  private sendAndFlush () {
    console.log('[analytics]: FPS = min: %d, current: %d, max: %d, NoP: %d', this.minFPS, this.currentFPS, this.maxFPS, this.numMembers);

    // analyticsService.firePerformanceAnalyzer(this.currentFPS, this.minFPS, this.maxFPS, this.numMembers)

    this.lastAnalyzeAt = Date.now();
    this.minFPS = Number.MAX_SAFE_INTEGER;
    this.maxFPS = Number.MIN_SAFE_INTEGER
  }
}
</script>

<style lang="scss" scoped>
.fps-analyzer {
  display: none;
}
</style>
