import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeIntroProps {
  onComplete?: () => void;
}

const STORAGE_KEY = "envelope-opened";

export function EnvelopeIntro({ onComplete }: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<"idle" | "breaking" | "opening" | "done">("idle");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const opened = typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1";
    if (!opened) setHidden(false);
  }, []);

  const finish = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    }
    setHidden(true);
    onComplete?.();
  };

  useEffect(() => {
    if (phase === "breaking") {
      const t = setTimeout(() => setPhase("opening"), 320);
      return () => clearTimeout(t);
    }
    if (phase === "opening") {
      const t = setTimeout(() => setPhase("done"), 1000);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = setTimeout(finish, 700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleOpen = () => {
    if (phase === "idle") setPhase("breaking");
  };

  const opened = phase === "opening" || phase === "done";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, #1a1a1c 0%, #0a0a0b 60%, #000 100%)",
          }}
        >
          {/* Brushed light strokes (subtle) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            }}
          />

          {/* Skip */}
          <button
            onClick={finish}
            className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.32em] text-white/50 hover:text-white/90 transition z-10"
          >
            Skip
          </button>

          {/* Stage */}
          <div
            className="relative"
            style={{ perspective: "1600px", perspectiveOrigin: "50% 25%" }}
          >
            <motion.div
              animate={
                phase === "idle"
                  ? { y: [0, -6, 0] }
                  : phase === "done"
                    ? { y: 100, opacity: 0, scale: 0.9 }
                    : { y: 0 }
              }
              transition={
                phase === "idle"
                  ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 1.1, ease: "easeInOut" }
              }
              className="relative"
              style={{
                width: "min(86vw, 460px)",
                aspectRatio: "1.5 / 1",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Drop shadow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-[50%] pointer-events-none"
                style={{
                  bottom: "-50px",
                  width: "78%",
                  height: "44px",
                  background:
                    "radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, transparent 70%)",
                  filter: "blur(14px)",
                }}
              />

              {/* Envelope back / pocket */}
              <div
                className="absolute inset-0 rounded-[8px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(155deg, #1c1c1e 0%, #0e0e10 50%, #050506 100%)",
                  boxShadow:
                    "inset 0 0 80px rgba(0,0,0,0.7), 0 40px 80px -20px rgba(0,0,0,0.85), 0 14px 30px -10px rgba(0,0,0,0.6)",
                }}
              >
                {/* paper grain */}
                <div
                  className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
                  }}
                />
                {/* edge highlight */}
                <div
                  className="absolute inset-0 rounded-[8px] pointer-events-none"
                  style={{
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)",
                  }}
                />
              </div>

              {/* Inner card (revealed) */}
              <motion.div
                className="absolute left-[6%] right-[6%] top-[10%] bottom-[10%] rounded-[5px] flex flex-col items-center justify-center px-6 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, #f7f4ec 0%, #ece6d4 100%)",
                  boxShadow:
                    "inset 0 0 40px rgba(80, 60, 30, 0.18), 0 6px 18px rgba(0,0,0,0.4)",
                }}
                initial={{ y: 30, opacity: 0 }}
                animate={
                  opened ? { y: -34, opacity: 1 } : { y: 30, opacity: 0 }
                }
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              >
                <div className="relative z-10">
                  <p
                    className="text-[10px] uppercase tracking-[0.4em] mb-3"
                    style={{ color: "#7a7a82" }}
                  >
                    You're Invited
                  </p>
                  <p
                    className="font-display italic text-4xl md:text-5xl"
                    style={{ color: "#1a1a1c", fontFamily: "'Great Vibes', 'Pinyon Script', 'Allura', cursive", letterSpacing: "0.01em" }}
                  >
                    Charles Osam
                  </p>
                  <p
                    className="font-display italic text-sm md:text-base mt-1"
                    style={{ color: "#5a5a62" }}
                  >
                    Birthday Rendezvous
                  </p>
                </div>
              </motion.div>

              {/* Bottom triangle */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(0 100%, 100% 100%, 50% 45%)",
                  background:
                    "linear-gradient(180deg, #18181a 0%, #07070a 100%)",
                  boxShadow: "inset 0 -10px 24px rgba(0,0,0,0.6)",
                }}
              />
              {/* Left triangle */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(0 0, 0 100%, 50% 50%)",
                  background:
                    "linear-gradient(135deg, #1f1f22 0%, #0c0c0e 100%)",
                }}
              />
              {/* Right triangle */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(100% 0, 100% 100%, 50% 50%)",
                  background:
                    "linear-gradient(225deg, #1f1f22 0%, #0c0c0e 100%)",
                }}
              />
              {/* Center seam highlights */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 44%, rgba(255,255,255,0.04) 45%, transparent 46%)",
                }}
              />

              {/* Top flap */}
              <motion.div
                className="absolute inset-0"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "50% 0%",
                  zIndex: opened ? 5 : 30,
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: opened ? -178 : 0 }}
                transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.35 }}
              >
                {/* Front face */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 55%)",
                    background:
                      "linear-gradient(180deg, #232326 0%, #111114 60%, #0a0a0c 100%)",
                    boxShadow:
                      "inset 0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backfaceVisibility: "hidden",
                  }}
                />
                {/* Back face */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 55%)",
                    background:
                      "linear-gradient(0deg, #1a1a1c 0%, #0c0c0e 100%)",
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Silver wax seal */}
                <motion.button
                  onPointerDown={handleOpen}
                  disabled={phase !== "idle"}
                  aria-label="Open envelope"
                  className="absolute left-1/2 -translate-x-1/2 rounded-full touch-manipulation"
                  style={{
                    top: "calc(28% - 14px)",
                    width: "120px",
                    height: "120px",
                    cursor: phase === "idle" ? "pointer" : "default",
                    backfaceVisibility: "hidden",
                    background: "transparent",
                    border: "none",
                    padding: "14px",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  whileHover={phase === "idle" ? { scale: 1.05 } : {}}
                  whileTap={phase === "idle" ? { scale: 0.96 } : {}}
                  animate={
                    phase === "breaking"
                      ? { scale: [1, 1.18, 0.94, 1], rotate: [0, -4, 5, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Pulse ring */}
                  {phase === "idle" && (
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(200,205,215,0.5)",
                          "0 0 0 22px rgba(200,205,215,0)",
                        ],
                      }}
                      transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}

                  {/* Drop shadow under seal */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      boxShadow:
                        "0 8px 18px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)",
                    }}
                  />

                  {/* Left half */}
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    animate={
                      phase === "breaking" || opened
                        ? { x: -14, y: 4, rotate: -12, opacity: 0.92 }
                        : { x: 0, y: 0, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.5, ease: [0.5, 0, 0.3, 1] }}
                    style={{ clipPath: "polygon(0 0, 52% 0, 48% 100%, 0 100%)" }}
                  >
                    <SealFace side="left" />
                  </motion.div>

                  {/* Right half */}
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    animate={
                      phase === "breaking" || opened
                        ? { x: 14, y: 4, rotate: 12, opacity: 0.92 }
                        : { x: 0, y: 0, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.5, ease: [0.5, 0, 0.3, 1] }}
                    style={{ clipPath: "polygon(48% 0, 100% 0, 100% 100%, 52% 100%)" }}
                  >
                    <SealFace side="right" />
                  </motion.div>

                  {/* Crack line flash */}
                  <motion.div
                    className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[2px] rounded-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(255,255,255,0.85), transparent)",
                    }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={
                      phase === "breaking" || opened
                        ? { opacity: [0, 1, 0], scaleY: [0, 1, 1] }
                        : { opacity: 0, scaleY: 0 }
                    }
                    transition={{ duration: 0.4 }}
                  />

                  {/* Monogram */}
                  <div
                    className="absolute inset-0 flex items-center justify-center font-display text-[22px] pointer-events-none select-none"
                    style={{
                      color: "rgba(20,20,22,0.75)",
                      textShadow:
                        "0 1px 0 rgba(255,255,255,0.35), 0 -1px 1px rgba(0,0,0,0.4)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    CO
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Hint */}
            <motion.p
              className="absolute left-1/2 -translate-x-1/2 mt-14 text-[10px] uppercase tracking-[0.4em] text-white/55 whitespace-nowrap"
              style={{ top: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "idle" ? 1 : 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Tap the seal to open
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SealFace({ side }: { side: "left" | "right" }) {
  const lightX = side === "left" ? "32%" : "68%";
  return (
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle at ${lightX} 28%, #f4f5f7 0%, #c8ccd3 30%, #8c9099 65%, #4a4d54 100%)`,
        boxShadow:
          side === "left"
            ? "inset -5px -5px 12px rgba(0,0,0,0.5), inset 4px 4px 8px rgba(255,255,255,0.45)"
            : "inset 5px -5px 12px rgba(0,0,0,0.5), inset -4px 4px 8px rgba(255,255,255,0.45)",
      }}
    >
      {/* speckled wax texture */}
      <div
        className="absolute inset-0 rounded-full opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* outer rim */}
      <div
        className="absolute inset-[4px] rounded-full pointer-events-none"
        style={{
          boxShadow:
            "inset 0 0 0 1.5px rgba(255,255,255,0.18), inset 0 0 0 2.5px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}
