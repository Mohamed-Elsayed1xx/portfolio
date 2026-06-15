import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../constants";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Clear the active link when back at the hero, before the first
      // tracked section — the IntersectionObserver below only fires
      // for #about/#skills/#projects/#contact, so it can't "un-set"
      // active on its own when scrolling back to the top.
      const firstSection = document.getElementById(navLinks[0]?.id);
      if (firstSection) {
        const triggerPoint = firstSection.offsetTop - window.innerHeight * 0.55;
        if (window.scrollY < triggerPoint) {
          setActive("");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy: automatically highlight the nav link for the section
  // currently in view, instead of relying only on click state.
  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050816]/90 backdrop-blur-md shadow-lg shadow-cyan-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="#"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
          className="group relative flex items-center gap-1.5"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Dot pulse */}
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)] animate-pulse" />
          {/* Name */}
          <span className="text-white font-bold text-xl tracking-wide">
            Mohamed
          </span>
          {/* Gradient underline on hover */}
          <span
            className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
            style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
          />
        </motion.a>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <li key={link.id} className="relative group">
              <a
                href={`#${link.id}`}
                onClick={() => setActive(link.id)}
                className={`relative inline-block px-3 py-1.5 rounded-md text-sm font-medium overflow-hidden transition-colors duration-200 ${
                  active === link.id
                    ? "text-cyan-400"
                    : "text-gray-300 hover:text-cyan-400"
                }`}
              >
                {/* Beam shine — sweeps left to right on hover (pure CSS, no JS listeners) */}
                <span
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 35%, rgba(6,182,212,0.25) 50%, transparent 65%)",
                  }}
                />

                {link.title}

                {/* Underline */}
                <span
                  className={`absolute bottom-0 left-0 h-px transition-all duration-300 ${
                    active === link.id ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  style={{
                    background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                  }}
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1 group cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-gray-300 group-hover:bg-cyan-400 transition-colors duration-200 rounded-full"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
            className="block w-6 h-0.5 bg-gray-300 group-hover:bg-cyan-400 transition-colors duration-200 rounded-full"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-gray-300 group-hover:bg-cyan-400 transition-colors duration-200 rounded-full"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#050816]/95 backdrop-blur-md px-6 pb-6 flex flex-col gap-4 border-t border-white/5"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setActive(link.id);
                  setMenuOpen(false);
                }}
                className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                  active === link.id ? "text-cyan-400" : "text-gray-300"
                }`}
              >
                {link.title}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
