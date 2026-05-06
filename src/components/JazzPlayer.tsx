import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

// Modern jazz — Kevin MacLeod / incompetech.com (CC BY 4.0)
const TRACK_URL =
  "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Smooth%20Lovin.mp3";
const FALLBACK_URL =
  "https://incompetech.com/music/royalty-free/mp3-royaltyfree/George%20Street%20Shuffle.mp3";

export function JazzPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = new Audio(TRACK_URL);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "auto";
    audio.onerror = () => {
      audio.src = FALLBACK_URL;
      audio.load();
    };
    audioRef.current = audio;
    setReady(true);

    // Try to autoplay immediately (works if browser allows it)
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        // Blocked by browser autoplay policy — start on first user interaction
        const start = () => {
          audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => {});
        };
        window.addEventListener("pointerdown", start, { once: true });
        window.addEventListener("keydown", start, { once: true });
        window.addEventListener("touchstart", start, { once: true });
      });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Mute jazz music" : "Play jazz music"}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur ring-border px-4 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-background/90 transition shadow-elegant"
    >
      {playing ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <Music className="w-3.5 h-3.5 text-gold" />
          <span>Jazz</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Muted</span>
        </>
      )}
    </button>
  );
}
