import { trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OpenTelemetry as GlideOpenTelemetry } from "@valkey/valkey-glide";

import * as env from "./util/envvar.ts";

const otelEndpoint = env.getOr("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318");
const valkeyOtelSamplePercentage = env.getFloatOr("VALKEY_OTEL_SAMPLE_PERCENTAGE", 100);

export const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  logRecordProcessor: new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": {
        enabled: true,
        ignoreOutgoingRequestHook: () => true,
      },
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-dns": { enabled: false },
      "@opentelemetry/instrumentation-net": { enabled: false },
      "@opentelemetry/instrumentation-graphql": { enabled: false },
    }),
  ],
});

const g = globalThis as typeof globalThis & { __otelSdkStarted?: boolean };

if (!g.__otelSdkStarted) {
  g.__otelSdkStarted = true;
  sdk.start();

  // NOTE: GLIDE Node.jsはinvokeScript(EVAL/EVALSHA)にOTel spanを生成しない
  // Pythonはv2.6でfix済みだが、Node.jsは未対応
  // https://github.com/valkey-io/valkey-glide/issues/5599
  GlideOpenTelemetry.init({
    traces: {
      endpoint: `${otelEndpoint}/v1/traces`,
      samplePercentage: valkeyOtelSamplePercentage,
    },
    flushIntervalMs: 1_000,
    parentSpanContextProvider: () => {
      const span = trace.getActiveSpan();
      if (span == null) return undefined;
      const ctx = span.spanContext();
      return {
        traceId: ctx.traceId,
        spanId: ctx.spanId,
        traceFlags: ctx.traceFlags,
        ...(ctx.traceState != null && {
          traceState: ctx.traceState.toString(),
        }),
      };
    },
  });
}
