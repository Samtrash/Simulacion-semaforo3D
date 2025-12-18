/**
 * Scene Manager - Configuración de la escena Three.js
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.init();
    }
    
    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Cielo azul claro
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
        
        // Configurar cámara
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(50, 40, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Configurar controles de órbita
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 150;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Limitar para no ver desde abajo
        this.controls.target.set(0, 0, 0);
        
        // Iluminación
        this.setupLighting();
        
        // Manejar redimensionamiento
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional principal (sol)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(50, 80, 30);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 200;
        sunLight.shadow.camera.left = -60;
        sunLight.shadow.camera.right = 60;
        sunLight.shadow.camera.top = 60;
        sunLight.shadow.camera.bottom = -60;
        sunLight.shadow.bias = -0.0001;
        this.scene.add(sunLight);
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x9999ff, 0.3);
        fillLight.position.set(-30, 40, -30);
        this.scene.add(fillLight);
        
        // Hemisférica para mejor ambiente
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.4);
        this.scene.add(hemiLight);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    update() {
        this.controls.update();
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
}
