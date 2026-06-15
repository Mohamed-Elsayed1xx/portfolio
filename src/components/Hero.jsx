import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const roles = [
  "Full-Stack Developer",
  "React · ASP.NET Core",
  "SEO & Web Specialist",
  "UI/UX Enthusiast",
];

const TypingText = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = roles[index % roles.length];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setText(current.slice(0, text.length + 1));
          if (text.length === current.length) {
            setTimeout(() => setDeleting(true), 1500);
          }
        } else {
          setText(current.slice(0, text.length - 1));
          if (text.length === 0) {
            setDeleting(false);
            setIndex((i) => i + 1);
          }
        }
      },
      deleting ? 40 : 80,
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <span className="text-cyan-400">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const RobotViewer = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector("script[data-spline-viewer]")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js";
      script.setAttribute("data-spline-viewer", "true");
      document.head.appendChild(script);
    }

    let viewer = null;
    let intersectionObserver = null;
    let removePointerListener = null;

    // Forward pointermove من أي مكان في الصفحة للروبوت — بس وقت ما
    // الهيرو نفسه ظاهر على الشاشة، عشان ما يفضلش شغال للأبد في كل الصفحة
    const attachPointerForwarding = () => {
      if (removePointerListener) return; // already attached
      const forwardPointer = (e) => {
        const canvas = viewer?.shadowRoot?.querySelector("canvas");
        if (canvas) {
          canvas.dispatchEvent(
            new PointerEvent("pointermove", {
              bubbles: true,
              clientX: e.clientX,
              clientY: e.clientY,
              pointerType: "mouse",
            }),
          );
        }
      };
      document.addEventListener("pointermove", forwardPointer);
      removePointerListener = () =>
        document.removeEventListener("pointermove", forwardPointer);
    };

    const detachPointerForwarding = () => {
      if (removePointerListener) {
        removePointerListener();
        removePointerListener = null;
      }
    };

    const timer = setTimeout(() => {
      if (
        containerRef.current &&
        !containerRef.current.querySelector("spline-viewer")
      ) {
        viewer = document.createElement("spline-viewer");
        viewer.setAttribute(
          "url",
          "https://prod.spline.design/8I1YsNAMZzAymxLl/scene.splinecode",
        );
        viewer.style.width = "100%";
        viewer.style.height = "100%";
        viewer.style.background = "transparent";
        containerRef.current.appendChild(viewer);

        // Hide "Built with Spline" button - polling every 200ms for 10s
        const hideInterval = setInterval(() => {
          const btn = viewer.shadowRoot?.querySelector("#logo");
          if (btn) {
            btn.style.cssText = "display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;";
            clearInterval(hideInterval);
          }
        }, 200);
        setTimeout(() => clearInterval(hideInterval), 10000);

        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) attachPointerForwarding();
            else detachPointerForwarding();
          },
          { threshold: 0 },
        );
        intersectionObserver.observe(containerRef.current);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      detachPointerForwarding();
      if (intersectionObserver) intersectionObserver.disconnect();
    };
  }, []);

  const handleWheel = (e) => {
    window.scrollBy({ top: e.deltaY, behavior: "auto" });
  };

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      onWheel={handleWheel}
    >
      <div ref={containerRef} className="w-full h-full" />
      {/* Cover Spline watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "288px",
          right: 0,
          height: "70px",
          width: "270px",
          background: "linear-gradient(to top, #020817 70%, transparent)",
          zIndex: 10,
          pointerEvents: "all",
          cursor: "default",
        }}
      />
    </div>
  );
};

const Hero = () => {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-sm font-medium mb-6"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Available for work
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3"
          >
            Hi, I am{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Mohamed
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl font-semibold text-gray-300 mb-5 h-9"
          >
            <TypingText />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-400 text-base max-w-lg mb-8 leading-relaxed"
          >
            I turn ideas into fast, scalable full-stack web applications — clean
            architecture, pixel-perfect UI, and real results. Specialized in
            React, ASP.NET Core, PostgreSQL, and SEO-optimized frontends.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-10"
          >
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View my projects"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              View My Work
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/mohamed-elsayed1st/"
              target="_blank"
              rel="noreferrer"
              aria-label="Connect with Mohamed on LinkedIn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-7 py-3 rounded-full border border-white/10 text-gray-300 font-semibold hover:bg-white/5 transition-all duration-300"
            >
              LinkedIn
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex gap-8 justify-center md:justify-start"
          >
            {[
              { number: "3+", label: "Projects Shipped" },
              { number: "10+", label: "Technologies" },
              { number: "1+", label: "Years Building" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right - Robot */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="flex-1 flex items-center justify-center"
          style={{ marginTop: "-220px" }}
        >
          <div
            className="relative w-[300px] h-[500px] md:w-[480px] md:h-[700px]"
            style={{ zIndex: 11 }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>
            <RobotViewer />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 border border-gray-600 rounded-full flex items-start justify-center pt-1"
        >
          <div className="w-1 h-2 bg-cyan-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
