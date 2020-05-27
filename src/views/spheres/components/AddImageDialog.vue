<template>
  <v-dialog
    v-model="dialog"
    max-width="500">
    <v-card>
      <v-card-text>
        <v-row style="margin-left: 3px">
          <v-icon large color="#1E90FF">mdi-image-filter-hdr</v-icon>
          <v-card-title>Insert image link</v-card-title>
          <v-card-title v-if="error" class="input-text error">{{ error }}</v-card-title>
        </v-row>
        <v-row align="center"
               class="mx-0">
          <v-text-field
            ref="link"
            label=""
            solo
            v-model="link"
            autofocus/>
        </v-row>
        <v-row class="mx-0"
               align-center>
          <v-layout>
            <v-flex align-center>
              <img v-if="previewImgUrl" class="preview-img" :src="previewImgUrl" ref="img"
                   :class="{uploading}" @load="reflow()" alt="Preview"/>
              <Spinner v-show="uploading" name="three-bounce" color="#2cd79a" className="Spinner"
                       :noFadeIn="true"/>
            </v-flex>
          </v-layout>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="secondary"
               @click="hide">
          CANCEL
        </v-btn>
        <v-btn @click="selected">
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator'
  import {spatialChat} from '@/services/spatialchat-api.service'
  import {AppModule} from '@/store/modules/app'

  @Component
  export default class AddImageDialog extends Vue {
    error: string | null = null;
    file: File | null = null;

    get dialog() {
      const _dialog = AppModule.getShowImageDialog;
      if (_dialog) this.link = '';
      return _dialog
    }

    set dialog(val) {
      AppModule.setShowImageDialog(val)
    }

    @Watch('file') onFileChanged() {
      if (this.fileObjectURL) {
        URL.revokeObjectURL(this.fileObjectURL);
        this.fileObjectURL = null
      }

      if (this.file) {
        this.fileObjectURL = URL.createObjectURL(this.file)
      }
    }

    fileObjectURL: string | null = null;

    @Watch('fileObjectURL') onFileObjectURLChanged() {
      this.previewImgUrl = this.fileObjectURL
    }

    previewImgUrl: string | null = null;
    uploading = false;
    dragOverDropzone = false;

    uploadState = 'link';

    @Watch('uploadState', {immediate: true}) onStateChanged() {
      this.reset();
      if (this.uploadState === 'link') {
        this.$nextTick(() => {
          const $link = this.$refs.link as HTMLInputElement;
          if ($link) $link.focus()
        })
      }
    }

    link = '';

    @Watch('link')
    async onLinkChanged() {
      if (this.link.length === 0) {
        this.error = null;
        return
      }

      this.source = 'URL';

      const preload = document.createElement('img');
      preload.onerror = ev => this.error = 'Incorrect link';
      preload.onload = ev => this.previewImgUrl = this.link;
      preload.src = this.link
    }

    source: 'URL' | 'Browse' | 'DragDrop' | 'Clipboard' = 'Browse';

    reset() {
      this.file = null;
      this.dragOverDropzone = false;
      this.error = null;
      this.link = '';
      this.uploading = false;
      this.previewImgUrl = null
    }

    mounted() {
      document.body.addEventListener('paste', this.onPaste)
    }

    beforeDestroy() {
      document.body.removeEventListener('paste', this.onPaste)
    }

    opened() {
      const $file = this.$refs.fileEl as HTMLInputElement;
      if ($file) {
        $file.value = ''
      }
    }

    show(file?: File) {
      this.uploadState = 'computer';
      this.reset();
      this.$nextTick(() => {
        this.file = file || null;
      })
    }

    hide() {
      //@ts-ignore
      // this.$modal.hide('add-image')
      this.dialog = false;
      this.previewImgUrl = null
    }

    showError(text: string) {
      this.error = text
    }

    async onFiles(files: FileList) {
      this.error = null;
      if (files.length === 0) {
        return this.showError('You must select file')
      }

      const file = files.item(0)!;

      if (!file.type.startsWith('image/')) {
        return this.showError('Only images are supported!')
      }

      this.source = 'Browse';
      this.file = file
    }

    async upload(file: File): Promise<any> {
      this.uploading = true;
      const resp = await spatialChat.uploadImage(file);
      this.uploading = false;

      return resp.url
    }

    async selected() {

      let imageUrl = this.previewImgUrl;
      // if (this.file) {
      //   imageUrl = await this.upload(this.file)
      // }

      if (imageUrl) {
        const $img = this.$refs.img as HTMLImageElement;
        this.$emit('selected', imageUrl, $img.naturalWidth, $img.naturalHeight)
      }

      this.hide()
    }

    onPaste(ev: ClipboardEvent) {
      if (ev.target !== document.body && !(ev.target instanceof HTMLDivElement)) return;
      ev.preventDefault();
      ev.stopPropagation();
      if (ev.clipboardData && ev.clipboardData.items) {
        this.loadFromDataItemList(ev.clipboardData.items)
      }
      this.source = 'Clipboard'
    }

    dropHandler(ev: DragEvent) {
      if (ev.dataTransfer) {
        this.loadFromDataItemList(ev.dataTransfer.items);
        this.source = 'DragDrop'
      }
      this.dragOverDropzone = false
    }

    private loadFromDataItemList(items: DataTransferItemList) {
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            this.show(file);
            return
          }
        }
      }
      this.error = 'Unsupported file format (only images allowed)'
    }

    reflow() {
      // DIRTY HACK for repositioning popup :(
      const img = this.$refs.img as HTMLImageElement;
      if (img) img.height = img.height
    }
  }
</script>

<style lang="scss" scoped>

  .preview-img {
    max-width: inherit;
    max-height: inherit;
    object-fit: contain;
  }


  %button {
    width: 120px;
    height: 40px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.69;
  }

  .add-image-modal {
    > > > .modal {
      border-radius: 12px;
      background-color: #ffffff;

      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      padding: 25px;

      font-size: 14px;
      font-weight: 500;
      line-height: 1.57;
      color: #121212;

      min-height: 293px;
    }

    .header {
      align-self: flex-start;
      margin-bottom: 20px;

      a {
        color: inherit;
        text-decoration: none;
        margin-right: 16px;
        padding-bottom: 3px;

        &.active, &:hover {
          border-bottom: solid 3px #2cd79a;
        }

        &.active {
          font-weight: bold;
        }
      }

      .title {
        font-weight: bold;
      }
    }

    .upload-computer {
      border: dashed 1.5px #d9d9d9;
      border-radius: 6px;
      flex-grow: 1;
      align-self: stretch;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      font-size: 14px;
      line-height: 1.57;
      color: #121212;

      .bold {
        font-weight: bold;
      }

      .gray {
        font-weight: normal;
        color: #999999;
      }

      input.select {
        @extend %button;
        margin-top: 10px;
        background-color: #282828;
        color: #ffffff;
      }

      &.drop-zone {
        &.dragging-over {
          border-color: #3d3d3d;
        }
      }
    }

    .upload-link {
      flex-grow: 1;
      align-self: stretch;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;

      .link {
        align-self: stretch;
        border-radius: 6px;
        border: solid 1.5px #d9d9d9;
        height: 40px;
        padding: 0px 10px;
        font-size: 14px;
        font-weight: 500;
        margin: 10px 0;
      }
    }

    /*
        .preview {
          display: inline;
          max-height: 400px;
          max-width: 100%;

          .preview-img {
            max-width: inherit;
            max-height: inherit;
            object-fit: contain;

            &.uploading {
              opacity: 0.1;
            }
          }

          .Spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            > > > div {
              width: 12px;
              height: 12px;
            }
          }
        }
    */

    .buttons {
      align-self: flex-end;
      margin-top: 20px;

      input.cancel {
        @extend %button;
        background-color: #d9d9d9;
        color: #121212;
      }

      input.ok {
        @extend %button;
        background-color: #282828;
        color: #ffffff;
        margin-left: 10px;
      }
    }

    .error {
      color: #ff2631;
    }
  }
</style>
