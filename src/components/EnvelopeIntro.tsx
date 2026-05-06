import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface EnvelopeIntroProps {
  onComplete?: () => void;
}

export function EnvelopeIntro({ onComplete }: EnvelopeIntroProps) {
  const [phase, setPhase] = useState<"idle" | "breaking" | "opening" | "done">("idle");
  const [hidden, setHidden] = useState(false);

  // Auto-trigger after a short delay if user doesn't click
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase((p) => (p === "idle" ? "breaking" : p));
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  // Phase progression
  useEffect(() => {
    if (phase === "breaking") {
      const t = setTimeout(() => setPhase("opening"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "opening") {
      const t = setTimeout(() => setPhase("done"), 1200);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = setTimeout(() => {
        setHidden(true);
        onComplete?.();
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const handleOpen = () => {
    if (phase === "idle") setPhase("breaking");
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse at center, #e8c98a 0%, #c89a5a 45%, #6b4422 100%)",
          }}
        >
          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />

          {/* Skip */}
          <button
            onClick={() => {
              setHidden(true);
              onComplete?.();
            }}
            className="absolute top-6 right-6 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white transition z-10"
          >
            Skip
          </button>

          {/* Stage with perspective */}
          <div
            className="relative"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 30%" }}
          >
            {/* Floating wrapper */}
            <motion.div
              animate={
                phase === "idle"
                  ? { y: [0, -8, 0] }
                  : phase === "done"
                    ? { y: 80, opacity: 0, scale: 0.92 }
                    : { y: 0 }
              }
              transition={
                phase === "idle"
                  ? { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 1.2, ease: "easeInOut" }
              }
              className="relative"
              style={{ width: "min(86vw, 440px)", aspectRatio: "1.5 / 1" }}
            >
              {/* Soft shadow under envelope */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  bottom: "-40px",
                  width: "70%",
                  height: "32px",
                  background:
                    "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)",
                  filter: "blur(8px)",
                }}
              />

              {/* Envelope body (back) */}
              <div
                className="absolute inset-0 rounded-[6px]"
                style={{
                  background:
                    "linear-gradient(155deg, #f5e9d0 0%, #ead9b6 50%, #d8c39a 100%)",
                  boxShadow:
                    "inset 0 0 60px rgba(120, 80, 30, 0.15), 0 30px 60px -20px rgba(0,0,0,0.5), 0 10px 25px -10px rgba(0,0,0,0.4)",
                }}
              >
                {/* Paper texture noise */}
                <div
                  className="absolute inset-0 rounded-[6px] opacity-[0.18] mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
                  }}
                />
              </div>

              {/* Inner content (revealed when flap opens) */}
              <motion.div
                className="absolute left-[6%] right-[6%] top-[10%] bottom-[10%] rounded-[4px] flex flex-col items-center justify-center px-6 text-center"
                style={{
                  background:
                    "linear-gradient(180deg, #fbf3df 0%, #f3e6c4 100%)",
                  boxShadow:
                    "inset 0 0 30px rgba(120, 80, 30, 0.18)",
                }}
                initial={{ y: 40, opacity: 0 }}
                animate={
                  phase === "opening" || phase === "done"
                    ? { y: -30, opacity: 1 }
                    : { y: 40, opacity: 0 }
                }
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              >
                {/* Glow */}
                <motion.div
                  className="absolute inset-0 rounded-[4px] pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(255, 220, 140, 0.5) 0%, transparent 70%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === "opening" || phase === "done" ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                />
                <div className="relative z-10">
                  <Sparkles className="w-5 h-5 mx-auto mb-3" style={{ color: "#a8741f" }} />
                  <p
                    className="text-[10px] uppercase tracking-[0.4em] mb-2"
                    style={{ color: "#8a5a1a" }}
                  >
                    You're Invited
                  </p>
                  <p
                    className="font-display italic text-2xl md:text-3xl"
                    style={{ color: "#3a2410" }}
                  >
                    Charles Osam's
                  </p>
                  <p
                    className="font-display text-base md:text-lg tracking-wide"
                    style={{ color: "#5a3818" }}
                  >
                    Birthday Celebration
                  </p>
                </div>
              </motion.div>

              {/* Bottom triangle (front fold) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(0 100%, 100% 100%, 50% 45%)",
                  background:
                    "linear-gradient(180deg, #ead9b6 0%, #d4bc8f 100%)",
                  boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.08)",
                }}
              />
              {/* Left triangle */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(0 0, 0 100%, 50% 50%)",
                  background:
                    "linear-gradient(135deg, #f0dfba 0%, #d8c39a 100%)",
                }}
              />
              {/* Right triangle */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: "polygon(100% 0, 100% 100%, 50% 50%)",
                  background:
                    "linear-gradient(225deg, #f0dfba 0%, #d8c39a 100%)",
                }}
              />

              {/* Top flap (hinge at top) */}
              <motion.div
                className="absolute inset-0 origin-top"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: "50% 0%",
                  zIndex: phase === "opening" || phase === "done" ? 5 : 30,
                }}
                initial={{ rotateX: 0 }}
                animate={{
                  rotateX: phase === "opening" || phase === "done" ? -175 : 0,
                }}
                transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 55%)",
                    background:
                      "linear-gradient(180deg, #f5e9d0 0%, #e0cca0 100%)",
                    boxShadow: "inset 0 4px 12px rgba(0,0,0,0.08)",
                    backfaceVisibility: "hidden",
                  }}
                />
                {/* Back side of flap (visible when opened) */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 55%)",
                    background:
                      "linear-gradient(0deg, #fbf3df 0%, #f0e2bf 100%)",
                    transform: "rotateX(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                />

                {/* Wax seal — sits on the flap */}
                <motion.button
                  onClick={handleOpen}
                  disabled={phase !== "idle"}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full group"
                  style={{
                    top: "30%",
                    width: "78px",
                    height: "78px",
                    cursor: phase === "idle" ? "pointer" : "default",
                    backfaceVisibility: "hidden",
                  }}
                  whileHover={phase === "idle" ? { scale: 1.06 } : {}}
                  animate={
                    phase === "breaking"
                      ? { scale: [1, 1.15, 0.95, 1], rotate: [0, -3, 4, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Idle pulse ring */}
                  {phase === "idle" && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: "0 0 0 0 rgba(180,40,30,0.5)" }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(180,40,30,0.55)",
                          "0 0 0 18px rgba(180,40,30,0)",
                        ],
                      }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}

                  {/* Seal halves — split apart on break */}
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    animate={
                      phase === "breaking" || phase === "opening" || phase === "done"
                        ? { x: -10, rotate: -8, opacity: 0.85 }
                        : { x: 0, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
                    style={{
                      clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 30%, #e85a48 0%, #b8281e 55%, #6e1410 100%)",
                        boxShadow:
                          "inset -4px -4px 10px rgba(0,0,0,0.45), inset 3px 3px 6px rgba(255,200,180,0.35)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    animate={
                      phase === "breaking" || phase === "opening" || phase === "done"
                        ? { x: 10, rotate: 8, opacity: 0.85 }
                        : { x: 0, rotate: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
                    style={{
                      clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 65% 30%, #e85a48 0%, #b8281e 55%, #6e1410 100%)",
                        boxShadow:
                          "inset 4px -4px 10px rgba(0,0,0,0.45), inset -3px 3px 6px rgba(255,200,180,0.35)",
                      }}
                    />
                  </motion.div>

                  {/* Monogram */}
                  <div
                    className="absolute inset-0 flex items-center justify-center font-display text-white/90 text-xl pointer-events-none select-none"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                  >
                    CO
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Hint */}
            <motion.p
              className="absolute left-1/2 -translate-x-1/2 mt-12 text-xs uppercase tracking-[0.35em] text-white/80 whitespace-nowrap"
              style={{ top: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "idle" ? 1 : 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Tap the seal to open
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
