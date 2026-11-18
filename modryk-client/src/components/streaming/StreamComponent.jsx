import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  VideoOff,
  AlertCircle,
  Loader2,
  RefreshCw,
  Camera,
} from "lucide-react";
import { selectSelectedFarm } from "../../data/farms/farmsSlice";
import {
  startStreamApi,
  stopViewerApi,
  stopViewerBeacon,
  sendHeartbeatApi,
} from "./streamingApi";
import HlsPlayer from "./HlsPlayer";

/**
 * Generates an alphanumeric unique viewer ID for each viewer session.
 */
function generateViewerId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `v_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `v_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Inner component managing stream initiation, viewer registration, heartbeat,
 * and automatic cleanup for a specific camera.
 * Keyed by `${cameraId}-${rtspUrl}` to guarantee complete teardown when regions/cameras switch.
 */
function ActiveCameraStream({ farmId, cameraId, rtspUrl }) {
  const [hlsUrl, setHlsUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryIndex, setRetryIndex] = useState(0);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Generate a unique viewer ID per mount effect execution.
    // Guarantees zero ID collision even under React StrictMode double-mounting.
    const viewerId = generateViewerId();
    let isCurrent = true;
    const abortController = new AbortController();
    let heartbeatTimer = null;

    async function initStream() {
      try {
        const streamData = await startStreamApi(
          { farmId, cameraId, rtspUrl, viewerId },
          abortController.signal,
        );

        if (isCurrent) {
          setHlsUrl(streamData.hlsUrl);
          setLoading(false);
          setError(null);

          // Periodic heartbeat: ping server every 10s (server idle timeout is 30s)
          heartbeatTimer = setInterval(async () => {
            try {
              const hb = await sendHeartbeatApi({ cameraId, viewerId });
              // If server reports stream is no longer active (e.g. server restarted)
              if (!hb.active && isCurrent) {
                console.warn(
                  "Stream inactive on server during heartbeat. Reconnecting...",
                );
                initStream();
              }
            } catch (hbErr) {
              console.warn("Heartbeat ping warning:", hbErr.message);
            }
          }, 10000);
        }
      } catch (err) {
        if (isCurrent && err.name !== "AbortError") {
          console.error("Camera streaming initiation failed:", err);
          setError(err.message || "تعذر بدء البث المباشر للكاميرا");
          setLoading(false);
        }
      }
    }

    initStream();

    // Browser tab close / unload handler (best effort using sendBeacon)
    const handlePageHide = () => {
      stopViewerBeacon({ cameraId, viewerId });
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      isCurrent = false;
      abortController.abort();

      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);

      // Unregister only this viewer on component unmount / camera change
      stopViewerApi({ cameraId, viewerId }).catch(() => {});
    };
  }, [farmId, cameraId, rtspUrl, retryIndex]);

  if (loading) {
    return (
      <div className="relative w-full h-full min-h-[280px] sm:min-h-[400px] flex flex-col items-center justify-center gap-3 bg-black text-white p-4">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
        <span className="text-xs sm:text-sm text-gray-300">
          جاري الاتصال بكاميرا البث المباشر...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full min-h-[280px] sm:min-h-[400px] flex flex-col items-center justify-center gap-3 bg-black/95 text-white p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h4 className="text-base font-semibold text-white">
          فشل بدء البث المباشر
        </h4>
        <p className="text-xs sm:text-sm text-red-200 max-w-md">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer mt-1 shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (hlsUrl) {
    return <HlsPlayer src={hlsUrl} />;
  }

  return null;
}

/**
 * CameraPage / StreamComponent
 * Dynamically handles any number of cameras returned in farm.live_urls:
 * - 0 cameras: renders friendly empty state.
 * - 1 camera: plays stream directly.
 * - N cameras (>1): renders camera switcher tabs allowing seamless switching between streams.
 */
function CameraPage({ farm: propFarm }) {
  const storeFarm = useSelector(selectSelectedFarm);
  const currentFarm = propFarm !== undefined ? propFarm : storeFarm;

  // Extract all valid cameras from live_urls dynamically
  const cameras = Array.isArray(currentFarm?.live_urls)
    ? currentFarm.live_urls.filter(
        (cam) =>
          cam &&
          cam.id !== undefined &&
          cam.id !== null &&
          String(cam.id).trim() !== "" &&
          (!import.meta.env.DEV ||
            (typeof cam.url === "string" && cam.url.trim().startsWith("rtsp://"))),
      )
    : [];

  const [selectedCameraId, setSelectedCameraId] = useState(null);

  // Determine active camera: user-selected or first available
  const activeCamera =
    cameras.find((c) => String(c.id) === String(selectedCameraId)) ||
    cameras[0] ||
    null;

  const hasValidCamera = Boolean(activeCamera);

  return (
    <div className="col-span-2 lg:col-span-8 lg:col-start-3 lg:row-start-1 lg:row-span-2 relative w-full rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center min-h-[280px] sm:min-h-[400px]">
      {!hasValidCamera ? (
        <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
          <VideoOff className="w-12 h-12 text-gray-500 mb-1" />
          <h3 className="text-white text-base sm:text-lg font-semibold">
            لا يتوفر بث مباشر لهذه المنطقة حالياً
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-sm">
            لم يتم ربط كاميرا بث نشطة أو قد تكون الكاميرا غير متاحة في الوقت
            الحالي.
          </p>
        </div>
      ) : (
        <>
          {/* Multi-Camera Switcher: Appears only when farm has multiple cameras */}
          {cameras.length > 1 && (
            <div className="absolute top-3 end-3 z-20 flex flex-wrap gap-1.5 sm:gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg max-w-[90%]">
              {cameras.map((cam, idx) => {
                const isSelected = String(cam.id) === String(activeCamera.id);
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => setSelectedCameraId(cam.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{cam.name || `كاميرا ${idx + 1}`}</span>
                  </button>
                );
              })}
            </div>
          )}

          <ActiveCameraStream
            key={`${currentFarm.id}-${activeCamera.id}-${activeCamera.url}`}
            farmId={currentFarm.id}
            cameraId={activeCamera.id}
            rtspUrl={activeCamera.url}
          />
        </>
      )}
    </div>
  );
}

export default CameraPage;
