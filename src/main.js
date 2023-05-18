import * as THREE from "https://unpkg.com/three@v0.152.2/build/three.module.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// TODO
// 1.parallaxさせる画像を読み込んでテクスチャをShaderに渡す
async function loadTex(url) {
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync(url);
  return texture;
}
// 2.マウスの位置をshaderに渡す
const canvas = document.querySelector("canvas");
canvas.addEventListener("mousemove", mouseHandler);
const mouse = new THREE.Vector2();

function mouseHandler(event) {
  const el = event.currentTarget;

  const x = event.clientX; // mouseのx位置
  const y = event.clientY;
  const w = el.offsetWidth; // canvas要素の幅
  const h = el.offsetHeight; // canvas要素の高さ

  mouse.x = x / w; // 画面左が0, 右が1
  mouse.y = 1 - y / h; //画面下が0, 上が1
}

const geometry = new THREE.PlaneGeometry(8, 5);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTex: { value: await loadTex("./img/valley.jpg") },
    uTexDepth: { value: await loadTex("./img/valley_depth.jpg") },
    uMouse: { value: mouse },
  },

  vertexShader: `
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,

  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform sampler2D uTexDepth;
    uniform vec2 uMouse;

    void main(){
        vec4 texDepth = texture2D(uTexDepth, vUv);
        vec4 color = texture2D(uTex, vUv + (uMouse - vec2(0.5)) * 0.02 * texDepth.r);
        gl_FragColor = color;
    }
  `,
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
