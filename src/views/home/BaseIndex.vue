<script setup>
import {ref, onMounted, onBeforeUnmount, watch} from 'vue'
import LoadingView from '@/components/LoadingView.vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass }  from 'three/examples/jsm/postprocessing/RenderPass'
import  { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

import MacDock from "@/components/MacDock/MacDock.vue";
import TitleView from "@/components/TitleView.vue";
import gsap from "gsap";
import ColorMap from "@/components/ColorMap.vue";
import MaskImage from "@/components/MaskImage.vue";

import {TextUp, throttle} from "@/libs/textUp.js";
import JoyStick  from '@/libs/JoyStick.js'

const canvas = ref(document.createElement('canvas'))
const loading = ref(document.createElement('div'))
const tip = ref(document.createElement('div'))
const loadingComplete = ref(false)
const loadingPercentage = ref('0')
const isCameraComplete = ref(true)
const showColorMap = ref(false)
const client = ref({x:0,y:0})
const mouse = ref(new THREE.Vector2())
const isMouseMove = ref(false)
const isCheck = ref(false)
const targetPosition = new THREE.Vector3(2.78, 2.89, 5.18)

let scene, camera, renderer

const keyCode = ref() // 获取按键
const velocity = ref(new THREE.Vector3()) // 离地距离
const temp_vector = ref(new THREE.Vector3()) // 离地距离
const up_vector = ref(new THREE.Vector3(0, 1, 0))
const flySeep = ref(0)
const isFly = ref(false)
const beginFly = ref(false)
const showMask = ref(false)
const base64Image = ref('')

let selectedObjects = []
let modelScene = null

watch(isCheck,(val)=>{
  if (!val){
    beginFly.value = false;
    isFly.value = false;
    flySeep.value = 0
  }
})
const initView = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x333333)
  scene.fog = new THREE.Fog( 0x333333, 10, 20 );

  renderer = new THREE.WebGLRenderer( { antialias: true,canvas:canvas.value } );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop(renderLoop);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 10, 5, 10 );


  const composer = new EffectComposer( renderer );
  const renderPass = new RenderPass( scene, camera );
  composer.addPass( renderPass );
  const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
  composer.addPass( outlinePass );

  outlinePass.edgeStrength = 10.0 // 边框的亮度
  outlinePass.edgeGlow = 1 // 光晕[0,1]
  outlinePass.usePatternTexture = false // 是否使用父级的材质
  outlinePass.edgeThickness = 1.0 // 边框宽度
  outlinePass.downSampleRatio = 1 // 边框弯曲度
  outlinePass.pulsePeriod = 5 // 呼吸闪烁的速度
  outlinePass.visibleEdgeColor.set(parseInt('00ff00')) // 呼吸显示的颜色
  outlinePass.hiddenEdgeColor = new THREE.Color(0, 0, 0) // 呼吸消失的颜色
  outlinePass.clear = true

  const outputPass = new OutputPass();
  composer.addPass( outputPass );

  const effectFXAA = new ShaderPass( FXAAShader );
  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
  // effectFXAA.renderToScreen = true
  composer.addPass( effectFXAA );

  const controls = new OrbitControls(camera, canvas.value)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2
  controls.minPolarAngle = 0.1

  const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444, 3 );
  hemiLight.position.set( 0, 20, 0 );
  scene.add( hemiLight );

  const dLight = new THREE.DirectionalLight( 0xffffff, 3 );
  dLight.position.set( 0, 20, 10 );
  dLight.castShadow = true;
  dLight.shadow.camera.top = 2;
  dLight.shadow.camera.bottom = - 2;
  dLight.shadow.camera.left = - 2;
  dLight.shadow.camera.right = 2;
  scene.add( dLight );

  const planeGeometry = new THREE.PlaneGeometry( 40, 40 )
  const meshPhongMaterial = new THREE.MeshStandardMaterial( {
    color: 0x333333,
    depthWrite: false,
    roughness: 0.05,
    metalness: 0.5,
    // envMap: cubeRenderTarget.texture,
  } )
  const ground = new THREE.Mesh( planeGeometry, meshPhongMaterial);
  ground.rotation.x = - Math.PI / 2;
  ground.receiveShadow = true;
  // addShader( meshPhongMaterial );
  scene.add( ground );

  const grid = customGrid()
  scene.add( grid );

  const raycaster = new THREE.Raycaster();

  scene.add(modelScene.v1.scene)
  scene.add(modelScene.v2.scene)

  window.addEventListener('resize', onWindowResized);
  document.addEventListener('keydown', function(event) {
    keyCode.value = event.key === ' '? 'space' : event.key
    camera.position.addScaledVector(velocity.value, 0.5);

    switch (event.key) {
      case 'w':
        handleMobileCamera(new THREE.Vector3(0,0,-1));
        break;
      case 's':
        handleMobileCamera(new THREE.Vector3(0,0,1));
        break;
      case 'a':
        handleMobileCamera(new THREE.Vector3(-1,0,0));
        break;
      case 'd':
        handleMobileCamera(new THREE.Vector3(1,0,0));
        break;
      case ' ':
        // jump();
        break;
    }
  });

  function initMobileControls(){
    if ('ontouchstart' in document.documentElement) {
      const stickContainer = document.createElement('div')
      stickContainer.className = 'stickContainer'
      stickContainer.style.cssText = `
                position: fixed;
                width: 6rem;
                height: 6rem;
                z-index: 999;
                border-radius: 50%;
                bottom: 5rem;
                left: 50%;
                transform: translate(-50% ,-50%);
                // margin-left: -4rem;
                background: #616161;
            `
      document.body.appendChild(stickContainer);
      new JoyStick(stickContainer, {}, (status) => {
        const position = new THREE.Vector2(status.x, status.y);
        const angle = position.angle();
        let radio = angle * (180 / Math.PI)

        const keyCodeMap = [
          ['w',radio > 45 && radio <= 135,new THREE.Vector3(0,0,-1)],
          ['a',radio> 135 && radio <= 225,new THREE.Vector3(-1,0,0)],
          ['s',radio > 225 && radio <= 315,new THREE.Vector3(0,0,1)],
          ['d',radio > 315 || radio <= 45,new THREE.Vector3(1,0,0)],
        ]
        for (let [_key,_value,_Vector] of keyCodeMap){
          if(_value){
            keyCode.value = _key
            handleMobileCamera(_Vector);
          }
        }
      })

      const match = window.matchMedia('(orientation:portrait)')
      if(match.matches){
          stickContainer.style.bottom = '5rem'
          stickContainer.style.left = '50%'
      }else {
          stickContainer.style.bottom = '-8%'
          stickContainer.style.left = '15%'
      }
      match.addEventListener('change', (e) => {
        if (e.matches) {
          stickContainer.style.bottom = '5rem'
          stickContainer.style.left = '50%'
        } else {
          stickContainer.style.bottom = '-8%'
          stickContainer.style.left = '15%'
        }

      })
    }
  }

  function handleMobileCamera(vector){

    const angle = controls.getAzimuthalAngle();
    const speed = 0.25
    temp_vector.value.set(vector.x,vector.y,vector.z).applyAxisAngle(up_vector.value, angle);
    camera.position.addScaledVector(temp_vector.value, speed);

    throttledScrollHandler();
  }

  const throttledScrollHandler = throttle(function() {
    const id = document.querySelector('.text-up')
    new TextUp( {id:id,text: keyCode.value.toUpperCase()} )
  }, 500);
  function onWindowResized() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }



  function hoverPoint(){
    const { x, y } = mouse.value
    if (x === 0 && y ===0) return;
    raycaster.setFromCamera(mouse.value, camera);
    let intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length && intersects[0].object.name && intersects[0].object.name !== 'sprite'){
      selectedObjects = [];
      selectedObjects.push( intersects[0].object );
      outlinePass.selectedObjects = selectedObjects;
      showTip(intersects[0].object.material.name)
    }else {
      outlinePass.selectedObjects = []
      tip.value.style.display = 'none';
    }
  }

  function flyGltf(){
    modelScene.v1.scene.traverse((e)=>{
      const polySurface_number = e.name.replace(/polySurface/g,'')
      const rotatePoly = ['60','81','90','94']
      if (rotatePoly.includes(polySurface_number)){
        e.rotation.y += flySeep.value
      }
    })
    if (flySeep.value <= 1 && isFly.value){
      flySeep.value += 0.002
    }else {
      flySeep.value -= 0.002
    }
    if (flySeep.value <= 0){
      flySeep.value = 0
      grid.position.z = 0
    }
    grid.position.z -= flySeep.value % 1
    if (grid.position.z <= -20){
      grid.position.z = 0
    }
  }

  function updateCamera() {
    const { x,y,z } = targetPosition
    gsap.to(camera.position, {
      x: x,
      y: y,
      z: z,
      duration: 3,
      ease: 'power2.out',
      onComplete: () => {
        isCameraComplete.value = false
        initMobileControls()
      }
    })
  }
  updateCamera();

  function renderLoop(){
    controls.update();
    isMouseMove.value && hoverPoint();
    beginFly.value && flyGltf();

    // renderer.render( scene, camera );
    composer.render();
  }
}

const showTip = (title) =>{
  tip.value.classList.add('tip');
  tip.value.textContent = title;
  tip.value.style.left = (client.value.x + 15) + 'px';
  tip.value.style.top = (client.value.y + 15) + 'px';
  tip.value.style.display = 'block';
}

const customGrid = () =>{
  const grid = new THREE.GridHelper( 40, 20, 0xdddddd, 0xdddddd );
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  return grid
}

const loadGLTFModel = async (callback) => {
  const gltf = await loadStaticScene()
  const gltf_v11 = await loadStaticScene_v11()
  loadingComplete.value = true
  callback({
    v1: gltf,
    v2: gltf_v11
  })
}

const loadStaticScene =()=>{
  return new Promise(resolve => {
    let loader = new GLTFLoader();
    const url = "./models/gltf/WM161_zhankai_1k.glb"
    loader.load(url, (gltf) => {
      gltf.scene.position.set(0,27,0)
      gltf.scene.scale.set(15, 15, 15);
      gltf.scene.traverse(function (object){
        object.castShadow = true
      })
      resolve(gltf);
    },(event) =>{
      const {loaded,total} = event
      handleLoadProgress({url,loaded,total})
    });
  })
}
const loadStaticScene_v11 =() =>{
  return new Promise(resolve => {
    let loader = new GLTFLoader();
    const url = "./models/gltf/wm161_v11_zhedie_1k.glb"
    loader.load(url, (gltf) => {
      gltf.scene.position.set(0,-27,0)
      gltf.scene.scale.set(15, 15, 15);
      gltf.scene.traverse(function (object){
        object.castShadow = true
      })
      resolve(gltf);
    },(event) =>{
      const {loaded,total} = event
      handleLoadProgress({url,loaded,total})
    });
  })
}

const handleLoadProgress = ({url, loaded, total})=>{
  const percentage = ((loaded / total) * 100).toFixed(2);
  if (/.*\.(blob|glb)$/i.test(url)) {
    updateLoadingProgress(percentage);
  }
}

const updateLoadingProgress = (percentage) =>{
  loadingPercentage.value = percentage;
}
const handleFly = () =>{
  beginFly.value = true
  isCheck.value = true
  isFly.value =  !isFly.value
  checkGltf();
}

function getGltfUrl(){
  return new Promise((resolve)=>{
    renderer.render( scene, camera );
    resolve(canvas.value.toDataURL('image/png'))
  })
}

const handleTakePicture = async ()=> {
  base64Image.value = await getGltfUrl();
  showMask.value = true
  showWhiteScreen()
}

const handleMaskClose = ()=>{
  showMask.value = false
  base64Image.value = ''
}

function showWhiteScreen(){
  const screen = document.createElement('div');
  screen.style.cssText = `
            background: rgba(255,255,255,1);
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            animation: fade 0.5s cubic-bezier(0.075,0.82,0.165,1) forwards;
            `
  document.body.appendChild(screen);
  setTimeout(function() {
    document.body.removeChild(screen);
  }, 100);
}

const handleColorUpdate = (color) =>{
  setColorMap(color)
}

const setColorMap = (color) =>{
  const model = modelScene.v1.scene.position.y >= 27 ? modelScene.v2 :  modelScene.v1
  model.scene.traverse((e)=>{
    const polySurface_number = e.name.replace(/polySurface/g,'')
    const windBlade = ['21','101','201']
    if (windBlade.includes(polySurface_number)){
      e.material.color.set(color);
    }
  })
}
const checkGltf = () =>{
  const gltf_vector = isCheck.value ? new THREE.Vector3(0,0,0): new THREE.Vector3(0,27,0)
  // const sprite_vector = isCheck.value ? new THREE.Vector3(0,1.5,1): new THREE.Vector3(0,10,1)
  const gltf_v11_vector = isCheck.value ? new THREE.Vector3(0,0,0): new THREE.Vector3(0,-27,0)

  gsap.to(modelScene.v1.scene.position, {
    x: gltf_vector.x,
    y: gltf_vector.y,
    z: gltf_vector.z,
    duration: 1,
    ease: 'power2.out',
  })
  gsap.to(modelScene.v2.scene.position, {
    x: gltf_v11_vector.x,
    y: gltf_v11_vector.y,
    z: gltf_v11_vector.z,
    delay: 0,
    duration: 1,
    ease: 'power2.out',
  })
}

const canvasMouseMove = (event) => {
  isMouseMove.value = true
  client.value = {
    x: event.clientX,
    y: event.clientY
  }
  mouse.value = {
    x: (event.clientX / window.innerWidth) * 2 - 1,
    y: -(event.clientY / window.innerHeight) * 2 + 1
  }
}
// 工作台方法
const handleMacUpdate = (item) =>{
  const { tabName } = item

  const updateMap = {
    'fly': () =>{
      handleFly()
    },
    'color': () =>{
      showColorMap.value = !showColorMap.value
    },
    'check': ()=>{
      isCheck.value = !isCheck.value
      checkGltf()
    },
    'photo':()=>{
      handleTakePicture()
    }
  }
  updateMap[tabName] && updateMap[tabName]()
}

const canvasMouseLeave = () =>{
  isMouseMove.value = false
}

onMounted(()=>{
  canvas.value.height = window.innerHeight;
  canvas.value.width = window.innerWidth;

  canvas.value.addEventListener('mousemove', canvasMouseMove);
  canvas.value.addEventListener('mouseleave', canvasMouseLeave);

  loadGLTFModel((gltf)=>{
    document.body.appendChild(tip.value)
    modelScene = gltf
    initView()
  })
})

  onBeforeUnmount(()=>{
  if (canvas.value){
    canvas.value.removeEventListener('mousemove', canvasMouseMove);
    canvas.value.removeEventListener('mouseleave', canvasMouseLeave);
  }
})


</script>

<template>
  <main>
    <div class="text-up"></div>
    <LoadingView ref="loading" :loading="loadingComplete" :percentage="loadingPercentage"/>
    <TitleView :display="isCameraComplete"></TitleView>
    <MacDock v-if="!isCameraComplete" :loading="!isCameraComplete" @update="handleMacUpdate" />
    <ColorMap :loading="showColorMap" @update="handleColorUpdate"></ColorMap>
    <MaskImage :loading="showMask" :base64="base64Image" @close="handleMaskClose"></MaskImage>

    <canvas ref="canvas"></canvas>
  </main>
</template>

