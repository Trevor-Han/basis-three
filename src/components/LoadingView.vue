<script setup>
import { defineProps, watch, ref } from 'vue'

const props = defineProps({
  'loading': Boolean,
  'percentage': String
})
const loadingContainer = ref(document.createElement('div'))
const progress = ref(0)

watch(() => props.loading, (newVal) => {
  if (newVal) {
    if (loadingContainer.value){
      loadingContainer.value.classList.add("hide-loading");
      loadingContainer.value.addEventListener('animationend', hideLoadingContainer)
    }
  }
})

watch(() => props.percentage, (newVal) => {
  progress.value = newVal
})
const hideLoadingContainer = () => {
  loadingContainer.value.classList.add('display-none')
}
</script>

<template>
  <!-- loading相关 -->
  <div class="loading-con" ref="loadingContainer">
    <div class="loading">
      <div class="loading-circle"></div>
      <div class="progress">加载场景模型：{{ progress }}%</div>
    </div>
    <div class="loading-complete" :class="{ 'display-none': !props.loading}">
      <p>
        加载完成
        <svg t="1677233206130" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"  width="24" height="24">
          <path d="M537.6 102.4c73.5744 0 142.336 20.6848 200.704 56.576 15.872 9.6256 16.7936 23.1424 2.9696 40.5504-14.08 16.2816-43.008 13.2608-86.8352-9.216l-0.0512 0.0512a318.1568 318.1568 0 1 0 104.8064 524.3904h0.3584c19.456-26.7776 40.5504-40.192 63.1296-40.2432l6.8096 0.4096c24.064 4.4032 30.4128 16.6912 19.0464 36.864l0.2048-0.3584-0.1536 0.1536-0.0512 0.2048h-0.1024l-7.936 10.5984A384 384 0 1 1 537.6 102.4z m332.288 201.0112a33.28 33.28 0 0 1 0 47.104l-276.48 276.48a31.2832 31.2832 0 0 1-0.512 0.4608l-3.584 3.584a30.72 30.72 0 0 1-43.4176 0l-1.8432-1.792-0.4096-0.512-135.3216-135.2704a30.72 30.72 0 0 1 0-43.4176l3.584-3.584a30.72 30.72 0 0 1 43.4688 0l112.2304 112.128 255.232-255.1808a33.28 33.28 0 0 1 47.104 0z" fill="#ffffff" p-id="2676"></path></svg>
      </p>
    </div>
  </div>
</template>

<style scoped>
.loading-con{
  opacity: 1;
  width: 100%;
  height: 100%;
}
.hide-loading{
  animation: hideOpacity 0.5s ease-in-out forwards;
}

.loading {
  position: fixed;
  color: #fff;
  padding: 20px;
  user-select: none;
  text-align: center;
  width: 100%;
  height: 100%;
  background: #000;
  left: 0;
  top: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.loading .loading-circle {
  width: 25px;
  height: 25px;
  border: 4px solid;
  border-radius: 50%;
  border-color: #fff #fff transparent transparent;
  transform: rotate(0deg);
  animation: rotate .8s infinite linear;
}

.loading .progress {
  margin-top: 10px;
}
.loading-complete {
  padding: 20px;
  user-select: none;
  text-align: center;
  width: 100%;
  height: 100%;
  background: #000;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}
.loading-complete > p {
  color: #fff;
  font-size: 20px;
  margin-bottom: 20px;
}
.loading-complete > p svg {
  vertical-align: middle;
}
.loading-complete > p:nth-of-type(2) {
  font-size: 16px;
}
.loading-complete .start {
  width: 50%;
  margin: 0 auto;
  cursor: pointer;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  padding: 5px 20px;
  border: 1px solid #fff;
  border-radius: 30px;
  -webkit-tap-highlight-color: transparent;
}
.loading-complete .start:active {
  background: #fff;
  color: #333;
}
.loading-complete .start:hover {
  background: #fff;
  color: #333;
}
</style>
