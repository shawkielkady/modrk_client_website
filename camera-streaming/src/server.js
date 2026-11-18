const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const {
  startStream,
  removeViewer,
  recordHeartbeat,
  stopStream,
  getStreamInfo,
} = require("./services/streamManager");

const app = express();
const PORT = 4000;
const production = process.env.NODE_ENV === "production";
const cameraFile = path.join(__dirname, "../cameras.json");
const cameras = new Map(
  production && fs.existsSync(cameraFile)
    ? Object.entries(JSON.parse(fs.readFileSync(cameraFile, "utf8")))
    : [],
);

app.use(cors(production ? { origin: "https://modrk.modrk-app.com" } : {}));
app.use(express.json());
// Support raw text payloads from navigator.sendBeacon
app.use(express.text({ type: ["text/plain", "application/json"] }));

// Serve HLS files
app.use(
  "/streams",
  express.static(process.env.STREAMS_DIR || path.join(__dirname, "../streams"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }

      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
    },
  }),
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start or join an existing stream for a camera
app.post("/api/streams", async (req, res) => {
  try {
    const { cameraId, viewerId } = req.body || {};

    if (!/^[a-zA-Z0-9_-]+$/.test(String(cameraId || "")) ||
        !/^[a-zA-Z0-9_-]+$/.test(String(viewerId || ""))) {
      return res.status(400).json({
        message: "Valid cameraId and viewerId are required",
      });
    }

    const rtspUrl = production ? cameras.get(String(cameraId)) : req.body.rtspUrl;
    if (!rtspUrl) {
      return res.status(production ? 404 : 400).json({
        message: production ? "Camera not configured" : "rtspUrl is required",
      });
    }

    const result = await startStream(cameraId, rtspUrl, viewerId);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message: production ? "Could not start stream" : error.message,
    });
  }
});

// Remove a specific viewer (DELETE)
app.delete("/api/streams/:cameraId/viewers/:viewerId", async (req, res) => {
  try {
    const { cameraId, viewerId } = req.params;
    const result = await removeViewer(cameraId, viewerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Dedicated POST stop endpoint for navigator.sendBeacon and pagehide
app.post("/api/streams/:cameraId/viewers/:viewerId/stop", async (req, res) => {
  try {
    const { cameraId, viewerId } = req.params;
    const result = await removeViewer(cameraId, viewerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Viewer heartbeat
app.post("/api/streams/:cameraId/viewers/:viewerId/heartbeat", (req, res) => {
  try {
    const { cameraId, viewerId } = req.params;
    const result = recordHeartbeat(cameraId, viewerId);
    if (!result.active) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get stream status & active viewers (diagnostic / monitoring)
app.get("/api/streams/:cameraId", (req, res) => {
  if (production) return res.sendStatus(404);
  try {
    const info = getStreamInfo(req.params.cameraId);
    if (!info) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res.json(info);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Manual full stop for a camera
app.delete("/api/streams/:cameraId", async (req, res) => {
  if (production) return res.sendStatus(404);
  try {
    const stopped = await stopStream(req.params.cameraId);
    res.json({
      cameraId: req.params.cameraId,
      stopped,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Streaming Service: http://localhost:${PORT}`);
});
