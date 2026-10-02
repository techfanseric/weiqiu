import { isPublicDemo } from "@/runtime";
import { getToken } from "@/utils/auth";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { connectMqtt, connected } from "@/mqtt";
import { mqttMonitor, mqttUnMonitor } from "@/mqtt/monitor";
import {
  acceptSnapshot,
  createDemo,
  dataQuality,
  parseSnapshot,
  type RunStatus,
  type Snapshot,
} from "./model";
const CACHE = "weiqiu-display-snapshot-v1";
export function useDisplay() {
  const route = useRoute();
  const demo = computed(() => isPublicDemo || route.query.mode === "demo");
  const count = ref(
    Math.max(1, Math.min(10, Number(route.query.samples) || 5)),
  );
  watch(() => route.query.samples, value => {
    count.value = Math.max(1, Math.min(10, Math.round(Number(value) || 5)));
  });
  const elapsed = ref(83);
  const demoStatus = ref<RunStatus>("running");
  const now = ref(Date.now());
  const snapshot = ref<Snapshot | null>(null);
  const receivedAt = ref(0);
  const anchor = Date.now() - 83 * 60000;
  let timer: ReturnType<typeof setInterval>;
  let mounted = false;
  const issue = ref("");
  const quality = computed(() =>
    dataQuality(
      demo.value,
      connected.value,
      snapshot.value,
      receivedAt.value,
      now.value,
    ),
  );
  function receive(payload: unknown) {
    const next = acceptSnapshot(snapshot.value, payload);
    if (!next || next.source !== "live") {
      issue.value = "等待有效的实验快照";
      return;
    }
    snapshot.value = next;
    receivedAt.value = Date.now();
    issue.value = "";
    try {
      localStorage.setItem(CACHE, JSON.stringify(next));
    } catch {
      /* storage is optional */
    }
  }
  function renderDemo() {
    snapshot.value = createDemo(
      count.value,
      elapsed.value,
      demoStatus.value,
      anchor + elapsed.value * 60000,
    );
    receivedAt.value = now.value;
  }
  const topic = "/data/notification/changed";
  const id = `display-${Math.random().toString(36).slice(2)}`;
  function start() {
    if (demo.value) {
      renderDemo();
      return;
    }
    try {
      snapshot.value = parseSnapshot(
        JSON.parse(localStorage.getItem(CACHE) || "null"),
      );
    } catch {
      snapshot.value = null;
    }
    if (snapshot.value?.source !== "live") snapshot.value = null;
    connectMqtt({ readOnly: true });
    mqttMonitor(topic, id, (message: any) => {
      if (message.type === "display") receive(message.data);
    });
    // Optional, confirmed GET-only snapshot endpoint. No guessed endpoint or flow execution.
    const url = import.meta.env.VITE_DISPLAY_SNAPSHOT_URL;
    if (url) fetchSnapshot(url);
  }
  async function fetchSnapshot(url: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      if (new URL(url, location.href).origin !== location.origin)
        throw new Error("same-origin snapshot required");
      const token = getToken();
      const res = await fetch(url, {
        credentials: "same-origin",
        signal: controller.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("snapshot");
      receive(await res.json());
    } catch {
      issue.value = "实验快照暂不可用";
    } finally {
      clearTimeout(timeout);
    }
  }
  watch(connected, (value) => {
    if (value && !demo.value && import.meta.env.VITE_DISPLAY_SNAPSHOT_URL)
      fetchSnapshot(import.meta.env.VITE_DISPLAY_SNAPSHOT_URL);
  });
  watch([count, demoStatus, elapsed], () => {
    if (demo.value) renderDemo();
  });
  // Reload when switching source: guarantees a demo page never inherits a live transport.
  watch(demo, () => {
    if (mounted) location.reload();
  });
  onMounted(() => {
    mounted = true;
    start();
    timer = setInterval(() => {
      now.value = Date.now();
      if (demo.value && demoStatus.value === "running")
        elapsed.value = Math.min(180, elapsed.value + 1 / 60);
    }, 1000);
  });
  onUnmounted(() => {
    clearInterval(timer);
    mqttUnMonitor(topic, id);
  });
  return {
    demo,
    count,
    elapsed,
    demoStatus,
    now,
    snapshot,
    quality,
    issue,
    receivedAt,
  };
}
