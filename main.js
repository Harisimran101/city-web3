import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/loaders/GLTFLoader.js';
import { Sky } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/objects/Sky.js';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';

console.log(GUI)
const webgl = document.querySelector('.webgl');
const size = {
    width: webgl.offsetWidth,
    height: webgl.offsetHeight
  }

  let sun;
  sun = new THREE.Vector3();

// Scene

const scene = new THREE.Scene();


// Camera 

const camera = new THREE.PerspectiveCamera( 65, size.width / size.height , 0.01, 10000 );

camera.position.z = 80;

// Renderer

const renderer = new THREE.WebGLRenderer({
     antialias: true,
     canvas: webgl
});
const pmremGenerator = new THREE.PMREMGenerator( renderer );

renderer.setSize( size.width, size.height );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.6;


// Orbit Controls 

const controls = new OrbitControls(camera, webgl)
controls.enableDamping = true
controls.zoomSpeed = 1.8;
controls.minDistance = 25;

controls.maxDistance = 215;
controls.maxPolarAngle = Math.PI / 1.9

// Lights 

const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
scene.add( directionalLight );

// Screen Resize 

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
  camera.aspect = size.width / size.height
  camera.updateProjectionMatrix()
  renderer.setSize(size.width, size.height)
}


// Environment

const parameters = {
    elevation: 2,
    azimuth: 180
};

                
const sky = new Sky();
				sky.scale.setScalar( 10000 );
				scene.add( sky );

				const skyUniforms = sky.material.uniforms;

				skyUniforms[ 'turbidity' ].value = 10;
				skyUniforms[ 'rayleigh' ].value = 2;
				skyUniforms[ 'mieCoefficient' ].value = 0.005;
				skyUniforms[ 'mieDirectionalG' ].value = 0.8;


            

                function updateSun() {

                    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
                    const theta = THREE.MathUtils.degToRad( parameters.azimuth );
                
                    sun.setFromSphericalCoords( 1, phi, theta );
                
                    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
                
                    scene.environment = pmremGenerator.fromScene( sky ).texture;
                
                }
                
                updateSun();

                const gui = new GUI();

				const folderSky = gui.addFolder( 'Sky' );
				folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
				folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
				folderSky.open();
// Model

let model;

const modelloader = new GLTFLoader();
modelloader.load('city.glb', (gltf) =>{
     model = gltf.scene;
     scene.add(model)

})

// Animation Update

function animate() {
    requestAnimationFrame( animate );

    controls.update()
    renderer.render( scene, camera );
};

animate();