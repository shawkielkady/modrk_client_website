/**
 * Streaming Service API Client
 * Interfaces with the local Node.js RTSP-to-HLS streaming service.
 */

export const STREAMING_API_URL = (
  import.meta.env.VITE_STREAMING_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

/**
 * Start or join an active HLS stream for a camera.
 *
 * @param {Object} params
 * @param {string|number} params.cameraId - Dynamic ID of the camera
 * @param {string} params.rtspUrl - Dynamic RTSP stream URL
 * @param {string} params.viewerId - Unique identifier for the viewer instance
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel stale requests
 * @returns {Promise<{ cameraId: string, status: string, hlsUrl: string, viewersCount: number }>}
 */
export async function startStreamApi(
  { cameraId, rtspUrl, viewerId },
  signal,
) {
  if (!cameraId) {
    throw new Error("معرّف الكاميرا غير متوفر");
  }
  if (!rtspUrl) {
    throw new Error("رابط RTSP للكاميرا غير متوفر");
  }
  if (!viewerId) {
    throw new Error("معرّف المشاهد (viewerId) غير متوفر");
  }

  const endpoint = `${STREAMING_API_URL}/api/streams`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        cameraId: String(cameraId),
        rtspUrl: String(rtspUrl),
        viewerId: String(viewerId),
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.message ||
        `فشل الاتصال بسيرفر البث المباشر (رمز الخطأ: ${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();

    if (!data.hlsUrl) {
      throw new Error("لم يتم استلام رابط HLS من سيرفر البث");
    }

    // Normalize HLS URL if needed
    let hlsUrl = data.hlsUrl;
    if (hlsUrl.startsWith("/")) {
      hlsUrl = `${STREAMING_API_URL}${hlsUrl}`;
    } else if (
      hlsUrl.startsWith("http://localhost:4000") &&
      STREAMING_API_URL !== "http://localhost:4000"
    ) {
      hlsUrl = hlsUrl.replace("http://localhost:4000", STREAMING_API_URL);
    }

    return {
      cameraId: String(data.cameraId || cameraId),
      status: data.status,
      hlsUrl,
      viewersCount: data.viewersCount || 1,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError") ||
      error.message?.includes("fetch failed")
    ) {
      throw new Error(
        `تعذر الاتصال بسيرفر البث المباشر على ${STREAMING_API_URL}. يرجى التحقق من تشغيل السيرفر.`,
        { cause: error },
      );
    }

    throw error;
  }
}

/**
 * Unregister a specific viewer from an active camera stream (DELETE).
 *
 * @param {Object} params
 * @param {string|number} params.cameraId
 * @param {string} params.viewerId
 * @returns {Promise<{ cameraId: string, viewerId: string, remainingViewers: number, stopped: boolean }>}
 */
export async function stopViewerApi({ cameraId, viewerId }) {
  if (!cameraId || !viewerId) {
    return { stopped: false };
  }

  const endpoint = `${STREAMING_API_URL}/api/streams/${encodeURIComponent(
    cameraId,
  )}/viewers/${encodeURIComponent(viewerId)}`;

  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("Failed to unregister viewer cleanly:", err.message);
      return { stopped: false };
    }

    return await response.json();
  } catch (error) {
    // Non-blocking cleanup: log and continue
    console.warn("Network error during stopViewerApi:", error.message);
    return { stopped: false };
  }
}

/**
 * Sends a best-effort viewer unregister on page unload/close using navigator.sendBeacon.
 *
 * @param {Object} params
 * @param {string|number} params.cameraId
 * @param {string} params.viewerId
 */
export function stopViewerBeacon({ cameraId, viewerId }) {
  if (!cameraId || !viewerId) {
    return false;
  }

  const endpoint = `${STREAMING_API_URL}/api/streams/${encodeURIComponent(
    cameraId,
  )}/viewers/${encodeURIComponent(viewerId)}/stop`;

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const payload = JSON.stringify({ cameraId, viewerId, at: Date.now() });
    const blob = new Blob([payload], { type: "application/json" });
    const success = navigator.sendBeacon(endpoint, blob);
    if (success) return true;
  }

  // Modern keepalive fetch fallback
  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cameraId, viewerId }),
      keepalive: true,
    }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/**
 * Send periodic heartbeat to keep the viewer registered and active.
 *
 * @param {Object} params
 * @param {string|number} params.cameraId
 * @param {string} params.viewerId
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ success: boolean, active: boolean, viewersCount: number }>}
 */
export async function sendHeartbeatApi({ cameraId, viewerId }, signal) {
  if (!cameraId || !viewerId) {
    return { success: false, active: false };
  }

  const endpoint = `${STREAMING_API_URL}/api/streams/${encodeURIComponent(
    cameraId,
  )}/viewers/${encodeURIComponent(viewerId)}/heartbeat`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    return { success: false, active: false };
  }

  return await response.json();
}
