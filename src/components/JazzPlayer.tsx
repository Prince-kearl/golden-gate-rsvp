import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

// Asake — Great Guy (YouTube)
const VIDEO_ID = "JkqtmZGdOc8";

export function JazzPlayer() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const post = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  };

  // Try to autoplay (muted, since browsers require it) then unmute on first interaction.
  useEffect(() => {
    if (!ready) return;
    const start = () => {
      post("unMute");
      post("setVolume", [35]);
      post("playVideo");
      setPlaying(true);
    };
    const onInteract = () => {
      start();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, [ready]);

  const toggle = () => {
    if (playing) {
      post("pauseVideo");
      setPlaying(false);
    } else {
      post("unMute");
      post("setVolume", [35]);
      post("playVideo");
      setPlaying(true);
    }
  };

  if (!ready) return null;

  const src = `https://www.youtube.com/embed/${VIDEO_ID}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&playsinline=1&modestbranding=1`;

  return (
    <>
      <iframe
        ref={iframeRef}
        src={src}
        title="Asake - Great Guy"
        allow="autoplay; encrypted-media"
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", border: 0, left: -9999, top: -9999 }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur ring-border px-4 py-2.5 text-xs uppercase tracking-widest text-foreground hover:bg-background/90 transition shadow-elegant"
      >
        {playing ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <Music className="w-3.5 h-3.5 text-gold" />
            <span>Great Guy</span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Muted</span>
          </>
        )}
      </button>
    </>
  );
}
