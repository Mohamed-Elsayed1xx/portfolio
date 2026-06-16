import { useEffect, useRef, useState } from "react";

const AstronautViewer = () => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const faceRef = useRef(null);
  const armRef = useRef(null);

  // All animation state in refs — zero setState in RAF
  const stateRef = useRef({
    mouseX: 0, mouseY: 0,
    floatY: 0,
    waveAngle: 12,
    isHovered: false,
    elapsed: 0,
  });

  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animRef = useRef(null);
  const blinkRef = useRef(null);
  const startRef = useRef(Date.now());

  // RAF — only touches DOM directly, no setState
  useEffect(() => {
    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const floatY = Math.sin(elapsed * 1.2) * 10;
      const s = stateRef.current;
      const mx = s.mouseX;
      const my = s.mouseY;

      // SVG body float + lean
      if (svgRef.current) {
        svgRef.current.style.transform =
          `translateY(${floatY}px) translateX(${mx * 2.5}px)`;
      }

      // Face group translate
      if (faceRef.current) {
        const hx = mx * 5;
        const hy = my * 4;
        faceRef.current.setAttribute("transform", `translate(${hx},${hy})`);
      }

      // Arm wave
      if (armRef.current) {
        const targetAngle = s.isHovered
          ? -118 + Math.sin(elapsed * 6) * 18
          : 12;
        armRef.current.style.transition = s.isHovered ? "none" : "transform 0.55s cubic-bezier(0.34,1.4,0.64,1)";
        armRef.current.style.transform = `rotate(${targetAngle}deg)`;
      }
      // Fingers stay in sync with arm state (same condition, same frame)
      if (fingerGroupRestRef.current && fingerGroupOpenRef.current) {
        fingerGroupRestRef.current.style.display = s.isHovered ? "none" : "block";
        fingerGroupOpenRef.current.style.display = s.isHovered ? "block" : "none";
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Blinking — only this uses setState (infrequent)
  useEffect(() => {
    const scheduleBlink = () => {
      blinkRef.current = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => { setIsBlinking(false); scheduleBlink(); }, 130);
      }, 2500 + Math.random() * 3000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkRef.current);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      stateRef.current.mouseX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 0.7)));
      stateRef.current.mouseY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 0.7)));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleEnter = () => {
    setIsHovered(true);
    stateRef.current.isHovered = true;
  };
  const handleLeave = () => {
    setIsHovered(false);
    stateRef.current.isHovered = false;
  };

  // Eye pupils — driven by mousePos via direct DOM in RAF would be complex,
  // so we do a lightweight approach: update eyes via refs
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftIrisRef = useRef(null);
  const rightIrisRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftShineRef = useRef(null);
  const rightShineRef = useRef(null);
  const smileRef = useRef(null);
  const leftBlushRef = useRef(null);
  const rightBlushRef = useRef(null);
  const fingerGroupRestRef = useRef(null);
  const fingerGroupOpenRef = useRef(null);

  // Second RAF pass for eye/face details
  useEffect(() => {
    let rafId;
    const updateFaceDetails = () => {
      const s = stateRef.current;
      const ex = s.mouseX * 3.2;
      const ey = s.mouseY * 2.2;

      const setEye = (el, baseCx, baseCy) => {
        if (!el) return;
        el.setAttribute("cx", baseCx + ex);
        el.setAttribute("cy", baseCy + ey);
      };

      setEye(leftIrisRef.current,  117, 120);
      setEye(leftPupilRef.current, 117, 120);
      setEye(leftShineRef.current, 119, 118);
      setEye(rightIrisRef.current,  183, 120);
      setEye(rightPupilRef.current, 183, 120);
      setEye(rightShineRef.current, 185, 118);

      // Smile path
      if (smileRef.current) {
        smileRef.current.setAttribute("d",
          s.isHovered
            ? "M122 148 Q150 170 178 148"
            : "M128 148 Q150 160 172 148"
        );
      }
      // Blush opacity
      if (leftBlushRef.current)  leftBlushRef.current.setAttribute("opacity", s.isHovered ? "1" : "0");
      if (rightBlushRef.current) rightBlushRef.current.setAttribute("opacity", s.isHovered ? "1" : "0");

      rafId = requestAnimationFrame(updateFaceDetails);
    };
    rafId = requestAnimationFrame(updateFaceDetails);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
               justifyContent:"center", position:"relative", overflow:"visible" }}
    >
      {/* Ambient glow */}
      <div style={{ position:"absolute", width:"260px", height:"260px", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
        filter:"blur(40px)", pointerEvents:"none" }} />

      {/* Twinkling stars */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + 0.3;
        const r = 148 + Math.sin(i * 1.9) * 28;
        return <div key={i} style={{
          position:"absolute", borderRadius:"50%",
          width:i%2?"2px":"3px", height:i%2?"2px":"3px",
          background:"rgba(34,211,238,0.85)",
          left:`calc(50% + ${Math.cos(angle)*r}px)`,
          top:`calc(50% + ${Math.sin(angle)*r}px)`,
          boxShadow:"0 0 5px rgba(34,211,238,0.9)",
          animation:`twinkle ${1.4+i*0.38}s ${i*0.18}s ease-in-out infinite alternate`,
          pointerEvents:"none",
        }}/>;
      })}

      <svg
        ref={svgRef}
        width="300" height="500" viewBox="0 0 300 500"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{
          willChange:"transform",
          filter:"drop-shadow(0 0 18px rgba(34,211,238,0.14))",
          overflow:"visible",
        }}
      >
        <defs>
          <linearGradient id="suit" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#ddeef6"/>
            <stop offset="55%"  stopColor="#b8d0e0"/>
            <stop offset="100%" stopColor="#7a9fb5"/>
          </linearGradient>
          <linearGradient id="shade" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)"/>
          </linearGradient>
          <linearGradient id="boot" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7a9fb5"/>
            <stop offset="100%" stopColor="#4a6a80"/>
          </linearGradient>
          <linearGradient id="pack" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#9ab8c8"/>
            <stop offset="100%" stopColor="#5a7a90"/>
          </linearGradient>
          <linearGradient id="cyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
          {/* Visor: dark but not opaque black so eyes show */}
          <radialGradient id="visor" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#0d1f3a"/>
            <stop offset="100%" stopColor="#05101e"/>
          </radialGradient>
          <filter id="glow"     x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softglow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Clip visor so face stays inside */}
          <clipPath id="visorClip">
            <ellipse cx="150" cy="122" rx="55" ry="51"/>
          </clipPath>
        </defs>

        {/* ── BOOT SOLES (drawn first, behind everything) ── */}
        <ellipse cx="124" cy="448" rx="28" ry="9"  fill="#305060"/>
        <ellipse cx="176" cy="448" rx="28" ry="9"  fill="#305060"/>

        {/* ── LEGS ── connect to torso bottom (torso ends ~y=353) */}
        {/* Left leg */}
        <rect x="104" y="335" width="46" height="90" rx="22" fill="url(#suit)"/>
        <rect x="104" y="335" width="46" height="90" rx="22" fill="url(#shade)"/>
        <rect x="110" y="372" width="34" height="5"  rx="2.5" fill="rgba(34,211,238,0.65)"/>
        {/* Left boot upper */}
        <ellipse cx="127" cy="426" rx="28" ry="15" fill="url(#boot)"/>
        <ellipse cx="127" cy="426" rx="28" ry="15" fill="url(#shade)"/>

        {/* Right leg */}
        <rect x="150" y="335" width="46" height="90" rx="22" fill="url(#suit)"/>
        <rect x="150" y="335" width="46" height="90" rx="22" fill="url(#shade)"/>
        <rect x="156" y="372" width="34" height="5"  rx="2.5" fill="rgba(34,211,238,0.65)"/>
        {/* Right boot upper */}
        <ellipse cx="173" cy="426" rx="28" ry="15" fill="url(#boot)"/>
        <ellipse cx="173" cy="426" rx="28" ry="15" fill="url(#shade)"/>

        {/* ── TORSO ── */}
        <rect x="88" y="200" width="124" height="155" rx="36" fill="url(#suit)"/>
        <rect x="88" y="200" width="124" height="155" rx="36" fill="url(#shade)"/>

        {/* Backpack PLSS */}
        <rect x="66" y="210" width="24" height="100" rx="12" fill="url(#pack)"/>
        <rect x="70" y="228" width="16" height="6"   rx="3"  fill="rgba(34,211,238,0.8)"/>
        <rect x="70" y="241" width="16" height="6"   rx="3"  fill="rgba(59,130,246,0.8)"/>
        <rect x="70" y="255" width="16" height="4"   rx="2"  fill="rgba(255,255,255,0.3)"/>
        <rect x="70" y="265" width="16" height="4"   rx="2"  fill="rgba(255,255,255,0.3)"/>
        <rect x="70" y="276" width="16" height="4"   rx="2"  fill="rgba(255,255,255,0.2)"/>

        {/* Chest panel */}
        <rect x="108" y="224" width="84" height="64" rx="14"
              fill="rgba(255,255,255,0.09)" stroke="rgba(34,211,238,0.38)" strokeWidth="1.5"/>
        <circle cx="124" cy="242" r="6"  fill="rgba(34,211,238,0.95)" filter="url(#glow)"/>
        <circle cx="144" cy="242" r="6"  fill="rgba(59,130,246,0.95)"  filter="url(#glow)"/>
        <circle cx="164" cy="242" r="6"  fill="rgba(167,139,250,0.95)" filter="url(#glow)"/>
        <rect x="116" y="257" width="68" height="4" rx="2" fill="rgba(34,211,238,0.45)"/>
        <rect x="116" y="267" width="50" height="4" rx="2" fill="rgba(255,255,255,0.18)"/>
        <rect x="116" y="277" width="36" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>

        {/* Torso stripes */}
        <rect x="88"  y="308" width="124" height="9" rx="4.5" fill="url(#cyan)" opacity="0.8"/>
        <rect x="88"  y="321" width="124" height="4" rx="2"   fill="rgba(59,130,246,0.45)"/>

        {/* ── LEFT ARM (static, hangs naturally) ── */}
        <rect x="58"  y="210" width="34"  height="76" rx="16" fill="url(#suit)"/>
        <rect x="58"  y="210" width="34"  height="76" rx="16" fill="url(#shade)"/>
        <rect x="58"  y="274" width="34"  height="7"  rx="3.5" fill="url(#cyan)" opacity="0.75"/>
        <ellipse cx="75" cy="298" rx="18" ry="13" fill="url(#boot)"/>
        <ellipse cx="75" cy="298" rx="18" ry="13" fill="url(#shade)"/>
        {/* Left fingers */}
        <ellipse cx="66" cy="306" rx="5" ry="7" fill="#4a6a80"/>
        <ellipse cx="75" cy="309" rx="5" ry="7" fill="#4a6a80"/>
        <ellipse cx="84" cy="306" rx="5" ry="7" fill="#4a6a80"/>

        {/* ── RIGHT ARM (waving) — pivot top of arm = (208, 218) ── */}
        <g
          ref={armRef}
          style={{
            transformOrigin: "208px 218px",
            transform: "rotate(12deg)",
            willChange: "transform",
          }}
        >
          <rect x="208" y="210" width="34"  height="76" rx="16" fill="url(#suit)"/>
          <rect x="208" y="210" width="34"  height="76" rx="16" fill="url(#shade)"/>
          <rect x="208" y="274" width="34"  height="7"  rx="3.5" fill="url(#cyan)" opacity="0.75"/>
          <ellipse cx="225" cy="298" rx="18" ry="13" fill="url(#boot)"/>
          <ellipse cx="225" cy="298" rx="18" ry="13" fill="url(#shade)"/>
          {/* Fingers: both groups always rendered, visibility toggled via ref in RAF (synced with arm) */}
          <g ref={fingerGroupOpenRef} style={{ display: "none" }}>
            <rect x="211" y="285" width="8" height="20" rx="4" fill="#4a6a80"/>
            <rect x="221" y="282" width="8" height="23" rx="4" fill="#4a6a80"/>
            <rect x="231" y="284" width="8" height="21" rx="4" fill="#4a6a80"/>
            <rect x="216" y="299" width="8" height="15" rx="4" fill="#4a6a80" transform="rotate(18,220,306)"/>
          </g>
          <g ref={fingerGroupRestRef} style={{ display: "block" }}>
            <ellipse cx="216" cy="307" rx="5" ry="7" fill="#4a6a80"/>
            <ellipse cx="225" cy="310" rx="5" ry="7" fill="#4a6a80"/>
            <ellipse cx="234" cy="307" rx="5" ry="7" fill="#4a6a80"/>
          </g>
        </g>

        {/* ── NECK ── */}
        <rect x="126" y="186" width="48" height="26" rx="12" fill="url(#suit)"/>
        <rect x="122" y="198" width="56" height="8"  rx="4"  fill="url(#cyan)" opacity="0.55"/>

        {/* ── HELMET SHELL ── */}
        <circle cx="150" cy="122" r="86" fill="url(#suit)"/>
        <circle cx="150" cy="122" r="86" fill="url(#shade)"/>
        <circle cx="150" cy="122" r="86" fill="none" stroke="rgba(34,211,238,0.2)"  strokeWidth="2"/>
        <circle cx="150" cy="122" r="79" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>

        {/* ── VISOR ── */}
        <ellipse cx="150" cy="122" rx="55" ry="51" fill="url(#visor)"/>
        {/* Stars inside visor */}
        {[[125,100],[174,96],[131,146],[170,140],[158,108],[138,118],[177,128],[119,133],[161,156],[144,93]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i%3===0?1.2:0.7}
                  fill="white" opacity={0.25+i%4*0.12}/>
        ))}

        {/* ── FACE — clipped inside visor, moves with mouse ── */}
        <g ref={faceRef} clipPath="url(#visorClip)">
          {/* Left eye sclera */}
          <ellipse cx="117" cy="120" rx="11" ry={isBlinking ? 1 : 8} fill="white"/>
          {!isBlinking && <>
            <ellipse ref={leftIrisRef}  cx="117" cy="120" rx="6.5" ry="6.5" fill="#1a90c0"/>
            <ellipse ref={leftPupilRef} cx="117" cy="120" rx="3.5" ry="3.5" fill="#060f20"/>
            <circle  ref={leftShineRef} cx="119" cy="118" r="2"   fill="white" opacity="0.95"/>
            <circle cx="114" cy="122" r="1" fill="white" opacity="0.35"/>
          </>}
          {isBlinking && <ellipse cx="117" cy="120" rx="11" ry="1.2" fill="#b8d0e0"/>}

          {/* Right eye sclera */}
          <ellipse cx="183" cy="120" rx="11" ry={isBlinking ? 1 : 8} fill="white"/>
          {!isBlinking && <>
            <ellipse ref={rightIrisRef}  cx="183" cy="120" rx="6.5" ry="6.5" fill="#1a90c0"/>
            <ellipse ref={rightPupilRef} cx="183" cy="120" rx="3.5" ry="3.5" fill="#060f20"/>
            <circle  ref={rightShineRef} cx="185" cy="118" r="2"   fill="white" opacity="0.95"/>
            <circle cx="180" cy="122" r="1" fill="white" opacity="0.35"/>
          </>}
          {isBlinking && <ellipse cx="183" cy="120" rx="11" ry="1.2" fill="#b8d0e0"/>}

          {/* Eyebrows */}
          <path d="M107 108 Q117 101 127 108" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M173 108 Q183 101 193 108" stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

          {/* Smile */}
          <path ref={smileRef}
            d="M128 148 Q150 160 172 148"
            stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.88"/>

          {/* Blush — shown on hover */}
          <ellipse ref={leftBlushRef}  cx="108" cy="138" rx="11" ry="7" fill="rgba(255,140,140,0.2)" opacity="0"/>
          <ellipse ref={rightBlushRef} cx="192" cy="138" rx="11" ry="7" fill="rgba(255,140,140,0.2)" opacity="0"/>
        </g>

        {/* Visor glass shine — on top of face */}
        <ellipse cx="126" cy="94"  rx="26" ry="17" fill="rgba(255,255,255,0.1)"/>
        <ellipse cx="118" cy="88"  rx="13" ry="7"  fill="rgba(255,255,255,0.07)"/>

        {/* Visor border */}
        <ellipse cx="150" cy="122" rx="55" ry="51" fill="none"
                 stroke="rgba(34,211,238,0.55)" strokeWidth="2.5"/>
        <ellipse cx="150" cy="122" rx="55" ry="51" fill="none"
                 stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5 8"/>

        {/* Helmet side bars */}
        <rect x="65" y="98"  width="12" height="46" rx="6" fill="rgba(255,255,255,0.13)"/>
        <rect x="223" y="98" width="12" height="46" rx="6" fill="rgba(255,255,255,0.13)"/>
        {/* Side lights */}
        <circle cx="71"  cy="96" r="7" fill="rgba(34,211,238,0.75)" filter="url(#softglow)"/>
        <circle cx="229" cy="96" r="7" fill="rgba(34,211,238,0.75)" filter="url(#softglow)"/>

        {/* Antenna */}
        <line x1="150" y1="36" x2="150" y2="14"
              stroke="rgba(200,220,232,0.88)" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="150" cy="10" r="7.5" fill="rgba(34,211,238,0.95)" filter="url(#softglow)"/>
        <circle cx="150" cy="10" r="3.5" fill="white"/>

        {/* Shadow */}
        <ellipse cx="150" cy="460" rx="70" ry="8" fill="rgba(0,0,0,0.18)"/>
      </svg>

      {/* Hi bubble */}
      {isHovered && (
        <div style={{
          position:"absolute", top:"5%", right:"1%",
          background:"rgba(4,8,20,0.92)",
          border:"1px solid rgba(34,211,238,0.55)",
          borderRadius:"14px", padding:"9px 18px",
          color:"#22d3ee", fontSize:"13px",
          fontFamily:"monospace", fontWeight:"700",
          letterSpacing:"0.1em",
          backdropFilter:"blur(12px)",
          boxShadow:"0 0 28px rgba(34,211,238,0.22)",
          pointerEvents:"none", whiteSpace:"nowrap",
          animation:"fadeUp 0.28s ease forwards",
        }}>
          👋 Hi there!
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          from { opacity:0.2; transform:scale(0.7); }
          to   { opacity:1;   transform:scale(1.3); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0);   }
        }
      `}</style>
    </div>
  );
};

export default AstronautViewer;
