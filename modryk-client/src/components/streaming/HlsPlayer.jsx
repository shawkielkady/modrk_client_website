import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = true,
  playsInline = true,
  className = "",
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  const handleManualRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls = null;
    let retryTimer = null;
    let manifestRetries = 0;
    let isCleanedUp = false;
    const MAX_MANIFEST_RETRIES = 6;

    const handleWaiting = () => {
      if (!isCleanedUp) setLoading(true);
    };

    const handlePlaying = () => {
      if (!isCleanedUp) {
        setLoading(false);
        setError(null);
      }
    };

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        liveDurationInfinity: true,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 10,
        nudgeOffset: 0.1,
        nudgeMaxRetry: 5,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 5,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 5,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isCleanedUp) return;
        manifestRetries = 0;
        setLoading(false);
        setError(null);
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay might require muted, which is enabled by default
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (isCleanedUp) return;

        // Non-fatal errors: auto-nudge or startLoad
        if (!data.fatal) {
          if (data.details === "bufferStalledError") {
            hls.startLoad();
            if (video.paused && !video.ended) {
              video.play().catch(() => {});
            }
          }
          return;
        }

        console.error("Fatal HLS Error:", data);

        // When manifest is 404 (FFmpeg is still initializing first segment), retry after 1.5s
        if (data.details === "manifestLoadError") {
          if (manifestRetries < MAX_MANIFEST_RETRIES) {
            manifestRetries += 1;
            setLoading(true);
            retryTimer = setTimeout(() => {
              if (!isCleanedUp && hls) {
                hls.loadSource(src);
              }
            }, 1500);
            return;
          }
          setError("جاري تهيئة البث المباشر على السيرفر... يرجى الانتظار أو إعادة المحاولة");
          setLoading(false);
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.warn("Fatal HLS Network Error, attempting reload...");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.warn("Fatal HLS Media Error, recovering...");
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            hlsRef.current = null;
            setError("حدث خطأ أثناء تشغيل البث المباشر");
            setLoading(false);
            break;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari / iOS HLS playback
      video.src = src;

      const handleLoadedMetadata = () => {
        if (isCleanedUp) return;
        setLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      };

      const handleNativeError = () => {
        if (isCleanedUp) return;
        setError("تعذر تشغيل البث المباشر في هذا المتصفح");
        setLoading(false);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleNativeError);

      return () => {
        isCleanedUp = true;
        clearTimeout(retryTimer);
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleNativeError);
        video.removeAttribute("src");
        video.load();
      };
    } else {
      setError("متصفحك لا يدعم تشغيل بث الفيديو المباشر بصيغة HLS");
      setLoading(false);
    }

    return () => {
      isCleanedUp = true;
      clearTimeout(retryTimer);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);

      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }

      video.removeAttribute("src");
      video.load();
    };
  }, [src, autoPlay, retryKey]);

  return (
    <div
      className={`relative w-full h-full min-h-[280px] sm:min-h-[400px] flex items-center justify-center bg-black ${className}`}
    >
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 text-white pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs sm:text-sm text-gray-300">
            جاري تحميل البث المباشر...
          </span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 text-white p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm sm:text-base font-bold text-red-200 max-w-md">
            {error}
          </p>
          <button
            type="button"
            onClick={handleManualRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer mt-1 shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            إعادة المحاولة
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline={playsInline}
        className="w-full h-auto max-h-[75vh] object-contain bg-black"
      />
    </div>
  );
}
