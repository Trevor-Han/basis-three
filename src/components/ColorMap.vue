<script setup>
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps({
  loading: {
    type: Boolean,
    default:false
  }
})

const emits = defineEmits(['update']);
const colorMap = ref(["#ffffff","#9287E7", "#FF7B7B", "#FEB64D", "#49D6A5", "#32D3EB"])

const handleItemClick = (item) => {
  emits('update', item)
}
</script>

<template>
<div class="color-map" :class="{'show-color-map': props.loading}">
  <div
    v-for="item in colorMap"
    :key="item"
    :style="{backgroundColor: item}"
    @click="handleItemClick(item)"
    class="color-map-item"></div>
</div>
</template>

<style scoped>
.color-map{
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 50%;
  right: -5rem;
  transform: translate(-50%,-50%);
  z-index: 99;
  transition: right 0.5s cubic-bezier(0.075,0.82,0.165,1);
}
.show-color-map{
  right: 0;
}
.color-map-item{
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  margin: 0.5rem 0;
  border: 0.2rem solid #fff;
  box-shadow: 0 -0.2rem 0.7rem 0.1rem rgba(44, 38, 38, 0.2);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.075,0.82,0.165,1);
}
.color-map-item:hover{
  transform: scale(1.16);
}
</style>
