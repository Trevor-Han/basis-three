<!--工作台-->
<template>
  <div class="dock_con" :style="{ 'top': params.top }">
    <div ref="dock" class="dock" @mouseleave="removeHover">
      <div
        v-for="(item,index) in dockItems"
        :key="item.id"
        class="dock-item"
        :style="{ transform: `scale(${item.scale})`, margin: `0 ${item.margin}` }"
        @mouseenter="addHover(item, index)"
        @click="handleClick(item.id)"
      >
        <i
          class="icon"
          data-name="item.name"
          :style="{ background: `url(${ item.icon }) no-repeat center center / 50%`}"
        />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-show="showTip"
      ref="tooltip"
      aria-hidden="true"
      class="tooltip__popper is-dark"
    >
      <span>{{ tipTitle }}</span>
      <div class="popper__arrow" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, watch, defineModel, defineProps} from 'vue'
import { useResizeObserver } from '@vueuse/core';
import { dockItem } from './dockConfig';
import gsap from 'gsap'

defineProps({
  display:{
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update']); // 添加更新的emit
const dock = ref<HTMLDivElement>(document.createElement('div'));

const defaultItemScale = ref(1);
const hoverItemScale = ref(1.5); // 最大缩放
const neighborItemScale = ref(1.2); // 相邻缩放

const defaultMargin = ref('10px');
const expandMargin = ref('20px');
const tipTitle = ref('');
const showTip = ref(false);
const params = ref({
  top: '105%'
})


const dockItemBoundingClientRect = ref([])

const dockItems = ref([...dockItem]);
const loading = defineModel('loading',{default: true}); // 工作台动画隐藏和显示

watch(loading,(value) => {
  if (value){
    gsap.to(params.value,{
      ease: 'power1.in',
      top: '105%'
    })
  }else {
    gsap.to(params.value,{
      ease: 'power1.in',
      top: '93%',
      onComplete: () => {
        dockItemBoundingClientRect.value = [...getDockItemBoundingClientRect()];
      }
    })
  }
})

gsap.to(params.value,{
  ease: 'power1.in',
  top: '93%',
  onComplete: () => {
    dockItemBoundingClientRect.value = [...getDockItemBoundingClientRect()];
  }
})

useResizeObserver(document.body,() => {
  dockItemBoundingClientRect.value = [...getDockItemBoundingClientRect()]; // 更新位置
})

// 获取没变化前的每一个item的位置信息
function getDockItemBoundingClientRect(){
  const result = []
  for (let i = 0; i < dock.value.children.length; i++){
    const item = dock.value.children[i].getBoundingClientRect()
    result.push(item)
  }
  return result
}
function updateDock() {
  // 设置提示和选中项的缩放
  dockItems.value.forEach((item, index) => {
    let scale = defaultItemScale.value;
    let margin = defaultMargin.value;

    if (item.isHover) {
      scale = hoverItemScale.value;
      margin = expandMargin.value;
    } else if (item.isNeighbor) {
      scale = neighborItemScale.value;
      margin = expandMargin.value;
    }

    dockItems.value[index] = { ...item, scale, margin };
  });
}

function updateTooltip(data) {
  tipTitle.value = data.name;
}

// 添加移入事件
function addHover(data,index) {
  dockItems.value = dockItems.value.map((item, i) => ({
    ...item,
    isHover: i === index,
    isNeighbor: Math.abs(i - index) === 1,
  }));

  showTip.value = true;
  updateTooltip(data)
  updateDock();
}

// 移除事件
function removeHover() {
  dockItems.value = dockItems.value.map((item) => ({
    ...item,
    isHover: false,
    isNeighbor: false,
  }));
  showTip.value = false;
  updateDock();
}

// 点击事件
function handleClick(id) {
  const params = {
    tabName: id,
    showSwitch: true
  };
  emits('update',params);
}


</script>

<style scoped lang="less">
.dock_con{
  width: max-content;
  position: fixed;
  left: 50%;
  top: 93%;
  height: 4rem;
  transform:translate(-50%,-50%);
  border-radius: 0.75rem;
  box-shadow: 0 -2px 7px 1px rgba(44, 38, 38, 0.2);
  display:flex;
  background: rgba(255,255,255,0.3);
  justify-content: center;
  transform-origin: center;
}

.display-none {
  display: none !important;
}
@keyframes showIn {
  to {
    //bottom: 0;
  }
}

.dock{
  padding: 0.5rem;
  display:flex;
  justify-content: space-around;
}
.dock-item{
  cursor: pointer;
  width: 3rem;
  height: 3rem;
  background: rgb(45, 45, 45);
  background-size: 7.5rem;
  border-radius: 0.2rem;
  margin: 0 0.5rem;
  overflow: hidden;
  transition: 0.7s cubic-bezier(0.075,0.82,0.165,1);
  transform-origin: bottom;
  position: relative;
}
.dock-item i{
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 100%;
  height: 100%;
}
.dock-item .icon {
  background-position: center center;
  background-size: 50%;
}

.tooltip__popper{
  width: 300px;
  position: absolute;
  border-radius: 0.2rem;
  padding: 0.5rem;
  z-index: 2000;
  font-size: 0.75rem;
  line-height: 1.2;
  min-width: 0.5rem;
  word-wrap: break-word;
  text-align: center;
  transform: translate(-50%,-50%);
  top: 84%;
  left: 50%;
  height: 2rem;
  background: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  color: #fff;
}

</style>
