import process from "node:process";
import { Writable } from "node:stream";

import { trace } from "@opentelemetry/api";
import { logs, type LogAttributes, SeverityNumber } from "@opentelemetry/api-logs";
import { pino as createPino, multistream, stdTimeFunctions } from "pino";

import { isTest } from "../../config/exec-env.ts";

const SEVERITY_MAP: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};

// pino → OTel Logsブリッジ
// pino-opentelemetry-transportは存在するがpino.transport()はワーカースレッドで実行されるため、
// AsyncLocalStorage経由のmixin(trace_id/span_id)が失われる。自作のWritableで回避。
const otelDestination = new Writable({
  write(chunk, _encoding, callback) {
    try {
      const record = JSON.parse(chunk.toString());
      const attributes: LogAttributes = {};
      for (const [key, value] of Object.entries(record)) {
        if (key === "time" || key === "level" || key === "msg" || key === "v" || value == null)
          continue;
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          attributes[key] = value;
        } else {
          attributes[key] = JSON.stringify(value);
        }
      }
      logs.getLogger("pino").emit({
        severityNumber: SEVERITY_MAP[record.level] ?? SeverityNumber.UNSPECIFIED,
        body: record.msg ?? "",
        attributes,
      });
    } catch {
      // ignore parse errors
    }
    callback();
  },
});

export const pino = createPino(
  {
    enabled: !isTest,
    timestamp: stdTimeFunctions.isoTime,
    formatters: {
      // pidとhostnameを省く
      bindings: () => ({}),
    },
    mixin() {
      const span = trace.getActiveSpan();
      if (span == null) return {};
      const { traceId, spanId } = span.spanContext();
      return { trace_id: traceId, span_id: spanId };
    },
  },
  multistream([
    { level: "info", stream: otelDestination }, // 基本
    { level: "info", stream: process.stdout }, // OTel出力先が利用できない場合に備えた保険
  ]),
);
