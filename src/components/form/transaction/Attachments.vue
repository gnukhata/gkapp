<template>
  <b-card border-variant="secondary" no-body>
    <div class="p-2 p-md-3">
      <b v-translate> Attachments </b>
      <b-form-file
        class="mt-3 float-right d-inline-block"
        @input="onAttachmentSelect"
        v-model="currentAttachments"
        size="sm"
        accept="image/jpeg"
        placeholder="Choose a file / Drag & drop it here"
        drop-placeholder="Drop file here..."
        plain
        multiple
      ></b-form-file>
      <div class="clearfix"></div>
      <div class="mt-2">
        <div
          class="m-1 d-inline-block text-center float-left position-relative"
          style="width: 200px; height: 200px; border: 1px solid; line-height: 196px;"
          v-for="(image, index) in form.attachments"
          :key="index"
        >
          <b-button
            @click="onAttachmentDelete(index)"
            variant="link"
            class="position-absolute"
            style="right: 0px"
            size="sm"
          >
            <b-icon icon="trash"></b-icon>
          </b-button>
          <img
            style="height: 196px; box-sizing: border-box"
            @load="onAttachementPreviewLoad"
            :src="image"
            :alt="'Preview_' + index"
          />
        </div>
      </div>
    </div>
  </b-card>
</template>

<script>
import { getBase64 } from '@/js/utils.js';
import { mapState } from 'vuex';
export default {
  name: 'Attachments',
  props: {
    updateCounter: {
      type: Number,
      required: false,
      default: 0,
    },
    parentData: {
      type: Array,
      required: false,
      default: function() {
        return [];
      },
    },
  },
  data() {
    return {
      // the file uploader overwrites the existing files everytime a new set of files are chosen.
      // to overcome that we maintain the files chosen in form.attachments.
      form: {
        attachments: [],
      },
      currentAttachments: [],
      options: {},
    };
  },
  computed: {
    ...mapState([]),
  },
  watch: {
    updateCounter() {
      this.form.attachments = this.parentData;
      if(!this.form.attachments.length) {
        this.currentAttachments = [];
      }
    },
  },
  methods: {
    onAttachmentDelete(index) {
      this.form.attachments.splice(index, 1);
    },
    onAttachementPreviewLoad(e) {
      // console.log(e)
      if (e.target) {
        let height = e.target.height;
        let width = e.target.width;
        if (width > height) {
          e.target.style.height = 'auto';
          e.target.style.width = '196px';
        } else {
          e.target.style.width = 'auto';
          e.target.style.height = '196px';
        }
      }
    },
    onAttachmentSelect() {
      const self = this;
      let attachments = this.currentAttachments;
      let images = [];
      let b64Requests = [];
      if (attachments.length) {
        b64Requests = attachments.map((att) => getBase64(att));
        Promise.all(b64Requests).then((b64Images) => {
          images = b64Images.map((image) => {
            let imageData = image.split(',')[1];
            return `data:image/jpg;base64,${imageData}`;
          });
          self.form.attachments.push(...images);
        });
      }
    },
  },
};
</script>
