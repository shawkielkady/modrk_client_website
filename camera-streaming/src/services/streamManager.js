const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const defaultFfmpegPath =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\Mega Store\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe";
const ffmpegPath = fs.existsSync(defaultFfmpegPath)
  ? defaultFfmpegPath
  : "ffmpeg";

const streams = new Map();
const cameraLocks = new Map();

const streamsDirectory =
  process.env.STREAMS_DIR || path.join(__dirname, "../../streams");

const HEARTBEAT_TIMEOUT_MS = 30000; // 30 seconds idle timeout
const HEARTBEAT_CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

/**
 * Validates camera ID to prevent path traversal.
 */
function getSafeId(id) {
  const safeId = String(id || "").trim();
  if (!safeId || !/^[a-zA-Z0-9_-]+$/.test(safeId)) {
    throw new Error("Invalid camera ID");
  }
  return safeId;
}

/**
 * Validates viewer ID to prevent injection / malformed input.
 */
function getSafeViewerId(viewerId) {
  const safeId = String(viewerId || "").trim();
  if (!safeId || !/^[a-zA-Z0-9_-]+$/.test(safeId)) {
    throw new Error("Invalid viewer ID");
  }
  return safeId;
}

/**
 * Per-camera execution queue (mutex lock).
 * Guarantees that concurrent start, stop, and cleanup requests for the same camera
 * are processed strictly in sequence without race conditions.
 *
 * @param {string} cameraId
 * @param {Function} action - Async function to run exclusively for this camera
 * @returns {Promise<any>}
 */
function withCameraLock(cameraId, action) {
  const currentLock = cameraLocks.get(cameraId) || Promise.resolve();

  let releaseLock;
  const nextLock = new Promise((resolve) => {
    releaseLock = resolve;
  });

  const operation = currentLock
    .catch(() => {})
    .then(async () => {
      return await action();
    })
    .finally(() => {
      releaseLock();
      if (cameraLocks.get(cameraId) === nextLock) {
        cameraLocks.delete(cameraId);
      }
    });

  cameraLocks.set(cameraId, nextLock);
  return operation;
}

/**
 * Prepares the HLS output directory on Windows safely.
 * Avoids EPERM errors caused by Windows delayed folder deletion.
 */
async function prepareOutputDirectory(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
  const entries = await fs.promises.readdir(dir).catch(() => []);
  await Promise.all(
    entries.map((file) =>
      fs.promises.unlink(path.join(dir, file)).catch(() => {}),
    ),
  );
}

/**
 * Safely removes the HLS directory for a stream and removes it from the streams map.
 * Guards against deleting files belonging to a newer FFmpeg process for the same camera ID.
 *
 * @param {string} id - Camera ID
 * @param {object} streamData - The specific stream instance being cleaned up
 */
async function cleanupStream(id, streamData) {
  if (streamData.cleanupPromise) {
    return streamData.cleanupPromise;
  }

  streamData.cleanupPromise = (async () => {
    // Guard: check if another newer stream instance has already replaced this one in the Map
    const currentStream = streams.get(id);
    if (currentStream && currentStream !== streamData) {
      console.warn(
        `[Stream ${id}] Cleanup skipped: a newer stream instance is active for camera ${id}`,
      );
      return;
    }

    const outputDirectory =
      streamData.outputDirectory || path.join(streamsDirectory, id);

    try {
      console.log(`[Stream ${id}] Deleting HLS directory: ${outputDirectory}`);
      const entries = await fs.promises.readdir(outputDirectory).catch(() => []);
      await Promise.all(
        entries.map((file) =>
          fs.promises.unlink(path.join(outputDirectory, file)).catch(() => {}),
        ),
      );
      await fs.promises.rm(outputDirectory, {
        recursive: true,
        force: true,
      }).catch(() => {});
      console.log(`[Stream ${id}] HLS directory deleted successfully.`);
    } catch (error) {
      console.error(
        `[Stream ${id}] Error deleting HLS directory:`,
        error.message,
      );
    } finally {
      // Safely remove from active streams map if this instance is still registered
      if (streams.get(id) === streamData) {
        streams.delete(id);
        console.log(`[Stream ${id}] Stream removed from active map.`);
      }
      streamData.status = "stopped";
    }
  })();

  return streamData.cleanupPromise;
}

/**
 * Sends a termination signal to the FFmpeg process and waits for it to close.
 *
 * @param {ChildProcess} proc - The FFmpeg child process
 * @param {string} id - Camera ID for logging
 * @param {number} timeoutMs - Max time to wait before force-killing
 * @returns {Promise<void>}
 */
function terminateProcess(proc, id, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (
      !proc ||
      proc.exitCode !== null ||
      (proc.killed && proc.signalCode !== null)
    ) {
      console.log(`[Stream ${id}] Process already exited.`);
      return resolve();
    }

    let resolved = false;
    let forceKillTimer = null;

    const cleanup = () => {
      if (forceKillTimer) {
        clearTimeout(forceKillTimer);
        forceKillTimer = null;
      }
      proc.removeListener("close", onClose);
      proc.removeListener("error", onError);
    };

    const onClose = (code, signal) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      console.log(
        `[Stream ${id}] FFmpeg process closed (code: ${code}, signal: ${signal}).`,
      );
      resolve();
    };

    const onError = (err) => {
      console.error(
        `[Stream ${id}] Process error during termination:`,
        err.message,
      );
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };

    proc.once("close", onClose);
    proc.once("error", onError);

    try {
      console.log(`[Stream ${id}] Sending SIGTERM to PID ${proc.pid}...`);
      proc.kill("SIGTERM");
    } catch (err) {
      console.error(`[Stream ${id}] Failed to send SIGTERM:`, err.message);
    }

    forceKillTimer = setTimeout(() => {
      if (!resolved) {
        console.warn(
          `[Stream ${id}] FFmpeg did not exit within ${timeoutMs}ms. Forcing SIGKILL to PID ${proc.pid}...`,
        );
        try {
          proc.kill("SIGKILL");
        } catch (err) {
          console.error(`[Stream ${id}] Failed to send SIGKILL:`, err.message);
        }
      }
    }, timeoutMs);
  });
}

/**
 * Internal stream termination helper.
 * Stops FFmpeg, awaits process exit, deletes HLS directory, and cleans up map.
 */
async function stopStreamInternal(id, stream) {
  if (stream.stopPromise) {
    return stream.stopPromise;
  }

  stream.intentionallyStopped = true;
  stream.status = "stopping";

  stream.stopPromise = (async () => {
    try {
      console.log(
        `[Stream ${id}] Terminating FFmpeg process (PID: ${stream.process?.pid})...`,
      );
      await terminateProcess(stream.process, id);
      console.log(`[Stream ${id}] FFmpeg terminated. Cleaning up HLS files...`);
      await cleanupStream(id, stream);
      console.log(`[Stream ${id}] Stream stopped and cleaned up successfully.`);
      return true;
    } catch (err) {
      console.error(
        `[Stream ${id}] Error during stopStreamInternal:`,
        err.message,
      );
      await cleanupStream(id, stream);
      return true;
    }
  })();

  return stream.stopPromise;
}

/**
 * Starts or joins an existing stream for a camera.
 * Multiple viewers share ONE FFmpeg process.
 *
 * @param {string|number} cameraId
 * @param {string} rtspUrl
 * @param {string} viewerId
 * @returns {Promise<{ cameraId: string, status: string, hlsUrl: string, viewersCount: number }>}
 */
async function startStream(cameraId, rtspUrl, viewerId) {
  const id = getSafeId(cameraId);
  const safeViewerId = getSafeViewerId(viewerId);

  if (typeof rtspUrl !== "string" || !rtspUrl.startsWith("rtsp://")) {
    throw new Error("Invalid RTSP URL");
  }

  return withCameraLock(id, async () => {
    const existingStream = streams.get(id);

    // Case 1: Stream already exists and is active/starting
    if (
      existingStream &&
      !existingStream.intentionallyStopped &&
      existingStream.status !== "stopping"
    ) {
      // If same RTSP URL: reuse existing process and register new viewer
      if (existingStream.rtspUrl === rtspUrl) {
        existingStream.viewers.set(safeViewerId, {
          viewerId: safeViewerId,
          joinedAt: Date.now(),
          lastHeartbeat: Date.now(),
        });

        console.log(
          `[Stream ${id}] Viewer ${safeViewerId} joined existing stream. Active viewers: ${existingStream.viewers.size}`,
        );

        return {
          cameraId: id,
          status:
            existingStream.status === "starting"
              ? "starting"
              : "already-running",
          hlsUrl: `http://localhost:4000/streams/${id}/index.m3u8`,
          viewersCount: existingStream.viewers.size,
        };
      }

      // If different RTSP URL: do not interrupt active viewers
      if (existingStream.viewers.size > 0) {
        const error = new Error(
          `Camera ${id} is actively streaming another RTSP source for ${existingStream.viewers.size} active viewer(s). Cannot replace stream while active.`,
        );
        error.statusCode = 409;
        throw error;
      }

      // If no active viewers, stop old stream and start new one
      console.log(
        `[Stream ${id}] Stream has 0 viewers and different RTSP URL. Replacing stream...`,
      );
      await stopStreamInternal(id, existingStream);
    } else if (existingStream && existingStream.status === "stopping") {
      // If in the middle of stopping, wait for complete teardown
      if (existingStream.stopPromise) {
        await existingStream.stopPromise;
      }
    }

    // Case 2: Start new FFmpeg process for this camera
    const outputDirectory = path.join(streamsDirectory, id);
    await prepareOutputDirectory(outputDirectory);

    const outputFile = path.join(outputDirectory, "index.m3u8");

    const args = [
      "-hide_banner",
      "-loglevel",
      "info",
      "-rtsp_transport",
      "tcp",
      "-timeout",
      "5000000",
      "-i",
      rtspUrl,
      "-map",
      "0:v:0",
      "-an",
      "-c:v",
      "copy",
      "-f",
      "hls",
      "-hls_time",
      "2",
      "-hls_list_size",
      "10",
      "-hls_flags",
      "delete_segments",
      "-hls_segment_filename",
      path.join(outputDirectory, "segment_%03d.ts"),
      outputFile,
    ];

    console.log(
      `[Stream ${id}] Starting new FFmpeg process for viewer ${safeViewerId}...`,
    );

    const ffmpegProcess = spawn(ffmpegPath, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });

    const viewersMap = new Map();
    viewersMap.set(safeViewerId, {
      viewerId: safeViewerId,
      joinedAt: Date.now(),
      lastHeartbeat: Date.now(),
    });

    const streamData = {
      id,
      process: ffmpegProcess,
      rtspUrl,
      outputDirectory,
      status: "starting",
      intentionallyStopped: false,
      stopPromise: null,
      cleanupPromise: null,
      viewers: viewersMap,
    };

    streams.set(id, streamData);

    console.log(
      `[Stream ${id}] Spawned FFmpeg PID: ${ffmpegProcess.pid}. Initial viewer: ${safeViewerId}`,
    );

    ffmpegProcess.stderr.on("data", (data) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[FFmpeg ${id}] ${data.toString().trim()}`);
      }
    });

    ffmpegProcess.on("spawn", () => {
      console.log(`[Stream ${id}] FFmpeg process started successfully.`);
      if (streamData.status === "starting") {
        streamData.status = "running";
      }
    });

    ffmpegProcess.on("error", async (error) => {
      console.error(`[Stream ${id}] FFmpeg process error:`, error.message);
      if (streams.get(id) === streamData) {
        await cleanupStream(id, streamData);
      }
    });

    ffmpegProcess.on("close", async (code, signal) => {
      console.log(
        `[Stream ${id}] FFmpeg closed (code: ${code}, signal: ${signal}).`,
      );

      if (streamData.intentionallyStopped) {
        return;
      }

      console.warn(
        `[Stream ${id}] FFmpeg exited unexpectedly. Active viewers remaining: ${streamData.viewers.size}`,
      );

      await cleanupStream(id, streamData);

      // If active viewers still exist, attempt auto-reconnect
      if (streamData.viewers.size > 0 && !streamData.intentionallyStopped) {
        console.log(
          `[Stream ${id}] Attempting auto-reconnect for ${streamData.viewers.size} viewers in 2s...`,
        );
        setTimeout(() => {
          const firstViewer = streamData.viewers.keys().next().value;
          if (firstViewer) {
            startStream(id, rtspUrl, firstViewer).catch((err) => {
              console.error(
                `[Stream ${id}] Auto-reconnect failed:`,
                err.message,
              );
            });
          }
        }, 2000);
      }
    });

    return {
      cameraId: id,
      status: "starting",
      hlsUrl: `http://localhost:4000/streams/${id}/index.m3u8`,
      viewersCount: 1,
    };
  });
}

/**
 * Removes a specific viewer from a stream.
 * FFmpeg is stopped ONLY when 0 viewers remain.
 *
 * @param {string|number} cameraId
 * @param {string} viewerId
 * @returns {Promise<{ cameraId: string, viewerId: string, remainingViewers: number, stopped: boolean }>}
 */
async function removeViewer(cameraId, viewerId) {
  let id;
  let safeViewerId;
  try {
    id = getSafeId(cameraId);
    safeViewerId = getSafeViewerId(viewerId);
  } catch {
    return {
      cameraId: String(cameraId),
      viewerId: String(viewerId),
      remainingViewers: 0,
      stopped: false,
      message: "Invalid camera or viewer ID",
    };
  }

  return withCameraLock(id, async () => {
    const stream = streams.get(id);

    if (!stream) {
      console.log(
        `[Stream ${id}] Viewer ${safeViewerId} remove requested, but stream is not active.`,
      );
      return {
        cameraId: id,
        viewerId: safeViewerId,
        remainingViewers: 0,
        stopped: true,
      };
    }

    const wasRegistered = stream.viewers.delete(safeViewerId);
    const remainingViewers = stream.viewers.size;

    console.log(
      `[Stream ${id}] Viewer ${safeViewerId} removed (wasRegistered: ${wasRegistered}). Remaining viewers: ${remainingViewers}`,
    );

    // If at least one viewer remains: KEEP FFmpeg RUNNING!
    if (remainingViewers > 0) {
      return {
        cameraId: id,
        viewerId: safeViewerId,
        remainingViewers,
        stopped: false,
      };
    }

    // If 0 viewers remain: STOP FFmpeg, wait for process exit, delete HLS files
    console.log(
      `[Stream ${id}] Zero viewers remaining. Stopping FFmpeg and deleting HLS files...`,
    );
    await stopStreamInternal(id, stream);

    return {
      cameraId: id,
      viewerId: safeViewerId,
      remainingViewers: 0,
      stopped: true,
    };
  });
}

/**
 * Updates viewer activity timestamp (heartbeat).
 *
 * @param {string|number} cameraId
 * @param {string} viewerId
 * @returns {{ success: boolean, active: boolean, viewersCount: number }}
 */
function recordHeartbeat(cameraId, viewerId) {
  const id = getSafeId(cameraId);
  const safeViewerId = getSafeViewerId(viewerId);

  const stream = streams.get(id);

  if (!stream || stream.intentionallyStopped || stream.status === "stopping") {
    return {
      success: false,
      active: false,
      viewersCount: 0,
      message: "Stream is not active",
    };
  }

  const existingViewer = stream.viewers.get(safeViewerId);
  if (existingViewer) {
    existingViewer.lastHeartbeat = Date.now();
    return {
      success: true,
      active: true,
      viewersCount: stream.viewers.size,
    };
  }

  // Re-register viewer if active stream exists (e.g. after momentary network pause)
  stream.viewers.set(safeViewerId, {
    viewerId: safeViewerId,
    joinedAt: Date.now(),
    lastHeartbeat: Date.now(),
  });

  console.log(
    `[Stream ${id}] Viewer ${safeViewerId} re-registered via heartbeat. Total viewers: ${stream.viewers.size}`,
  );

  return {
    success: true,
    active: true,
    reconnected: true,
    viewersCount: stream.viewers.size,
  };
}

/**
 * Stops an entire camera stream immediately (manual / administrative stop).
 *
 * @param {string|number} cameraId
 * @returns {Promise<boolean>}
 */
async function stopStream(cameraId) {
  let id;
  try {
    id = getSafeId(cameraId);
  } catch {
    return false;
  }

  return withCameraLock(id, async () => {
    const stream = streams.get(id);
    if (!stream) {
      return false;
    }

    console.log(`[Stream ${id}] Manual full stop requested.`);
    await stopStreamInternal(id, stream);
    return true;
  });
}

/**
 * Retrieves camera stream diagnostic info (active viewers, status, uptime).
 *
 * @param {string|number} cameraId
 * @returns {object|null}
 */
function getStreamInfo(cameraId) {
  let id;
  try {
    id = getSafeId(cameraId);
  } catch {
    return null;
  }

  const stream = streams.get(id);
  if (!stream) {
    return null;
  }

  return {
    cameraId: id,
    status: stream.status,
    viewersCount: stream.viewers.size,
    viewers: Array.from(stream.viewers.values()).map((v) => ({
      viewerId: v.viewerId,
      joinedAt: new Date(v.joinedAt).toISOString(),
      lastHeartbeat: new Date(v.lastHeartbeat).toISOString(),
      idleSeconds: Math.round((Date.now() - v.lastHeartbeat) / 1000),
    })),
    hlsUrl: `http://localhost:4000/streams/${id}/index.m3u8`,
  };
}

/**
 * Periodic server-side cleanup for expired viewers (heartbeat timeout).
 * If a viewer's lastHeartbeat exceeds HEARTBEAT_TIMEOUT_MS, they are removed.
 * If 0 viewers remain, FFmpeg is stopped and HLS files deleted.
 */
function checkExpiredViewers() {
  const now = Date.now();

  for (const [id, stream] of streams.entries()) {
    if (stream.intentionallyStopped || stream.status === "stopping") {
      continue;
    }

    withCameraLock(id, async () => {
      const currentStream = streams.get(id);
      if (
        !currentStream ||
        currentStream !== stream ||
        currentStream.status === "stopping"
      ) {
        return;
      }

      for (const [viewerId, viewerData] of currentStream.viewers.entries()) {
        const idleTime = now - viewerData.lastHeartbeat;
        if (idleTime > HEARTBEAT_TIMEOUT_MS) {
          console.warn(
            `[Stream ${id}] Viewer ${viewerId} heartbeat expired (idle for ${Math.round(idleTime / 1000)}s). Removing.`,
          );
          currentStream.viewers.delete(viewerId);
        }
      }

      if (currentStream.viewers.size === 0) {
        console.log(
          `[Stream ${id}] All viewers expired via heartbeat timeout. Stopping FFmpeg and deleting HLS files...`,
        );
        await stopStreamInternal(id, currentStream);
      }
    }).catch((err) => {
      console.error(
        `[Stream ${id}] Error during expired viewers cleanup:`,
        err.message,
      );
    });
  }
}

// Start periodic heartbeat expiration monitor
const cleanupTimer = setInterval(
  checkExpiredViewers,
  HEARTBEAT_CHECK_INTERVAL_MS,
);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

module.exports = {
  startStream,
  removeViewer,
  recordHeartbeat,
  stopStream,
  getStreamInfo,
  cleanupStream,
  streams,
  HEARTBEAT_TIMEOUT_MS,
  HEARTBEAT_CHECK_INTERVAL_MS,
};
