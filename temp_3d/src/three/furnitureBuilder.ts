import * as THREE from 'three';
import { FurnitureType, PlacedFurniture } from '../data/studioData';
import {
  createBoucleFabricTexture,
  createContactShadowTexture,
  createTravertineTexture,
  createWoolRugTexture,
} from './proceduralTextures';

export interface FurnitureBuildContext {
  boucleMap: THREE.CanvasTexture;
  travertineMap: THREE.CanvasTexture;
  rugSet: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture };
  shadowTexture: THREE.CanvasTexture;
  lampBulbMeshes: THREE.Mesh[];
  lampPointLights: THREE.PointLight[];
  isSoftwareGl: boolean;
}

function makeRoundedBox(w: number, h: number, d: number, radius = 0.04, bevelSegments = 3): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const x = -w / 2 + radius;
  const y = -d / 2 + radius;
  const rw = w - radius * 2;
  const rd = d - radius * 2;

  shape.moveTo(x, y - radius);
  shape.lineTo(x + rw, y - radius);
  shape.quadraticCurveTo(x + rw + radius, y - radius, x + rw + radius, y);
  shape.lineTo(x + rw + radius, y + rd);
  shape.quadraticCurveTo(x + rw + radius, y + rd + radius, x + rw, y + rd + radius);
  shape.lineTo(x, y + rd + radius);
  shape.quadraticCurveTo(x - radius, y + rd + radius, x - radius, y + rd);
  shape.lineTo(x - radius, y);
  shape.quadraticCurveTo(x - radius, y - radius, x, y - radius);

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, h - 0.02),
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments,
  });
  extrude.rotateX(-Math.PI / 2);
  extrude.center();
  return extrude;
}

function addContactShadow(group: THREE.Group, tex: THREE.CanvasTexture, width: number, depth: number) {
  const geo = new THREE.PlaneGeometry(width * 1.18, depth * 1.18);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(geo, mat);
  shadow.position.y = 0.012;
  shadow.name = 'contact-shadow';
  group.add(shadow);
}

function tagInteractiveGroup(group: THREE.Group, placement: PlacedFurniture) {
  group.userData.furnitureId = placement.id;
  group.userData.furnitureType = placement.type;
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name !== 'contact-shadow') {
      child.castShadow = true;
      child.receiveShadow = true;
      child.userData.furnitureId = placement.id;
      child.userData.furnitureType = placement.type;
    }
  });
}

export function buildFurnitureMesh(
  placement: PlacedFurniture,
  ctx: FurnitureBuildContext
): THREE.Group {
  const group = new THREE.Group();
  const type: FurnitureType = placement.type;

  const walnutMat = new THREE.MeshStandardMaterial({
    color: 0x453123,
    roughness: 0.5,
    metalness: 0.04,
    envMapIntensity: 0.5,
  });
  const oakMat = new THREE.MeshStandardMaterial({
    color: 0xb59871,
    roughness: 0.64,
    metalness: 0.02,
    envMapIntensity: 0.45,
  });
  const travertineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: ctx.travertineMap,
    roughness: 0.72,
    metalness: 0.03,
    envMapIntensity: 0.45,
  });
  const brassMat = new THREE.MeshPhysicalMaterial({
    color: 0xc5a265,
    roughness: 0.22,
    metalness: 0.92,
    clearcoat: 0.4,
    envMapIntensity: 1.1,
  });
  const charcoalSteelMat = new THREE.MeshStandardMaterial({
    color: 0x20201e,
    roughness: 0.36,
    metalness: 0.78,
    envMapIntensity: 0.85,
  });
  const boucleMat = new THREE.MeshPhysicalMaterial({
    color: placement.fabricColor ? new THREE.Color(placement.fabricColor) : new THREE.Color(0xede6da),
    map: ctx.boucleMap,
    roughness: 0.92,
    metalness: 0,
    sheen: 0.5,
    sheenRoughness: 0.85,
    envMapIntensity: 0.38,
  });

  if (type === 'boucle-sofa') {
    addContactShadow(group, ctx.shadowTexture, 2.65, 1.08);
    // 1. Recessed walnut plinth base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.1, 0.88), walnutMat);
    plinth.position.y = 0.05;
    group.add(plinth);

    // 2. Main upholstered lower deck
    const deck = new THREE.Mesh(makeRoundedBox(2.56, 0.16, 0.98, 0.08), boucleMat);
    deck.position.y = 0.18;
    group.add(deck);

    // 3-5. Three plush seat cushions
    for (let i = -1; i <= 1; i++) {
      const seat = new THREE.Mesh(makeRoundedBox(0.76, 0.16, 0.86, 0.07), boucleMat);
      seat.position.set(i * 0.78, 0.34, 0.04);
      group.add(seat);
    }

    // 6-8. Three tailored backrest cushions
    const backFrame = new THREE.Mesh(makeRoundedBox(2.54, 0.48, 0.22, 0.08), boucleMat);
    backFrame.position.set(0, 0.48, -0.37);
    group.add(backFrame);

    for (let i = -1; i <= 1; i++) {
      const cushion = new THREE.Mesh(makeRoundedBox(0.72, 0.36, 0.16, 0.07), boucleMat);
      cushion.position.set(i * 0.76, 0.56, -0.22);
      cushion.rotation.x = -0.14;
      group.add(cushion);
    }

    // 9-10. Sculpted armrests
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(makeRoundedBox(0.22, 0.44, 0.96, 0.09), boucleMat);
      arm.position.set(side * 1.18, 0.42, 0);
      group.add(arm);
    }

    // 11. Accent linen throw pillow
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xb7ab99, roughness: 0.85 });
    const pillow = new THREE.Mesh(makeRoundedBox(0.38, 0.34, 0.12, 0.06), accentMat);
    pillow.position.set(0.84, 0.54, -0.05);
    pillow.rotation.set(-0.22, -0.35, 0.12);
    group.add(pillow);
  } else if (type === 'coffee-table') {
    addContactShadow(group, ctx.shadowTexture, 1.45, 0.9);
    // 1-2. Tiered monolithic travertine plinth legs
    for (const side of [-0.42, 0.42]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, 0.64), travertineMat);
      leg.position.set(side, 0.12, 0);
      group.add(leg);
    }
    // 3. Beveled monolithic tabletop slab
    const top = new THREE.Mesh(makeRoundedBox(1.42, 0.09, 0.86, 0.05), travertineMat);
    top.position.y = 0.285;
    group.add(top);

    // 4. Sculpted ceramic vessel
    const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xe6dfd3, roughness: 0.72 });
    const vaseProfile = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.07, 0.02),
      new THREE.Vector2(0.09, 0.1),
      new THREE.Vector2(0.05, 0.18),
      new THREE.Vector2(0.04, 0.21),
    ];
    const vase = new THREE.Mesh(new THREE.LatheGeometry(vaseProfile, 20), ceramicMat);
    vase.position.set(-0.26, 0.33, -0.08);
    group.add(vase);

    // 5. Architectural monograph book
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.035, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x383633, roughness: 0.7 })
    );
    book.position.set(0.22, 0.348, 0.06);
    book.rotation.y = 0.18;
    group.add(book);

    // 6. Brushed brass catchall bowl
    const bowlProfile = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.08, 0.01),
      new THREE.Vector2(0.11, 0.045),
      new THREE.Vector2(0.095, 0.045),
      new THREE.Vector2(0.06, 0.015),
    ];
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProfile, 22), brassMat);
    bowl.position.set(0.22, 0.366, 0.06);
    group.add(bowl);
  } else if (type === 'lounge-chair') {
    addContactShadow(group, ctx.shadowTexture, 0.86, 0.86);
    // 1-4. Four angled solid walnut legs
    const legGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.42, 12);
    const legOffsets: [number, number, number][] = [
      [-0.32, -0.28, 0.12],
      [0.32, -0.28, 0.12],
      [-0.32, 0.28, -0.08],
      [0.32, 0.28, -0.08],
    ];
    legOffsets.forEach(([lx, lz, tilt]) => {
      const leg = new THREE.Mesh(legGeo, walnutMat);
      leg.position.set(lx, 0.21, lz);
      leg.rotation.x = tilt;
      group.add(leg);
    });
    // 5-6. Sculpted armrests
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(makeRoundedBox(0.07, 0.045, 0.64, 0.02), walnutMat);
      arm.position.set(side * 0.34, 0.56, -0.02);
      group.add(arm);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 10), walnutMat);
      post.position.set(side * 0.34, 0.46, 0.22);
      group.add(post);
    }
    // 7. Saddle-linen seat cushion
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xcabaa4, roughness: 0.85 });
    const seat = new THREE.Mesh(makeRoundedBox(0.62, 0.12, 0.6, 0.05), cushionMat);
    seat.position.set(0, 0.4, 0.02);
    seat.rotation.x = -0.08;
    group.add(seat);
    // 8. Angled wing backrest
    const back = new THREE.Mesh(makeRoundedBox(0.62, 0.42, 0.11, 0.05), cushionMat);
    back.position.set(0, 0.62, -0.25);
    back.rotation.x = -0.26;
    group.add(back);
  } else if (type === 'floor-lamp') {
    addContactShadow(group, ctx.shadowTexture, 0.5, 0.5);
    // 1. Heavy honed travertine cylinder base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.07, 24), travertineMat);
    base.position.y = 0.035;
    group.add(base);

    // 2. Brass collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 16), brassMat);
    collar.position.y = 0.09;
    group.add(collar);

    // 3. Curved arched brass stem via TubeGeometry
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, 1.35, 0),
      new THREE.Vector3(0.14, 1.78, 0),
      new THREE.Vector3(0.45, 1.85, 0),
      new THREE.Vector3(0.56, 1.72, 0),
    ]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.014, 12, false), brassMat);
    group.add(stem);

    // 4. Tapered Belgian linen shade
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xf4eee4,
      roughness: 0.9,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0xffcf8b),
      emissiveIntensity: 0.08,
    });
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.22, 0.28, 24, 1, true),
      shadeMat
    );
    shade.position.set(0.56, 1.59, 0);
    group.add(shade);

    // 5. Warm glowing bulb core
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xfff3d6,
      emissive: new THREE.Color(0xffb866),
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), bulbMat);
    bulb.position.set(0.56, 1.57, 0);
    group.add(bulb);
    ctx.lampBulbMeshes.push(bulb);
    ctx.lampBulbMeshes.push(shade);

    const lampLight = new THREE.PointLight(0xffb96b, 0.3, 6.5, 1.8);
    lampLight.position.set(0.56, 1.52, 0);
    group.add(lampLight);
    ctx.lampPointLights.push(lampLight);
  } else if (type === 'credenza') {
    addContactShadow(group, ctx.shadowTexture, 2.1, 0.55);
    // 1-4. Blackened steel sled legs
    for (const side of [-0.92, 0.92]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.42), charcoalSteelMat);
      leg.position.set(side, 0.09, 0);
      group.add(leg);
    }
    // 5. Main Indian oak cabinet carcass
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.46, 0.46), oakMat);
    body.position.y = 0.41;
    group.add(body);

    // 6. Recessed stone inlay top
    const stoneTop = new THREE.Mesh(new THREE.BoxGeometry(2.08, 0.03, 0.48), travertineMat);
    stoneTop.position.y = 0.655;
    group.add(stoneTop);

    // 7-10. Fluted oak vertical door slats
    for (let s = -14; s <= 14; s++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.42, 0.018), oakMat);
      slat.position.set(s * 0.068, 0.41, 0.238);
      group.add(slat);
    }

    // 11. Minimalist bronze tabletop sculpture
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 12, 28), brassMat);
    ring.position.set(-0.48, 0.8, 0);
    ring.rotation.y = 0.4;
    group.add(ring);
  } else if (type === 'wool-rug') {
    const rugMat = new THREE.MeshStandardMaterial({
      map: ctx.rugSet.map,
      bumpMap: ctx.rugSet.bumpMap,
      bumpScale: 0.018,
      roughness: 0.95,
      metalness: 0,
    });
    // 1. Main woven wool carpet (elevated by 0.022 to prevent Z-fighting)
    const rug = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.018, 2.55), rugMat);
    rug.position.y = 0.024;
    group.add(rug);

    // 2-3. Tailored border trims
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xc2b8a8, roughness: 0.92 });
    for (const side of [-1.77, 1.77]) {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 2.55), trimMat);
      trim.position.set(side, 0.025, 0);
      group.add(trim);
    }
  } else if (type === 'olive-planter') {
    addContactShadow(group, ctx.shadowTexture, 0.62, 0.62);
    // 1. Ribbed limestone planter pot
    const potProfile = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.19, 0),
      new THREE.Vector2(0.24, 0.26),
      new THREE.Vector2(0.22, 0.46),
      new THREE.Vector2(0.19, 0.46),
    ];
    const pot = new THREE.Mesh(new THREE.LatheGeometry(potProfile, 24), travertineMat);
    group.add(pot);

    // 2. Dark soil bed
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.03, 20),
      new THREE.MeshStandardMaterial({ color: 0x3b3127, roughness: 0.95 })
    );
    soil.position.y = 0.42;
    group.add(soil);

    // 3-5. Sculptural multi-branch olive trunk
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x6b5c4d, roughness: 0.9 });
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.42, 0),
      new THREE.Vector3(0.04, 0.85, 0.02),
      new THREE.Vector3(-0.03, 1.25, -0.02),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 12, 0.03, 8, false), barkMat));

    const branch1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.95, 0.01),
      new THREE.Vector3(0.18, 1.22, 0.12),
      new THREE.Vector3(0.25, 1.42, 0.14),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(branch1, 8, 0.016, 7, false), barkMat));

    const branch2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.01, 1.05, -0.01),
      new THREE.Vector3(-0.18, 1.32, -0.1),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(branch2, 8, 0.015, 7, false), barkMat));

    // 6-9. Sage-olive foliage clusters
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x768369, roughness: 0.8 });
    const leafPositions: [number, number, number, number][] = [
      [0, 1.48, 0, 0.24],
      [0.24, 1.46, 0.14, 0.2],
      [-0.2, 1.38, -0.1, 0.19],
      [0.06, 1.62, -0.08, 0.17],
    ];
    leafPositions.forEach(([lx, ly, lz, rad]) => {
      const cluster = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), leafMat);
      cluster.position.set(lx, ly, lz);
      cluster.scale.set(1.15, 0.78, 1.05);
      group.add(cluster);
    });
  } else if (type === 'side-table') {
    addContactShadow(group, ctx.shadowTexture, 0.52, 0.52);
    // 1. Recessed plinth
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.04, 24), travertineMat);
    base.position.y = 0.02;
    group.add(base);
    // 2. Fluted stone column drum
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.45, 24), travertineMat);
    drum.position.y = 0.265;
    group.add(drum);
    // 3. Top cap + espresso ceramic cup
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 28), travertineMat);
    top.position.y = 0.505;
    group.add(top);
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.032, 0.07, 16),
      new THREE.MeshStandardMaterial({ color: 0x2b2927, roughness: 0.45 })
    );
    cup.position.set(0.04, 0.555, 0.02);
    group.add(cup);
  } else if (type === 'dining-set') {
    addContactShadow(group, ctx.shadowTexture, 2.2, 1.55);
    // 1. Chamfered walnut dining tabletop
    const tableTop = new THREE.Mesh(makeRoundedBox(1.96, 0.06, 0.96, 0.06), walnutMat);
    tableTop.position.y = 0.74;
    group.add(tableTop);
    // 2-3. Architectural sculpted pedestal slabs
    for (const side of [-0.62, 0.62]) {
      const leg = new THREE.Mesh(makeRoundedBox(0.16, 0.71, 0.58, 0.04), walnutMat);
      leg.position.set(side, 0.355, 0);
      group.add(leg);
    }
    // 4-11. Four minimalist dining chairs (2 per long side)
    const chairOffsets: [number, number, number][] = [
      [-0.48, -0.68, 0],
      [0.48, -0.68, 0],
      [-0.48, 0.68, Math.PI],
      [0.48, 0.68, Math.PI],
    ];
    chairOffsets.forEach(([cx, cz, ry]) => {
      const chair = new THREE.Group();
      const cSeat = new THREE.Mesh(makeRoundedBox(0.44, 0.05, 0.42, 0.03), boucleMat);
      cSeat.position.y = 0.45;
      chair.add(cSeat);
      const cBack = new THREE.Mesh(makeRoundedBox(0.42, 0.34, 0.05, 0.03), walnutMat);
      cBack.position.set(0, 0.66, -0.19);
      chair.add(cBack);
      for (const lx of [-0.18, 0.18]) {
        for (const lz of [-0.17, 0.17]) {
          const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.44, 8), walnutMat);
          cLeg.position.set(lx, 0.22, lz);
          chair.add(cLeg);
        }
      }
      chair.position.set(cx, 0, cz);
      chair.rotation.y = ry;
      group.add(chair);
    });
  }

  group.position.set(placement.x, 0, placement.z);
  group.rotation.y = placement.rotationY;
  tagInteractiveGroup(group, placement);

  return group;
}

export function createSelectionRing(width: number, depth: number): THREE.Mesh {
  const radius = Math.max(width, depth) * 0.58;
  const geo = new THREE.RingGeometry(radius - 0.045, radius, 48);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x9a7b4f,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geo, mat);
  ring.position.y = 0.032;
  return ring;
}

export function createRoomFurnitureContext(maxAnisotropy: number, isSoftwareGl: boolean): FurnitureBuildContext {
  return {
    boucleMap: createBoucleFabricTexture(maxAnisotropy),
    travertineMap: createTravertineTexture(maxAnisotropy),
    rugSet: createWoolRugTexture(maxAnisotropy),
    shadowTexture: createContactShadowTexture(),
    lampBulbMeshes: [],
    lampPointLights: [],
    isSoftwareGl,
  };
}
