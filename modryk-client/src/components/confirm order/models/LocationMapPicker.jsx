import { useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPin, Minus, Plus } from "lucide-react";

const TILE_SIZE = 256;
const MIN_ZOOM = 5;
const MAX_ZOOM = 18;
const DEFAULT_LAT = 21.4858;
const DEFAULT_LNG = 39.1925;

const clampLat = (lat) => Math.max(-85, Math.min(85, lat));

const normalizeLng = (lng) => ((((lng + 180) % 360) + 360) % 360) - 180;

const lngToX = (lng, zoom) =>
  ((lng + 180) / 360) * TILE_SIZE * Math.pow(2, zoom);

const latToY = (lat, zoom) => {
  const rad = (clampLat(lat) * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    TILE_SIZE *
    Math.pow(2, zoom)
  );
};

const xToLng = (x, zoom) =>
  (x / (TILE_SIZE * Math.pow(2, zoom))) * 360 - 180;

const yToLat = (y, zoom) => {
  const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * Math.pow(2, zoom));
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

export default function LocationMapPicker({ lat, lng, onChange }) {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const pinLat = Number.isFinite(parsedLat) && lat !== "" ? parsedLat : DEFAULT_LAT;
  const pinLng = Number.isFinite(parsedLng) && lng !== "" ? parsedLng : DEFAULT_LNG;

  const [viewCenter, setViewCenter] = useState({
    lat: pinLat,
    lng: pinLng,
  });
  const [zoom, setZoom] = useState(12);
  const [size, setSize] = useState({ width: 380, height: 224 });
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const mapRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    startCenterPxX: 0,
    startCenterPxY: 0,
  });

  useEffect(() => {
    const el = mapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { tiles, pinPos } = useMemo(() => {
    const n = Math.pow(2, zoom);
    const centerPxX = lngToX(viewCenter.lng, zoom);
    const centerPxY = latToY(viewCenter.lat, zoom);
    const topLeftX = centerPxX - size.width / 2;
    const topLeftY = centerPxY - size.height / 2;

    const startTileX = Math.floor(topLeftX / TILE_SIZE);
    const endTileX = Math.floor((topLeftX + size.width) / TILE_SIZE);
    const startTileY = Math.floor(topLeftY / TILE_SIZE);
    const endTileY = Math.floor((topLeftY + size.height) / TILE_SIZE);

    const tileList = [];
    for (let tx = startTileX; tx <= endTileX; tx++) {
      for (let ty = startTileY; ty <= endTileY; ty++) {
        if (ty < 0 || ty >= n) continue;
        const wrappedX = ((tx % n) + n) % n;
        tileList.push({
          key: `${zoom}-${tx}-${ty}`,
          src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
          left: tx * TILE_SIZE - topLeftX,
          top: ty * TILE_SIZE - topLeftY,
        });
      }
    }

    return {
      tiles: tileList,
      pinPos: {
        left: lngToX(pinLng, zoom) - topLeftX,
        top: latToY(pinLat, zoom) - topLeftY,
      },
    };
  }, [viewCenter, zoom, size, pinLat, pinLng]);

  const handlePointerDown = (e) => {
    if (e.target.closest("button")) return;
    setGeoError(null);
    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      startCenterPxX: lngToX(viewCenter.lng, zoom),
      startCenterPxY: latToY(viewCenter.lat, zoom),
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    const newLng = normalizeLng(xToLng(dragRef.current.startCenterPxX - dx, zoom));
    const newLat = clampLat(yToLat(dragRef.current.startCenterPxY - dy, zoom));
    setViewCenter({ lat: newLat, lng: newLng });
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    const wasDrag = dragRef.current.hasMoved;
    dragRef.current.isDragging = false;

    if (wasDrag || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const topLeftX = lngToX(viewCenter.lng, zoom) - rect.width / 2;
    const topLeftY = latToY(viewCenter.lat, zoom) - rect.height / 2;

    const clickedLat = clampLat(yToLat(topLeftY + clickY, zoom));
    const clickedLng = normalizeLng(xToLng(topLeftX + clickX, zoom));

    onChange?.({
      lat: clickedLat.toFixed(6),
      lng: clickedLng.toFixed(6),
    });
  };

  const handleLocateMe = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("المتصفح لا يدعم تحديد الموقع تلقائياً");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = position.coords.latitude;
        const nextLng = position.coords.longitude;
        setViewCenter({ lat: nextLat, lng: nextLng });
        setZoom(15);
        onChange?.({
          lat: nextLat.toFixed(6),
          lng: nextLng.toFixed(6),
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setGeoError("تعذر الوصول لموقعك، انقر على الخريطة لتحديد الموقع يدوياً");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-right font-bold text-primary text-sm sm:text-base">
          الموقع على الخريطة <span className="text-secondary">*</span>
        </label>
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-60"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
          <span>{locating ? "جاري التحديد..." : "تحديد موقعي الحالي"}</span>
        </button>
      </div>

      <div
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragRef.current.isDragging = false;
        }}
        dir="ltr"
        className="relative w-full h-56 rounded-2xl overflow-hidden border border-gray-300 bg-[#e8e5dc] select-none touch-none cursor-crosshair"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="absolute pointer-events-none max-w-none"
            style={{
              left: tile.left,
              top: tile.top,
              width: TILE_SIZE,
              height: TILE_SIZE,
            }}
          />
        ))}

        {/* Pin Marker */}
        <div
          className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full transition-all duration-100"
          style={{ left: pinPos.left, top: pinPos.top }}
        >
          <div className="flex flex-col items-center">
            <MapPin className="w-8 h-8 text-secondary fill-secondary/25 drop-shadow-md" />
            <span className="w-2.5 h-1 rounded-full bg-black/30 -mt-1" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
            aria-label="تكبير"
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-primary shadow flex items-center justify-center cursor-pointer border border-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
            aria-label="تصغير"
            className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-primary shadow flex items-center justify-center cursor-pointer border border-gray-200"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Helper Hint */}
        <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs text-[11px] font-bold text-primary px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
          انقر على الخريطة لتحديد الموقع
        </div>
      </div>

      {geoError && (
        <p className="text-xs font-bold text-amber-600 text-right">{geoError}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 flex items-center justify-between">
          <span className="font-bold text-primary">lat:</span>
          <span dir="ltr" className="font-mono">
            {lat}
          </span>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 flex items-center justify-between">
          <span className="font-bold text-primary">lng:</span>
          <span dir="ltr" className="font-mono">
            {lng}
          </span>
        </div>
      </div>
    </div>
  );
}

