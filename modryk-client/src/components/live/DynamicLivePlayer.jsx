import { useEffect, useRef, useState } from "react";
import { registerDynamicStream } from "./streamService";

export const DynamicLivePlayer = ({ rtspUrl, streamId }) => {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rtspUrl) return;

    let isCancelled = false;
    const videoEl = videoRef.current;

    const startStreaming = async () => {
      setLoading(true);
      setError(null);

      if (videoEl) {
        videoEl.srcObject = null;
      }

      // 1. تسجيل الرابط في السيرفر المحلي
      const whepUrl = await registerDynamicStream(streamId, rtspUrl);
      if (isCancelled) return;

      // 2. إعداد WebRTC
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (isCancelled || !videoRef.current) return;
        if (event.streams && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        } else {
          if (!videoRef.current.srcObject) {
            videoRef.current.srcObject = new MediaStream();
          }
          videoRef.current.srcObject.addTrack(event.track);
        }
        setLoading(false);
      };

      pc.onconnectionstatechange = () => {
        if (isCancelled) return;
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          setLoading(false);
        }
      };

      try {
        const offer = await pc.createOffer();
        if (isCancelled) return;

        await pc.setLocalDescription(offer);
        if (isCancelled) return;

        const response = await fetch(whepUrl, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription?.sdp || offer.sdp,
        });
        if (isCancelled) return;

        if (response.ok) {
          const answerSdp = await response.text();
          if (isCancelled) return;
          await pc.setRemoteDescription({
            type: "answer",
            sdp: answerSdp,
          });
        } else {
          console.error(
            "WHEP response error:",
            response.status,
            response.statusText,
          );
          setError("تعذر تشغيل البث المباشر حالياً");
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("WHEP Connection Error:", err);
          setError("حدث خطأ أثناء الاتصال بالبث المباشر");
          setLoading(false);
        }
      }
    };

    startStreaming();

    return () => {
      isCancelled = true;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (videoEl) {
        videoEl.srcObject = null;
      }
    };
  }, [rtspUrl, streamId]);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-black/75 rounded-xl z-1 min-h-[300px]">
          <div className="w-10 h-10 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin" />
          <span className="text-sm font-bold text-gray-200">
            جاري فتح البث المباشر...
          </span>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center text-red-400 bg-black/85 rounded-xl z-1 min-h-[300px] px-4 text-center font-bold">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls
        className="w-full h-auto max-h-[75vh] min-h-[300px] bg-black rounded-xl block object-contain"
      />
    </div>
  );
};
