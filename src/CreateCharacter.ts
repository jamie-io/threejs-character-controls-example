import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {Camera} from "three";

function createCharacter(path: string, scene: THREE.Scene, camera: any, renderer: THREE.WebGLRenderer) {
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();
    const keys: { [key: string]: boolean } = {}; // To store active keys
    let isJumping = false;
    let jumpVelocity = 0;
    let onGround = true;

    // Load the character
    loader.load(
        path,
        (gltf) => {
            const soldier = gltf.scene;
            soldier.scale.set(3, 3, 3);
            soldier.position.set(0,0,20);
            scene.add(soldier);

            // Listen for key events
            window.addEventListener('keydown', (event) => {
                keys[event.key.toLowerCase()] = true;
            });

            window.addEventListener('keyup', (event) => {
                keys[event.key.toLowerCase()] = false;
            });

            // Animation or physics update loop
            function animate() {
                const delta = clock.getDelta();

                // Movement logic
                const speed = 5; // Units per second
                const moveDistance = speed * delta; // Distance to move per frame
                const rotationSpeed = Math.PI * delta; // Rotation speed


                if (keys['w']) {
                    soldier.position.z -= moveDistance; // Move forward
                }
                if (keys['s']) {
                    soldier.position.z += moveDistance; // Move backward
                }
                if (keys['a']) {
                    soldier.rotation.y = 1; // Rotate left
                    soldier.position.x -= moveDistance; // Rotate left
                }
                if (keys['d']) {
                    soldier.rotation.y = -1; // Rotate right
                    soldier.position.x += moveDistance; // Rotate right
                }

                // Jump logic
                if (keys[' '] && onGround) {
                    isJumping = true;
                    onGround = false;
                    jumpVelocity = 8; // Initial jump velocity
                }

                if (isJumping) {
                    soldier.position.y += jumpVelocity * delta; // Move up
                    jumpVelocity -= 20 * delta; // Simulate gravity

                    // Stop jump when character lands
                    if (soldier.position.y <= 0) {
                        soldier.position.y = 0;
                        isJumping = false;
                        onGround = true;
                    }
                }

                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }

            animate();
        },
        undefined,
        (error) => {
            console.error('An error occurred:', error);
        }
    );
}

export default createCharacter;