import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

// Asake — Great Guy (YouTube)
const VIDEO_ID = "JkqtmZGdOc8";
const DEFAULT_VOLUME = 35;

type YouTubePlayer = {
  destroy: () => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
            onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
          };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<typeof window.YT> | null = null;

function loadYouTubeAPI() {
  if (typeof window === "undefined") return Promise.resolve(undefined);
  if (window.YT?.Player) return Promise.resolve(window.YT);

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve(window.YT);
      };

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
}

export function JazzPlayer() {
  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeAPI().then((YT) => {
      if (cancelled || !YT?.Player || !playerHostRef.current) return;

      playerRef.current = new YT.Player(playerHostRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: VIDEO_ID,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: ({ target }) => {
            if (cancelled) return;

            target.mute();
            target.setVolume(DEFAULT_VOLUME);
            target.playVideo();

            setPlaying(true);
            setReady(true);
          },
          onStateChange: ({ data, target }) => {
            if (data === 0) {
              target.playVideo();
              return;
            }

            if (data === 1 || data === 3 || data === 5) {
              setPlaying(true);
            }

            if (data === 2) {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const activateAudio = () => {
    if (!playerRef.current) return;

    playerRef.current.unMute();
    playerRef.current.setVolume(DEFAULT_VOLUME);
    playerRef.current.playVideo();
    setAudioUnlocked(true);
    setPlaying(true);
  };

  useEffect(() => {
    if (!ready) return;

    const onInteract = () => {
      activateAudio();
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
    if (!audioUnlocked) {
      activateAudio();
      return;
    }

    if (playing) {
      playerRef.current?.pauseVideo();
      setPlaying(false);
    } else {
      activateAudio();
    }
  };

  return (
    <>
      <div
        ref={playerHostRef}
        aria-hidden="true"
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", border: 0, left: -9999, top: -9999 }}
      />
      {ready ? (
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
      ) : null}
    </>
  );
}
