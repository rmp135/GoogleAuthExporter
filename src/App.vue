<script setup lang="ts">
import { computed, ref } from 'vue'
import * as proto from './protobuf/index'
import jsQR from 'jsqr'
import * as base32 from './protobuf/base32'
import QRCodeComp from './components/QRCodeComp.vue'

const generatedCodes = ref<QRDetails[]>([])

const message = ref<string>('')
const hasMessage = computed(() => message.value.length > 0)
const showCodes = ref<boolean>(false)

function decodeAccount(payload: proto.OtpParameter) : QRDetails {
  const secret = payload.secret
  const base64EncodedSecret = Uint8Array.from(atob(secret), c => c.charCodeAt(0))
  const actualSecret = base32.encode(base64EncodedSecret)!
  const name = payload.name || ""
  const issuer = payload.issuer || ""
  // TODO: implement counter, period, digits
  // digits are string which is weird
  // const counter = payload.counter || 0
  // const period = payload.period || 30
  // const digits = payload.digits || 6

  const url = `otpauth://totp/${encodeURI(name)}?secret=${encodeURI(actualSecret)}&issuer=${encodeURI(issuer)}`
  return {
    name,
    code: actualSecret,
    url,
    issuer
  }
}
async function decodeQRCodeFromImage(file: File) {
  const img = new Image()
  img.src = URL.createObjectURL(file)
  await new Promise((resolve) => img.addEventListener("load", resolve))
  const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight)
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
  const qrdata: string = jsQR(imageData.data, img.naturalWidth, img.naturalHeight)?.data || ''
  const dataParam = new URL(qrdata).searchParams.get('data')!
  const urldecoded = decodeURIComponent(dataParam)
  const base64decoded = atob(urldecoded)
  const response = proto.decode(base64decoded)
  if (response == null) {
    message.value = `Failed to decode QR code from ${file.name}`
    return
  }
  for (const payload of response.otpParameters) {
    generatedCodes.value.push(decodeAccount(payload))
  }
}
async function decodeQRCodeFiles(event: Event) {
  generatedCodes.value = []
  const files = (event.target as HTMLInputElement).files
  if (files == null) {
    message.value = 'No files selected'
    return
  }
  try {
    for (const file of files) {
      await decodeQRCodeFromImage(file)
    }
  } catch (e) {
    message.value = `Failed to decode QR code from selected files.`
  }
}
</script>

<template>
  <div id="hide-print"> 
    <div>No information is uploaded to any server, this is entirely offline. The images will be shown on mousover, or during printing.</div>
    <div>Select your images below.</div>
    <input type="file" alt="QR Code" @change="decodeQRCodeFiles" multiple accept="image/*" />
    <span v-if="generatedCodes.length > 0">
      <input id="show-codes" type="checkbox" v-model="showCodes" />
      <label for="show-codes">Show Codes</label>
    </span>
  </div>
  <div v-if="hasMessage">
    {{ message }}
  </div>
  <div class="qr-grid" v-else>
    <q-r-code-comp v-for="url in generatedCodes" :code="url" :show-codes="showCodes" />
  </div>
</template>

<style scoped>
@media print {
  #hide-print {
    display: none;
  }
}
@media screen {
  #hide-print {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 1rem;
  }
}
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(256px, 1fr));
  gap: 1rem;
}
</style>
