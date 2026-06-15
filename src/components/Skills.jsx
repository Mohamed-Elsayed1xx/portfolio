import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CONSTELLATIONS = [
  {
    id: "frontend",
    label: "Frontend",
    color: "#06b6d4",
    glow: "rgba(6,182,212,",
    stars: [
      { name: "React", x: 18, y: 32, size: 14, level: "Advanced" },
      { name: "TypeScript", x: 28, y: 52, size: 13, level: "Advanced" },
      { name: "Tailwind CSS", x: 10, y: 58, size: 13, level: "Advanced" },
      { name: "HTML & CSS", x: 22, y: 72, size: 15, level: "Advanced" },
      { name: "Framer Motion", x: 30, y: 36, size: 10, level: "Proficient" },
    ],
    lines: [
      [0, 1],
      [0, 4],
      [1, 2],
      [2, 3],
      [4, 1],
    ],
  },
  {
    id: "backend",
    label: "Backend",
    color: "#3b82f6",
    glow: "rgba(59,130,246,",
    stars: [
      { name: "C#", x: 50, y: 26, size: 13, level: "Advanced" },
      { name: "ASP.NET Core", x: 62, y: 42, size: 13, level: "Advanced" },
      { name: "REST API", x: 50, y: 55, size: 12, level: "Advanced" },
      { name: "PostgreSQL", x: 40, y: 42, size: 11, level: "Proficient" },
      { name: "Entity Framework", x: 58, y: 68, size: 10, level: "Proficient" },
    ],
    lines: [
      [0, 1],
      [0, 3],
      [1, 2],
      [2, 4],
      [3, 2],
    ],
  },
  {
    id: "tools",
    label: "Tools & Others",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,",
    stars: [
      { name: "Git & GitHub", x: 75, y: 30, size: 13, level: "Advanced" },
      { name: "Vercel", x: 86, y: 50, size: 12, level: "Advanced" },
      { name: "SEO", x: 74, y: 62, size: 13, level: "Advanced" },
      { name: "Postman", x: 66, y: 44, size: 11, level: "Advanced" },
      { name: "VS Code", x: 82, y: 70, size: 12, level: "Advanced" },
    ],
    lines: [
      [0, 1],
      [0, 3],
      [1, 4],
      [3, 2],
      [2, 4],
    ],
  },
];

const PILLS = [
  {
    name: "Redux",
    color: "#764abc",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg",
  },
  {
    name: "React Router",
    color: "#ca4245",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg",
  },
  {
    name: "Axios",
    color: "#5a29e4",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/axios/axios-plain.svg",
  },
  {
    name: "JWT",
    color: "#d63aff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/json/json-plain.svg",
  },
  {
    name: "Swagger",
    color: "#85ea2d",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg",
  },
  {
    name: "Figma",
    color: "#f24e1e",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
  },
  {
    name: "Cloudinary",
    color: "#3448c5",
    icon: "https://cdn.simpleicons.org/cloudinary/3448C5",
  },
];

/* tiny twinkle data */
const BG_STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.4 + 0.3,
  delay: Math.random() * 4,
  dur: Math.random() * 3 + 2,
}));

/* ─────────────────────────────────────────────
   BACKGROUND TWINKLE STARS (CSS only, no JS)
───────────────────────────────────────────── */
const BgStars = () => (
  <>
    {BG_STARS.map((s) => (
      <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white">
        <animate
          attributeName="opacity"
          values="0.15;0.7;0.15"
          dur={`${s.dur}s`}
          begin={`${s.delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </>
);

/* ─────────────────────────────────────────────
   CONSTELLATION LINES (SVG)
───────────────────────────────────────────── */
const ConstellationLines = ({ constellation, hovered }) => {
  const { stars, lines, color } = constellation;
  const active = hovered === constellation.id;
  return (
    <>
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={`${stars[a].x}%`}
          y1={`${stars[a].y}%`}
          x2={`${stars[b].x}%`}
          y2={`${stars[b].y}%`}
          stroke={color}
          strokeWidth={active ? 1.2 : 0.5}
          strokeOpacity={active ? 0.6 : 0.18}
          style={{ transition: "all 0.4s ease" }}
        />
      ))}
    </>
  );
};

/* ─────────────────────────────────────────────
   SINGLE STAR NODE
───────────────────────────────────────────── */
const StarNode = ({
  star,
  color,
  glow,
  constellationHovered,
  isHovered,
  onEnter,
  onLeave,
  isVisibleRef,
}) => {
  const pulseRef = useRef(null);

  useAnimationFrame((t) => {
    if (!pulseRef.current || !isVisibleRef.current) return;
    const scale = 1 + Math.sin(t * 0.002 + star.x) * 0.12;
    pulseRef.current.style.transform = `translate(-50%,-50%) scale(${scale})`;
  });

  const active = constellationHovered;
  const sz = star.size;

  return (
    <div
      className="absolute cursor-pointer select-none"
      style={{ left: `${star.x}%`, top: `${star.y}%` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* outer pulse ring */}
      <div
        ref={pulseRef}
        className="absolute rounded-full"
        style={{
          width: sz * 3.5,
          height: sz * 3.5,
          top: "50%",
          left: "50%",
          background: `radial-gradient(circle, ${glow}${active ? "0.18" : "0.10"}) 0%, transparent 70%)`,
          transition: "background 0.4s",
        }}
      />
      {/* star core */}
      <div
        className="absolute rounded-full"
        style={{
          width: sz,
          height: sz,
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: isHovered
            ? `radial-gradient(circle at 35% 35%, white, ${color})`
            : `radial-gradient(circle at 35% 35%, ${color}dd, ${color}88)`,
          boxShadow: isHovered
            ? `0 0 ${sz * 2.5}px ${sz}px ${glow}0.9), 0 0 ${sz * 5}px ${glow}0.4)`
            : `0 0 ${sz * 1.5}px ${glow}${active ? "0.8" : "0.55"})`,
          transition: "all 0.25s ease",
        }}
      />
      {/* tooltip — shows below if star is near top, above otherwise */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: star.y < 40 ? -6 : 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="absolute z-50 pointer-events-none"
          style={{
            ...(star.y < 40
              ? { top: sz + 10, bottom: "auto" }
              : { bottom: sz + 12, top: "auto" }),
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
            style={{
              background: "rgba(4,13,26,0.95)",
              border: `1px solid ${color}60`,
              boxShadow: `0 0 16px ${glow}0.3)`,
              color,
            }}
          >
            {star.name}
            <span className="ml-2 opacity-60 font-normal text-white">
              {star.level}
            </span>
          </div>
          <div className="flex justify-center">
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                ...(star.y < 40
                  ? { borderBottom: `5px solid ${color}60`, borderTop: "none" }
                  : {
                      borderTop: `5px solid ${color}60`,
                      borderBottom: "none",
                    }),
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   GALAXY MAP CANVAS
───────────────────────────────────────────── */
const GalaxyMap = () => {
  const [hovered, setHovered] = useState(null); // constellation id
  const [hoveredStar, setHoveredStar] = useState(null); // "cid:si"
  const scanRef = useRef(null);
  const containerRef = useRef(null);
  const isVisibleRef = useRef(false);

  // Only run the per-frame animations (scan line + star pulses) while the
  // galaxy map is actually on screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scan line animation
  useAnimationFrame((t) => {
    if (!scanRef.current || !isVisibleRef.current) return;
    const x = (t * 0.012) % 100;
    scanRef.current.style.left = `${x}%`;
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: "340px",
        background: "transparent",
        border: "none",
      }}
    >
      {/* SVG layer: bg stars + lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <BgStars />
        {CONSTELLATIONS.map((c) => (
          <ConstellationLines key={c.id} constellation={c} hovered={hovered} />
        ))}
        {/* constellation label */}
        {CONSTELLATIONS.map((c) => (
          <text
            key={c.id + "-label"}
            x={`${c.stars.reduce((s, st) => s + st.x, 0) / c.stars.length}%`}
            y="90%"
            textAnchor="middle"
            fill={c.color}
            fontSize="11"
            fontFamily="monospace"
            opacity={hovered === c.id ? 0.9 : 0.35}
            style={{ transition: "opacity 0.3s", letterSpacing: "0.15em" }}
          >
            ── {c.label.toUpperCase()} ──
          </text>
        ))}
      </svg>

      {/* Scan line */}
      <div
        ref={scanRef}
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          width: "1px",
          background:
            "linear-gradient(to bottom, transparent, rgba(6,182,212,0.15) 40%, rgba(6,182,212,0.08) 60%, transparent)",
          zIndex: 2,
        }}
      />

      {/* no dividers — open space */}

      {/* Star nodes */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        {CONSTELLATIONS.map((c) =>
          c.stars.map((star, si) => {
            const key = `${c.id}:${si}`;
            return (
              <StarNode
                key={key}
                star={star}
                color={c.color}
                glow={c.glow}
                constellationHovered={hovered === c.id}
                isHovered={hoveredStar === key}
                isVisibleRef={isVisibleRef}
                onEnter={() => {
                  setHovered(c.id);
                  setHoveredStar(key);
                }}
                onLeave={() => {
                  setHovered(null);
                  setHoveredStar(null);
                }}
              />
            );
          }),
        )}
      </div>

      {/* no corner brackets — stars float freely in space */}

      {/* corner brackets only, no label */}
    </div>
  );
};

/* ─────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────── */
const Legend = () => (
  <div className="flex flex-wrap justify-center gap-8 mt-6">
    {CONSTELLATIONS.map((c) => (
      <div key={c.id} className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }}
        />
        <span className="text-gray-400 text-xs font-mono tracking-wider">
          {c.label}
        </span>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
const Skills = () => (
  <section id="skills" className="relative z-10 py-24 px-6">
    <div className="max-w-7xl mx-auto">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase mb-3">
          WHAT I WORK WITH
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          My{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Skills
          </span>
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-4" />
        <p className="text-gray-500 text-sm font-mono">
          Hover any star to explore — each one is a skill I've used in real
          projects
        </p>
      </motion.div>

      {/* Galaxy Map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <GalaxyMap />
        <Legend />
      </motion.div>

      {/* Pills */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <p className="text-gray-600 text-xs font-mono tracking-[0.25em] uppercase mb-5">
          Also Familiar With
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {PILLS.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono cursor-default"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#6b7280",
                background: "rgba(255,255,255,0.03)",
                transition:
                  "border-color 0.15s ease, color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${tech.color}60`;
                e.currentTarget.style.color = tech.color;
                e.currentTarget.style.background = `${tech.color}12`;
                e.currentTarget.style.boxShadow = `0 0 14px ${tech.color}30`;
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#6b7280";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-4 h-4 object-contain opacity-70"
              />
              {tech.name}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default Skills;
