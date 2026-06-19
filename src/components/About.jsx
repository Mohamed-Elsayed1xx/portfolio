import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useEffect } from "react";
import { Lightbulb, Zap, Code2 } from "lucide-react";

/* ── Floating particles ── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 0.015 + 0.005,
  opacity: Math.random() * 0.5 + 0.2,
}));

/* ── Orbiting moon around the ME planet ── */
const OrbitingMoon = () => {
  const ref = useRef(null);
  const isVisible = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((t) => {
    if (!ref.current || !isVisible.current) return;
    const angle = (t * 0.00022) % (Math.PI * 2);
    const rx = 96,
      ry = 28;
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    ref.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    ref.current.style.zIndex = y > 0 ? 20 : 0;
  });

  return (
    <div ref={ref} className="absolute" style={{ top: "50%", left: "50%" }}>
      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-300 to-cyan-200 shadow-[0_0_10px_3px_rgba(34,211,238,0.7)]" />
    </div>
  );
};

/* ── ME Planet ── */
const MEPlanet = () => (
  <div className="flex justify-center mb-6">
    <div className="relative w-56 h-44 flex items-center justify-center">
      <div
        className="absolute w-52 h-16 rounded-full border border-cyan-400/25 pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%) rotateX(72deg)",
        }}
      />
      <div
        className="absolute w-44 h-10 rounded-full border border-blue-400/15 pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%) rotateX(72deg)",
        }}
      />

      {/* planet wrapper — status dot sits outside the clipped circle */}
      <div
        id="me-planet"
        className="relative z-10 w-32 h-32 group cursor-pointer"
      >
        {/* clipped sphere — photo, texture lines, scan line */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #1a4a7a, #0d2444 50%, #060f24)",
            border: "1.5px solid rgba(6,182,212,0.35)",
          }}
          animate={{
            boxShadow: [
              "0 0 40px 8px rgba(6,182,212,0.18), 0 0 80px 20px rgba(59,130,246,0.08), inset 0 0 30px rgba(6,182,212,0.1)",
              "0 0 55px 14px rgba(6,182,212,0.32), 0 0 95px 28px rgba(59,130,246,0.14), inset 0 0 30px rgba(6,182,212,0.18)",
              "0 0 40px 8px rgba(6,182,212,0.18), 0 0 80px 20px rgba(59,130,246,0.08), inset 0 0 30px rgba(6,182,212,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* surface texture lines */}
          {[28, 44, 58, 72].map((top, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${top}%`,
                background: `rgba(6,182,212,${i === 1 ? 0.25 : 0.1})`,
              }}
            />
          ))}
          <div
            className="absolute w-8 h-5 rounded-full opacity-20"
            style={{
              top: "30%",
              left: "20%",
              background: "rgba(34,211,238,0.6)",
            }}
          />
          <div
            className="absolute w-5 h-3 rounded-full opacity-15"
            style={{
              top: "55%",
              left: "55%",
              background: "rgba(96,165,250,0.6)",
            }}
          />

          {/* photo — zooms in slightly on hover */}
          <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
            <img
              src="/avatar.jpg"
              alt="Mohamed Elsayed"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            />
          </div>

          {/* hover glow ring */}
          <div
            className="absolute inset-0 rounded-full z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow:
                "inset 0 0 25px rgba(34,211,238,0.45), 0 0 35px 6px rgba(34,211,238,0.35)",
              border: "1.5px solid rgba(34,211,238,0.6)",
            }}
          />

          {/* hover sweep scan line (faster, brighter) */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 pointer-events-none z-30 opacity-0 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(125,211,252,0.9), transparent)",
            }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* cyan tint overlay — blends photo with the sphere */}
          <div
            className="absolute inset-0 rounded-full z-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(34,211,238,0.2) 0%, transparent 55%)",
            }}
          />

          {/* slow identification scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px pointer-events-none z-20"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)",
            }}
            animate={{ top: ["8%", "92%", "8%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* status dot — "available for work", outside the clip */}
        <motion.div
          className="absolute rounded-full z-30"
          style={{
            width: 14,
            height: 14,
            right: -2,
            bottom: 6,
            background: "#22c55e",
            border: "2px solid #060f24",
            boxShadow: "0 0 8px 2px rgba(34,197,94,0.6)",
          }}
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <OrbitingMoon />
    </div>
  </div>
);

/* ── Mission card ── */
const MissionCard = () => (
  <motion.div
    initial={{ opacity: 0, x: -60 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.7 }}
    viewport={{ once: true }}
    className="flex-1 flex justify-center items-center"
  >
    <div className="relative w-80">
      <MEPlanet />
      <div className="relative rounded-2xl border border-cyan-500/20 bg-[#040d1a]/80 backdrop-blur-sm p-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-cyan-400/50 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-cyan-400/50 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-cyan-400/50 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyan-400/50 rounded-br-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
              Mission Profile
            </span>
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Mohamed Elsayed</h3>
          <p className="text-cyan-400 text-sm mb-4">Full-Stack Developer</p>
          <div className="space-y-2 mb-4">
            {[
              { label: "Base", value: "Egypt 🇪🇬" },
              { label: "Status", value: "Available for work" },
              { label: "Mission", value: "Full-Stack + SEO" },
              { label: "Languages", value: "Arabic / English" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 w-16 flex-shrink-0 font-mono">
                  {item.label}:
                </span>
                <span className="text-gray-300">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-3 border-t border-cyan-500/10">
            {["React", "C#", "ASP.NET", "PostgreSQL", "SEO"].map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs rounded-full border border-cyan-400/30 text-cyan-400 bg-cyan-400/5 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Cards ── */
const cards = [
  {
    icon: Lightbulb,
    title: "Problem Solver",
    desc: "I break down complex challenges into clean, efficient solutions — no overengineering, just results.",
    glow: "#06b6d4",
    iconBg: "rgba(6,182,212,0.15)",
    iconBorder: "rgba(6,182,212,0.3)",
    topLine: "from-transparent via-cyan-400 to-transparent",
  },
  {
    icon: Zap,
    title: "Fast Learner",
    desc: "I adapt quickly to new technologies, frameworks, and project needs — whatever it takes to ship on time.",
    glow: "#3b82f6",
    iconBg: "rgba(59,130,246,0.15)",
    iconBorder: "rgba(59,130,246,0.3)",
    topLine: "from-transparent via-blue-400 to-transparent",
  },
  {
    icon: Code2,
    title: "Clean Code",
    desc: "Readable, maintainable, and scalable — I write code that your future self (and your team) will thank you for.",
    glow: "#8b5cf6",
    iconBg: "rgba(139,92,246,0.15)",
    iconBorder: "rgba(139,92,246,0.3)",
    topLine: "from-transparent via-purple-400 to-transparent",
  },
];

/* ── Rocket: reads planet positions from DOM — works at any zoom/screen size ── */
const GuidedRocket = ({ sectionRef }) => {
  const ref = useRef(null);
  const coords = useRef(null);
  const isVisible = useRef(false);

  const calcCoords = () => {
    const section = sectionRef?.current;
    if (!section) return;
    const secRect = section.getBoundingClientRect();
    const bigPlanet = document.getElementById("big-planet");
    const mePlanet = document.getElementById("me-planet");
    if (!bigPlanet || !mePlanet) return;
    const bp = bigPlanet.getBoundingClientRect();
    const mp = mePlanet.getBoundingClientRect();
    coords.current = {
      x0: bp.left + bp.width / 2 - secRect.left,
      y0: bp.top + bp.height / 2 - secRect.top,
      x1: mp.left + mp.width / 2 - secRect.left,
      y1: mp.top + mp.height / 2 - secRect.top,
    };
  };

  useEffect(() => {
    calcCoords();
    window.addEventListener("resize", calcCoords);

    // The MissionCard / DistantPlanet entrance animations (whileInView) take
    // a moment to settle, so the very first calcCoords() can capture the
    // planets mid-animation and "lock in" wrong coordinates → recompute once
    // the layout has had time to settle.
    const settleTimer = setTimeout(calcCoords, 1200);

    // Stop animation when section not in view → kills the lag
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        // Also refresh coordinates the moment the section comes into view,
        // in case the page layout shifted while it was off-screen.
        if (entry.isIntersecting) calcCoords();
      },
      { threshold: 0.1 },
    );
    if (sectionRef?.current) observer.observe(sectionRef.current);

    return () => {
      window.removeEventListener("resize", calcCoords);
      clearTimeout(settleTimer);
      observer.disconnect();
    };
  }, []);

  useAnimationFrame((t) => {
    // Skip every frame when section is off-screen → zero lag while scrolling
    if (!ref.current || !coords.current || !isVisible.current) return;

    const cycle = 4500;
    const p = (t % cycle) / cycle;

    const { x0, y0, x1, y1 } = coords.current;

    const c1x = x0 - (x0 - x1) * 0.25;
    const c1y = y0 - 80;
    const c2x = x1 + (x0 - x1) * 0.2;
    const c2y = y1 - 350;

    const mt = 1 - p;
    const bx =
      mt * mt * mt * x0 +
      3 * mt * mt * p * c1x +
      3 * mt * p * p * c2x +
      p * p * p * x1;
    const by =
      mt * mt * mt * y0 +
      3 * mt * mt * p * c1y +
      3 * mt * p * p * c2y +
      p * p * p * y1;

    const tdx =
      3 * mt * mt * (c1x - x0) +
      6 * mt * p * (c2x - c1x) +
      3 * p * p * (x1 - c2x);
    const tdy =
      3 * mt * mt * (c1y - y0) +
      6 * mt * p * (c2y - c1y) +
      3 * p * p * (y1 - c2y);
    const angle = Math.atan2(tdy, tdx) * (180 / Math.PI) + 90;

    let opacity = 1;
    if (p < 0.06) opacity = p / 0.06;
    else if (p > 0.82) opacity = 1 - (p - 0.82) / 0.18;

    ref.current.style.transform = `translate(${bx}px, ${by}px) rotate(${angle}deg)`;
    ref.current.style.opacity = String(opacity);
  });

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 pointer-events-none select-none"
      style={{ zIndex: 6, marginLeft: "-9px", marginTop: "-16px" }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "-14px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "4px",
          height: "18px",
          background:
            "linear-gradient(to bottom, rgba(249,115,22,0.9), transparent)",
          borderRadius: "3px",
          filter: "blur(2px)",
        }}
      />
      <svg width="18" height="32" viewBox="0 0 28 48" fill="none">
        <path
          d="M14 2C14 2 22 12 22 26C22 34 18 40 14 46C10 40 6 34 6 26C6 12 14 2 14 2Z"
          fill="#22d3ee"
          opacity="0.92"
        />
        <path d="M6 30L1 40L8 37L6 30Z" fill="#3b82f6" opacity="0.85" />
        <path d="M22 30L27 40L20 37L22 30Z" fill="#3b82f6" opacity="0.85" />
        <circle
          cx="14"
          cy="21"
          r="4.5"
          fill="#060f24"
          stroke="#22d3ee"
          strokeWidth="1.5"
        />
        <path
          d="M11 46C11 46 12 53 14 55C16 53 17 46 17 46Z"
          fill="#f97316"
          opacity="1"
        />
      </svg>
    </div>
  );
};

/* ── Top-right decorative planet ── */
const DistantPlanet = () => (
  <div
    className="absolute pointer-events-none"
    id="big-planet"
    style={{ top: "4%", right: "5%" }}
  >
    <div
      className="absolute inset-0 rounded-full blur-2xl"
      style={{
        background:
          "radial-gradient(circle, rgba(59,130,246,0.25), transparent 70%)",
        transform: "scale(2)",
      }}
    />
    <div
      className="relative w-24 h-24 rounded-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #1e3a6e, #0f1f44 55%, #060c20)",
        border: "1px solid rgba(59,130,246,0.2)",
        boxShadow:
          "0 0 30px 6px rgba(59,130,246,0.12), inset 0 0 20px rgba(59,130,246,0.08)",
      }}
    >
      {[30, 48, 65].map((top, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${top}%`,
            background: `rgba(96,165,250,${i === 1 ? 0.2 : 0.08})`,
          }}
        />
      ))}
      <div
        className="absolute w-6 h-4 rounded-full"
        style={{ top: "35%", left: "25%", background: "rgba(59,130,246,0.25)" }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(96,165,250,0.18) 0%, transparent 55%)",
        }}
      />
    </div>
    <div
      className="absolute"
      style={{
        top: "50%",
        left: "50%",
        width: "110px",
        height: "22px",
        borderRadius: "50%",
        border: "1px solid rgba(59,130,246,0.2)",
        transform: "translate(-50%,-50%) rotateX(75deg)",
      }}
    />
  </div>
);

/* ── Main ── */
const About = () => {
  const sectionRef = useRef(null);
  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 py-24 px-6 overflow-hidden"
    >
      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400 pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
          }}
          transition={{
            duration: 6 / p.speed / 10,
            repeat: Infinity,
            delay: p.id * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}

      <DistantPlanet />

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 6 }}
      >
        <GuidedRocket sectionRef={sectionRef} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase mb-3">
            WHO I AM
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Me
            </span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full" />
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-16 -mt-4">
          <MissionCard />
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              I am a{" "}
              <span className="text-cyan-400 font-semibold">
                Full-Stack Developer
              </span>{" "}
              who doesn't just write code — I think through the product,
              understand the business goals behind it, and build complete
              digital products that solve real problems, scale with growth, and
              deliver real value.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              From pixel-perfect{" "}
              <span className="text-white font-medium">React</span> frontends
              to secure{" "}
              <span className="text-white font-medium">ASP.NET Core</span>{" "}
              backends and{" "}
              <span className="text-white font-medium">PostgreSQL</span>{" "}
              databases, I handle the entire development lifecycle with a strong
              focus on performance, clean architecture, maintainability, and
              user experience.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              I've built and deployed production-grade digital products across
              multiple domains — including{" "}
              <span className="text-white font-medium">E-Commerce</span>,{" "}
              <span className="text-white font-medium">SaaS</span>, and{" "}
              <span className="text-white font-medium">Healthcare</span> —
              delivering solutions that combine modern user experiences with
              robust backend systems and business-focused functionality.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Every project I build is designed to be scalable, maintainable,
              and ready for real-world use — from database design and
              authentication to SEO optimization, admin dashboards, and
              production deployment.
            </p>

            <div className="relative rounded-xl border border-cyan-500/15 bg-[#040d1a]/60 p-5 mb-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              <p className="text-cyan-400 text-xs font-mono tracking-widest uppercase mb-3">
                Launch Checklist
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "React frontends",
                  "ASP.NET Core APIs",
                  "PostgreSQL databases",
                  "Clean architecture",
                  "SEO optimization",
                  "Available for work →",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="text-cyan-400 text-xs font-mono">▸</span>
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.a
              href="https://www.linkedin.com/in/mohamed-elsayed1st/"
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              Connect on LinkedIn
            </motion.a>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="relative p-6 rounded-2xl border border-white/10 bg-[#0a0f1e] overflow-hidden group cursor-default"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px ${card.glow}30, 0 0 60px ${card.glow}10`;
                e.currentTarget.style.borderColor = `${card.glow}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: card.glow }}
              />
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${card.topLine} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}
              />
              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: card.iconBg,
                    border: `1px solid ${card.iconBorder}`,
                  }}
                >
                  <card.icon size={22} style={{ color: card.glow }} />
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
