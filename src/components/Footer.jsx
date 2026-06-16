import { useRef, Suspense } from "react";
import { motion, useInView } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { navLinks } from "../constants";

/* ══════════════════════════════════════
   Mini 3D Planet
══════════════════════════════════════ */
/* ══════════════════════════════════════
   Procedural cratered moon texture
══════════════════════════════════════ */
let moonTexture = null;
const getMoonTexture = () => {
  if (moonTexture) return moonTexture;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");

  // base regolith tone
  ctx.fillStyle = "#9aa3ad";
  ctx.fillRect(0, 0, 512, 512);

  // fine grain noise
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 512,
      y = Math.random() * 512;
    const shade = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${(Math.random() * 0.05).toFixed(3)})`;
    ctx.fillRect(x, y, 1.4, 1.4);
  }

  // craters — dark basin + bright rim
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512,
      y = Math.random() * 512;
    const r = Math.random() * 26 + 5;

    const basin = ctx.createRadialGradient(x, y, 0, x, y, r);
    basin.addColorStop(0, "rgba(70,78,88,0.55)");
    basin.addColorStop(0.7, "rgba(120,128,138,0.22)");
    basin.addColorStop(1, "rgba(154,163,173,0)");
    ctx.fillStyle = basin;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(215,222,230,0.18)";
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath();
    ctx.arc(x + r * 0.12, y + r * 0.12, r * 0.92, 0, Math.PI * 2);
    ctx.stroke();
  }

  moonTexture = new THREE.CanvasTexture(c);
  return moonTexture;
};

/* ══════════════════════════════════════
   Mini 3D Moon — realistic cratered surface
   with a soft cyan atmospheric rim glow
══════════════════════════════════════ */
const MiniMoon = () => {
  const mesh = useRef();
  useFrame((s) => {
    mesh.current.rotation.y += 0.0025;
    mesh.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.25) * 0.04;
  });
  const texture = getMoonTexture();
  return (
    <Float speed={1.6} rotationIntensity={0.18} floatIntensity={0.9}>
      <group>
        <Sphere ref={mesh} args={[1, 96, 96]}>
          <meshStandardMaterial
            map={texture}
            bumpMap={texture}
            bumpScale={0.045}
            roughness={0.95}
            metalness={0.04}
          />
        </Sphere>

        {/* soft cyan atmosphere — rim-lit edge glow */}
        <Sphere args={[1.06, 48, 48]}>
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.26}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>
        <Sphere args={[1.18, 32, 32]}>
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>
        <Sphere args={[1.32, 24, 24]}>
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.05}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>

        <ambientLight intensity={0.35} />
        {/* warm key light — like sunlight */}
        <directionalLight
          position={[3, 2, 4]}
          intensity={2.4}
          color="#f8fafc"
        />
        {/* cyan rim light — ties moon to the site palette */}
        <pointLight
          position={[-3, -1, -2]}
          intensity={3.6}
          color="#38bdf8"
          distance={10}
        />
        <pointLight
          position={[-2.2, 0.5, -1.5]}
          intensity={1.8}
          color="#7dd3fc"
          distance={8}
        />
        <pointLight position={[0, 3, 2]} intensity={0.5} color="#818cf8" />
      </group>
    </Float>
  );
};

/* ══════════════════════════════════════
   Social icons data
══════════════════════════════════════ */
const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/Mohamed-Elsayed1xx",
    color: "#e2e8f0",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mohamed-elsayed1st/",
    color: "#0a66c2",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/+201004354231",
    color: "#26a5e4",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/201021399112",
    color: "#25d366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={17} height={17}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
];

const EXPLORE_LINKS = navLinks;

/* SVG icons for contact rows — consistent with site theme (no emoji glyphs) */
const IconMail = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);
const IconChat = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const IconPin = () => (
  <svg
    viewBox="0 0 24 24"
    width={14}
    height={14}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CONTACT_INFO = [
  {
    icon: <IconMail />,
    text: "mohamedelsayed.x1x@gmail.com",
    href: "mailto:mohamedelsayed.x1x@gmail.com",
  },
  {
    icon: <IconChat />,
    text: "wa.me/201021399112",
    href: "https://wa.me/201021399112",
  },
  { icon: <IconPin />, text: "Egypt 🇪🇬", href: null },
];

/* ══════════════════════════════════════
   SocialBtn — كارد مع hover animation
══════════════════════════════════════ */
const SocialBtn = ({ s }) => (
  <motion.a
    href={s.href}
    target="_blank"
    rel="noreferrer"
    aria-label={s.label}
    className="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden"
    style={{
      background: "rgba(5,15,40,0.75)",
      border: "1px solid rgba(56,189,248,0.15)",
      color: "#475569",
    }}
    whileHover="hov"
    whileTap={{ scale: 0.9 }}
    initial="rest"
    variants={{
      rest: { scale: 1 },
      hov: { scale: 1.18, y: -3 },
    }}
    transition={{ type: "spring", stiffness: 300, damping: 18 }}
    onMouseEnter={(e) => {
      const el = e.currentTarget;
      el.style.color = s.color;
      el.style.borderColor = s.color + "99";
      el.style.background = s.color + "1a";
      el.style.boxShadow = `0 0 16px ${s.color}55, inset 0 0 10px ${s.color}18`;
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.color = "#475569";
      el.style.borderColor = "rgba(56,189,248,0.15)";
      el.style.background = "rgba(5,15,40,0.75)";
      el.style.boxShadow = "none";
    }}
  >
    {s.icon}
  </motion.a>
);

/* ══════════════════════════════════════
   NavLink — hover underline animation
══════════════════════════════════════ */
const NavLinkItem = ({ link, delay }) => (
  <motion.li
    initial={{ opacity: 0, x: -12 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    viewport={{ once: true }}
  >
    <motion.a
      href={`#${link.id}`}
      className="relative flex items-center gap-2 text-sm text-gray-500 group"
      style={{ width: "fit-content" }}
      whileHover={{ x: 5, color: "#38bdf8" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* dot */}
      <motion.span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: "linear-gradient(135deg,#38bdf8,#818cf8)",
          flexShrink: 0,
        }}
        initial={{ scale: 0, opacity: 0 }}
        variants={{
          hov: { scale: 1, opacity: 1 },
          rest: { scale: 0, opacity: 0 },
        }}
        whileHover="hov"
      />
      <span className="tracking-wide" style={{ fontSize: 13, fontWeight: 500 }}>
        {link.title}
      </span>
      {/* underline */}
      <motion.span
        className="absolute bottom-0 left-0 h-px rounded-full"
        style={{ background: "linear-gradient(to right,#38bdf8,#818cf8)" }}
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.25 }}
      />
    </motion.a>
  </motion.li>
);

/* ══════════════════════════════════════
   ContactRow — hover glow animation
══════════════════════════════════════ */
const ContactRow = ({ c, delay }) => {
  const inner = (
    <motion.div
      className="flex items-center gap-3 group"
      style={{ width: "fit-content" }}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.span
        className="flex items-center justify-center flex-shrink-0 rounded-full transition-colors duration-200"
        style={{
          width: 26,
          height: 26,
          background: "rgba(56,189,248,0.07)",
          border: "1px solid rgba(56,189,248,0.18)",
          color: "#38bdf8",
        }}
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        {c.icon}
      </motion.span>
      <span
        className="text-sm text-gray-500 group-hover:text-cyan-400 transition-colors duration-200"
        style={{ fontSize: 12 }}
      >
        {c.text}
      </span>
    </motion.div>
  );

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
    >
      {c.href ? (
        <a href={c.href} target="_blank" rel="noreferrer">
          {inner}
        </a>
      ) : (
        inner
      )}
    </motion.li>
  );
};

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
const Footer = () => {
  const year = new Date().getFullYear();
  const footerRef = useRef(null);
  const isVisible = useInView(footerRef, { once: false, margin: "200px" });
  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden"
      style={{
        background: "transparent",
        borderTop: "1px solid rgba(56,189,248,0.12)",
      }}
    >
      {/* space background */}

      {/* top glow line */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.7) 40%, rgba(129,140,248,0.5) 60%, transparent 100%)",
        }}
      />

      {/* nebula blobs — نفس اللي في باقي الموقع */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "5%",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.04) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "5%",
            width: 400,
            height: 250,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(129,140,248,0.05) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "40%",
            width: 300,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.03) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-8">
        {/* ══ grid ══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-14">
          {/* col 1 — brand */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-start gap-4"
          >
            {/* 3D planet */}
            <motion.div
              style={{ width: 150, height: 150 }}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              viewport={{ once: true }}
            >
              <Canvas
                camera={{ position: [0, 0, 3.8], fov: 44 }}
                frameloop={isVisible ? "always" : "never"}
              >
                <Suspense fallback={null}>
                  {isVisible && (
                    <Stars
                      radius={25}
                      depth={15}
                      count={600}
                      factor={2}
                      fade
                      speed={0.4}
                    />
                  )}
                  <MiniMoon />
                </Suspense>
              </Canvas>
            </motion.div>

            {/* logo + bio */}
            <div>
              <motion.h3
                className="text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg,#38bdf8 0%,#818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                whileHover={{ letterSpacing: "0.05em" }}
                transition={{ duration: 0.2 }}
              >
                Mohamed
              </motion.h3>
              <p
                className="text-gray-600 text-xs mt-1.5 leading-relaxed"
                style={{ maxWidth: 220 }}
              >
                Full-Stack Developer
                <br />
                Crafting digital experiences
                <br />
                from Egypt 🇪🇬
              </p>
            </div>

            {/* socials */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIALS.map((s) => (
                <SocialBtn key={s.label} s={s} />
              ))}
            </div>
          </motion.div>

          {/* col 2 — explore */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <h4
              className="text-xs font-bold tracking-[0.22em] uppercase mb-6"
              style={{
                background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Explore
            </h4>
            <ul className="flex flex-col gap-4">
              {EXPLORE_LINKS.map((link, i) => (
                <NavLinkItem key={link.id} link={link} delay={0.2 + i * 0.07} />
              ))}
            </ul>
          </motion.div>

          {/* col 3 — contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4
              className="text-xs font-bold tracking-[0.22em] uppercase mb-6"
              style={{
                background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Contact
            </h4>
            <ul className="flex flex-col gap-4">
              {CONTACT_INFO.map((c, i) => (
                <ContactRow key={i} c={c} delay={0.35 + i * 0.08} />
              ))}
            </ul>

            {/* available badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{
                opacity: 1,
                scale: 1,
                transition: { delay: 0.6, duration: 0.5 },
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 18px rgba(34,197,94,0.25)",
                transition: { duration: 0.2, delay: 0 },
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full mt-6 w-fit cursor-default"
              style={{
                background: "rgba(34,197,94,0.07)",
                border: "1px solid rgba(34,197,94,0.22)",
              }}
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.25, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-green-400 text-xs font-semibold tracking-wide">
                Available for work
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ══ divider ══ */}
        <div
          className="w-full h-px mb-7"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(56,189,248,0.35), rgba(129,140,248,0.28), transparent)",
          }}
        />

        {/* ══ bottom bar ══ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="text-gray-600 text-xs tracking-wide text-center"
          >
            © {year}{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#38bdf8,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Mohamed Elsayed
            </span>{" "}
            · Built with React &amp; ❤️
          </motion.p>

          {/* back to top */}
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0 }}
            whileInView={{
              opacity: 1,
              transition: { delay: 0.5, duration: 0.5 },
            }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase cursor-pointer"
            style={{
              background: "rgba(56,189,248,0.07)",
              border: "1px solid rgba(56,189,248,0.22)",
              color: "#38bdf8",
            }}
            whileHover={{
              scale: 1.06,
              y: -2,
              boxShadow: "0 0 22px rgba(56,189,248,0.3)",
              background: "rgba(56,189,248,0.14)",
              transition: { duration: 0.2, delay: 0 },
            }}
            whileTap={{ scale: 0.95, transition: { duration: 0.1, delay: 0 } }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width={13}
              height={13}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
