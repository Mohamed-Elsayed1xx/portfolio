import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { projects } from "../constants";

const GitHubIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

/* ── Scan line overlay on the image ── */
const ScanLines = () => (
  <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-2xl">
    {/* horizontal scan lines */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
      }}
    />
    {/* moving scan beam */}
    <motion.div
      animate={{ top: ["-10%", "110%"] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 1.5,
      }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: "3px",
        background:
          "linear-gradient(to bottom, transparent, rgba(6,182,212,0.25), transparent)",
        filter: "blur(1px)",
      }}
    />
  </div>
);

/* ── Corner HUD brackets ── */
const HUDBrackets = ({ color }) => (
  <>
    {[
      { top: 8, left: 8, bt: true, bl: true, br: false, bb: false },
      { top: 8, right: 8, bt: true, bl: false, br: true, bb: false },
      { bottom: 8, left: 8, bt: false, bl: true, br: false, bb: true },
      { bottom: 8, right: 8, bt: false, bl: false, br: true, bb: true },
    ].map((c, i) => (
      <div
        key={i}
        className="absolute w-5 h-5 z-20 pointer-events-none"
        style={{
          top: c.top,
          bottom: c.bottom,
          left: c.left,
          right: c.right,
          borderTop: c.bt ? `1.5px solid ${color}` : "none",
          borderBottom: c.bb ? `1.5px solid ${color}` : "none",
          borderLeft: c.bl ? `1.5px solid ${color}` : "none",
          borderRight: c.br ? `1.5px solid ${color}` : "none",
          opacity: 0.7,
        }}
      />
    ))}
  </>
);

const Projects = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index) => {
    setDirection(index > active ? 1 : -1);
    setActive(index);
  };
  const goNext = () => goTo((active + 1) % projects.length);
  const goPrev = () => goTo((active - 1 + projects.length) % projects.length);

  const project = projects[active];
  const color = project.color;

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -80 : 80,
      transition: { duration: 0.35 },
    }),
  };

  const infoVariants = {
    enter: () => ({ opacity: 0, y: 30 }),
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <section id="projects" className="relative z-10 py-24 px-6 overflow-hidden">
      {/* Nebula background glow — changes per project */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`nebula-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* main nebula */}
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: "60%",
              background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
          {/* side accent */}
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "-5%",
              width: "40%",
              height: "80%",
              background: `radial-gradient(ellipse at center, ${color}05 0%, transparent 60%)`,
              filter: "blur(60px)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-xs font-mono tracking-[0.3em] uppercase mb-3">
            WHAT I BUILT
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            My{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-4" />
          <p className="text-gray-500 text-sm font-mono">
            3 full-stack missions — built from scratch, deployed live
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[520px]">
          {/* Left — Mission Screen */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`img-${active}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Outer nebula glow */}
                <div
                  className="absolute -inset-4 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, ${color}20 0%, transparent 70%)`,
                    filter: "blur(20px)",
                  }}
                />

                {/* Screen frame */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: `1px solid ${color}25`,
                    boxShadow: `0 0 0 1px ${color}10, 0 20px 60px ${color}20`,
                    transition: "box-shadow 0.4s ease, border-color 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${color}30, 0 30px 80px ${color}35`;
                    e.currentTarget.style.borderColor = `${color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${color}10, 0 20px 60px ${color}20`;
                    e.currentTarget.style.borderColor = `${color}25`;
                  }}
                >
                  {/* Top color sweep */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px z-10"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    }}
                  />

                  {/* Image */}
                  <motion.img
                    src={project.image}
                    alt={project.name}
                    initial={{ scale: 1.06 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="w-full h-80 object-cover object-top"
                  />

                  {/* Scan lines overlay */}
                  <ScanLines />

                  {/* Bottom fade */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(3,8,18,0.7), transparent)",
                    }}
                  />

                  {/* Targeting reticle — top-right corner detail */}
                  <div
                    className="absolute top-4 right-14 z-20 pointer-events-none opacity-40"
                    style={{ color }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle
                        cx="10"
                        cy="10"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                      <line
                        x1="10"
                        y1="0"
                        x2="10"
                        y2="6"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                      <line
                        x1="10"
                        y1="14"
                        x2="10"
                        y2="20"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                      <line
                        x1="0"
                        y1="10"
                        x2="6"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                      <line
                        x1="14"
                        y1="10"
                        x2="20"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                    </svg>
                  </div>

                  {/* Mission counter — HUD style */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: color }}
                    />
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color }}
                    >
                      MISSION {String(project.id).padStart(2, "0")} /{" "}
                      {String(projects.length).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Live badge */}
                  <div
                    className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.7)",
                      border: "1px solid rgba(74,222,128,0.3)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-mono font-semibold">
                      ONLINE
                    </span>
                  </div>

                  {/* Bottom HUD — tech stack preview */}
                  <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{
                            background: `${color}18`,
                            color: `${color}cc`,
                            border: `1px solid ${color}20`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Right — Mission Briefing */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`info-${active}`}
              custom={direction}
              variants={infoVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col gap-5"
            >
              {/* Mission label */}
              <div>
                <p
                  className="text-xs font-mono font-bold tracking-[0.2em] uppercase mb-3 flex items-center gap-2"
                  style={{ color }}
                >
                  <span className="opacity-50">▸▸</span>
                  {project.tagline}
                </p>
                <h3 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                  {project.name}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {project.description}
                </p>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full"
                style={{
                  background: `linear-gradient(90deg, ${color}40, transparent)`,
                }}
              />

              {/* Mission objectives — no label */}
              <div>
                <div className="grid grid-cols-1 gap-2">
                  {project.features.map((feature, i) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.07 }}
                      className="flex items-center gap-3 group/item cursor-default"
                    >
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-gray-400 text-sm group-hover/item:text-gray-200 transition-colors duration-150">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-mono cursor-default"
                    style={{
                      background: `${color}10`,
                      border: `1px solid ${color}25`,
                      color,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${color}22`;
                      e.currentTarget.style.borderColor = `${color}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `${color}10`;
                      e.currentTarget.style.borderColor = `${color}25`;
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Launch buttons */}
              <div className="flex gap-3 pt-1">
                <motion.a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${color}cc, ${color})`,
                    boxShadow: `0 8px 25px ${color}35`,
                    transition: "box-shadow 0.2s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 35px ${color}55`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 25px ${color}35`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <ExternalLink size={14} />
                  Live Demo
                </motion.a>
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold"
                  style={{
                    border: `1px solid ${color}35`,
                    color,
                    transition:
                      "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${color}15`;
                    e.currentTarget.style.borderColor = `${color}60`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = `${color}35`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <GitHubIcon size={14} color={color} />
                  GitHub
                </motion.a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — HUD targeting style */}
        <div className="flex items-center justify-center gap-6 mt-14">
          {/* Prev — HUD left arrow */}
          <motion.button
            onClick={goPrev}
            whileTap={{ scale: 0.9 }}
            className="relative w-11 h-11 flex items-center justify-center"
            style={{ transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              {/* outer square corners */}
              <path
                d="M2 10 L2 2 L10 2"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M34 2 L42 2 L42 10"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M2 34 L2 42 L10 42"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M34 42 L42 42 L42 34"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              {/* arrow */}
              <path
                d="M26 14 L16 22 L26 30"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          {/* Dots */}
          <div className="flex items-center gap-3">
            {projects.map((p, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active === i ? 28 : 8,
                  height: 8,
                  background: active === i ? p.color : "rgba(255,255,255,0.15)",
                  boxShadow: active === i ? `0 0 12px ${p.color}80` : "none",
                }}
              />
            ))}
          </div>

          {/* Next — HUD right arrow */}
          <motion.button
            onClick={goNext}
            whileTap={{ scale: 0.9 }}
            className="relative w-11 h-11 flex items-center justify-center opacity-50"
            style={{ transition: "opacity 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M2 10 L2 2 L10 2"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M34 2 L42 2 L42 10"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M2 34 L2 42 L10 42"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <path
                d="M34 42 L42 42 L42 34"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              {/* arrow */}
              <path
                d="M18 14 L28 22 L18 30"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
