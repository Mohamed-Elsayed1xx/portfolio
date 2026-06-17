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
    isHovered: false,
    elapsed: 0,
    currentArmAngle: 12, // smoothed current angle (lerped toward target)
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

      // Arm wave — smooth lerp toward target, oscillate only once mostly raised
      if (armRef.current) {
        const restAngle = 12;
        const raisedBase = -110;
        const targetBase = s.isHovered ? raisedBase : restAngle;

        // Lerp current angle toward target base (smooth raise/lower, no CSS transition fight)
        const lerpSpeed = s.isHovered ? 0.12 : 0.09;
        s.currentArmAngle += (targetBase - s.currentArmAngle) * lerpSpeed;

        // Add oscillation only when close to raised position (natural wave wobble)
        const raiseProgress = s.isHovered
          ? Math.min(1, Math.abs(s.currentArmAngle - restAngle) / Math.abs(raisedBase - restAngle))
          : 0;
        const wobble = s.isHovered ? Math.sin(elapsed * 4.5) * 14 * raiseProgress : 0;

        armRef.current.style.transform = `rotate(${s.currentArmAngle + wobble}deg)`;
      }
      // Fingers stay constant — no toggle needed anymore

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
          {/* Helmet rim — thick metallic ring around visor */}
          <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#f4fafd"/>
            <stop offset="35%"  stopColor="#c5dae6"/>
            <stop offset="70%"  stopColor="#8aa8b8"/>
            <stop offset="100%" stopColor="#5e7e90"/>
          </linearGradient>
          {/* Helmet dome top highlight */}
          <radialGradient id="domeShine" cx="32%" cy="22%" r="45%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.55)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
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
            <ellipse cx="150" cy="124" rx="54" ry="50"/>
          </clipPath>
        </defs>

        {/* ── BOOT SOLES (drawn first, behind everything) ── */}
        <ellipse cx="115" cy="448" rx="22" ry="6"  fill="rgba(0,0,0,0.18)"/>
        <ellipse cx="185" cy="448" rx="22" ry="6"  fill="rgba(0,0,0,0.18)"/>

        {/* ── LEGS ── connect to torso bottom (torso ends ~y=353), clearly separated by gap */}
        {/* Left leg */}
        <rect x="100" y="335" width="38" height="80" rx="19" fill="url(#suit)"/>
        <rect x="100" y="335" width="38" height="80" rx="19" fill="url(#shade)"/>
        <rect x="105" y="370" width="28" height="5"  rx="2.5" fill="rgba(34,211,238,0.65)"/>
        {/* Left boot ankle cuff */}
        <rect x="101" y="392" width="36" height="16" rx="8" fill="url(#boot)"/>
        <rect x="101" y="392" width="36" height="16" rx="8" fill="url(#shade)" opacity="0.4"/>
        {/* Left foot — distinct shoe shape, toe pointing forward-left, clear gap from right foot */}
        <path d="M94 406
                 Q94 400 102 400
                 L130 400
                 Q138 401 140 408
                 L142 421
                 Q143 431 132 432
                 L97 432
                 Q88 431 88 421
                 Z"
              fill="url(#boot)"/>
        <path d="M94 406
                 Q94 400 102 400
                 L130 400
                 Q138 401 140 408
                 L142 421
                 Q143 431 132 432
                 L97 432
                 Q88 431 88 421
                 Z"
              fill="url(#shade)" opacity="0.5"/>
        {/* Toe cap highlight */}
        <path d="M130 401 Q138 402 140 409 L142 419 Q137 414 131 413 Z" fill="rgba(255,255,255,0.15)"/>
        {/* Sole */}
        <rect x="86" y="426" width="58" height="7" rx="3.5" fill="#2a4452"/>

        {/* Right leg — mirrored, with clear gap from left leg */}
        <rect x="162" y="335" width="38" height="80" rx="19" fill="url(#suit)"/>
        <rect x="162" y="335" width="38" height="80" rx="19" fill="url(#shade)"/>
        <rect x="167" y="370" width="28" height="5"  rx="2.5" fill="rgba(34,211,238,0.65)"/>
        {/* Right boot ankle cuff */}
        <rect x="163" y="392" width="36" height="16" rx="8" fill="url(#boot)"/>
        <rect x="163" y="392" width="36" height="16" rx="8" fill="url(#shade)" opacity="0.4"/>
        {/* Right foot — mirrored shoe shape */}
        <path d="M206 406
                 Q206 400 198 400
                 L170 400
                 Q162 401 160 408
                 L158 421
                 Q157 431 168 432
                 L203 432
                 Q212 431 212 421
                 Z"
              fill="url(#boot)"/>
        <path d="M206 406
                 Q206 400 198 400
                 L170 400
                 Q162 401 160 408
                 L158 421
                 Q157 431 168 432
                 L203 432
                 Q212 431 212 421
                 Z"
              fill="url(#shade)" opacity="0.5"/>
        {/* Toe cap highlight */}
        <path d="M170 401 Q162 402 160 409 L158 419 Q163 414 169 413 Z" fill="rgba(255,255,255,0.15)"/>
        {/* Sole */}
        <rect x="156" y="426" width="58" height="7" rx="3.5" fill="#2a4452"/>

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
        <rect x="58"  y="210" width="34"  height="80" rx="16" fill="url(#suit)"/>
        <rect x="58"  y="210" width="34"  height="80" rx="16" fill="url(#shade)"/>
        <rect x="58"  y="274" width="34"  height="7"  rx="3.5" fill="url(#cyan)" opacity="0.75"/>
        {/* Left hand — relaxed fist, side-profile perspective (matches right hand style) */}
        <g>
          {/* Fist — oval shape */}
          <ellipse cx="75" cy="298" rx="15" ry="17" fill="url(#boot)"/>
          <ellipse cx="75" cy="298" rx="15" ry="17" fill="url(#shade)" opacity="0.35"/>
          {/* Knuckle ridge */}
          <path d="M62 292 Q75 286 88 292" stroke="#3d5d72" strokeWidth="5" strokeLinecap="round" fill="none"/>
          {/* Finger separation creases */}
          <line x1="69" y1="296" x2="69" y2="306" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
          <line x1="75" y1="294" x2="75" y2="307" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
          <line x1="81" y1="296" x2="81" y2="306" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
        </g>

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

          {/* Right hand — same relaxed fist shape always (matches left hand style), no finger-spread complexity */}
          <g>
            {/* Fist — side-profile perspective, oval shape rotated slightly for natural wrist angle */}
            <ellipse cx="225" cy="298" rx="15" ry="17" fill="url(#boot)"/>
            <ellipse cx="225" cy="298" rx="15" ry="17" fill="url(#shade)" opacity="0.35"/>
            {/* Knuckle ridge — curved line across top of fist */}
            <path d="M212 292 Q225 286 238 292" stroke="#3d5d72" strokeWidth="5" strokeLinecap="round" fill="none"/>
            {/* Finger separation creases */}
            <line x1="219" y1="296" x2="219" y2="306" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
            <line x1="225" y1="294" x2="225" y2="307" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
            <line x1="231" y1="296" x2="231" y2="306" stroke="#2a4452" strokeWidth="1.1" opacity="0.45"/>
          </g>
        </g>

        {/* ── NECK ── */}
        <rect x="126" y="186" width="48" height="26" rx="12" fill="url(#suit)"/>
        <rect x="122" y="198" width="56" height="8"  rx="4"  fill="url(#cyan)" opacity="0.55"/>

        {/* ── HELMET SHELL ── slightly smaller, more proportional to body */}
        <circle cx="150" cy="124" r="80" fill="url(#suit)"/>
        <circle cx="150" cy="124" r="80" fill="url(#shade)"/>
        {/* Dome top-light glass shine sweep */}
        <ellipse cx="150" cy="124" rx="80" ry="80" fill="url(#domeShine)" opacity="0.5"/>
        {/* Outer rim ring — thick, metallic, gives helmet real depth */}
        <circle cx="150" cy="124" r="80" fill="none" stroke="url(#rim)" strokeWidth="6"/>
        <circle cx="150" cy="124" r="80" fill="none" stroke="rgba(20,40,55,0.35)" strokeWidth="1.5"/>
        <circle cx="150" cy="124" r="73" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>

        {/* ── VISOR RIM — raised metallic collar around the glass ── */}
        <ellipse cx="150" cy="124" rx="60" ry="56" fill="url(#rim)"/>
        <ellipse cx="150" cy="124" rx="60" ry="56" fill="url(#shade)" opacity="0.4"/>

        {/* ── VISOR GLASS ── slightly inset from rim for depth */}
        <ellipse cx="150" cy="124" rx="54" ry="50" fill="url(#visor)"/>
        {/* Stars inside visor */}
        {[[126,102],[173,98],[132,147],[169,141],[157,109],[139,119],[176,129],[121,134],[160,156],[145,95]].map(([x,y],i)=>(
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

          {/* Blush — subtle, shown on hover */}
          <ellipse ref={leftBlushRef}  cx="108" cy="138" rx="10" ry="6" fill="rgba(255,150,150,0.12)" opacity="0"/>
          <ellipse ref={rightBlushRef} cx="192" cy="138" rx="10" ry="6" fill="rgba(255,150,150,0.12)" opacity="0"/>
        </g>

        {/* Visor glass shine — on top of face */}
        <ellipse cx="127" cy="96"  rx="25" ry="16" fill="rgba(255,255,255,0.12)"/>
        <ellipse cx="119" cy="90"  rx="12" ry="6"  fill="rgba(255,255,255,0.08)"/>

        {/* Visor inner glass edge — subtle bevel for depth */}
        <ellipse cx="150" cy="124" rx="54" ry="50" fill="none"
                 stroke="rgba(34,211,238,0.5)" strokeWidth="2"/>
        <ellipse cx="150" cy="124" rx="57.5" ry="53.5" fill="none"
                 stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>

        {/* Helmet side hardware — communication units, more 3D looking */}
        <rect x="62" y="102" width="13" height="44" rx="6" fill="url(#rim)"/>
        <rect x="62" y="102" width="13" height="44" rx="6" fill="url(#shade)" opacity="0.5"/>
        <rect x="225" y="102" width="13" height="44" rx="6" fill="url(#rim)"/>
        <rect x="225" y="102" width="13" height="44" rx="6" fill="url(#shade)" opacity="0.5"/>
        {/* Side lights */}
        <circle cx="68.5"  cy="100" r="7" fill="rgba(34,211,238,0.75)" filter="url(#softglow)"/>
        <circle cx="231.5" cy="100" r="7" fill="rgba(34,211,238,0.75)" filter="url(#softglow)"/>

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
          position:"absolute", top:"-6%", right:"-8%",
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
