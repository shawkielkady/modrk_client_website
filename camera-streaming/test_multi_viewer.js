const assert = require("assert");
const EventEmitter = require("events");
const childProcess = require("child_process");
const path = require("path");

process.env.STREAMS_DIR = path.join(__dirname, "test_streams");

// Mock FFmpeg child process
class MockProcess extends EventEmitter {
  constructor(pid = 12345) {
    super();
    this.pid = pid;
    this.exitCode = null;
    this.signalCode = null;
    this.killed = false;
    this.stderr = new EventEmitter();
  }

  kill(signal = "SIGTERM") {
    this.killed = true;
    this.signalCode = signal;
    setTimeout(() => {
      this.exitCode = 0;
      this.emit("close", 0, signal);
    }, 50);
    return true;
  }
}

let spawnedCount = 0;
const originalSpawn = childProcess.spawn;

childProcess.spawn = function (cmd, args, opts) {
  spawnedCount++;
  const proc = new MockProcess(10000 + spawnedCount);
  setTimeout(() => {
    proc.emit("spawn");
  }, 10);
  return proc;
};

const streamManager = require("./src/services/streamManager");
const {
  startStream,
  removeViewer,
  recordHeartbeat,
  getStreamInfo,
  streams,
} = streamManager;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("=== Starting Shared Camera Streaming Tests ===\n");

  const rtsp5 = "rtsp://camera-5.local/live";
  const rtsp6 = "rtsp://camera-6.local/live";

  // Scenario 1: User A opens camera 5 -> 1 FFmpeg process starts
  console.log("Test 1: User A opens camera 5...");
  const resA = await startStream("5", rtsp5, "viewer_A");
  assert.strictEqual(resA.cameraId, "5");
  assert.strictEqual(resA.viewersCount, 1);
  assert.strictEqual(spawnedCount, 1, "Expected exactly 1 FFmpeg spawn");
  console.log("✓ User A opened camera 5. Spawn count: 1");

  // Scenario 2: User B opens camera 5 -> NO second FFmpeg process starts
  console.log("\nTest 2: User B opens camera 5...");
  const resB = await startStream("5", rtsp5, "viewer_B");
  assert.strictEqual(resB.cameraId, "5");
  assert.strictEqual(resB.viewersCount, 2);
  assert.strictEqual(spawnedCount, 1, "Expected NO additional FFmpeg process");
  const info5 = getStreamInfo("5");
  assert.strictEqual(info5.viewersCount, 2);
  console.log("✓ User B joined camera 5. Shared FFmpeg process confirmed (spawn count: 1, viewers: 2)");

  // Scenario 3: User A closes camera 5 -> FFmpeg stays running
  console.log("\nTest 3: User A closes camera 5...");
  const remA = await removeViewer("5", "viewer_A");
  assert.strictEqual(remA.remainingViewers, 1);
  assert.strictEqual(remA.stopped, false);
  const infoAfterA = getStreamInfo("5");
  assert.ok(infoAfterA, "Stream 5 should still be active");
  assert.strictEqual(infoAfterA.viewersCount, 1);
  console.log("✓ User A left. FFmpeg stayed running for User B (remainingViewers: 1)");

  // Scenario 4: User B closes camera 5 -> FFmpeg stops and cleans up
  console.log("\nTest 4: User B closes camera 5...");
  const remB = await removeViewer("5", "viewer_B");
  assert.strictEqual(remB.remainingViewers, 0);
  assert.strictEqual(remB.stopped, true);
  await sleep(100);
  const infoAfterB = getStreamInfo("5");
  assert.strictEqual(infoAfterB, null, "Stream 5 should be removed from Map");
  console.log("✓ User B left. FFmpeg stopped and cleaned up (remainingViewers: 0)");

  // Scenario 5: User A and B open camera 5 simultaneously
  console.log("\nTest 5: Simultaneous open by User A and User B...");
  const currentSpawned = spawnedCount;
  const [simA, simB] = await Promise.all([
    startStream("5", rtsp5, "viewer_sim_A"),
    startStream("5", rtsp5, "viewer_sim_B"),
  ]);
  assert.strictEqual(spawnedCount, currentSpawned + 1, "Expected exactly 1 new spawn for simultaneous requests");
  assert.strictEqual(getStreamInfo("5").viewersCount, 2);
  console.log("✓ Simultaneous start handled cleanly with single FFmpeg process");

  // Scenario 6: User A closes while User C joins
  console.log("\nTest 6: User A closes while User C joins...");
  const [closeA, joinC] = await Promise.all([
    removeViewer("5", "viewer_sim_A"),
    startStream("5", rtsp5, "viewer_sim_C"),
  ]);
  assert.strictEqual(closeA.stopped, false, "Stream should NOT stop because B and/or C are active");
  const infoAfterAC = getStreamInfo("5");
  assert.ok(infoAfterAC, "Stream should remain active");
  assert.strictEqual(infoAfterAC.viewersCount, 2, "Expected 2 viewers (sim_B and sim_C)");
  console.log("✓ Interleaved leave/join handled safely without dropping stream");

  // Scenario 7: Heartbeat update
  console.log("\nTest 7: Heartbeat updates...");
  const hbC = recordHeartbeat("5", "viewer_sim_C");
  assert.strictEqual(hbC.success, true);
  assert.strictEqual(hbC.active, true);
  console.log("✓ Heartbeat recorded successfully");

  // Scenario 8: Different cameras run independently
  console.log("\nTest 8: Independent camera streaming (Camera 6)...");
  const res6 = await startStream("6", rtsp6, "viewer_cam6");
  assert.strictEqual(res6.cameraId, "6");
  assert.ok(getStreamInfo("5"), "Camera 5 is running");
  assert.ok(getStreamInfo("6"), "Camera 6 is running");
  console.log("✓ Camera 5 and Camera 6 running simultaneously and independently");

  // Scenario 9: RTSP conflict protection
  console.log("\nTest 9: RTSP URL conflict protection...");
  try {
    await startStream("5", "rtsp://different-url/stream", "viewer_conflict");
    assert.fail("Should have thrown 409 error on RTSP URL conflict with active viewers");
  } catch (err) {
    assert.strictEqual(err.statusCode, 409);
    console.log(`✓ Protected active stream from source replacement (${err.message})`);
  }

  // Cleanup remaining streams
  console.log("\nCleaning up test streams...");
  await removeViewer("5", "viewer_sim_B");
  await removeViewer("5", "viewer_sim_C");
  await removeViewer("6", "viewer_cam6");
  await sleep(150);

  assert.strictEqual(getStreamInfo("5"), null);
  assert.strictEqual(getStreamInfo("6"), null);

  console.log("\n==========================================");
  console.log("  ALL MULTI-VIEWER TESTS PASSED (9/9)  ");
  console.log("==========================================");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    childProcess.spawn = originalSpawn;
    process.exit(0);
  });
