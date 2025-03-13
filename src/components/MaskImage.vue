<script setup>
import {defineProps} from "vue";

const props = defineProps({
  loading:{
    type: Boolean,
    default: false
  },
  base64:{
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close']);
let longPressTimer;
const handleClose = ()=>{
  emit('close')
}

const handleImageMaskMouseDown = (event)=>{
  if (event.button === 0) {
    longPressTimer = setTimeout(handleLongPress, 1000);
  }
}
const handleImageMaskMouseUp = ()=>{
  clearTimeout(longPressTimer);
}
const getRandomDate = ()=>{
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');

  const dateString = `${year}${month}${day}${hours}`;

  const randomNumber = Math.floor(Math.random() * 9000) + 10000;

  return  `${dateString}0${randomNumber}`;
}

const handleLongPress = async ()=>{
  const random = getRandomDate()
  const link = document.createElement("a");
  link.href = props.base64
  link.download = `canvas_image${random}.png`;
  link.click();
}
</script>

<template>
  <div class="photo-mask" :class="{'display-none': !props.loading}">
    <div class="mask-con">
      <div class="mask-image"
           @mousedown="handleImageMaskMouseDown"
           @mouseup="handleImageMaskMouseUp"
      >
        <img :src="props.base64" alt="photo-mask" class="img"/>
      </div>
      <div class="mask-text">长按保存</div>

    </div>

    <div class="close-mask" @click="handleClose">
      <i class="icon icon-close"></i>
    </div>
  </div>
</template>

<style scoped>
.photo-mask{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.9);
  padding: 6% 12% 8% 12%;
  box-sizing: border-box;
  z-index: 1999;
}
.mask-con{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
}
.mask-image{
  border: 2px solid #efefef;
  background-color: rgba(0,0,0,0.9);
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.mask-text{
  padding: 5px 0;
}
.mask-image img{
  width: 100%;
}
.close-mask{
  position: fixed;
  bottom: 10%;
  left: 50%;
  width: 45px;
  height: 45px;
  z-index: 99;
  cursor: pointer;
}
.close-mask .icon {
  position: absolute;
  width: 100%;
  height: 100%;
  background-position: center center;
  background-size: 100%;
}
.icon-close{
  background: url('./image/icon_close.svg') no-repeat;
}
.display-none{
  display: none;
}
@keyframes fade {
  to{opacity: 0}
}

</style>
