/**
 * Pedestrians - Modelos 3D de peatones
 */
import * as THREE from 'three';

export class PedestrianFactory {
    constructor() {
        this.skinColors = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524];
        this.clothesColors = [0x1e3a8a, 0x991b1b, 0x065f46, 0x7c2d12, 0x4c1d95, 0x1f2937, 0xfbbf24, 0xec4899];
        this.pantsColors = [0x1f2937, 0x374151, 0x1e3a8a, 0x422006];
    }

    create() {
        const group = new THREE.Group();

        const skinColor = this.skinColors[Math.floor(Math.random() * this.skinColors.length)];
        const shirtColor = this.clothesColors[Math.floor(Math.random() * this.clothesColors.length)];
        const pantsColor = this.pantsColors[Math.floor(Math.random() * this.pantsColors.length)];

        const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });

        // Cabeza
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            skinMat
        );
        head.position.y = 1.55;
        head.castShadow = true;
        group.add(head);

        // Cabello
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.16, 12, 12),
            hairMat
        );
        hair.position.y = 1.6;
        hair.scale.set(1, 0.6, 1);
        group.add(hair);

        // Cuello
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8),
            skinMat
        );
        neck.position.y = 1.35;
        group.add(neck);

        // Torso
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.45, 0.2),
            shirtMat
        );
        torso.position.y = 1.05;
        torso.castShadow = true;
        group.add(torso);

        // Brazos
        [-0.22, 0.22].forEach(x => {
            // Brazo superior
            const upperArm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.04, 0.25, 8),
                shirtMat
            );
            upperArm.position.set(x, 1.1, 0);
            upperArm.rotation.z = x > 0 ? -0.1 : 0.1;
            upperArm.castShadow = true;
            group.add(upperArm);

            // Antebrazo
            const forearm = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.03, 0.22, 8),
                skinMat
            );
            forearm.position.set(x * 1.1, 0.85, 0);
            forearm.rotation.z = x > 0 ? -0.15 : 0.15;
            group.add(forearm);

            // Mano
            const hand = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 8, 8),
                skinMat
            );
            hand.position.set(x * 1.15, 0.72, 0);
            group.add(hand);
        });

        // Piernas
        [-0.1, 0.1].forEach(x => {
            // Muslo
            const thigh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.055, 0.35, 8),
                pantsMat
            );
            thigh.position.set(x, 0.65, 0);
            thigh.castShadow = true;
            group.add(thigh);

            // Pantorrilla
            const shin = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.04, 0.35, 8),
                pantsMat
            );
            shin.position.set(x, 0.3, 0);
            group.add(shin);

            // Zapato
            const shoe = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.08, 0.18),
                shoeMat
            );
            shoe.position.set(x, 0.04, 0.03);
            shoe.castShadow = true;
            group.add(shoe);
        });

        return group;
    }

    // Crear peatón decorativo para las veredas (estático)
    createStatic() {
        const pedestrian = this.create();
        // Posición aleatoria de brazos para variedad
        return pedestrian;
    }
}

export function createPedestrian() {
    const factory = new PedestrianFactory();
    return factory.create();
}

// Crear peatones decorativos para el ambiente
export function createDecorativePedestrians(count = 10) {
    const factory = new PedestrianFactory();
    const pedestrians = [];

    // Posiciones en las veredas
    const positions = [
        { x: 15, z: 10 }, { x: -15, z: 10 },
        { x: 15, z: -10 }, { x: -15, z: -10 },
        { x: 10, z: 15 }, { x: -10, z: 15 },
        { x: 10, z: -15 }, { x: -10, z: -15 },
        { x: 18, z: 12 }, { x: -18, z: -12 },
    ];

    positions.slice(0, count).forEach(pos => {
        const ped = factory.createStatic();
        ped.position.set(pos.x, 0, pos.z);
        ped.rotation.y = Math.random() * Math.PI * 2;
        pedestrians.push(ped);
    });

    return pedestrians;
}
