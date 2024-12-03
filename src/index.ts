import * as THREE from 'three'
import { Vector3} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import createCharacter  from './CreateCharacter'

function createSceneAndBG(){
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8def0);
    return scene;
}
function createOrbitControlls(camera: THREE.Camera, renderer: THREE.WebGLRenderer){
    // CONTROLS
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true
    orbitControls.minDistance = 5
    orbitControls.maxDistance = 150
    orbitControls.enablePan = false
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
    return orbitControls;
}
function createRenderer(){
    return new THREE.WebGLRenderer({ antialias: false});
}
function light(scene: THREE.Scene) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

function generateFloor(scene: THREE.Scene, width = 100, length = 500)    {
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const placeholder = textureLoader.load("./textures/placeholder/placeholder.png");
    const sandBaseColor = textureLoader.load("./textures/grasslight-big.jpg");
    const sandNormalMap = textureLoader.load("./textures/grasslight-big-nm.jpg");
    const sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
    const sandAmbientOcclusion = textureLoader.load("./textures/sand/Sand 002_OCC.jpg");

    const geometry = new THREE.PlaneGeometry(width, length, 16, 16);
    const material = new THREE.MeshStandardMaterial(
        {
            map: sandBaseColor, normalMap: sandNormalMap,
            displacementMap: sandHeightMap, displacementScale: 0.1,
            aoMap: sandAmbientOcclusion
        })
    wrapAndRepeatTexture(material.map)
    wrapAndRepeatTexture(material.normalMap)
    wrapAndRepeatTexture(material.displacementMap)
    wrapAndRepeatTexture(material.aoMap)
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2

    return floor;
}
function wrapAndRepeatTexture (map: THREE.Texture) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 10
}

function createWoodBoxes(scene: THREE.Scene, amount: number, cubeSize: Vector3) {
    const loader = new THREE.TextureLoader();
    const boxTexture = loader.load("./textures/woodBoxText.jpg");
    const obst = new THREE.BoxGeometry(cubeSize.x, cubeSize.y, cubeSize.z);
    const material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        map: boxTexture,
    });

    const x_pos = [2, 4, 8, 10, 12];
    const y_pos = cubeSize.y / 2;
    const z_pos = [0, 0, 0, 0, 0];


    const group = new THREE.Group();

    for (let i = 0; i < amount; i++) {
        // Create a new mesh for each iteration
        const mesh = new THREE.Mesh(obst, material);

        // Use modular arithmetic to cycle through the positions in x_pos and z_pos
        const position: Vector3 = new THREE.Vector3(
            x_pos[i % x_pos.length], // Cycle through x_pos
            y_pos,
            z_pos[i % z_pos.length] // Cycle through z_pos
        );

        mesh.position.set(position.x, position.y, position.z);
        group.add(mesh);
    }

    // Add all children to the scene
    group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
            scene.add(child);
        }
    });
}

function getRandomInt(min:number, max:number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function returnfollowingCam (posVec: Vector3): THREE.PerspectiveCamera{
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(posVec.x, posVec.y, posVec.z);

    return camera;
}

function main(){
    // IMP
    const WIDTH = 100;
    const HEIGHT = 500;


    const scene = createSceneAndBG()
    const posCharacter: THREE.Vector3 = new THREE.Vector3(0,100,50)
    const camera = returnfollowingCam(posCharacter)

    const renderer = createRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true

    const floor = generateFloor(scene, WIDTH, HEIGHT)
    scene.add(floor);

    const orbitControls = createOrbitControlls(camera, renderer);
    orbitControls.update();

    // LIGHTS
    light(scene)

    // FLOOR
    generateFloor(scene)

    let characterPath = "models/soldier.glb"
    createCharacter(characterPath, scene,camera, renderer);


    let boxSize = new THREE.Vector3(3,3,3)
    createWoodBoxes(scene,10, boxSize);


    function animate() {
        orbitControls.update()
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    document.body.appendChild(renderer.domElement);
    animate();

    // RESIZE HANDLER
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

}



main()
