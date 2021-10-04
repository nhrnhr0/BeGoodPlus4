//import ThreeGlobe from 'three-globe';

const N = 20;
  const arcsData = [...Array(N).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: ['rgb(249, 242, 149)', 'rgb(224, 170, 62)', 'rgb(249, 242, 149)', 'rgb(224, 170, 62)'][Math.round(Math.random() * 3)]
  }));



  //Globe.globeImageUrl('https://image.shutterstock.com/image-vector/gold-world-map-vector-600w-1294298026.jpg')
const Globe = new ThreeGlobe();
Globe.globeImageUrl('/static/assets/websites/imgs/globe_texture.jpg')
.arcsData(arcsData)
.arcColor('color')
.arcDashLength(0.4)
.arcDashGap(4)
.arcDashInitialGap(() => Math.random() * 5)
.arcDashAnimateTime(1000);





const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
function initThreeJs() {
    console.log('initThreeJs');
  const loader = new THREE.TextureLoader();
  loader.load('/static/assets/websites/imgs/bg_image.jpg' , function(texture)
            {
              texture.app
              scene.background = texture;  
            });
  
  // Setup renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('globeViz').appendChild(renderer.domElement);

  // Setup scene
  scene.add(Globe);


  //var root_style = getComputedStyle(document.body)
  //var background_color = root_style.getPropertyValue('--clr-background');
  //background_color = 0x979797;//background_color.replace('#', '0x');
  //scene.background = new Color(background_color);
  //console.log(scene.background);
  scene.background = new THREE.Color(0x97979797);
  const ambientLight = new THREE.AmbientLight(0xf9f295);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xf9f295, 0.8);
  scene.add(directionalLight);
  //initGlobe();


  //const pointLight = new PointLight( 0xffffff, 1, 10000 );
  //pointLight
  //pointLight.position.set( 250, 40, 250 );
  //scene.add( pointLight );

  // Setup camera

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = 500;
  document.body.onscroll = moveCameraOnScrool;

  // Add camera controls
  /*const tbControls = new TrackballControls(camera, renderer.domElement);
  tbControls.minDistance = 101;
  tbControls.rotateSpeed = 5;
  tbControls.zoomSpeed = 0.8;
  tbControls.noPan = true;
  tbControls.noZoom = true;*/

  // Kick-off renderer
  (function animate() { // IIFE
    // Frame cycle
    //tbControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
}


function moveCameraOnScrool() {
  const t = document.body.getBoundingClientRect().top;
  console.log('t: ', t);
  //camera.position.x = t * -0.1;
  camera.position.y = Math.max(t * 0.1, -190);
  camera.position.z = t * -0.1 + 500;
  camera.position.x = Math.min(t * -0.1, 190);

  //Globe.position.add(new Vector3(0,0,1));
  Globe.rotation.set(0, t * 0.003, 0);
}

initThreeJs();