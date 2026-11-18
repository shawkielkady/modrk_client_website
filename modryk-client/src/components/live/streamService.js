export const registerDynamicStream = async (streamId, rtspUrl) => {
  // يمر عبر Vite Proxy ويتخطى CORS تماماً
  const safeStreamId = encodeURIComponent(streamId);
  const addUrl = `/mediamtx-api/v3/config/paths/add/${safeStreamId}`;
  const getUrl = `/mediamtx-api/v3/config/paths/get/${safeStreamId}`;
  const patchUrl = `/mediamtx-api/v3/config/paths/patch/${safeStreamId}`;
  const deleteUrl = `/mediamtx-api/v3/config/paths/delete/${safeStreamId}`;

  const body = JSON.stringify({
    source: rtspUrl,
    sourceOnDemand: true,
  });

  try {
    const res = await fetch(addUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.status === 400) {
      // المسار موجود بالفعل: نتحقق من مصدره، وإذا اختلف نحدثه عبر PATCH (أو حذف وإعادة إضافة)
      let needsUpdate = true;
      try {
        const existingRes = await fetch(getUrl);
        if (existingRes.ok) {
          const existingConfig = await existingRes.json();
          if (existingConfig?.source === rtspUrl) {
            needsUpdate = false;
          }
        }
      } catch {
        // تعذر قراءة الإعدادات الحالية، نتابع التحديث لضمان صحة الرابط
      }

      if (needsUpdate) {
        const patchRes = await fetch(patchUrl, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (!patchRes.ok) {
          await fetch(deleteUrl, { method: "DELETE" });
          await fetch(addUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
        }
      }
    } else if (!res.ok) {
      console.warn("MediaMTX note:", res.status, res.statusText);
    }
  } catch (err) {
    console.error("Error contacting MediaMTX API:", err);
  }

  return `/mediamtx-stream/${safeStreamId}/whep`;
};
