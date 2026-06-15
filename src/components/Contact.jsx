import { useEffect, useRef, useState, Suspense } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sphere,
  MeshDistortMaterial,
  Ring,
  Stars,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── Flame sprite texture (generated once via canvas) ─── */
let flameTexture = null;
const getFlameTexture = () => {
  if (flameTexture) return flameTexture;
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(225,245,255,1)");
  g.addColorStop(0.25, "rgba(125,211,252,0.9)");
  g.addColorStop(0.55, "rgba(56,189,248,0.4)");
  g.addColorStop(1, "rgba(14,165,233,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  flameTexture = new THREE.CanvasTexture(c);
  return flameTexture;
};

/* ─── Fresnel glow shader material for the core star surface ─── */
const sunVertex = `
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float time;

  // simple noise
  float hash(vec3 p){ return fract(sin(dot(p, vec3(17.1,29.7,41.3)))*43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p); vec3 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
  }
  void main(){
    vNormal = normalize(normalMatrix * normal);
    float n = noise(position * 2.2 + time * 0.25);
    vec3 displaced = position + normal * n * 0.045;
    vPos = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const sunFragment = `
  varying vec3 vNormal;
  varying vec3 vPos;
  uniform float time;

  float hash(vec3 p){ return fract(sin(dot(p, vec3(17.1,29.7,41.3)))*43758.5453); }
  float noise(vec3 p){
    vec3 i = floor(p); vec3 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(
      mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y), f.z);
  }
  void main(){
    // fresnel — subtle rim brightening, doesn't overpower the surface
    vec3 viewDir = normalize(-vPos);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);

    // surface turbulence for plasma look — higher frequency for visible cells
    float n1 = noise(vPos * 5.0 + time * 0.4);
    float n2 = noise(vPos * 11.0 - time * 0.35);
    float n3 = noise(vPos * 18.0 + time * 0.6);
    float plasma = n1 * 0.5 + n2 * 0.35 + n3 * 0.15;

    vec3 deep   = vec3(0.03, 0.12, 0.32);   // deep indigo-blue core
    vec3 mid    = vec3(0.08, 0.42, 0.78);   // electric blue
    vec3 hot    = vec3(0.30, 0.70, 1.0);    // bright cyan
    vec3 rim    = vec3(0.55, 0.88, 1.0);    // cyan rim (kept inside cyan family)

    vec3 col = mix(deep, mid, plasma);
    col = mix(col, hot, smoothstep(0.55, 0.95, plasma));
    col = mix(col, rim, fresnel * 0.65);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ─── Core star ─── */
const Sun = ({ paused }) => {
  const core = useRef();
  const flare = useRef();
  const matRef = useRef();
  const flameGroup = useRef();

  const uniforms = useRef({ time: { value: 0 } });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) matRef.current.uniforms.time.value = t;
    if (paused) return;
    core.current.rotation.y += 0.0012;
    flameGroup.current.rotation.z += 0.0015;
    flare.current.intensity = 2.4 + Math.sin(t * 1.8) * 0.7;
    // animate each plasma plume — pulse scale & opacity
    flameGroup.current.children.forEach((plume, i) => {
      const s = 1 + Math.sin(t * 1.5 + i) * 0.18;
      plume.scale.setScalar(s);
      plume.material.opacity = 0.3 + Math.sin(t * 2 + i * 1.3) * 0.12;
    });
  });

  const flamePositions = [];
  const FLAME_COUNT = 10;
  for (let i = 0; i < FLAME_COUNT; i++) {
    const a = (i / FLAME_COUNT) * Math.PI * 2;
    flamePositions.push([Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.02]);
  }

  return (
    <group>
      {/* Core star — custom shader, fresnel + plasma */}
      <Sphere ref={core} args={[0.65, 64, 64]}>
        <shaderMaterial
          ref={matRef}
          vertexShader={sunVertex}
          fragmentShader={sunFragment}
          uniforms={uniforms.current}
        />
      </Sphere>

      {/* Plasma plumes — additive billboard sprites around the rim */}
      <group ref={flameGroup}>
        {flamePositions.map((p, i) => (
          <sprite key={i} position={p} scale={[0.4, 0.4, 1]}>
            <spriteMaterial
              map={getFlameTexture()}
              transparent
              opacity={0.35}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
        ))}
      </group>

      {/* Outer halo sprite — soft ambient bloom, kept outside the sphere's silhouette */}
      <sprite scale={[2.4, 2.4, 1]}>
        <spriteMaterial
          map={getFlameTexture()}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <ambientLight intensity={0.2} />
      <pointLight
        ref={flare}
        position={[0, 0, 0]}
        intensity={2.4}
        color="#38bdf8"
        distance={8}
      />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#a78bfa" />
    </group>
  );
};

/* ─── Energy beam ─── */
const EnergyBeam = ({ active, targetX, targetY, isVisible }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const phaseRef = useRef("idle");
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width,
      H = canvas.height;
    const cx = W / 2,
      cy = H / 2;
    const clear = () => ctx.clearRect(0, 0, W, H);
    if (!active || !isVisible) {
      phaseRef.current = "idle";
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clear();
      return;
    }
    const tx = targetX,
      ty = targetY;
    phaseRef.current = "strike";
    let strikeFrame = 0;
    const totalStrikeFrames = 14;
    const drawBeam = (x1, y1, x2, y2, depth) => {
      if (depth === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
      }
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 14 * depth;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 14 * depth;
      drawBeam(x1, y1, mx, my, depth - 1);
      drawBeam(mx, my, x2, y2, depth - 1);
      if (depth === 2 && Math.random() > 0.6) {
        const bx = mx + (Math.random() - 0.5) * 20,
          by = my + (Math.random() - 0.5) * 20;
        ctx.globalAlpha *= 0.4;
        drawBeam(mx, my, bx, by, depth - 1);
        ctx.globalAlpha /= 0.4;
      }
    };
    const animate = () => {
      clear();
      if (phaseRef.current === "strike") {
        strikeFrame++;
        const frac = Math.min(strikeFrame / totalStrikeFrames, 1);
        const ex = cx + (tx - cx) * frac,
          ey = cy + (ty - cy) * frac;
        // outer violet glow
        ctx.save();
        ctx.shadowBlur = 28;
        ctx.shadowColor = "#8b5cf6";
        ctx.strokeStyle = `rgba(139,92,246,${0.4 + Math.random() * 0.15})`;
        ctx.lineWidth = 9;
        ctx.globalAlpha = 0.65;
        drawBeam(cx, cy, ex, ey, 3);
        ctx.restore();
        // mid violet-pink energy stream
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#a78bfa";
        ctx.strokeStyle = `rgba(196,181,253,${0.8 + Math.random() * 0.15})`;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.95;
        drawBeam(cx, cy, ex, ey, 3);
        ctx.restore();
        // bright white-violet core
        ctx.save();
        ctx.strokeStyle = `rgba(245,243,255,${0.95 + Math.random() * 0.05})`;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 1;
        drawBeam(cx, cy, ex, ey, 2);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(ex, ey, 4 + Math.random() * 3, 0, Math.PI * 2);
        const sg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
        sg.addColorStop(0, "rgba(245,243,255,0.95)");
        sg.addColorStop(0.4, "rgba(196,181,253,0.75)");
        sg.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = sg;
        ctx.fill();
        if (strikeFrame >= totalStrikeFrames) {
          phaseRef.current = "pulse";
          strikeFrame = 0;
        }
      } else if (phaseRef.current === "pulse") {
        const fl = Math.random() > 0.25 ? 1 : 0.6;
        ctx.save();
        ctx.shadowBlur = 24;
        ctx.shadowColor = "#8b5cf6";
        ctx.strokeStyle = `rgba(139,92,246,${0.35 * fl})`;
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.6 * fl;
        drawBeam(cx, cy, tx, ty, 3);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(196,181,253,${0.75 * fl})`;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = 0.9 * fl;
        drawBeam(cx, cy, tx, ty, 3);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(245,243,255,${0.9 * fl})`;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.9 * fl;
        drawBeam(cx, cy, tx, ty, 2);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        const eg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 16);
        eg.addColorStop(0, "rgba(245,243,255,0.9)");
        eg.addColorStop(0.4, "rgba(196,181,253,0.65)");
        eg.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = eg;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clear();
    };
  }, [active, targetX, targetY, isVisible]);
  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
};

/* ─── Icons ─── */
const IconEmail = () => (
  <svg
    viewBox="0 0 24 24"
    width={22}
    height={22}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);
const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);
const IconTelegram = () => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const IconCV = () => (
  <svg
    viewBox="0 0 24 24"
    width={22}
    height={22}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9,15 12,18 15,15" />
  </svg>
);

const INNER_R = 190;
const OUTER_R = 290;
const ICON_SIZE = 72; // ← حجم موحد لكل الأيقونات

/* Each item keeps its own brand color for the icon glyph + hover accent,
   but the resting "vessel" around every icon is now a unified glass/cyan
   shell so the whole orbit reads as one cohesive system. */
const ITEMS = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mohamed-elsayed1st/",
    orbitRadius: INNER_R,
    startAngle: -Math.PI / 2,
    speed: 0.0035,
    icon: <IconLinkedIn />,
    color: "#38bdf8",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/+201004354231",
    orbitRadius: INNER_R,
    startAngle: Math.PI / 2,
    speed: 0.0035,
    icon: <IconTelegram />,
    color: "#38bdf8",
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:mohamedelsayed.x1x@gmail.com",
    orbitRadius: OUTER_R,
    startAngle: Math.PI / 6,
    speed: -0.005,
    icon: <IconEmail />,
    color: "#7dd3fc",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/201021399112",
    orbitRadius: OUTER_R,
    startAngle: Math.PI / 6 + (2 * Math.PI) / 3,
    speed: -0.005,
    icon: <IconWhatsApp />,
    color: "#34d399",
  },
  {
    id: "cv",
    label: "CV",
    href: "/Mohamed_Elsayed_CV.pdf",
    orbitRadius: OUTER_R,
    startAngle: Math.PI / 6 + (4 * Math.PI) / 3,
    speed: -0.005,
    icon: <IconCV />,
    color: "#a78bfa",
  },
];

const CONTAINER = 560;

/* ─── OrbitIcon — unified glass shell, brand color only on hover ───
   Position is now driven by a single shared animation loop in <Contact>,
   this component just registers its DOM node via `registerRef`. */
const OrbitIcon = ({ item, isActive, onEnter, onLeave, registerRef }) => {
  return (
    <a
      ref={(el) => registerRef(item.id, el)}
      href={item.href}
      target={item.id === "cv" ? "_self" : "_blank"}
      rel="noreferrer"
      download={item.id === "cv" ? "Mohamed_Elsayed_CV.pdf" : undefined}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 10,
        width: ICON_SIZE,
        height: ICON_SIZE,
        display: "block",
      }}
      onMouseEnter={() => onEnter(item.id)}
      onMouseLeave={onLeave}
    >
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 28px 8px ${item.color}55` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
      <div
        className="flex flex-col items-center justify-center gap-1 rounded-full transition-all duration-300"
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          background: isActive
            ? "radial-gradient(circle at 35% 30%, rgba(30,41,59,0.95), rgba(8,15,35,0.9))"
            : "radial-gradient(circle at 35% 30%, rgba(15,23,42,0.85), rgba(5,10,25,0.75))",
          backdropFilter: "blur(6px)",
          border: isActive
            ? `1.5px solid ${item.color}`
            : "1px solid rgba(125,211,252,0.22)",
          color: item.color,
          boxShadow: isActive
            ? `0 0 30px 6px ${item.color}66, 0 0 60px ${item.color}33`
            : "0 0 16px 2px rgba(56,189,248,0.12)",
          transform: isActive ? "scale(1.25)" : "scale(1)",
        }}
      >
        {item.icon}
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: isActive ? item.color : "rgba(226,232,240,0.65)",
            transition: "color 0.3s",
          }}
        >
          {item.label}
        </span>
      </div>
    </a>
  );
};

const OrbitRingsSVG = () => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 1,
    }}
    viewBox={`0 0 ${CONTAINER} ${CONTAINER}`}
  >
    <ellipse
      cx={CONTAINER / 2}
      cy={CONTAINER / 2}
      rx={INNER_R}
      ry={INNER_R}
      fill="none"
      stroke="rgba(125,211,252,0.25)"
      strokeWidth="1.2"
      strokeDasharray="3 7"
    />
    <ellipse
      cx={CONTAINER / 2}
      cy={CONTAINER / 2}
      rx={OUTER_R}
      ry={OUTER_R}
      fill="none"
      stroke="rgba(125,211,252,0.18)"
      strokeWidth="1.2"
      strokeDasharray="3 9"
    />
  </svg>
);

const Contact = () => {
  const [hovered, setHovered] = useState(null);
  const [beamTarget, setBeamTarget] = useState({
    x: CONTAINER / 2,
    y: CONTAINER / 2,
  });
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { once: false, margin: "100px" });

  // Shared orbit state — one animation loop drives every icon instead of
  // each icon running its own requestAnimationFrame loop.
  const iconRefs = useRef({});
  const anglesRef = useRef(
    Object.fromEntries(ITEMS.map((item) => [item.id, item.startAngle])),
  );
  const hoveredRef = useRef(null);
  hoveredRef.current = hovered;

  const applyIconPositions = () => {
    const center = CONTAINER / 2;
    const half = ICON_SIZE / 2;
    ITEMS.forEach((item) => {
      const el = iconRefs.current[item.id];
      if (!el) return;
      const angle = anglesRef.current[item.id];
      const x = center + Math.cos(angle) * item.orbitRadius - half;
      const y = center + Math.sin(angle) * item.orbitRadius - half;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  const registerIconRef = (id, el) => {
    iconRefs.current[id] = el;
    if (el) applyIconPositions();
  };

  useEffect(() => {
    applyIconPositions();
    if (!isVisible) return; // don't run the loop while off-screen

    let raf;
    const tick = () => {
      if (!hoveredRef.current) {
        ITEMS.forEach((item) => {
          anglesRef.current[item.id] += item.speed;
        });
      }
      applyIconPositions();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isVisible]);

  const handleEnter = (id) => {
    setHovered(id);
    const item = ITEMS.find((it) => it.id === id);
    if (item) {
      const center = CONTAINER / 2;
      const angle = anglesRef.current[id];
      setBeamTarget({
        x: center + Math.cos(angle) * item.orbitRadius,
        y: center + Math.sin(angle) * item.orbitRadius,
      });
    }
  };
  const handleLeave = () => setHovered(null);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-10 py-24 px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase mb-3">
            GET IN TOUCH
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Me
            </span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-4" />
          <p className="text-gray-500 text-sm font-mono">
            I'm open to opportunities — hover any orbit to connect
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative mx-auto"
          style={{ width: CONTAINER, height: CONTAINER }}
        >
          {/* 2D core glow overlay — cyan/blue radiance matching the site theme */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center,
              rgba(56,189,248,0.30) 0%,
              rgba(14,165,233,0.16) 26%,
              rgba(56,189,248,0.06) 44%,
              transparent 65%)`,
            }}
          />

          <div className="absolute inset-0 z-0">
            {/* Canvas stays mounted permanently — only its frameloop toggles
                with visibility. This avoids destroying/recreating the WebGL
                context (which causes a visible stutter) on every scroll. */}
            <Canvas
              camera={{ position: [0, 0, 5], fov: 42 }}
              frameloop={isVisible ? "always" : "never"}
            >
              <Suspense fallback={null}>
                <Stars
                  radius={80}
                  depth={50}
                  count={4000}
                  factor={3}
                  fade
                  speed={0.6}
                />
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  enableRotate={false}
                />
                <Sun paused={!!hovered} />
              </Suspense>
            </Canvas>
          </div>

          <OrbitRingsSVG />
          <EnergyBeam
            active={!!hovered}
            targetX={beamTarget.x}
            targetY={beamTarget.y}
            isVisible={isVisible}
          />

          {ITEMS.map((item) => (
            <OrbitIcon
              key={item.id}
              item={item}
              isActive={hovered === item.id}
              onEnter={handleEnter}
              onLeave={handleLeave}
              registerRef={registerIconRef}
            />
          ))}

          {hovered && (
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 190,
                height: 190,
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                border: "1px solid rgba(167,139,250,0.25)",
                zIndex: 3,
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.08, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
