import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CAMERA_PRESETS,
  CameraPresetId,
  FLOOR_MATERIALS,
  FloorMaterialId,
  LightingMode,
  PlacedFurniture,
  WALL_COLORS,
} from '../data/studioData';
import { clampFurniturePosition, getCatalogItem } from '../utils/roomConfigLogic';
import {
  buildFurnitureMesh,
  createRoomFurnitureContext,
  createSelectionRing,
  FurnitureBuildContext,
} from './furnitureBuilder';
import {
  createFloorTextures,
  createPlasterWallBumpMap,
} from './proceduralTextures';

export interface Room3DSceneProps {
  mode: 'hero' | 'studio';
  wallColorId: string;
  floorMaterialId: FloorMaterialId;
  lightingMode: LightingMode;
  furniture: PlacedFurniture[];
  selectedFurnitureId: string | null;
  cameraPresetId: CameraPresetId;
  snapToGrid?: boolean;
  orbitEnabled?: boolean;
  onSelectFurniture?: (id: string | null) => void;
  onMoveFurniture?: (id: string, x: number, z: number) => void;
}

export interface Room3DSceneHandle {
  exportPngPreview: () => string | null;
}

const _raycaster = new THREE.Raycaster();
const _pointer = new THREE.Vector2();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _intersectPoint = new THREE.Vector3();
const _dragOffset = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetCtrlTarget = new THREE.Vector3();
const _dayBgColor = new THREE.Color('#ece7df');
const _nightBgColor = new THREE.Color('#131418');
const _daySunColor = new THREE.Color('#fff2dc');
const _nightMoonColor = new THREE.Color('#7f98c7');
const _dayTerraceColor = new THREE.Color('#8f887d');
const _nightTerraceColor = new THREE.Color('#23252b');
const _tmpColor = new THREE.Color();

export const Room3DScene = forwardRef<Room3DSceneHandle, Room3DSceneProps>(
  function Room3DScene(
    {
      mode,
      wallColorId,
      floorMaterialId,
      lightingMode,
      furniture,
      selectedFurnitureId,
      cameraPresetId,
      snapToGrid = false,
      orbitEnabled = true,
      onSelectFurniture,
      onMoveFurniture,
    },
    ref
  ) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [webglUnavailable, setWebglUnavailable] = useState(false);

    // Refs to keep callbacks and latest props accessible inside WebGL closures without tearing down canvas
    const callbacksRef = useRef({ onSelectFurniture, onMoveFurniture });
    callbacksRef.current = { onSelectFurniture, onMoveFurniture };

    const propsRef = useRef({
      mode,
      furniture,
      selectedFurnitureId,
      snapToGrid,
      lightingMode,
      orbitEnabled,
    });
    propsRef.current = {
      mode,
      furniture,
      selectedFurnitureId,
      snapToGrid,
      lightingMode,
      orbitEnabled,
    };

    const sceneApiRef = useRef<{
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.PerspectiveCamera;
      controls: OrbitControls;
      wallMat: THREE.MeshStandardMaterial;
      floorMat: THREE.MeshStandardMaterial;
      floorMaps: { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null;
      furnitureGroup: THREE.Group;
      selectionRing: THREE.Mesh | null;
      furnitureMeshes: Map<string, THREE.Group>;
      buildCtx: FurnitureBuildContext;
      hemiLight: THREE.HemisphereLight;
      sunLight: THREE.DirectionalLight;
      coveLight: THREE.PointLight;
      hearthLight: THREE.PointLight;
      coveEmissiveMat: THREE.MeshStandardMaterial;
      emberMat: THREE.MeshStandardMaterial;
      skyBackdropMat: THREE.MeshBasicMaterial;
      terraceMat: THREE.MeshStandardMaterial;
      maxAnisotropy: number;
      isSoftwareGl: boolean;
      lightBlend: number; // 0 = day, 1 = night
      targetLightBlend: number;
      camAnimating: boolean;
      requestRender: () => void;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      exportPngPreview: () => {
        const api = sceneApiRef.current;
        if (!api) return null;
        api.renderer.render(api.scene, api.camera);
        try {
          return api.renderer.domElement.toDataURL('image/png');
        } catch {
          return null;
        }
      },
    }));

    // 1. Mount WebGLRenderer & architectural shell once
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      // Probe software WebGL
      const isSoftwareGl = (() => {
        try {
          const probeCanvas = document.createElement('canvas');
          const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
          if (!gl) return true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
          const gpu = String(gl.getParameter(param) || '');
          gl.getExtension('WEBGL_lose_context')?.loseContext();
          return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
        } catch {
          return true;
        }
      })();

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
        });
      } catch {
        setWebglUnavailable(true);
        return;
      }

      const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || 600;
      renderer.setSize(width, height);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = mode === 'studio' ? 'none' : 'pan-y';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = _dayBgColor.clone();
      scene.fog = new THREE.FogExp2('#ece7df', 0.022);

      // Studio environment reflections
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = envRT.texture;
      pmremGenerator.dispose();

      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
      const initialPreset = CAMERA_PRESETS.find((p) => p.id === cameraPresetId) ?? CAMERA_PRESETS[0];
      camera.position.set(...initialPreset.position);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(...initialPreset.target);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.06;
      controls.minPolarAngle = 0.22;
      controls.maxPolarAngle = Math.PI / 2 - 0.04;
      controls.minDistance = 3.1;
      controls.maxDistance = 12.5;
      controls.enableZoom = mode === 'studio';
      controls.enablePan = mode === 'studio';
      controls.enabled = orbitEnabled;
      controls.update();

      // Lighting Rig
      const hemiLight = new THREE.HemisphereLight(0xd5e2ee, 0x6c6052, 0.52);
      hemiLight.position.set(0, 8, 0);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xffe9c9, 1.25);
      sunLight.position.set(4.5, 6.8, 3.2);
      sunLight.castShadow = !isSoftwareGl;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 22;
      sunLight.shadow.camera.left = -6.5;
      sunLight.shadow.camera.right = 6.5;
      sunLight.shadow.camera.top = 6.5;
      sunLight.shadow.camera.bottom = -6.5;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
      scene.add(sunLight);

      const coveLight = new THREE.PointLight(0xffbe73, 0.3, 11, 1.6);
      coveLight.position.set(0, 3.15, -3.15);
      scene.add(coveLight);

      const hearthLight = new THREE.PointLight(0xff8c42, 0.3, 6, 1.8);
      hearthLight.position.set(-4.1, 0.65, -0.35);
      scene.add(hearthLight);

      // Architectural Shell
      const archGroup = new THREE.Group();
      scene.add(archGroup);

      const wallBump = createPlasterWallBumpMap(maxAnisotropy);
      const initialWall = WALL_COLORS.find((w) => w.id === wallColorId) ?? WALL_COLORS[0];
      const wallMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(initialWall.hex),
        bumpMap: wallBump,
        bumpScale: 0.01,
        roughness: 0.9,
        metalness: 0.01,
        envMapIntensity: 0.35,
      });

      const initialFloorOpt = FLOOR_MATERIALS.find((f) => f.id === floorMaterialId) ?? FLOOR_MATERIALS[0];
      const floorMaps = createFloorTextures(initialFloorOpt.id, maxAnisotropy);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: floorMaps.map,
        bumpMap: floorMaps.bumpMap,
        bumpScale: 0.014,
        roughness: initialFloorOpt.roughness,
        metalness: 0.03,
        envMapIntensity: 0.38,
      });

      // Floor slab
      const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.16, 7.6), floorMat);
      floorMesh.position.set(0, -0.08, 0);
      floorMesh.receiveShadow = true;
      archGroup.add(floorMesh);

      // Architectural perimeter plinth curb
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x262523, roughness: 0.55 });
      const frontCurb = new THREE.Mesh(new THREE.BoxGeometry(9.62, 0.17, 0.08), curbMat);
      frontCurb.position.set(0, -0.08, 3.82);
      archGroup.add(frontCurb);
      const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.17, 7.62), curbMat);
      rightCurb.position.set(4.82, -0.08, 0);
      archGroup.add(rightCurb);

      // Back wall with panoramic window cutout (width 9.6, height 3.6 at z = -3.72)
      const wallH = 3.65;
      const backZ = -3.72;
      // Left back pier
      const leftPier = new THREE.Mesh(new THREE.BoxGeometry(2.1, wallH, 0.22), wallMat);
      leftPier.position.set(-3.75, wallH / 2, backZ);
      leftPier.castShadow = true;
      leftPier.receiveShadow = true;
      archGroup.add(leftPier);

      // Right back pier
      const rightPier = new THREE.Mesh(new THREE.BoxGeometry(2.1, wallH, 0.22), wallMat);
      rightPier.position.set(3.75, wallH / 2, backZ);
      rightPier.castShadow = true;
      rightPier.receiveShadow = true;
      archGroup.add(rightPier);

      // Window sill wall & header lintel
      const sillWall = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.42, 0.22), wallMat);
      sillWall.position.set(0, 0.21, backZ);
      sillWall.receiveShadow = true;
      archGroup.add(sillWall);

      const headerWall = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.55, 0.22), wallMat);
      headerWall.position.set(0, 3.375, backZ);
      headerWall.castShadow = true;
      headerWall.receiveShadow = true;
      archGroup.add(headerWall);

      // Blackened steel window mullions
      const steelFrameMat = new THREE.MeshStandardMaterial({
        color: 0x1e1e1c,
        roughness: 0.35,
        metalness: 0.75,
      });
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(5.42, 0.06, 0.14), steelFrameMat);
      frameTop.position.set(0, 3.08, backZ);
      archGroup.add(frameTop);
      const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(5.42, 0.06, 0.14), steelFrameMat);
      frameBottom.position.set(0, 0.44, backZ);
      archGroup.add(frameBottom);
      const midBar = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.04, 0.1), steelFrameMat);
      midBar.position.set(0, 2.02, backZ);
      archGroup.add(midBar);
      for (const mx of [-2.68, -0.9, 0.9, 2.68]) {
        const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.68, 0.12), steelFrameMat);
        mullion.position.set(mx, 1.76, backZ);
        archGroup.add(mullion);
      }

      // Window glazing
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xe6eff5,
        roughness: 0.05,
        metalness: 0,
        transmission: isSoftwareGl ? 0 : 0.78,
        transparent: true,
        opacity: isSoftwareGl ? 0.22 : 0.95,
        ior: 1.5,
      });
      const glassPane = new THREE.Mesh(new THREE.PlaneGeometry(5.32, 2.6), glassMat);
      glassPane.position.set(0, 1.76, backZ);
      archGroup.add(glassPane);

      // Outdoor horizon sky plane & distant Indian Contemporary pine silhouettes outside window
      const skyBackdropMat = new THREE.MeshBasicMaterial({ color: 0xd5dfe8 });
      const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), skyBackdropMat);
      skyPlane.position.set(0, 3.2, -19.5);
      archGroup.add(skyPlane);

      // Exterior limestone terrace ledge outside panoramic window (flush within room width)
      const terraceMat = new THREE.MeshStandardMaterial({
        color: _dayTerraceColor.clone(),
        roughness: 0.85,
        envMapIntensity: 0.18,
      });
      const terraceDeck = new THREE.Mesh(
        new THREE.BoxGeometry(9.4, 0.2, 2.2),
        terraceMat
      );
      terraceDeck.position.set(0, -0.1, -4.9);
      archGroup.add(terraceDeck);

      const pineMat = new THREE.MeshStandardMaterial({ color: 0x3b4a3e, roughness: 0.92, envMapIntensity: 0.2 });
      const barkOutsideMat = new THREE.MeshStandardMaterial({ color: 0x4b3f35, roughness: 0.9 });
      for (const [px, pz, scale] of [
        [-4.2, -11.5, 1.0],
        [-1.3, -13.2, 1.2],
        [1.8, -11.8, 0.95],
        [4.5, -14.0, 1.25],
      ] as [number, number, number][]) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.8 * scale, 8), barkOutsideMat);
        trunk.position.set(px, 1.6 * scale, pz);
        archGroup.add(trunk);
        for (let tier = 0; tier < 3; tier++) {
          const crown = new THREE.Mesh(
            new THREE.ConeGeometry((0.72 - tier * 0.16) * scale, 1.35 * scale, 8),
            pineMat
          );
          crown.position.set(px, (2.1 + tier * 0.85) * scale, pz);
          archGroup.add(crown);
        }
      }

      // Concealed cove light strip along back header
      const coveEmissiveMat = new THREE.MeshStandardMaterial({
        color: 0xffe6bd,
        emissive: new THREE.Color(0xffb866),
        emissiveIntensity: 0.25,
      });
      const coveStrip = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.03, 0.04), coveEmissiveMat);
      coveStrip.position.set(0, 3.12, backZ + 0.14);
      archGroup.add(coveStrip);

      // Left architectural wall (x = -4.72)
      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.22, wallH, 7.6), wallMat);
      leftWall.position.set(-4.72, wallH / 2, 0);
      leftWall.castShadow = true;
      leftWall.receiveShadow = true;
      archGroup.add(leftWall);

      // Subtle architectural shadow-gap baseboard trim
      const trimMat = new THREE.MeshStandardMaterial({ color: 0x2a2927, roughness: 0.65 });
      const backTrim = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.06, 0.04), trimMat);
      backTrim.position.set(0, 0.03, backZ + 0.12);
      archGroup.add(backTrim);
      const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 7.5), trimMat);
      leftTrim.position.set(-4.59, 0.03, 0);
      archGroup.add(leftTrim);

      // Minimalist fireplace hearth on left wall
      const hearthStone = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.12, 2.1),
        new THREE.MeshStandardMaterial({ color: 0xc9bfb0, roughness: 0.68, envMapIntensity: 0.4 })
      );
      hearthStone.position.set(-4.35, 0.06, -0.35);
      hearthStone.receiveShadow = true;
      archGroup.add(hearthStone);

      const chimneyBreast = new THREE.Mesh(new THREE.BoxGeometry(0.32, wallH, 1.55), wallMat);
      chimneyBreast.position.set(-4.46, wallH / 2, -0.35);
      chimneyBreast.castShadow = true;
      chimneyBreast.receiveShadow = true;
      archGroup.add(chimneyBreast);

      const firebox = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.52, 0.88),
        steelFrameMat
      );
      firebox.position.set(-4.26, 0.46, -0.35);
      archGroup.add(firebox);

      const emberMat = new THREE.MeshStandardMaterial({
        color: 0xff6e2b,
        emissive: new THREE.Color(0xff5a1f),
        emissiveIntensity: 0.45,
        roughness: 0.4,
      });
      const embers = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.56), emberMat);
      embers.position.set(-4.21, 0.3, -0.35);
      archGroup.add(embers);

      // Architectural framed artwork above chimney with 2-tone geometric composition
      const artFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.08, 0.84),
        new THREE.MeshStandardMaterial({ color: 0x5c4433, roughness: 0.5 })
      );
      artFrame.position.set(-4.28, 1.85, -0.35);
      archGroup.add(artFrame);
      const artCanvas = new THREE.Mesh(
        new THREE.BoxGeometry(0.046, 0.96, 0.72),
        new THREE.MeshStandardMaterial({ color: 0xe3dcd0, roughness: 0.9, envMapIntensity: 0.25 })
      );
      artCanvas.position.set(-4.275, 1.85, -0.35);
      archGroup.add(artCanvas);
      const artAccent = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.54, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x363431, roughness: 0.85, envMapIntensity: 0.25 })
      );
      artAccent.position.set(-4.272, 1.76, -0.31);
      archGroup.add(artAccent);
      const artAccent2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.052, 0.24, 0.26),
        new THREE.MeshStandardMaterial({ color: 0xa68961, roughness: 0.85, envMapIntensity: 0.25 })
      );
      artAccent2.position.set(-4.27, 2.02, -0.44);
      archGroup.add(artAccent2);

      // Exposed Indian Contemporary white oak ceiling beams
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xc2a985, roughness: 0.6 });
      for (const bz of [-2.4, -0.4, 1.6]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.18, 0.16), beamMat);
        beam.position.set(0, 3.55, bz);
        beam.castShadow = true;
        archGroup.add(beam);
      }

      // Dynamic furniture container
      const furnitureGroup = new THREE.Group();
      scene.add(furnitureGroup);

      const buildCtx = createRoomFurnitureContext(maxAnisotropy, isSoftwareGl);

      // Render scheduler (on-demand + software WebGL afterDraw fenceSync)
      let frameId = 0;
      let renderBusy = false;
      let renderDirty = false;
      let lastTime = performance.now();

      const afterDraw = (cb: () => void) => {
        try {
          const gl = renderer.getContext() as WebGL2RenderingContext;
          if (!gl || typeof gl.fenceSync !== 'function') {
            frameId = window.setTimeout(cb, 60);
            return;
          }
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          let polls = 0;
          const poll = () => {
            polls++;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED && polls < 8) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 60);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } catch {
          frameId = window.setTimeout(cb, 60);
        }
      };

      const requestRender = () => {
        if (renderBusy) {
          renderDirty = true;
          return;
        }
        renderBusy = true;
        frameId = requestAnimationFrame((now) => {
          renderDirty = false;
          const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
          lastTime = now;

          const api = sceneApiRef.current;
          let needsAnotherFrame = false;

          if (api) {
            // Smooth camera preset transition
            if (api.camAnimating) {
              const dampFactor = 1 - Math.exp(-7 * dt);
              camera.position.lerp(_targetCamPos, dampFactor);
              controls.target.lerp(_targetCtrlTarget, dampFactor);
              if (
                camera.position.distanceTo(_targetCamPos) < 0.02 &&
                controls.target.distanceTo(_targetCtrlTarget) < 0.02
              ) {
                camera.position.copy(_targetCamPos);
                controls.target.copy(_targetCtrlTarget);
                api.camAnimating = false;
              } else {
                needsAnotherFrame = true;
              }
            }

            // Smooth Day/Night lighting blend (snap on software WebGL for immediate crisp capture)
            if (api.isSoftwareGl) {
              api.lightBlend = api.targetLightBlend;
            } else if (Math.abs(api.lightBlend - api.targetLightBlend) > 0.005) {
              api.lightBlend = THREE.MathUtils.damp(
                api.lightBlend,
                api.targetLightBlend,
                6.5,
                dt
              );
              needsAnotherFrame = true;
            } else {
              api.lightBlend = api.targetLightBlend;
            }

            const b = api.lightBlend;
            _tmpColor.copy(_dayBgColor).lerp(_nightBgColor, b);
            scene.background = _tmpColor.clone();
            if (scene.fog instanceof THREE.FogExp2) {
              scene.fog.color.copy(_tmpColor);
            }
            api.skyBackdropMat.color.copy(_tmpColor);
            api.terraceMat.color.copy(_dayTerraceColor).lerp(_nightTerraceColor, b);

            api.hemiLight.intensity = THREE.MathUtils.lerp(0.52, 0.22, b);
            api.sunLight.intensity = THREE.MathUtils.lerp(1.25, 0.22, b);
            api.sunLight.color.copy(_daySunColor).lerp(_nightMoonColor, b);
            api.coveLight.intensity = THREE.MathUtils.lerp(0.3, 2.3, b);
            api.hearthLight.intensity = THREE.MathUtils.lerp(0.25, 1.85, b);
            api.coveEmissiveMat.emissiveIntensity = THREE.MathUtils.lerp(0.25, 1.8, b);
            api.emberMat.emissiveIntensity = THREE.MathUtils.lerp(0.35, 2.1, b);
            renderer.toneMappingExposure = THREE.MathUtils.lerp(0.96, 0.92, b);

            api.buildCtx.lampPointLights.forEach((pl) => {
              pl.intensity = THREE.MathUtils.lerp(0.25, 2.3, b);
            });
            api.buildCtx.lampBulbMeshes.forEach((mesh) => {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = THREE.MathUtils.lerp(0.15, 1.65, b);
            });
          }

          controls.update();
          renderer.render(scene, camera);

          const done = () => {
            renderBusy = false;
            if (renderDirty || needsAnotherFrame) {
              requestRender();
            }
          };

          if (isSoftwareGl) {
            afterDraw(done);
          } else {
            done();
          }
        });
      };

      // Cancel scripted camera glide on manual orbit start
      const onControlStart = () => {
        if (sceneApiRef.current) {
          sceneApiRef.current.camAnimating = false;
        }
      };
      const onControlChange = () => {
        requestRender();
      };
      controls.addEventListener('start', onControlStart);
      controls.addEventListener('change', onControlChange);

      // Pointer selection & floor-plane drag-and-drop
      let pointerDownPos = { x: 0, y: 0 };
      let draggingId: string | null = null;
      let hasDragged = false;

      const updatePointer = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        _pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const onPointerDown = (e: PointerEvent) => {
        const api = sceneApiRef.current;
        if (!api) return;
        pointerDownPos = { x: e.clientX, y: e.clientY };
        hasDragged = false;
        updatePointer(e);
        _raycaster.setFromCamera(_pointer, camera);
        const hits = _raycaster.intersectObjects(api.furnitureGroup.children, true);

        if (hits.length > 0) {
          const hitId = hits[0].object.userData.furnitureId as string | undefined;
          if (hitId) {
            if (propsRef.current.mode === 'studio') {
              draggingId = hitId;
              controls.enabled = false;
              const targetGroup = api.furnitureMeshes.get(hitId);
              if (targetGroup && _raycaster.ray.intersectPlane(_floorPlane, _intersectPoint)) {
                _dragOffset.copy(targetGroup.position).sub(_intersectPoint);
              }
            }
            callbacksRef.current.onSelectFurniture?.(hitId);
            requestRender();
          }
        } else {
          draggingId = null;
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        const api = sceneApiRef.current;
        if (!api) return;

        if (draggingId && propsRef.current.mode === 'studio') {
          const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
          if (distMoved > 4) {
            hasDragged = true;
          }
          updatePointer(e);
          _raycaster.setFromCamera(_pointer, camera);
          if (_raycaster.ray.intersectPlane(_floorPlane, _intersectPoint)) {
            const targetGroup = api.furnitureMeshes.get(draggingId);
            const placement = propsRef.current.furniture.find((f) => f.id === draggingId);
            if (targetGroup && placement) {
              const rawX = _intersectPoint.x + _dragOffset.x;
              const rawZ = _intersectPoint.z + _dragOffset.z;
              const clamped = clampFurniturePosition(
                rawX,
                rawZ,
                placement.type,
                placement.rotationY,
                propsRef.current.snapToGrid
              );
              targetGroup.position.set(clamped.x, 0, clamped.z);
              if (api.selectionRing) {
                api.selectionRing.position.set(clamped.x, 0.032, clamped.z);
              }
              callbacksRef.current.onMoveFurniture?.(draggingId, clamped.x, clamped.z);
              requestRender();
            }
          }
          return;
        }

        // Hover cursor hint
        updatePointer(e);
        _raycaster.setFromCamera(_pointer, camera);
        const hits = _raycaster.intersectObjects(api.furnitureGroup.children, true);
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      };

      const onPointerUp = (e: PointerEvent) => {
        if (draggingId) {
          draggingId = null;
          controls.enabled = propsRef.current.orbitEnabled;
        } else {
          const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
          if (distMoved < 5 && !hasDragged) {
            updatePointer(e);
            _raycaster.setFromCamera(_pointer, camera);
            const api = sceneApiRef.current;
            if (api) {
              const hits = _raycaster.intersectObjects(api.furnitureGroup.children, true);
              if (hits.length === 0 && propsRef.current.mode === 'studio') {
                callbacksRef.current.onSelectFurniture?.(null);
              }
            }
          }
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      const onContextLost = (ev: Event) => {
        ev.preventDefault();
        setWebglUnavailable(true);
      };
      const onContextRestored = () => {
        setWebglUnavailable(false);
        requestRender();
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || 600;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      };
      window.addEventListener('resize', onResize);

      const resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(container);

      sceneApiRef.current = {
        renderer,
        scene,
        camera,
        controls,
        wallMat,
        floorMat,
        floorMaps,
        furnitureGroup,
        selectionRing: null,
        furnitureMeshes: new Map(),
        buildCtx,
        hemiLight,
        sunLight,
        coveLight,
        hearthLight,
        coveEmissiveMat,
        emberMat,
        skyBackdropMat,
        terraceMat,
        maxAnisotropy,
        isSoftwareGl,
        lightBlend: lightingMode === 'night' ? 1 : 0,
        targetLightBlend: lightingMode === 'night' ? 1 : 0,
        camAnimating: false,
        requestRender,
      };

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      requestRender();

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        resizeObserver.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointerup', onPointerUp);
        controls.removeEventListener('start', onControlStart);
        controls.removeEventListener('change', onControlChange);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
        controls.dispose();
        envRT.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
        sceneApiRef.current = null;
      };
    }, [mode]);

    // 2. Sync Wall Color
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;
      const wall = WALL_COLORS.find((w) => w.id === wallColorId) ?? WALL_COLORS[0];
      api.wallMat.color.set(wall.hex);
      api.requestRender();
    }, [wallColorId]);

    // 3. Sync Floor Material
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;
      const floorOpt = FLOOR_MATERIALS.find((f) => f.id === floorMaterialId) ?? FLOOR_MATERIALS[0];
      const nextMaps = createFloorTextures(floorOpt.id, api.maxAnisotropy);
      api.floorMaps?.map.dispose();
      api.floorMaps?.bumpMap.dispose();
      api.floorMaps = nextMaps;
      api.floorMat.map = nextMaps.map;
      api.floorMat.bumpMap = nextMaps.bumpMap;
      api.floorMat.roughness = floorOpt.roughness;
      api.floorMat.needsUpdate = true;
      api.requestRender();
    }, [floorMaterialId]);

    // 4. Sync Lighting Mode
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;
      api.targetLightBlend = lightingMode === 'night' ? 1 : 0;
      api.requestRender();
    }, [lightingMode]);

    // 5. Sync Camera Preset
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;
      const preset = CAMERA_PRESETS.find((p) => p.id === cameraPresetId);
      if (!preset) return;
      _targetCamPos.set(...preset.position);
      _targetCtrlTarget.set(...preset.target);
      if (api.isSoftwareGl) {
        api.camera.position.copy(_targetCamPos);
        api.controls.target.copy(_targetCtrlTarget);
        api.camAnimating = false;
      } else {
        api.camAnimating = true;
      }
      api.requestRender();
    }, [cameraPresetId]);

    // 6. Sync OrbitEnabled
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;
      api.controls.enabled = orbitEnabled;
    }, [orbitEnabled]);

    // 7. Sync Furniture & Selection Ring
    useEffect(() => {
      const api = sceneApiRef.current;
      if (!api) return;

      // Clear previous groups cleanly
      api.furnitureGroup.clear();
      api.furnitureMeshes.clear();
      api.buildCtx.lampBulbMeshes = [];
      api.buildCtx.lampPointLights = [];
      api.selectionRing = null;

      furniture.forEach((item) => {
        const meshGroup = buildFurnitureMesh(item, api.buildCtx);
        api.furnitureGroup.add(meshGroup);
        api.furnitureMeshes.set(item.id, meshGroup);
      });

      if (selectedFurnitureId) {
        const selected = furniture.find((f) => f.id === selectedFurnitureId);
        if (selected) {
          const info = getCatalogItem(selected.type);
          const ring = createSelectionRing(info.footprintWidth, info.footprintDepth);
          ring.position.set(selected.x, 0.032, selected.z);
          api.furnitureGroup.add(ring);
          api.selectionRing = ring;
        }
      }

      api.requestRender();
    }, [furniture, selectedFurnitureId]);

    return (
      <div
        className="relative w-full h-full overflow-hidden"
        data-testid={`room-3d-${mode}`}
        data-state="ready"
        data-lighting={lightingMode}
        data-wall={wallColorId}
        data-floor={floorMaterialId}
        data-selected={selectedFurnitureId || 'none'}
        data-furniture-count={furniture.length}
      >
        <div ref={mountRef} className="w-full h-full" />
        {webglUnavailable && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EAE4DA] p-8 text-center">
            <img
              src="/src/assets/images/project_living_oslo_1794905574624.jpg"
              alt="NORDHUS architectural living room preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-30 absolute inset-0"
            />
            <div className="relative z-10 max-w-md bg-[#FAF9F6]/95 p-6 border border-[#1C1C1B]/10">
              <p className="font-display text-lg font-medium text-[#1C1C1B]">
                3D Hardware Context Paused
              </p>
              <p className="mt-2 text-sm text-[#64615B]">
                Your browser paused WebGL rendering. Reload the page or enable hardware acceleration to interact with the live 3D room.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);
