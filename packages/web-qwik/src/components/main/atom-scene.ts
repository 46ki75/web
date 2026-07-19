// ============================================================================
// Orbital model — WebGL scene (Solid decoration variant)
// A glowing nucleus wrapped in electron orbits. Each electron rides its own
// inclined ellipse and drags a comet trail. Trimmed from the standalone
// showcase: transparent canvas, single element (Carbon), gentle auto-rotation,
// no controls/panel — it lives behind the page as a decoration.
// ============================================================================
import * as THREE from "three";

// Carbon: shells follow the 2, 8 filling order. nucleons ≈ mass.
const ELEMENT = { number: 6, shells: [2, 4], nucleons: 12 };

// Gold + slate palette (Elmethis). Electrons glow gold; nucleus mixes warm
// protons with cooler neutrons.
const COL = {
  electron: new THREE.Color(0xe7c79a),
  electronHi: new THREE.Color(0xfff0da),
  ring: new THREE.Color(0xac8e6d),
  proton: new THREE.Color(0xc69a64),
  neutron: new THREE.Color(0x9aa0ac),
  nucleusGlow: new THREE.Color(0xd8b483),
};

const TRAIL_SEGMENTS = 26; // points in each comet tail
const TRAIL_SPAN = 2.05; // radians of arc the tail covers

/**
 * Builds the orbital-atom scene into `canvas` and starts animating.
 * Returns a cleanup function that stops the loop and frees GPU resources.
 */
export function createAtomScene(canvas: HTMLCanvasElement): () => void {
  // Transparent framebuffer so additive glows composite over the page.
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  // Pulled back far enough that the outer orbit (+ its glow/trail) clears the
  // frustum edges — at 6.4 the top/bottom of the orbits were being clipped.
  camera.position.set(0.5, 1.5, 10.4);
  camera.lookAt(0, 0, 0);

  // gentle lights for the solid nucleus spheres
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xfff3e6, 1.15);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xcdd6ff, 0.4);
  rim.position.set(-4, -1, -3);
  scene.add(rim);

  // --- environment map: gives the glass nucleons something to reflect/refract.
  // A warm-to-dark equirectangular gradient with a soft highlight, run through
  // PMREM so MeshPhysicalMaterial can sample it for specular + transmission.
  function makeGlassEnv(): THREE.Texture {
    const W = 512;
    const H = 256;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0.0, "#fff3e0"); // warm sky
    g.addColorStop(0.45, "#caa877");
    g.addColorStop(1.0, "#2a2620"); // dark floor
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // a bright soft spot for a crisp specular highlight
    const hl = ctx.createRadialGradient(
      W * 0.66,
      H * 0.3,
      0,
      W * 0.66,
      H * 0.3,
      H * 0.5,
    );
    hl.addColorStop(0.0, "rgba(255,255,255,0.9)");
    hl.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(0, 0, W, H);
    const equi = new THREE.CanvasTexture(c);
    equi.mapping = THREE.EquirectangularReflectionMapping;
    equi.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromEquirectangular(equi).texture;
    equi.dispose();
    pmrem.dispose();
    return env;
  }
  const glassEnv = makeGlassEnv();
  scene.environment = glassEnv;

  const root = new THREE.Group();
  scene.add(root);

  // --- soft round sprite texture (shared by glows / electron cores) ---------
  function makeGlowTexture(inner: number, mid: number): THREE.CanvasTexture {
    const S = 128;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0.0, `rgba(255,255,255,${inner})`);
    g.addColorStop(0.25, `rgba(255,255,255,${mid})`);
    g.addColorStop(0.55, `rgba(255,255,255,${mid * 0.35})`);
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  }
  const TEX_CORE = makeGlowTexture(1.0, 0.5);
  const TEX_HALO = makeGlowTexture(0.85, 0.22);

  // --- nucleus: a packed clump of nucleon spheres + a soft glow behind it ----
  const nucleusGroup = new THREE.Group();
  root.add(nucleusGroup);

  const NUCLEON_GEO = new THREE.SphereGeometry(1, 20, 20);
  // Glass nucleons: clear surface, color comes from light attenuating through
  // the glass body (warm gold protons, cool slate neutrons).
  const protonMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.12,
    transmission: 1,
    thickness: 0.6,
    ior: 1.45,
    attenuationColor: COL.proton,
    attenuationDistance: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: COL.proton,
    emissiveIntensity: 0.04,
    envMapIntensity: 1.1,
    transparent: true,
  });
  const neutronMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.16,
    transmission: 1,
    thickness: 0.6,
    ior: 1.45,
    attenuationColor: COL.neutron,
    attenuationDistance: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
    emissive: COL.neutron,
    emissiveIntensity: 0.03,
    envMapIntensity: 1.0,
    transparent: true,
  });

  const nucleusGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: TEX_HALO,
      color: COL.nucleusGlow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
    }),
  );
  nucleusGroup.add(nucleusGlow);

  // deterministic pseudo-random so the clump packs the same way each load
  function mulberry32(a: number): () => number {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Fibonacci-sphere packing of the nucleons into a tight clump.
  const n = ELEMENT.nucleons;
  const protons = ELEMENT.number;
  const rand = mulberry32(ELEMENT.number * 9176 + 13);
  const nucleonR = 0.17;
  const clump = 0.2 + 0.11 * Math.cbrt(n);

  // interleave protons & neutrons so the two colours mix evenly
  const roles: boolean[] = [];
  let pLeft = protons;
  let nLeft = n - protons;
  const wantProtonRatio = protons / n;
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += wantProtonRatio;
    if ((acc >= 1 && pLeft > 0) || nLeft === 0) {
      roles.push(true);
      acc -= 1;
      pLeft--;
    } else {
      roles.push(false);
      nLeft--;
    }
  }

  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (n === 1) {
      x = y = z = 0;
    } else {
      const tt = i / (n - 1);
      const phi = Math.acos(1 - 2 * tt);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const rr = clump * (0.35 + 0.65 * Math.cbrt(0.2 + 0.8 * rand()));
      x = rr * Math.sin(phi) * Math.cos(theta);
      y = rr * Math.sin(phi) * Math.sin(theta);
      z = rr * Math.cos(phi);
    }
    const m = new THREE.Mesh(NUCLEON_GEO, roles[i] ? protonMat : neutronMat);
    m.scale.setScalar(nucleonR * (0.92 + 0.16 * rand()));
    m.position.set(x, y, z);
    nucleusGroup.add(m);
  }
  nucleusGlow.scale.setScalar(clump * 4.2 + 0.9);

  // --- electrons: each rides its own inclined circular orbit + comet trail ---
  type Electron = {
    radius: number;
    q: THREE.Quaternion;
    omega: number;
    phase: number;
    core: THREE.Sprite;
    halo: THREE.Sprite;
    trail: THREE.Line;
    tp: Float32Array;
    tc: Float32Array;
  };
  const electronsGroup = new THREE.Group();
  root.add(electronsGroup);
  const ringsGroup = new THREE.Group();
  root.add(ringsGroup);
  const electrons: Electron[] = [];

  // orbit-plane orientation for global electron index k of total K (fibonacci)
  function orientationFor(k: number, K: number): THREE.Quaternion {
    const t = K <= 1 ? 0.5 : k / (K - 1);
    const phi = Math.acos(1 - 2 * t);
    const theta = Math.PI * (1 + Math.sqrt(5)) * k;
    const normal = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    ).normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      normal,
    );
  }

  const totalE = ELEMENT.shells.reduce((a, b) => a + b, 0);
  const baseR = clump + 1.08;
  const shellGap = 0.96;

  let gi = 0; // global electron index across all shells
  ELEMENT.shells.forEach((count, si) => {
    const radius = baseR + si * shellGap;
    for (let j = 0; j < count; j++, gi++) {
      const q = orientationFor(gi, totalE);
      const dir = gi % 2 === 0 ? 1 : -1;
      const omega =
        dir * (0.95 - si * 0.22) * (0.9 + (0.2 * ((gi * 7) % 5)) / 5);
      const phase = (j / count) * Math.PI * 2 + gi * 0.6;

      // faint orbit ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.006, 8, 160),
        new THREE.MeshBasicMaterial({
          color: COL.ring,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.quaternion.copy(q);
      ringsGroup.add(ring);

      // comet trail (additive line, colour fades to black = invisible)
      const trailGeo = new THREE.BufferGeometry();
      const tp = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
      const tc = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
      trailGeo.setAttribute("position", new THREE.BufferAttribute(tp, 3));
      trailGeo.setAttribute("color", new THREE.BufferAttribute(tc, 3));
      const trail = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.95,
        }),
      );
      trail.frustumCulled = false;
      electronsGroup.add(trail);

      // glowing head: tight core + soft halo
      const core = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: TEX_CORE,
          color: COL.electronHi,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 1.0,
        }),
      );
      core.scale.setScalar(0.32);
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: TEX_HALO,
          color: COL.electron,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 0.8,
        }),
      );
      halo.scale.setScalar(0.85);
      electronsGroup.add(halo);
      electronsGroup.add(core);

      electrons.push({ radius, q, omega, phase, core, halo, trail, tp, tc });
    }
  });

  // reusable temp vector
  const _v = new THREE.Vector3();
  function orbitPoint(
    out: THREE.Vector3,
    radius: number,
    angle: number,
    q: THREE.Quaternion,
  ) {
    out.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    out.applyQuaternion(q);
    return out;
  }

  function updateElectrons(time: number) {
    for (const e of electrons) {
      const angle = e.phase + time * e.omega;
      orbitPoint(_v, e.radius, angle, e.q);
      e.core.position.copy(_v);
      e.halo.position.copy(_v);
      for (let s = 0; s <= TRAIL_SEGMENTS; s++) {
        const f = s / TRAIL_SEGMENTS; // 0 = head, 1 = tail
        const a = angle - Math.sign(e.omega || 1) * f * TRAIL_SPAN;
        orbitPoint(_v, e.radius, a, e.q);
        const i3 = s * 3;
        e.tp[i3] = _v.x;
        e.tp[i3 + 1] = _v.y;
        e.tp[i3 + 2] = _v.z;
        const fall = (1 - f) * (1 - f);
        e.tc[i3] = COL.electron.r * fall;
        e.tc[i3 + 1] = COL.electron.g * fall;
        e.tc[i3 + 2] = COL.electron.b * fall;
      }
      e.trail.geometry.attributes.position.needsUpdate = true;
      e.trail.geometry.attributes.color.needsUpdate = true;
    }
  }

  // --- resize: track the canvas's CSS box -----------------------------------
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // --- animation loop -------------------------------------------------------
  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let t = 0;
  let last = performance.now();
  let raf = 0;
  let disposed = false;

  function frame(now: number) {
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    updateElectrons(t);

    // gentle nucleus breathing + slow auto-rotation of the whole atom
    nucleusGroup.scale.setScalar(1 + Math.sin(t * 1.6) * 0.018);
    if (!reduceMotion) {
      root.rotation.y += dt * 0.18;
      root.rotation.x = Math.sin(t * 0.12) * 0.12;
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  // one static paint even under reduced motion, then loop if allowed
  updateElectrons(0);
  renderer.render(scene, camera);
  if (!reduceMotion) raf = requestAnimationFrame(frame);

  // --- cleanup --------------------------------------------------------------
  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    scene.traverse((obj) => {
      const mesh = obj as Partial<THREE.Mesh & THREE.Line & THREE.Sprite>;
      mesh.geometry?.dispose?.();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose?.();
    });
    TEX_CORE.dispose();
    TEX_HALO.dispose();
    NUCLEON_GEO.dispose();
    protonMat.dispose();
    neutronMat.dispose();
    glassEnv.dispose();
    renderer.dispose();
  };
}
