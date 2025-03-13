<script setup>

import { defineProps } from 'vue'
const props = defineProps({
  display:{
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '快意飞行'
  },
  subTitle: {
    type: String,
    default: 'DJI MINI 2'
  }
})

</script>

<template>
  <div class="header-title" :class="{ 'display-none': props.display }">
    <h1 class="title-h1">{{props.subTitle}}</h1>
    <p class="title-p">{{props.title}}</p>
  </div>
</template>

<style scoped>
.header-title{
  position: fixed;
  text-align: center;
  width: 100%;
  padding: 1rem;
  top: -10rem;
  font-size: 1rem;
  z-index: 99;
  animation: showTop 0.5s cubic-bezier(0.075,0.82,0.165,1) forwards;
}
.header-title .title-h1{
  margin: 1rem 0;
}
.header-title .title-p{
  font-weight: lighter;
  margin-top: 0;
}

.display-none {
  display: none !important;
}

@keyframes showTop {
  to { top: 1rem}
}

</style>
