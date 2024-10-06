<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QrCreator from 'qr-creator'

const props = defineProps<{
  code: QRDetails,
  showCodes: boolean
}>()

const qrRef = ref<HTMLElement | null>(null)

onMounted(() => {
  QrCreator.render({
    text: props.code.url,
    radius: 0.0,
    ecLevel: 'H',
    fill: 'black',
    background: null,
    size: 256
  }, qrRef.value!)
})

</script>

<template>
  <div class="qr">
    <div class="overlay">
      <svg xmlns="http://www.w3.org/2000/svg" height="64" width="64" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
    </div>
    <div class="qr-wrapper" ref="qrRef" />
    <div>{{ props.code.issuer }} {{ props.code.name }}</div>
    <div v-if="showCodes">{{ props.code.code }}</div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  top: 0;
  left: 0;
  width: 256px;
  height: 256px;
  background: gray;
  z-index: 1;
  color: white;
  transition: background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  @media print {
    display: none;
  }
  &:hover {
    background: rgba(0, 0, 0, 0);
    svg {
      display: none;
    }
  }
}

.qr-wrapper {
  @media screen {
    position: absolute;
  }
}
.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-all;
  text-wrap: wrap;
}
</style>
