import { useEffect, useMemo, useRef, useState } from "react";

type MemorySnapshot = {
  usedMb: number;
  totalMb: number;
  limitMb: number;
};

type WebGlSnapshot = {
  drawCalls: number;
  triangles: number;
};

type CpuMode = "longtask" | "frames";

type PerformanceWithMemory = Performance & {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }>;
};

const MB = 1024 * 1024;
const FRAME_BUDGET_MS = 1000 / 60;
const WEBGL_TRIANGLES = 0x0004;
const WEBGL_TRIANGLE_STRIP = 0x0005;
const WEBGL_TRIANGLE_FAN = 0x0006;

function estimateTriangles(
  mode: number,
  count: number,
  instanceCount = 1,
): number {
  const safeCount = Math.max(0, count);
  const safeInstanceCount = Math.max(1, instanceCount);

  let triangles = 0;
  if (mode === WEBGL_TRIANGLES) {
    triangles = Math.floor(safeCount / 3);
  } else if (mode === WEBGL_TRIANGLE_STRIP || mode === WEBGL_TRIANGLE_FAN) {
    triangles = Math.max(0, safeCount - 2);
  }

  return triangles * safeInstanceCount;
}

function installWebGlCounter() {
  let drawCalls = 0;
  let triangles = 0;

  const teardowns: Array<() => void> = [];

  if (typeof WebGLRenderingContext !== "undefined") {
    const glProto = WebGLRenderingContext.prototype;

    const originalDrawArrays = glProto.drawArrays;
    glProto.drawArrays = function drawArraysPatched(mode, first, count) {
      drawCalls += 1;
      triangles += estimateTriangles(mode, count);
      return originalDrawArrays.call(this, mode, first, count);
    };
    teardowns.push(() => {
      glProto.drawArrays = originalDrawArrays;
    });

    const originalDrawElements = glProto.drawElements;
    glProto.drawElements = function drawElementsPatched(
      mode,
      count,
      type,
      offset,
    ) {
      drawCalls += 1;
      triangles += estimateTriangles(mode, count);
      return originalDrawElements.call(this, mode, count, type, offset);
    };
    teardowns.push(() => {
      glProto.drawElements = originalDrawElements;
    });
  }

  if (typeof WebGL2RenderingContext !== "undefined") {
    const gl2Proto = WebGL2RenderingContext.prototype;

    if (typeof gl2Proto.drawArraysInstanced === "function") {
      const originalDrawArraysInstanced = gl2Proto.drawArraysInstanced;
      gl2Proto.drawArraysInstanced = function drawArraysInstancedPatched(
        mode,
        first,
        count,
        instanceCount,
      ) {
        drawCalls += 1;
        triangles += estimateTriangles(mode, count, instanceCount);
        return originalDrawArraysInstanced.call(
          this,
          mode,
          first,
          count,
          instanceCount,
        );
      };
      teardowns.push(() => {
        gl2Proto.drawArraysInstanced = originalDrawArraysInstanced;
      });
    }

    if (typeof gl2Proto.drawElementsInstanced === "function") {
      const originalDrawElementsInstanced = gl2Proto.drawElementsInstanced;
      gl2Proto.drawElementsInstanced = function drawElementsInstancedPatched(
        mode,
        count,
        type,
        offset,
        instanceCount,
      ) {
        drawCalls += 1;
        triangles += estimateTriangles(mode, count, instanceCount);
        return originalDrawElementsInstanced.call(
          this,
          mode,
          count,
          type,
          offset,
          instanceCount,
        );
      };
      teardowns.push(() => {
        gl2Proto.drawElementsInstanced = originalDrawElementsInstanced;
      });
    }
  }

  return {
    readAndReset: (): WebGlSnapshot => {
      const snapshot = { drawCalls, triangles };
      drawCalls = 0;
      triangles = 0;
      return snapshot;
    },
    teardown: () => {
      for (const fn of teardowns.reverse()) {
        fn();
      }
    },
  };
}

function formatMb(value: number): string {
  return `${value.toFixed(1)} MB`;
}

function getMemorySnapshot(): MemorySnapshot | null {
  const perf = performance as PerformanceWithMemory;
  if (!perf.memory) {
    return null;
  }

  return {
    usedMb: perf.memory.usedJSHeapSize / MB,
    totalMb: perf.memory.totalJSHeapSize / MB,
    limitMb: perf.memory.jsHeapSizeLimit / MB,
  };
}

export function DevPerformancePanel() {
  const [memory, setMemory] = useState<MemorySnapshot | null>(null);
  const [uaMemoryMb, setUaMemoryMb] = useState<number | null>(null);
  const [uaMemoryUnavailable, setUaMemoryUnavailable] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(0);
  const [fps, setFps] = useState(0);
  const [frameMs, setFrameMs] = useState(0);
  const [webgl, setWebgl] = useState<WebGlSnapshot>({
    drawCalls: 0,
    triangles: 0,
  });
  const [cpuMode, setCpuMode] = useState<CpuMode>("frames");

  const longTaskTotalRef = useRef(0);
  const uaMemoryPendingRef = useRef(false);

  useEffect(() => {
    const perf = performance as PerformanceWithMemory;
    if (!perf.measureUserAgentSpecificMemory) {
      setUaMemoryUnavailable(true);
      return;
    }

    const sampleUaMemory = async () => {
      if (uaMemoryPendingRef.current) {
        return;
      }

      uaMemoryPendingRef.current = true;
      try {
        const result = await perf.measureUserAgentSpecificMemory();
        setUaMemoryMb(result.bytes / MB);
        setUaMemoryUnavailable(false);
      } catch {
        setUaMemoryUnavailable(true);
      } finally {
        uaMemoryPendingRef.current = false;
      }
    };

    void sampleUaMemory();
    const id = window.setInterval(() => {
      void sampleUaMemory();
    }, 3000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;
    let sampleId = 0;
    let observer: PerformanceObserver | null = null;
    const webglCounter = installWebGlCounter();

    let elapsedTotal = 0;
    let frameDelayTotal = 0;
    let frameCount = 0;
    let lastTs = performance.now();

    const onFrame = (now: number) => {
      const delta = now - lastTs;
      lastTs = now;
      elapsedTotal += delta;
      frameDelayTotal += Math.max(0, delta - FRAME_BUDGET_MS);
      frameCount += 1;
      frameId = requestAnimationFrame(onFrame);
    };

    frameId = requestAnimationFrame(onFrame);

    if (typeof PerformanceObserver !== "undefined") {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            longTaskTotalRef.current += entry.duration;
          }
        });
        observer.observe({ entryTypes: ["longtask"] });
        setCpuMode("longtask");
      } catch {
        setCpuMode("frames");
      }
    }

    sampleId = window.setInterval(() => {
      setMemory(getMemorySnapshot());

      const elapsedMs = Math.max(1, elapsedTotal);
      const longTaskBusy = (longTaskTotalRef.current / elapsedMs) * 100;
      const frameBusy = (frameDelayTotal / elapsedMs) * 100;
      const nextCpu = cpuMode === "longtask" ? longTaskBusy : frameBusy;

      setCpuLoad(Math.max(0, Math.min(100, nextCpu)));
      setFps((frameCount * 1000) / elapsedMs);
      setFrameMs(elapsedMs / Math.max(1, frameCount));
      setWebgl(webglCounter.readAndReset());

      elapsedTotal = 0;
      frameDelayTotal = 0;
      frameCount = 0;
      longTaskTotalRef.current = 0;
    }, 1000);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearInterval(sampleId);
      observer?.disconnect();
      webglCounter.teardown();
    };
  }, [cpuMode]);

  const cpuLabel = useMemo(() => {
    if (cpuMode === "longtask") {
      return "Main-thread busy (long tasks)";
    }
    return "Main-thread busy (frame delay est.)";
  }, [cpuMode]);

  return (
    <aside
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 2000,
        width: 285,
        borderRadius: 12,
        padding: "10px 12px",
        background: "rgb(10 10 10 / 0.82)",
        border: "1px solid rgb(255 255 255 / 0.16)",
        color: "#f4f0e8",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        lineHeight: 1.4,
        backdropFilter: "blur(6px)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Dev Performance</div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ opacity: 0.8 }}>Frame timing</div>
        <div>
          {fps.toFixed(1)} FPS ({frameMs.toFixed(2)} ms)
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ opacity: 0.8 }}>{cpuLabel}</div>
        <div>{cpuLoad.toFixed(1)}%</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ opacity: 0.8, marginBottom: 2 }}>
          Estimated tab memory
        </div>
        {uaMemoryUnavailable ? (
          <div>Unavailable in this browser/context</div>
        ) : uaMemoryMb !== null ? (
          <div>{formatMb(uaMemoryMb)}</div>
        ) : (
          <div>Sampling...</div>
        )}
      </div>

      <div>
        <div style={{ opacity: 0.8, marginBottom: 2 }}>JS heap memory</div>
        {memory ? (
          <>
            <div>Used: {formatMb(memory.usedMb)}</div>
            <div>Total: {formatMb(memory.totalMb)}</div>
            <div>Limit: {formatMb(memory.limitMb)}</div>
          </>
        ) : (
          <div>Unavailable in this browser</div>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ opacity: 0.8, marginBottom: 2 }}>WebGL (last 1s)</div>
        <div>Draw calls: {webgl.drawCalls}</div>
        <div>Triangles: {webgl.triangles.toLocaleString()}</div>
      </div>
    </aside>
  );
}
